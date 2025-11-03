import React, { useState, useMemo } from 'react';
import { InspecProLogo, UserIcon, LockIcon } from './Icons';
import { useAuth } from '../context/AuthContext';

type ShowToastFn = (message: string, type?: 'success' | 'error') => void;

interface AuthPageProps {
    showToast: ShowToastFn;
}

interface LoginPageProps extends AuthPageProps {
    onSwitchToRegister: () => void;
}

interface RegisterPageProps extends AuthPageProps {
    onSwitchToLogin: () => void;
}

const DynamicBackground = () => {
    const particles = useMemo(() => Array.from({ length: 50 }).map((_, i) => ({
        key: i,
        cx: `${Math.random() * 100}%`,
        cy: `${Math.random() * 100}%`,
        r: `${Math.random() * 1 + 0.5}`,
        begin: `${Math.random() * 5}s`,
        dur: `${Math.random() * 5 + 5}s`,
    })), []);

    return (
        <div className="login-background" aria-hidden="true">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0">
                <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.5"/>
                    </pattern>
                    <linearGradient id="scanline" x1="0" y1="0" x2="0" y2="100%">
                        <stop stopColor="#0ea5e9" stopOpacity="0" offset="0%"/>
                        <stop stopColor="#0ea5e9" stopOpacity="0.3" offset="50%"/>
                        <stop stopColor="#0ea5e9" stopOpacity="0" offset="100%"/>
                    </linearGradient>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>

                <rect width="100%" height="100%" fill="url(#grid)" />
                
                {particles.map(p => (
                     <circle key={p.key} cx={p.cx} cy={p.cy} r={p.r} fill="#fff" opacity="0">
                        <animate attributeName="opacity" values="0;0.5;0" begin={p.begin} dur={p.dur} repeatCount="indefinite" />
                    </circle>
                ))}

                <g transform="translate(50%, 50%) scale(1.5)" className="absolute top-1/2 left-1/2">
                    <g filter="url(#glow)" stroke="#0ea5e9" strokeWidth="1" fill="none" opacity="0.6">
                        <circle cx="0" cy="0" r="100">
                             <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="30s" repeatCount="indefinite" />
                        </circle>
                        <path d="M -150 0 A 150 150 0 0 1 150 0" strokeDasharray="10 10">
                            <animateTransform attributeName="transform" type="rotate" from="360 0 0" to="0 0 0" dur="40s" repeatCount="indefinite" />
                        </path>
                        <path d="M 0 -120 A 120 120 0 0 1 0 120" strokeDasharray="none">
                           <animateTransform attributeName="transform" type="rotate" from="180 0 0" to="-180 0 0" dur="20s" repeatCount="indefinite" />
                        </path>

                        <g className="corner-brackets">
                            <path d="M -80 -80 L -110 -80 L -110 -110" strokeDasharray="90" strokeDashoffset="90">
                                <animate attributeName="stroke-dashoffset" values="90;0;90" dur="4s" repeatCount="indefinite" />
                            </path>
                             <path d="M 80 -80 L 110 -80 L 110 -110" strokeDasharray="90" strokeDashoffset="90">
                                <animate attributeName="stroke-dashoffset" values="90;0;90" dur="4s" begin="1s" repeatCount="indefinite" />
                            </path>
                             <path d="M -80 80 L -110 80 L -110 110" strokeDasharray="90" strokeDashoffset="90">
                                <animate attributeName="stroke-dashoffset" values="90;0;90" dur="4s" begin="2s" repeatCount="indefinite" />
                            </path>
                            <path d="M 80 80 L 110 80 L 110 110" strokeDasharray="90" strokeDashoffset="90">
                                <animate attributeName="stroke-dashoffset" values="90;0;90" dur="4s" begin="3s" repeatCount="indefinite" />
                            </path>
                        </g>
                    </g>
                </g>
                
                <rect x="0" y="0" width="100%" height="50" fill="url(#scanline)">
                    <animate attributeName="y" from="-50" to="100%" dur="8s" repeatCount="indefinite" />
                </rect>
            </svg>
        </div>
    )
};


