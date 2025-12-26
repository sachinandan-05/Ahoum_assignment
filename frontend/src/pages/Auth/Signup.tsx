import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/client';
import toast from 'react-hot-toast';
import { Mail, Lock, ArrowRight, Sparkles, Users, Calendar, Check, X } from 'lucide-react';

type SignupData = {
    email: string;
    password: string;
    role: 'SEEKER' | 'FACILITATOR';
};

const Signup: React.FC = () => {
    const { register, handleSubmit, watch, formState: { errors } } = useForm<SignupData>({
        defaultValues: { role: 'SEEKER' }
    });
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const password = watch('password', '');
    const selectedRole = watch('role');

    const passwordStrength = useMemo(() => {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        return strength;
    }, [password]);

    const getStrengthColor = () => {
        if (passwordStrength <= 1) return 'bg-red-500';
        if (passwordStrength <= 2) return 'bg-orange-500';
        if (passwordStrength <= 3) return 'bg-yellow-500';
        if (passwordStrength <= 4) return 'bg-green-400';
        return 'bg-green-500';
    };

    const getStrengthText = () => {
        if (passwordStrength <= 1) return 'Weak';
        if (passwordStrength <= 2) return 'Fair';
        if (passwordStrength <= 3) return 'Good';
        if (passwordStrength <= 4) return 'Strong';
        return 'Very Strong';
    };

    const onSubmit = async (data: SignupData) => {
        setIsLoading(true);
        try {
            await api.post('/auth/signup/', data);
            toast.success('Account created! Please check your email for OTP.');
            navigate(`/verify?email=${encodeURIComponent(data.email)}`);
        } catch (error: any) {
            console.error(error);
            const errorMsg = error.response?.data?.email?.[0] 
                || error.response?.data?.password?.[0]
                || error.response?.data?.non_field_errors?.[0]
                || 'Signup failed. Please try again.';
            toast.error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-pattern flex">
            {/* Left Panel - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-500 p-12 flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full">
                    <div className="absolute top-20 right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float"></div>
                    <div className="absolute bottom-40 left-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }}></div>
                </div>
                
                <div className="relative z-10">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-8 w-8 text-white" />
                        <span className="text-2xl font-bold text-white">EventsPlatform</span>
                    </div>
                </div>
                
                <div className="relative z-10 space-y-6">
                    <h1 className="text-5xl font-bold text-white leading-tight">
                        Start Your<br />Journey Today
                    </h1>
                    <p className="text-xl text-white/80 max-w-md">
                        Create an account and unlock a world of amazing events and opportunities.
                    </p>
                    
                    <div className="space-y-4 pt-6">
                        <div className="flex items-center gap-3 text-white/90">
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                                <Calendar className="h-5 w-5" />
                            </div>
                            <span>Browse and enroll in events</span>
                        </div>
                        <div className="flex items-center gap-3 text-white/90">
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                                <Users className="h-5 w-5" />
                            </div>
                            <span>Connect with facilitators</span>
                        </div>
                        <div className="flex items-center gap-3 text-white/90">
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                                <Sparkles className="h-5 w-5" />
                            </div>
                            <span>Create your own events</span>
                        </div>
                    </div>
                </div>
                
                <div className="relative z-10 text-white/60 text-sm">
                    © 2025 EventsPlatform. All rights reserved.
                </div>
            </div>

            {/* Right Panel - Signup Form */}
            <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 bg-gray-50">
                <div className="mx-auto w-full max-w-sm lg:max-w-md">
                    <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
                        <Sparkles className="h-8 w-8 text-indigo-600" />
                        <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">EventsPlatform</span>
                    </div>

                    <div className="animate-fade-in">
                        <h2 className="text-3xl font-bold text-gray-900">Create an account</h2>
                        <p className="mt-2 text-gray-600">
                            Already have an account?{' '}
                            <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </div>

                    <div className="mt-8 animate-slide-up">
                        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
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
                                        autoComplete="new-password"
                                        placeholder="Create a strong password"
                                        {...register('password', { 
                                            required: 'Password is required',
                                            minLength: { value: 6, message: 'Password must be at least 6 characters' }
                                        })}
                                        className="input-field pl-12"
                                    />
                                </div>
                                {errors.password && (
                                    <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
                                )}
                                
                                {password && (
                                    <div className="mt-3 space-y-2">
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map((level) => (
                                                <div
                                                    key={level}
                                                    className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                                                        level <= passwordStrength ? getStrengthColor() : 'bg-gray-200'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                        <p className={`text-xs font-medium ${
                                            passwordStrength <= 2 ? 'text-red-500' : 
                                            passwordStrength <= 3 ? 'text-yellow-600' : 'text-green-600'
                                        }`}>
                                            {getStrengthText()}
                                        </p>
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div className={`flex items-center gap-1 ${password.length >= 8 ? 'text-green-600' : 'text-gray-400'}`}>
                                                {password.length >= 8 ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                                                8+ characters
                                            </div>
                                            <div className={`flex items-center gap-1 ${/[A-Z]/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
                                                {/[A-Z]/.test(password) ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                                                Uppercase
                                            </div>
                                            <div className={`flex items-center gap-1 ${/[0-9]/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
                                                {/[0-9]/.test(password) ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                                                Number
                                            </div>
                                            <div className={`flex items-center gap-1 ${/[^A-Za-z0-9]/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
                                                {/[^A-Za-z0-9]/.test(password) ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                                                Special char
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    I want to
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <label className={`relative flex flex-col items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                                        selectedRole === 'SEEKER' 
                                            ? 'border-indigo-500 bg-indigo-50' 
                                            : 'border-gray-200 hover:border-gray-300 bg-white'
                                    }`}>
                                        <input
                                            type="radio"
                                            value="SEEKER"
                                            {...register('role')}
                                            className="sr-only"
                                        />
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                                            selectedRole === 'SEEKER' ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-500'
                                        }`}>
                                            <Users className="h-6 w-6" />
                                        </div>
                                        <span className={`font-medium ${selectedRole === 'SEEKER' ? 'text-indigo-700' : 'text-gray-700'}`}>
                                            Attend Events
                                        </span>
                                        <span className="text-xs text-gray-500 mt-1">Seeker</span>
                                    </label>
                                    
                                    <label className={`relative flex flex-col items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                                        selectedRole === 'FACILITATOR' 
                                            ? 'border-indigo-500 bg-indigo-50' 
                                            : 'border-gray-200 hover:border-gray-300 bg-white'
                                    }`}>
                                        <input
                                            type="radio"
                                            value="FACILITATOR"
                                            {...register('role')}
                                            className="sr-only"
                                        />
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                                            selectedRole === 'FACILITATOR' ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-500'
                                        }`}>
                                            <Calendar className="h-6 w-6" />
                                        </div>
                                        <span className={`font-medium ${selectedRole === 'FACILITATOR' ? 'text-indigo-700' : 'text-gray-700'}`}>
                                            Create Events
                                        </span>
                                        <span className="text-xs text-gray-500 mt-1">Facilitator</span>
                                    </label>
                                </div>
                            </div>

                            <button type="submit" disabled={isLoading} className="btn-primary group mt-6">
                                {isLoading ? (
                                    <>
                                        <div className="spinner mr-2"></div>
                                        Creating account...
                                    </>
                                ) : (
                                    <>
                                        Create account
                                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <p className="mt-6 text-center text-xs text-gray-500">
                            By signing up, you agree to our Terms of Service and Privacy Policy
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
