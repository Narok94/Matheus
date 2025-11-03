

import React, { useState } from 'react';
import { InspecProLogo, UserIcon, LockIcon, MailIcon, BuildingIcon } from './Icons';

interface AuthPageProps {
    showToast: (message: string, type?: 'success' | 'error') => void;
}

interface LoginPageProps extends AuthPageProps {
    onLogin: (username: string, pass: string) => void;
    onSwitchToRegister: () => void;
}

interface RegisterPageProps extends AuthPageProps {
    onRegister: (username: string, email: string, pass: string, fullName: string, address: string) => void;
    onSwitchToLogin: () => void;
}

const LoginBackground = () => (
    <div className="absolute inset-0 z-0 overflow-hidden bg-[#0a0f1f]">
        <svg width="100%" height="100%" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" className="absolute inset-0">
            <defs>
                <filter id="hud-glow">
                    <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
                 <linearGradient id="scanline-gradient" x1="0%" x2="0%" y1="0%" y2="100%">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0" />
                    <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                </linearGradient>
            </defs>

            <g transform="translate(0, 30)">
                {/* Background static grid */}
                <g stroke="#1e293b" strokeWidth="0.5">
                    {[...Array(40)].map((_, i) => (
                        <path key={`h-${i}`} d={`M 0 ${i * 15} H 800`} />
                    ))}
                    {[...Array(54)].map((_, i) => (
                        <path key={`v-${i}`} d={`M ${i * 15} 0 V 600`} />
                    ))}
                </g>

                {/* Central HUD framing */}
                <g transform="translate(400, 300)" fill="none" stroke="#38bdf8" filter="url(#hud-glow)">
                    {/* Corner Brackets */}
                    <g strokeWidth="2" opacity="0.8">
                        {/* Top-Left */}
                        <path d="M -180 -130 L -220 -130 L -220 -90">
                            <animate attributeName="stroke-dasharray" values="0 80; 80 0; 0 80" dur="5s" repeatCount="indefinite" />
                        </path>
                        {/* Top-Right */}
                        <path d="M 180 -130 L 220 -130 L 220 -90">
                             <animate attributeName="stroke-dasharray" values="80 0; 0 80; 80 0" dur="5s" repeatCount="indefinite" />
                        </path>
                        {/* Bottom-Left */}
                        <path d="M -180 130 L -220 130 L -220 90">
                             <animate attributeName="stroke-dasharray" values="0 80; 80 0; 0 80" dur="5s" repeatCount="indefinite" begin="2.5s" />
                        </path>
                        {/* Bottom-Right */}
                        <path d="M 180 130 L 220 130 L 220 90">
                            <animate attributeName="stroke-dasharray" values="80 0; 0 80; 80 0" dur="5s" repeatCount="indefinite" begin="2.5s" />
                        </path>
                    </g>

                    {/* Rotating Rings */}
                    <g strokeWidth="1" opacity="0.6">
                        {/* Outer ring - dashed */}
                        <circle cx="0" cy="0" r="180" strokeDasharray="5 15">
                            <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="30s" repeatCount="indefinite" />
                        </circle>
                        {/* Inner ring - partial */}
                        <path d="M 0 -150 A 150 150 0 0 1 106 106">
                             <animateTransform attributeName="transform" type="rotate" from="360 0 0" to="0 0 0" dur="20s" repeatCount="indefinite" />
                        </path>
                         <path d="M 0 150 A 150 150 0 0 1 -106 -106">
                             <animateTransform attributeName="transform" type="rotate" from="360 0 0" to="0 0 0" dur="20s" repeatCount="indefinite" />
                        </path>
                    </g>
                </g>

                {/* Scanning Line */}
                <rect x="0" y="-50" width="100%" height="100" fill="url(#scanline-gradient)" opacity="0.4">
                    <animate attributeName="y" from="-100" to="600" dur="8s" repeatCount="indefinite" begin="0s" />
                </rect>

                {/* Twinkling Particles */}
                 <g fill="#f1f5f9" opacity="0.3">
                    {[...Array(70)].map((_, i) => {
                        const x = Math.random() * 800;
                        const y = Math.random() * 600;
                        const r = 0.5 + Math.random() * 0.8;
                        const dur = 3 + Math.random() * 4;
                        const delay = Math.random() * 2;
                        return (
                            <circle key={`p-${i}`} cx={x} cy={y} r={r}>
                                <animate attributeName="opacity" values="0;1;0" dur={`${dur}s`} begin={`${delay}s`} repeatCount="indefinite" />
                            </circle>
                        )
                    })}
                </g>
            </g>
        </svg>
    </div>
);


