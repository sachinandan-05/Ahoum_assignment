import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import api, { setTokens } from '../../api/client';
import toast from 'react-hot-toast';
import { Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';

type LoginData = {
    email: string;
    password: string;
};

const Login: React.FC = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<LoginData>();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const onSubmit = async (data: LoginData) => {
        setIsLoading(true);
        try {
            const response = await api.post('/auth/login/', data);
            const { access, refresh, role } = response.data;
            setTokens(access, refresh);
            localStorage.setItem('role', role);

            toast.success('Welcome back! 🎉');

            if (role === 'FACILITATOR') {
                navigate('/my-events');
            } else {
                navigate('/events');
            }

        } catch (error: any) {
            console.error(error);
            const errorMsg = error.response?.data?.non_field_errors?.[0] 
                || error.response?.data?.detail 
                || 'Login failed. Please check your credentials.';
            toast.error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-pattern flex">
            {/* Left Panel - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-12 flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full">
                    <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float"></div>
                    <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
                </div>
                
                <div className="relative z-10">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-8 w-8 text-white" />
                        <span className="text-2xl font-bold text-white">EventsPlatform</span>
                    </div>
                </div>
                
                <div className="relative z-10 space-y-6">
                    <h1 className="text-5xl font-bold text-white leading-tight">
                        Discover Amazing<br />Events Near You
                    </h1>
                    <p className="text-xl text-white/80 max-w-md">
                        Connect with facilitators, join exciting events, and create unforgettable experiences.
                    </p>
                    <div className="flex items-center gap-4 pt-4">
                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-white/30 to-white/10 border-2 border-white/50 flex items-center justify-center text-white text-sm font-medium">
                                    {String.fromCharCode(64 + i)}
                                </div>
                            ))}
                        </div>
                        <p className="text-white/80 text-sm">Join 10,000+ users</p>
                    </div>
                </div>
                
                <div className="relative z-10 text-white/60 text-sm">
                    © 2025 EventsPlatform. All rights reserved.
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 bg-gray-50">
                <div className="mx-auto w-full max-w-sm lg:max-w-md">
                    <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
                        <Sparkles className="h-8 w-8 text-indigo-600" />
                        <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">EventsPlatform</span>
                    </div>

                    <div className="animate-fade-in">
                        <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
                        <p className="mt-2 text-gray-600">
                            Don't have an account?{' '}
                            <Link to="/signup" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
                                Sign up for free
                            </Link>
                        </p>
                    </div>

                    <div className="mt-8 animate-slide-up">
                        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                    Email address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="email"
                                        type="email"
                                        autoComplete="email"
                                        placeholder="you@example.com"
                                        {...register('email', { 
                                            required: 'Email is required',
                                            pattern: {
                                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                message: 'Invalid email address'
                                            }
                                        })}
                                        className="input-field pl-12"
                                    />
                                </div>
                                {errors.email && (
                                    <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="password"
                                        type="password"
                                        autoComplete="current-password"
                                        placeholder="••••••••"
                                        {...register('password', { required: 'Password is required' })}
                                        className="input-field pl-12"
                                    />
                                </div>
                                {errors.password && (
                                    <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
                                )}
                            </div>

                            <button type="submit" disabled={isLoading} className="btn-primary group">
                                {isLoading ? (
                                    <>
                                        <div className="spinner mr-2"></div>
                                        Signing in...
                                    </>
                                ) : (
                                    <>
                                        Sign in
                                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-gray-50 text-gray-500">Secure login with JWT</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 grid grid-cols-2 gap-4 text-center">
                            <div className="p-4 rounded-xl bg-white border border-gray-100 shadow-sm">
                                <div className="text-2xl mb-1">🔒</div>
                                <p className="text-xs text-gray-600">Secure Auth</p>
                            </div>
                            <div className="p-4 rounded-xl bg-white border border-gray-100 shadow-sm">
                                <div className="text-2xl mb-1">⚡</div>
                                <p className="text-xs text-gray-600">Fast Access</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
