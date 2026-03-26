import { useMemo, useCallback } from 'react';
import { useIndexedDB } from './useIndexedDB';
import { User } from '../../types';
import { sha256 } from '../utils';
import { api } from '../services/api';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MS = 5 * 60 * 1000; // 5 minutes

type LoginAttempt = {
    count: number;
    lockUntil: number | null;
}

type ShowToastFn = (message: string, type?: 'success' | 'error') => void;

export const useAuth = () => {
    const [jwtToken, setJwtToken, isJwtTokenLoaded] = useIndexedDB<string | null>('jwtToken', null);
    const [currentUserDetails, setCurrentUserDetails, isUserDetailsLoaded] = useIndexedDB<User | null>('currentUserDetails', null);
    const [loginAttempts, setLoginAttempts, isLoginAttemptsLoaded] = useIndexedDB<Record<string, LoginAttempt>>('loginAttempts', {});

    const currentUser = useMemo(() => currentUserDetails?.username || null, [currentUserDetails]);
    
    const isAuthenticated = !!jwtToken;
    const isAuthLoading = !isJwtTokenLoaded || !isUserDetailsLoaded || !isLoginAttemptsLoaded;

    const handleLogin = async (username: string, pass: string, showToast: ShowToastFn) => {
        const lowerCaseUsername = username.toLowerCase();
        const userAttempt = loginAttempts[lowerCaseUsername];

        if (userAttempt?.lockUntil && userAttempt.lockUntil > Date.now()) {
            const remainingTime = Math.ceil((userAttempt.lockUntil - Date.now()) / (1000 * 60));
            showToast(`Conta bloqueada. Tente novamente em ${remainingTime} minuto(s).`, 'error');
            return;
        }

        try {
            const passHash = await sha256(pass.trim());
            const response = await api.post('/auth/login', { username: lowerCaseUsername, passwordHash: passHash });
            
            setJwtToken(response.token);
            setCurrentUserDetails(response.user);

            if (userAttempt) {
                setLoginAttempts(prev => {
                    const newAttempts = { ...prev };
                    delete newAttempts[lowerCaseUsername];
                    return newAttempts;
                });
            }
            showToast('Login realizado com sucesso!', 'success');
        } catch (error: any) {
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
                showToast(error.message || 'Credenciais inválidas.', 'error');
            }
        }
    };

    const handleRegister = async (username: string, email: string, pass: string, fullName: string, showToast: ShowToastFn, onSuccess: () => void) => {
        try {
            const passwordHash = await sha256(pass);
            await api.post('/auth/register', { 
                username: username.toLowerCase(), 
                passwordHash,
                email,
                fullName
            });
            showToast(`Usuário "${username}" registrado com sucesso!`, 'success');
            onSuccess();
        } catch (error: any) {
            showToast(error.message || 'Erro ao registrar usuário.', 'error');
        }
    };

    const handleLogout = useCallback(async (reason: 'inactivity' | 'manual', showToast: ShowToastFn) => {
        setJwtToken(null);
        setCurrentUserDetails(null);
        
        if (reason === 'inactivity') {
            showToast('Sessão encerrada por inatividade.', 'error');
        } else {
            showToast('Você saiu da sua conta.');
        }
    }, [setJwtToken, setCurrentUserDetails]);
    
    const handleUpdateUser = (updatedUser: User) => {
        setCurrentUserDetails(updatedUser);
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
        jwtToken,
    };
};
