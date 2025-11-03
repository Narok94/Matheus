import React, { createContext, useContext, ReactNode } from 'react';
import { useData } from '../hooks/useData';

type DataContextType = ReturnType<typeof useData>;

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const data = useData();
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