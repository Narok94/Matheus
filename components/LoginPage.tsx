
import React, { useState } from 'react';
import { Button, Input, FormField } from './common';
import { CertificateIcon } from './Icons';

interface LoginPageProps {
    onLogin: (email: string, pass: string) => void;
    showToast: (message: string, type?: 'success' | 'error') => void;
}

const TechBackground: React.FC = () => (
    <div className="absolute inset-0 z-0 overflow-hidden bg-primary">
        <svg
            width="100%"
            height="100%"
            xmlns="http://www.w3.org/2000/svg"
            className="text-border/50 dark:text-border/20"
        >
            <defs>
                <pattern
                    id="grid"
                    width="40"
                    height="40"
                    patternUnits="userSpaceOnUse"
                >
                    <path
                        d="M 40 0 L 0 0 0 40"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="0.5"
                    />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/80 to-transparent"></div>
    </div>
);


export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, showToast }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onLogin(email, password);
    };

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 relative">
            <TechBackground />
            <div className="w-full max-w-sm z-10">
                <div className="flex flex-col items-center mb-8">
                    <div className="p-3 bg-accent/10 rounded-full mb-3">
                         <CertificateIcon className="h-10 w-10 text-accent" />
                    </div>
                    <h1 className="text-2xl font-bold text-text-primary">InspecPro</h1>
                    <p className="text-text-secondary">Acesse sua conta para continuar</p>
                </div>
                <div className="bg-secondary p-8 rounded-2xl shadow-lg border border-border">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <FormField label="Email">
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="ex: teste@a.com"
                                required
                            />
                        </FormField>
                        <FormField label="Senha">
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="ex: 1234"
                                required
                            />
                        </FormField>
                        <Button type="submit" className="w-full !py-3">
                            Entrar
                        </Button>
                    </form>
                    <div className="relative flex py-5 items-center">
                        <div className="flex-grow border-t border-border"></div>
                        <span className="flex-shrink mx-4 text-text-secondary text-xs uppercase">Ou</span>
                        <div className="flex-grow border-t border-border"></div>
                    </div>
                     <Button
                        onClick={() => onLogin('teste@a.com', '1234')}
                        variant="secondary"
                        className="w-full !py-3"
                    >
                        Acessar sem login (Modo Teste)
                    </Button>
                     <div className="text-center mt-6">
                        <a 
                            href="#" 
                            onClick={(e) => {
                                e.preventDefault();
                                showToast("Função de recuperação em desenvolvimento.", "error");
                            }}
                            className="text-sm font-medium text-accent hover:underline"
                        >
                            Esqueceu sua senha?
                        </a>
                    </div>
                </div>
            </div>
            <footer className="absolute bottom-4 text-center w-full text-xs text-text-secondary z-10">
                Produzido por Henrique Costa © 2025
            </footer>
        </div>
    );
};