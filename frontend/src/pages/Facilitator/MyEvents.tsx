import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import toast from 'react-hot-toast';
import { Calendar, MapPin, Users, Plus, Clock, TrendingUp, Eye, MoreVertical, Globe } from 'lucide-react';

type Event = {
    id: number;
    title: string;
    description: string;
    starts_at: string;
    ends_at: string;
    location: string;
    language: string;
    capacity: number | null;
    available_seats: number | null;
};

const MyEvents: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const response = await api.get('/events/events/my_events/');
            const data = Array.isArray(response.data) ? response.data : response.data.results;
            setEvents(data);
        } catch (error) {
            toast.error('Failed to load events');
        } finally {
            setIsLoading(false);
        }
    };

    const getEventStatus = (startsAt: string, endsAt: string) => {
        const now = new Date();
        const start = new Date(startsAt);
        const end = new Date(endsAt);
        
        if (now < start) return { label: 'Upcoming', color: 'bg-blue-100 text-blue-700' };
        if (now >= start && now <= end) return { label: 'Live', color: 'bg-green-100 text-green-700' };
        return { label: 'Completed', color: 'bg-gray-100 text-gray-600' };
    };

    const totalEnrollments = events.reduce((acc, event) => {
        if (event.capacity && event.available_seats !== null) {
            return acc + (event.capacity - event.available_seats);
        }
        return acc;
    }, 0);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse mb-4"></div>
                            <div className="h-4 w-full bg-gray-100 rounded animate-pulse mb-2"></div>
                            <div className="h-4 w-2/3 bg-gray-100 rounded animate-pulse"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Events</h1>
                    <p className="text-gray-500 mt-1">Manage and track your created events</p>
                </div>
                <Link
                    to="/create-event"
                    className="inline-flex items-center justify-center px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
                >
                    <Plus className="h-5 w-5 mr-2" />
                    Create Event
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-indigo-100 text-sm font-medium">Total Events</p>
                            <p className="text-3xl font-bold mt-1">{events.length}</p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <Calendar className="h-6 w-6" />
                        </div>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-emerald-100 text-sm font-medium">Total Enrollments</p>
                            <p className="text-3xl font-bold mt-1">{totalEnrollments}</p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <Users className="h-6 w-6" />
                        </div>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-orange-500 to-pink-600 rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-orange-100 text-sm font-medium">Upcoming Events</p>
                            <p className="text-3xl font-bold mt-1">
                                {events.filter(e => new Date(e.starts_at) > new Date()).length}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <TrendingUp className="h-6 w-6" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Events Grid */}
            {events.length === 0 ? (
                <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No events yet</h3>
                    <p className="text-gray-500 mb-6">Get started by creating your first event</p>
                    <Link
                        to="/create-event"
                        className="inline-flex items-center px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        Create Your First Event
                    </Link>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {events.map((event, index) => {
                        const status = getEventStatus(event.starts_at, event.ends_at);
                        const enrolledCount = event.capacity && event.available_seats !== null 
                            ? event.capacity - event.available_seats 
                            : 0;
                        const fillPercentage = event.capacity 
                            ? ((event.capacity - (event.available_seats || 0)) / event.capacity) * 100 
                            : 0;

                        return (
                            <div 
                                key={event.id} 
                                className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-gray-200 transition-all duration-300 overflow-hidden group"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                {/* Card Header */}
                                <div className="p-6 pb-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                                            {status.label}
                                        </span>
                                        <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                                            <MoreVertical className="h-5 w-5 text-gray-400" />
                                        </button>
                                    </div>
                                    
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                                        {event.title}
                                    </h3>
                                    <p className="text-gray-500 text-sm line-clamp-2 mb-4">
                                        {event.description}
                                    </p>

                                    {/* Event Details */}
                                    <div className="space-y-2">
                                        <div className="flex items-center text-sm text-gray-600">
                                            <Calendar className="h-4 w-4 mr-2 text-indigo-500" />
                                            {new Date(event.starts_at).toLocaleDateString('en-US', {
                                                weekday: 'short',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </div>
                                        <div className="flex items-center text-sm text-gray-600">
                                            <MapPin className="h-4 w-4 mr-2 text-pink-500" />
                                            {event.location}
                                        </div>
                                        <div className="flex items-center text-sm text-gray-600">
                                            <Globe className="h-4 w-4 mr-2 text-emerald-500" />
                                            {event.language}
                                        </div>
                                    </div>
                                </div>

                                {/* Card Footer */}
                                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                                    {event.capacity !== null ? (
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm text-gray-600">
                                                    <Users className="h-4 w-4 inline mr-1" />
                                                    {enrolledCount} / {event.capacity} enrolled
                                                </span>
                                                <span className="text-sm font-semibold text-indigo-600">
                                                    {Math.round(fillPercentage)}%
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div 
                                                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                                                    style={{ width: `${fillPercentage}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center text-sm text-gray-500">
                                            <Users className="h-4 w-4 mr-2" />
                                            Unlimited capacity
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MyEvents;
