import React, { createContext, useContext, ReactNode, useEffect, useRef } from 'react';
import { useSettings } from '../hooks/useSettings';
import { useAuth } from './AuthContext';
import { get, set } from '../idb';

type SettingsContextType = ReturnType<typeof useSettings>;

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const handleSettingsAutoBackup = async (user: string) => {
    if (!user || user === 'guest') return;
    try {
        const settingsKeys = ['companyProfile', 'appSettings'];
        for (const key of settingsKeys) {
            const data = await get(`${user}-${key}`);
            if (data) {
                await set(`${user}-${key}_backup`, data);
            }
        }
        console.log(`[AutoBackup] Settings backed up for user: ${user}`);
    } catch (error) {
        console.error(`[AutoBackup] Failed to backup settings for user: ${user}`, error);
    }
};

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const settings = useSettings();
    const { currentUser } = useAuth();
    const previousUserRef = useRef<string | null>(null);
    
    useEffect(() => {
        const previousUser = previousUserRef.current;
        if (previousUser && !currentUser) {
            handleSettingsAutoBackup(previousUser);
        }
        previousUserRef.current = currentUser;
    }, [currentUser]);

    return <SettingsContext.Provider value={settings}>{children}</SettingsContext.Provider>;
};

export const useSettingsContext = () => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettingsContext must be used within a SettingsProvider');
    }
    return context;
};

// Re-exporting useSettings for consumers
export { useSettingsContext as useSettings };