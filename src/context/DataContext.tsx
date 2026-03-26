import React, { createContext, useContext, ReactNode, useEffect, useRef } from 'react';
import { useData } from '../hooks/useData';
import { useAuth } from './AuthContext';
import { get, set } from '../idb';

type DataContextType = ReturnType<typeof useData>;

const DataContext = createContext<DataContextType | undefined>(undefined);

const handleAutoBackup = async (user: string) => {
    if (!user || user === 'guest') return;

    try {
        const dataKeys = ['clients', 'equipment', 'inspections', 'financial', 'certificates', 'licenses', 'deliveries', 'expenses'];
        
        for (const key of dataKeys) {
            const data = await get(`${user}-${key}`);
            if (data) {
                await set(`${user}-${key}_backup`, data);
            }
        }
        
        await set(`${user}-lastBackupTimestamp`, new Date().toISOString());
        console.log(`[AutoBackup] Data backed up for user: ${user}`);
    } catch (error) {
        console.error(`[AutoBackup] Failed to backup data for user: ${user}`, error);
    }
};


export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const data = useData();
    const { currentUser } = useAuth();
    const previousUserRef = useRef<string | null>(null);

    useEffect(() => {
        const previousUser = previousUserRef.current;
        // Trigger backup on logout: previousUser exists, currentUser is null.
        if (previousUser && !currentUser) {
            handleAutoBackup(previousUser);
        }
        previousUserRef.current = currentUser;
    }, [currentUser]);

    return <DataContext.Provider value={data}>{children}</DataContext.Provider>;
};

export const useDataContext = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useDataContext must be used within a DataProvider');
    }
    return context;
};

// Re-exporting useData for consumers
export { useDataContext as useData };