import { useState, useMemo, useCallback } from 'react';
import { useIndexedDB } from './useIndexedDB';
import { User } from '../../types';
import { sha256 } from '../utils';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MS = 5 * 60 * 1000; // 5 minutes

type LoginAttempt = {
    count: number;
    lockUntil: number | null;
}

type ShowToastFn = (message: string, type?: 'success' | 'error') => void;

export const useAuth = () => {
    const [sessionToken, setSessionToken, isSessionTokenLoaded] = useIndexedDB<string | null>('sessionToken', null);
    const [sessions, setSessions, isSessionsLoaded] = useIndexedDB<Record<string, string>>('sessions', {});
    const [users, setUsers, isUsersLoaded] = useIndexedDB<User[]>('users', [{ 
        username: 'admin', 
        passwordHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', // Hashed "admin"
        fullName: 'Administrador' 
    }]);
    const [loginAttempts, setLoginAttempts, isLoginAttemptsLoaded] = useIndexedDB<Record<string, LoginAttempt>>('loginAttempts', {});

    const currentUser = useMemo(() => {
        if (sessionToken && sessions[sessionToken]) {
            return sessions[sessionToken];
        }
        return null;
    }, [sessionToken, sessions]);

    const currentUserDetails = useMemo(() => {
        return users.find(u => u.username === currentUser);
    }, [currentUser, users]);
    
    const isAuthenticated = !!currentUser;
    const isAuthLoading = !isSessionTokenLoaded || !isSessionsLoaded || !isUsersLoaded || !isLoginAttemptsLoaded;

    const handleLogin = async (username: string, pass: string, showToast: ShowToastFn) => {
        const lowerCaseUsername = username.toLowerCase();
        const userAttempt = loginAttempts[lowerCaseUsername];

        if (userAttempt?.lockUntil && userAttempt.lockUntil > Date.now()) {
            const remainingTime = Math.ceil((userAttempt.lockUntil - Date.now()) / (1000 * 60));
            showToast(`Conta bloqueada. Tente novamente em ${remainingTime} minuto(s).`, 'error');
            return;
        }

        const user = users.find(u => u.username === lowerCaseUsername);
        if (user) {
            const passHash = await sha256(pass);
            if (user.passwordHash === passHash) {
                if (userAttempt) {
                    setLoginAttempts(prev => {
                        const newAttempts = { ...prev };
                        delete newAttempts[lowerCaseUsername];
                        return newAttempts;
                    });
                }
                const newSessionToken = crypto.randomUUID();
                setSessions(prev => ({ ...prev, [newSessionToken]: user.username }));
                setSessionToken(newSessionToken);
            } else {
                const newCount = (userAttempt?.count || 0) + 1;
                if (newCount >= MAX_LOGIN_ATTEMPTS) {
                    setLoginAttempts(prev => ({
                        ...prev,
                        [lowerCaseUsername]: { count: newCount, lockUntil: Date.now() + LOCK_DURATION_MS }
                    }));
                    showToast(`Conta bloqueada por ${LOCK_DURATION_MS / 60000} minutos.`, 'error');
                } else {
                     setLoginAttempts(prev => ({
                        ...prev,
                        [lowerCaseUsername]: { count: newCount, lockUntil: null }
                    }));
                    showToast(`Credenciais inválidas. Tentativa ${newCount} de ${MAX_LOGIN_ATTEMPTS}.`, 'error');
                }
            }
        } else {
            showToast('Credenciais inválidas.', 'error');
        }
    };

    const handleRegister = async (username: string, email: string, pass: string, fullName: string, address: string, showToast: ShowToastFn, onSuccess: () => void) => {
        const existingUser = users.find(u => u.username === username.toLowerCase());
        if (existingUser) {
            showToast('Este nome de usuário já está em uso.', 'error');
            return;
        }

        const passwordHash = await sha256(pass);
        const newUser: User = { username: username.toLowerCase(), passwordHash };
        if (email) newUser.email = email;
        if (fullName) newUser.fullName = fullName;
        if (address) newUser.address = address;

        setUsers(prev => [...prev, newUser]);
        showToast(`Usuário "${username}" registrado com sucesso!`, 'success');
        onSuccess();
    };

    const handleLogout = useCallback(async (reason: 'inactivity' | 'manual', showToast: ShowToastFn) => {
        // Automatic backup on logout is now handled in useData hook
        if (sessionToken) {
            setSessions(prev => {
                const newSessions = { ...prev };
                delete newSessions[sessionToken];
                return newSessions;
            });
        }
        setSessionToken(null);
        
        if (reason === 'inactivity') {
            showToast('Sessão encerrada por inatividade.', 'error');
        } else {
            showToast('Você saiu da sua conta.');
        }
    }, [sessionToken, setSessions, setSessionToken]);
    
    const handleUpdateUser = (updatedUser: User) => {
        setUsers(prevUsers => prevUsers.map(u => u.username === updatedUser.username ? updatedUser : u));
    };

    return {
        currentUser,
        currentUserDetails,
        isAuthenticated,
        isAuthLoading,
        handleLogin,
        handleRegister,
        handleLogout,
        handleUpdateUser,
    };
};