const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="min-h-screen flex items-center justify-center p-4">
        {children}
    </div>
);

const AuthFormCard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
     <div className="relative z-10 w-full max-w-sm bg-slate-900/40 backdrop-blur-md border border-cyan-400/30 rounded-2xl shadow-2xl shadow-cyan-500/10 p-8 animate-fade-in">
        {children}
    </div>
);

const AuthHeader = () => (
    <div className="text-center mb-8">
        <div className="flex justify-center items-center mb-4">
            <InspecProLogo className="w-16 h-16 text-cyan-400 filter drop-shadow-[0_0_8px_rgba(56,189,248,0.7)]" />
        </div>
        <h1 className="text-3xl font-bold text-white tracking-wider">InspecPro</h1>
        <p className="text-sm text-slate-400">Gestão de Inspeções</p>
    </div>
);

const InputWithIcon: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { icon: React.ReactNode }> = ({ icon, ...props }) => (
    <div className="relative group">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            {icon}
        </span>
        <input 
            {...props}
            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-3 pl-10 pr-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
        />
    </div>
);

const FormButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = (props) => (
    <button 
        {...props}
        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg shadow-cyan-500/20 hover:shadow-cyan-400/40 transform hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-cyan-300 active:scale-95"
    />
);

export const LoginPage: React.FC<LoginPageProps> = ({ showToast, onSwitchToRegister }) => {
    const { handleLogin } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await handleLogin(username, password, showToast);
    };

    return (
        <>
            <DynamicBackground />
            <AuthLayout>
                <div className="w-full max-w-sm">
                    <AuthFormCard>
                        <AuthHeader />
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <InputWithIcon
                                icon={<UserIcon />}
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Username"
                                required
                                aria-label="Username"
                            />
                            <InputWithIcon
                                icon={<LockIcon />}
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                required
                                aria-label="Password"
                            />
                            <FormButton type="submit">LOG IN</FormButton>
                        </form>

                        <div className="text-center text-sm mt-6 flex justify-between text-cyan-400">
                            <a 
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    showToast("Função de recuperação em desenvolvimento.", "error");
                                }}
                                className="hover:underline"
                            >
                                Forgot Password?
                            </a>
                            <a 
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    onSwitchToRegister();
                                }}
                                className="hover:underline"
                            >
                                Sign Up
                            </a>
                        </div>
                    </AuthFormCard>
                     <p className="text-center text-xs text-slate-500 mt-6">
                        Use <strong className="text-slate-400">admin</strong> e senha <strong className="text-slate-400">admin</strong> para testar.
                    </p>
                </div>
            </AuthLayout>
        </>
    );
};

export const RegisterPage: React.FC<RegisterPageProps> = ({ showToast, onSwitchToLogin }) => {
    const { handleRegister } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 4) {
            showToast("A senha deve ter pelo menos 4 caracteres.", "error");
            return;
        }
        await handleRegister(username, '', password, '', showToast, onSwitchToLogin);
    };

    return (
        <>
            <DynamicBackground />
            <AuthLayout>
                <div className="w-full max-w-sm">
                    <AuthFormCard>
                        <AuthHeader />
                        <h2 className="text-center text-lg text-slate-300 -mt-4 mb-6">Create Account</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <InputWithIcon
                                icon={<UserIcon />}
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Username"
                                required
                            />
                            <InputWithIcon
                                icon={<LockIcon />}
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                required
                            />
                            <FormButton type="submit">SIGN UP</FormButton>
                        </form>
                        <div className="text-center text-sm mt-6">
                            <a 
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    onSwitchToLogin();
                                }}
                                className="text-cyan-400 hover:underline"
                            >
                                Already have an account? Log In
                            </a>
                        </div>
                    </AuthFormCard>
                </div>
            </AuthLayout>
        </>
    );
};