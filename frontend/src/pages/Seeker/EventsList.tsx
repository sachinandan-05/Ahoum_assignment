import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../api/client';
import toast from 'react-hot-toast';
import { Search, Filter, Calendar, MapPin } from 'lucide-react';

type Event = {
    id: number;
    title: string;
    description: string;
    starts_at: string;
    location: string;
    language: string;
    available_seats: number | null;
    capacity: number | null;
};

type FilterData = {
    q?: string;
    location?: string;
    language?: string;
    starts_after?: string;
    starts_before?: string;
};

const EventsList: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { register, handleSubmit, watch } = useForm<FilterData>();

    // Debounce search? Or just search on submit/button. 
    // Let's use simple submit for now.

    const fetchEvents = async (filters: FilterData = {}) => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value) params.append(key, value);
            });

            const response = await api.get(`/events/events/?${params.toString()}`);
            const data = Array.isArray(response.data) ? response.data : response.data.results;
            setEvents(data);
        } catch (error) {
            toast.error('Failed to load events');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const onSubmit = (data: FilterData) => {
        fetchEvents(data);
    };

    const handleEnroll = async (eventId: number) => {
        try {
            await api.post(`/events/events/${eventId}/enroll/`);
            toast.success('Enrolled successfully!');
            // Refresh to update seat counts
            fetchEvents(watch());
        } catch (error: any) {
            toast.error(error.response?.data?.join(' ') || error.response?.data?.message || 'Enrollment failed');
        }
    };

    return (
        <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar Filters */}
            <div className="w-full md:w-64 flex-shrink-0">
                <div className="bg-white p-4 shadow rounded-lg">
                    <h3 className="font-semibold text-gray-700 mb-4 flex items-center">
                        <Filter className="h-4 w-4 mr-2" /> Filters
                    </h3>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500">Search</label>
                            <div className="relative mt-1">
                                <input {...register('q')} placeholder="Keywords..." className="block w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                                <Search className="h-4 w-4 text-gray-400 absolute left-2 top-2.5" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500">Location</label>
                            <input {...register('location')} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500">Language</label>
                            <input {...register('language')} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500">Starts After</label>
                            <input type="datetime-local" {...register('starts_after')} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500">Starts Before</label>
                            <input type="datetime-local" {...register('starts_before')} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <button type="submit" className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            Apply Filters
                        </button>
                    </form>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Upcoming Events</h2>
                {isLoading ? (
                    <p>Loading...</p>
                ) : events.length === 0 ? (
                    <p className="text-gray-500">No events found matching your criteria.</p>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                        {events.map(event => (
                            <div key={event.id} className="bg-white flex flex-col justify-between overflow-hidden shadow rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-200">
                                <div className="p-5">
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-lg font-bold text-gray-900 line-clamp-2">{event.title}</h3>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                            {event.language}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-sm text-gray-600 line-clamp-3">{event.description}</p>
                                    <div className="mt-4 space-y-2">
                                        <div className="flex items-center text-sm text-gray-500">
                                            <Calendar className="h-4 w-4 mr-2" />
                                            {new Date(event.starts_at).toLocaleString()}
                                        </div>
                                        <div className="flex items-center text-sm text-gray-500">
                                            <MapPin className="h-4 w-4 mr-2" />
                                            {event.location}
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-5 py-3 flex justify-between items-center border-t border-gray-100">
                                    <span className="text-xs text-gray-500 font-medium">
                                        {event.available_seats !== null
                                            ? `${event.available_seats} spots left`
                                            : 'Open Capacity'}
                                    </span>
                                    <button
                                        onClick={() => handleEnroll(event.id)}
                                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm"
                                    >
                                        Enroll Now
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventsList;