const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 relative font-sans text-white">
        <LoginBackground />
        <div className="w-full max-w-sm z-10">
            {children}
        </div>
    </div>
);

const AuthFormCard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
     <div className="w-full p-8 space-y-6 bg-slate-900/40 backdrop-blur-md rounded-2xl border border-cyan-400/30 shadow-2xl shadow-cyan-500/10">
        {children}
    </div>
);

const AuthHeader = () => (
    <div className="flex flex-col items-center mb-6 text-center">
        <InspecProLogo className="w-20 h-20 text-cyan-300 mb-2" />
        <h1 className="text-3xl font-bold text-white tracking-wider">InspecPro</h1>
        <p className="text-cyan-200/70 text-sm">Gestão de Inspeções</p>
    </div>
);

const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { icon: React.ReactNode }> = ({ icon, ...props }) => (
    <div className="relative flex items-center group">
        <span className="absolute -left-3 text-cyan-400 font-mono text-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">/</span>
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>
        <input 
            {...props}
            className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
        />
        <span className="absolute -right-3 text-cyan-400 font-mono text-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">/</span>
    </div>
);

const FormButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = (props) => (
    <button 
        {...props}
        className="w-full py-3 px-4 font-bold text-white rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-400 transform active:scale-95 transition-all duration-200 shadow-lg shadow-cyan-500/20"
    />
);


export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, showToast, onSwitchToRegister }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onLogin(username, password);
    };

    return (
        <AuthLayout>
            <AuthHeader />
            <AuthFormCard>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <FormInput
                        icon={<UserIcon />}
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Username"
                        required
                    />
                    <FormInput
                        icon={<LockIcon />}
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        required
                    />
                    <FormButton type="submit">LOG IN</FormButton>
                </form>

                <div className="text-center flex justify-between items-center text-sm pt-4">
                    <a 
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            showToast("Função de recuperação em desenvolvimento.", "error");
                        }}
                        className="font-medium text-cyan-300 hover:text-cyan-100 transition-colors"
                    >
                        Forgot Password?
                    </a>
                    <a 
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            onSwitchToRegister();
                        }}
                        className="font-medium text-cyan-300 hover:text-cyan-100 transition-colors"
                    >
                        Sign Up
                    </a>
                </div>
            </AuthFormCard>
            <div className="text-center mt-6 text-xs text-slate-400">
                <p>Use <strong className="font-semibold text-cyan-300/90">admin</strong> e senha <strong className="font-semibold text-cyan-300/90">admin</strong> para testar.</p>
            </div>
        </AuthLayout>
    );
};

export const RegisterPage: React.FC<RegisterPageProps> = ({ onRegister, showToast, onSwitchToLogin }) => {
    const [username, setUsername] = useState('');
    const [fullName, setFullName] = useState('');
    const [address, setAddress] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 4) {
            showToast("A senha deve ter pelo menos 4 caracteres.", "error");
            return;
        }
        onRegister(username, email, password, fullName, address);
    };

    return (
        <AuthLayout>
            <AuthHeader />
            <AuthFormCard>
                 <h2 className="text-center text-xl text-white font-semibold -mt-2 mb-4">Create Account</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormInput
                        icon={<UserIcon />}
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Usuário"
                        required
                    />
                    <FormInput
                        icon={<MailIcon />}
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email (Opcional)"
                    />
                    <FormInput
                        icon={<LockIcon />}
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Senha"
                        required
                    />
                    <FormInput
                        icon={<UserIcon />}
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Nome Completo (Opcional)"
                    />
                    <FormInput
                        icon={<BuildingIcon />}
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Endereço (Opcional)"
                    />
                    <div className="pt-2">
                         <FormButton type="submit">SIGN UP</FormButton>
                    </div>
                </form>

                <div className="text-center text-sm pt-4">
                    <a 
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            onSwitchToLogin();
                        }}
                        className="font-medium text-cyan-300 hover:text-cyan-100 transition-colors"
                    >
                        Already have an account? Log In
                    </a>
                </div>
            </AuthFormCard>
        </AuthLayout>
    );
};