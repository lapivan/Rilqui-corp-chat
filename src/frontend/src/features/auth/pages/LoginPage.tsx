import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import { Input } from '../../../components/Input';
import { Button } from '../../../components/Button';
import { authApi } from '../../../api/auth';
import { useAuthStore } from '../../../store/authStore';
import { MessageSquare } from 'lucide-react';

export const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const response = await authApi.login({ email, password });
            setAuth(response.user, response.token);
            navigate('/');
        } catch (err) {
            const axiosError = err as AxiosError<{ message?: string }>;
            const message = axiosError.response?.data?.message || 'Invalid email or password. Please try again.';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-950 to-black px-4 sm:px-6 lg:px-8 select-none">
            
            {/*(Glow effect) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-[400px] relative z-10 animate-in fade-in zoom-in-95 duration-500">
                
                {/* card */}
                <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 p-8 rounded-3xl shadow-2xl">
                    
                    <div className="flex flex-col items-center mb-10">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 mb-5 transform transition-transform hover:scale-105">
                            <MessageSquare size={32} className="text-white" />
                        </div>
                        <h1 className="text-white text-3xl font-extrabold tracking-tight">Welcome Back</h1>
                        <p className="text-slate-400 mt-2 text-sm font-medium text-center">
                            Sign in to continue to RilquiChat
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-2">
                        <Input
                            label="Email Address"
                            type="email"
                            placeholder="name@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                        />
                        
                        <Input
                            label="Password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                        />

                        {/* error block */}
                        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${error ? 'max-h-20 opacity-100 mb-4' : 'max-h-0 opacity-0'}`}>
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium p-3 rounded-xl text-center">
                                {error}
                            </div>
                        </div>

                        <div className="pt-2">
                            <Button type="submit" isLoading={isLoading}>
                                Sign In
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Ссылки под карточкой */}
                <div className="mt-8 flex flex-col items-center space-y-6">
                    <p className="text-slate-400 text-sm">
                        Don't have an account?{' '}
                        <Link 
                            to="/register" 
                            className="text-blue-400 hover:text-blue-300 font-semibold transition-colors hover:underline underline-offset-4"
                        >
                            Create one
                        </Link>
                    </p>
                    
                    <span className="text-slate-600 text-[11px] font-bold uppercase tracking-[0.2em]">
                        Rilqui Corporation © 2026
                    </span>
                </div>
            </div>
        </div>
    );
};