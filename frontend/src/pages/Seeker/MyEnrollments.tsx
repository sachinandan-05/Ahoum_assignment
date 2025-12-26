import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import toast from 'react-hot-toast';
import { Calendar, CheckCircle, Clock } from 'lucide-react';

type Enrollment = {
    id: number;
    event: number;
    event_title: string;
    event_starts_at: string;
    status: 'ENROLLED' | 'CANCELED';
};

const MyEnrollments: React.FC = () => {
    const [upcoming, setUpcoming] = useState<Enrollment[]>([]);
    const [past, setPast] = useState<Enrollment[]>([]);
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [upRes, pastRes] = await Promise.all([
                    api.get('/events/enrollments/upcoming/'),
                    api.get('/events/enrollments/past/')
                ]);
                setUpcoming(Array.isArray(upRes.data) ? upRes.data : upRes.data.results);
                setPast(Array.isArray(pastRes.data) ? pastRes.data : pastRes.data.results);
            } catch (error) {
                toast.error('Failed to load enrollments');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">My Enrollments</h2>
            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('upcoming')}
                        className={`${activeTab === 'upcoming'
                            ? 'border-indigo-500 text-indigo-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} 
                        whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                    >
                        <Clock className="w-4 h-4 mr-2" />
                        Upcoming
                    </button>
                    <button
                        onClick={() => setActiveTab('past')}
                        className={`${activeTab === 'past'
                            ? 'border-indigo-500 text-indigo-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} 
                        whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                    >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Past Events
                    </button>
                </nav>
            </div>

            {isLoading ? (
                <p>Loading...</p>
            ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200">
                        {(activeTab === 'upcoming' ? upcoming : past).length === 0 ? (
                            <li className="px-6 py-4 text-center text-gray-500">No enrollments found.</li>
                        ) : (
                            (activeTab === 'upcoming' ? upcoming : past).map((enrollment) => (
                                <li key={enrollment.id}>
                                    <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 flex justify-between items-center">
                                        <div>
                                            <p className="text-sm font-medium text-indigo-600 truncate">{enrollment.event_title}</p>
                                            <p className="mt-1 flex items-center text-sm text-gray-500">
                                                <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                                {new Date(enrollment.event_starts_at).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="ml-2 flex-shrink-0 flex">
                                            <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${enrollment.status === 'ENROLLED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {enrollment.status}
                                            </p>
                                        </div>
                                    </div>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default MyEnrollments;
