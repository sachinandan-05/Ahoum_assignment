import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/client';
import toast from 'react-hot-toast';
import { 
    Calendar, MapPin, Users, Globe, FileText, Clock, 
    ArrowLeft, Sparkles, CheckCircle, AlertCircle 
} from 'lucide-react';

type EventFormData = {
    title: string;
    description: string;
    language: string;
    location: string;
    starts_at: string;
    ends_at: string;
    capacity?: number;
};

const CreateEvent: React.FC = () => {
    const { register, handleSubmit, watch, formState: { errors } } = useForm<EventFormData>();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState(1);

    const watchedFields = watch();

    const onSubmit = async (data: EventFormData) => {
        setIsLoading(true);
        try {
            await api.post('/events/events/', data);
            toast.success('Event created successfully! 🎉');
            navigate('/my-events');
        } catch (error: any) {
            const errorMsg = error.response?.data?.detail 
                || Object.values(error.response?.data || {}).flat().join(', ')
                || 'Failed to create event';
            toast.error(errorMsg);
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const inputClasses = "w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 hover:border-gray-300";
    const labelClasses = "block text-sm font-semibold text-gray-700 mb-2";
    const errorClasses = "mt-1 text-sm text-red-500 flex items-center gap-1";

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <Link 
                    to="/my-events" 
                    className="inline-flex items-center text-gray-500 hover:text-gray-700 transition-colors mb-4"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to My Events
                </Link>
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Create New Event</h1>
                        <p className="text-gray-500">Fill in the details to create your event</p>
                    </div>
                </div>
            </div>

            {/* Progress Steps */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    {[
                        { num: 1, label: 'Basic Info' },
                        { num: 2, label: 'Date & Location' },
                        { num: 3, label: 'Capacity' }
                    ].map((s, i) => (
                        <React.Fragment key={s.num}>
                            <div 
                                className={`flex items-center cursor-pointer ${step >= s.num ? 'text-indigo-600' : 'text-gray-400'}`}
                                onClick={() => setStep(s.num)}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-200 ${
                                    step >= s.num 
                                        ? 'bg-indigo-600 text-white' 
                                        : 'bg-gray-100 text-gray-400'
                                }`}>
                                    {step > s.num ? <CheckCircle className="h-5 w-5" /> : s.num}
                                </div>
                                <span className="ml-2 font-medium hidden sm:block">{s.label}</span>
                            </div>
                            {i < 2 && (
                                <div className={`flex-1 h-1 mx-4 rounded-full transition-all duration-300 ${
                                    step > s.num ? 'bg-indigo-600' : 'bg-gray-200'
                                }`} />
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Step 1: Basic Info */}
                    <div className={`p-8 ${step === 1 ? 'block' : 'hidden'}`}>
                        <div className="flex items-center gap-2 mb-6">
                            <FileText className="h-5 w-5 text-indigo-600" />
                            <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
                        </div>
                        
                        <div className="space-y-6">
                            <div>
                                <label className={labelClasses}>
                                    Event Title *
                                </label>
                                <input 
                                    {...register('title', { required: 'Title is required' })} 
                                    placeholder="Enter a catchy title for your event"
                                    className={inputClasses}
                                />
                                {errors.title && (
                                    <p className={errorClasses}>
                                        <AlertCircle className="h-4 w-4" />
                                        {errors.title.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className={labelClasses}>
                                    Description *
                                </label>
                                <textarea 
                                    {...register('description', { required: 'Description is required' })} 
                                    rows={4}
                                    placeholder="Describe what attendees can expect from your event..."
                                    className={inputClasses + " resize-none"}
                                />
                                {errors.description && (
                                    <p className={errorClasses}>
                                        <AlertCircle className="h-4 w-4" />
                                        {errors.description.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className={labelClasses}>
                                    <Globe className="h-4 w-4 inline mr-1" />
                                    Language *
                                </label>
                                <select 
                                    {...register('language', { required: 'Language is required' })}
                                    className={inputClasses}
                                >
                                    <option value="">Select language</option>
                                    <option value="English">English</option>
                                    <option value="Hindi">Hindi</option>
                                    <option value="Spanish">Spanish</option>
                                    <option value="French">French</option>
                                    <option value="German">German</option>
                                    <option value="Other">Other</option>
                                </select>
                                {errors.language && (
                                    <p className={errorClasses}>
                                        <AlertCircle className="h-4 w-4" />
                                        {errors.language.message}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Step 2: Date & Location */}
                    <div className={`p-8 ${step === 2 ? 'block' : 'hidden'}`}>
                        <div className="flex items-center gap-2 mb-6">
                            <Calendar className="h-5 w-5 text-indigo-600" />
                            <h2 className="text-xl font-semibold text-gray-900">Date & Location</h2>
                        </div>
                        
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className={labelClasses}>
                                        <Clock className="h-4 w-4 inline mr-1" />
                                        Start Date & Time *
                                    </label>
                                    <input 
                                        type="datetime-local" 
                                        {...register('starts_at', { required: 'Start time is required' })}
                                        className={inputClasses}
                                    />
                                    {errors.starts_at && (
                                        <p className={errorClasses}>
                                            <AlertCircle className="h-4 w-4" />
                                            {errors.starts_at.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className={labelClasses}>
                                        <Clock className="h-4 w-4 inline mr-1" />
                                        End Date & Time *
                                    </label>
                                    <input 
                                        type="datetime-local" 
                                        {...register('ends_at', { required: 'End time is required' })}
                                        className={inputClasses}
                                    />
                                    {errors.ends_at && (
                                        <p className={errorClasses}>
                                            <AlertCircle className="h-4 w-4" />
                                            {errors.ends_at.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className={labelClasses}>
                                    <MapPin className="h-4 w-4 inline mr-1" />
                                    Location *
                                </label>
                                <input 
                                    {...register('location', { required: 'Location is required' })} 
                                    placeholder="Enter venue or online meeting link"
                                    className={inputClasses}
                                />
                                {errors.location && (
                                    <p className={errorClasses}>
                                        <AlertCircle className="h-4 w-4" />
                                        {errors.location.message}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Step 3: Capacity */}
                    <div className={`p-8 ${step === 3 ? 'block' : 'hidden'}`}>
                        <div className="flex items-center gap-2 mb-6">
                            <Users className="h-5 w-5 text-indigo-600" />
                            <h2 className="text-xl font-semibold text-gray-900">Capacity Settings</h2>
                        </div>
                        
                        <div className="space-y-6">
                            <div>
                                <label className={labelClasses}>
                                    Maximum Capacity (Optional)
                                </label>
                                <input 
                                    type="number" 
                                    {...register('capacity', { min: { value: 1, message: 'Capacity must be at least 1' } })} 
                                    placeholder="Leave empty for unlimited"
                                    className={inputClasses}
                                />
                                <p className="mt-2 text-sm text-gray-500">
                                    Set a limit on how many people can enroll. Leave empty for unlimited capacity.
                                </p>
                            </div>

                            {/* Preview Card */}
                            <div className="mt-8 p-6 bg-gradient-to-br from-gray-50 to-indigo-50 rounded-xl border border-gray-200">
                                <h3 className="text-sm font-semibold text-gray-600 mb-4">Event Preview</h3>
                                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                    <h4 className="font-bold text-lg text-gray-900 mb-2">
                                        {watchedFields.title || 'Your Event Title'}
                                    </h4>
                                    <p className="text-gray-500 text-sm mb-3 line-clamp-2">
                                        {watchedFields.description || 'Event description will appear here...'}
                                    </p>
                                    <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                                        {watchedFields.starts_at && (
                                            <span className="flex items-center bg-gray-100 px-2 py-1 rounded-full">
                                                <Calendar className="h-3 w-3 mr-1" />
                                                {new Date(watchedFields.starts_at).toLocaleDateString()}
                                            </span>
                                        )}
                                        {watchedFields.location && (
                                            <span className="flex items-center bg-gray-100 px-2 py-1 rounded-full">
                                                <MapPin className="h-3 w-3 mr-1" />
                                                {watchedFields.location}
                                            </span>
                                        )}
                                        {watchedFields.language && (
                                            <span className="flex items-center bg-gray-100 px-2 py-1 rounded-full">
                                                <Globe className="h-3 w-3 mr-1" />
                                                {watchedFields.language}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() => setStep(Math.max(1, step - 1))}
                            className={`px-6 py-2.5 text-gray-600 font-medium rounded-xl hover:bg-gray-100 transition-colors ${
                                step === 1 ? 'invisible' : ''
                            }`}
                        >
                            Previous
                        </button>
                        
                        <div className="flex gap-3">
                            {step < 3 ? (
                                <button
                                    type="button"
                                    onClick={() => setStep(Math.min(3, step + 1))}
                                    className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
                                >
                                    Continue
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="h-5 w-5 mr-2" />
                                            Create Event
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default CreateEvent;
