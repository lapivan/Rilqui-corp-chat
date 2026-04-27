import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import { Input } from '../../../components/Input';
import { Button } from '../../../components/Button';
import { authApi } from '../../../api/auth';
import { UserPlus, ArrowLeft } from 'lucide-react';

export const RegisterPage = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        fullname: '',
        password: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            await authApi.register(formData);
            navigate('/login', { state: { registered: true } });
        } catch (err) {
            const axiosError = err as AxiosError<{ message?: string }>;
            setError(axiosError.response?.data?.message || 'Registration failed. Try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen w-full bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-slate-800 via-slate-950 to-black px-4 select-none">
            
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-[420px] relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                
                <div className="bg-slate-900/60 backdrop-blur-2xl border border-slate-700/50 p-8 rounded-[2.5rem] shadow-2xl">
                    
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-14 h-14 bg-slate-800 border border-slate-700 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
                            <UserPlus size={28} className="text-blue-400" />
                        </div>
                        <h1 className="text-white text-2xl font-bold tracking-tight">Create Account</h1>
                        <p className="text-slate-400 mt-1 text-sm">Start your journey with RilquiChat</p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-1">
                        <Input
                            label="Full Name"
                            name="fullname"
                            placeholder="Full Name"
                            value={formData.fullname}
                            onChange={handleChange}
                            required
                        />
                        <div className="grid grid-cols-1 gap-0">
                            <Input
                                label="Username"
                                name="username"
                                placeholder="Username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                            <Input
                                label="Email"
                                name="email"
                                type="email"
                                placeholder="example@mail.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <Input
                            label="Password"
                            name="password"
                            type="password"
                            placeholder="At least 6 characters"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium p-3 rounded-xl text-center mb-4 animate-shake">
                                {error}
                            </div>
                        )}

                        <div className="pt-4">
                            <Button type="submit" isLoading={isLoading}>
                                Create Account
                            </Button>
                        </div>
                    </form>
                </div>

                <div className="mt-8 flex justify-center">
                    <Link 
                        to="/login" 
                        className="group flex items-center text-slate-400 hover:text-white text-sm font-medium transition-colors"
                    >
                        <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                        Already have an account? Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
};