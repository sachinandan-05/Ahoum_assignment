import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../../api/client';
import toast from 'react-hot-toast';
import { Mail, ArrowRight, Sparkles, RefreshCw, CheckCircle, ArrowLeft } from 'lucide-react';

const Verify: React.FC = () => {
    const [searchParams] = useSearchParams();
    const email = searchParams.get('email') || '';
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [countdown, setCountdown] = useState(300);
    const [canResend, setCanResend] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [countdown]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleChange = (index: number, value: string) => {
        if (value.length > 1) {
            const pastedValue = value.slice(0, 6).split('');
            const newOtp = [...otp];
            pastedValue.forEach((char, i) => {
                if (index + i < 6 && /^\d$/.test(char)) {
                    newOtp[index + i] = char;
                }
            });
            setOtp(newOtp);
            const nextIndex = Math.min(index + pastedValue.length, 5);
            inputRefs.current[nextIndex]?.focus();
            return;
        }
        if (value && !/^\d$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async () => {
        const otpString = otp.join('');
        if (otpString.length !== 6) {
            toast.error('Please enter the complete 6-digit OTP');
            return;
        }
        setIsLoading(true);
        try {
            await api.post('/auth/verify-email/', { email, otp: otpString });
            toast.success('Email verified successfully! 🎉');
            navigate('/login');
        } catch (error: any) {
            const errorMsg = error.response?.data?.non_field_errors?.[0]
                || error.response?.data?.detail
                || 'Verification failed. Please try again.';
            toast.error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        setIsResending(true);
        try {
            await api.post('/auth/resend-otp/', { email });
            toast.success('New OTP sent! Check your email.');
            setCountdown(300);
            setCanResend(false);
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } catch (error: any) {
            toast.error(error.response?.data?.non_field_errors?.[0] || 'Failed to resend OTP');
        } finally {
            setIsResending(false);
        }
    };

    const isComplete = otp.every(digit => digit !== '');

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                <div className="flex items-center justify-center gap-2 mb-8">
                    <Sparkles className="h-8 w-8 text-indigo-600" />
                    <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        EventsPlatform
                    </span>
                </div>

                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <Mail className="h-10 w-10 text-white" />
                        </div>
                    </div>

                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify your email</h2>
                        <p className="text-gray-600">We sent a 6-digit code to</p>
                        <p className="font-semibold text-indigo-600 mt-1">{email}</p>
                    </div>

                    <div className="flex justify-center gap-2 sm:gap-3 mb-6">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={el => inputRefs.current[index] = el}
                                type="text"
                                inputMode="numeric"
                                maxLength={6}
                                value={digit}
                                onChange={e => handleChange(index, e.target.value)}
                                onKeyDown={e => handleKeyDown(index, e)}
                                className={`w-11 h-14 sm:w-12 sm:h-16 text-center text-xl sm:text-2xl font-bold border-2 rounded-xl transition-all duration-200 focus:outline-none ${
                                    digit 
                                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                                        : 'border-gray-200 hover:border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                                }`}
                                autoFocus={index === 0}
                            />
                        ))}
                    </div>

                    <div className="text-center mb-6">
                        {countdown > 0 ? (
                            <div className="flex items-center justify-center gap-2 text-gray-500">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                <span>Code expires in <span className="font-mono font-semibold text-gray-700">{formatTime(countdown)}</span></span>
                            </div>
                        ) : (
                            <span className="text-red-500 font-medium">Code expired</span>
                        )}
                    </div>

                    <button
                        onClick={handleVerify}
                        disabled={isLoading || !isComplete}
                        className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 mb-4`}
                    >
                        {isLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                                Verifying...
                            </>
                        ) : (
                            <>
                                <CheckCircle className="mr-2 h-5 w-5" />
                                Verify Email
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </>
                        )}
                    </button>

                    <div className="text-center">
                        <p className="text-sm text-gray-500 mb-2">Didn't receive the code?</p>
                        <button
                            onClick={handleResend}
                            disabled={!canResend || isResending}
                            className={`inline-flex items-center text-sm font-semibold transition-colors ${
                                canResend 
                                    ? 'text-indigo-600 hover:text-indigo-700 cursor-pointer' 
                                    : 'text-gray-400 cursor-not-allowed'
                            }`}
                        >
                            {isResending ? (
                                <>
                                    <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="h-4 w-4 mr-1" />
                                    Resend Code
                                </>
                            )}
                        </button>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                        <Link to="/signup" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors">
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            Back to signup
                        </Link>
                    </div>
                </div>

                <p className="mt-6 text-center text-xs text-gray-500">
                    Check your spam folder if you don't see the email.
                </p>
            </div>
        </div>
    );
};

export default Verify;
