import React from 'react';
import { InspecProLogo } from './Icons';

export const GlobalLoader: React.FC<{ message?: string }> = ({ message = "Carregando seus dados..." }) => (
    <div className="fixed inset-0 bg-primary z-[200] flex flex-col items-center justify-center">
        <div className="relative w-24 h-24 text-accent">
            <InspecProLogo className="w-full h-full" />
            <div className="absolute inset-0 border-2 border-accent/50 rounded-full animate-spin border-t-accent"></div>
        </div>
        <p className="mt-4 text-text-secondary animate-pulse">{message}</p>
    </div>
);