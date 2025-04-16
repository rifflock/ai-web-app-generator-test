import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Calendar, DollarSign, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { fetchSessions, createRegistration } from '../lib/api';
import type { Session } from '../lib/types';

export default function Sessions() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const data = await fetchSessions();
      setSessions(data);
    } catch (error) {
      console.error('Error loading sessions:', error);
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (session: Session) => {
    if (!user) return;

    try {
      await createRegistration(session.id, user.id);
      toast.success('Successfully registered for session');
    } catch (error) {
      console.error('Error registering for session:', error);
      toast.error('Failed to register for session');
    }
  };

  const getSessionTypeLabel = (type: Session['session_type']) => {
    switch (type) {
      case 'multi_week':
        return 'Multi-Week Program';
      case 'single':
        return 'Single Session';
      case 'donation':
        return 'Donation';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="animate-pulse text-ocean-600">Loading sessions...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-display font-bold text-ocean-900">
          Available Sessions
        </h1>
        <p className="text-sand-600 mt-2">
          Browse and register for upcoming rowing sessions
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="bg-white rounded-xl shadow-md overflow-hidden border border-ocean-100 hover:shadow-lg transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 bg-ocean-100 text-ocean-700 rounded-full text-sm font-medium">
                  {getSessionTypeLabel(session.session_type)}
                </span>
              </div>
              <h3 className="text-xl font-display font-semibold text-ocean-900 mb-2">
                {session.name}
              </h3>
              <p className="text-sand-600 mb-4 line-clamp-2">{session.description}</p>
              
              <div className="space-y-3">
                <div className="flex items-center text-sand-700">
                  <Calendar className="h-5 w-5 mr-2 text-ocean-600" />
                  <span>
                    {format(new Date(session.start_date), 'MMM d, yyyy')} -{' '}
                    {format(new Date(session.end_date), 'MMM d, yyyy')}
                  </span>
                </div>
                <div className="flex items-center text-sand-700">
                  <Users className="h-5 w-5 mr-2 text-ocean-600" />
                  <span>{session.capacity} spots available</span>
                </div>
                <div className="flex items-center text-sand-700">
                  <DollarSign className="h-5 w-5 mr-2 text-ocean-600" />
                  <span>${(session.price / 100).toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => handleRegister(session)}
                className="mt-6 w-full bg-ocean-600 text-white py-2 px-4 rounded-lg hover:bg-ocean-700 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-ocean-500"
              >
                Register Now
              </button>
            </div>
          </div>
        ))}
      </div>

      {sessions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sand-600">No sessions available at the moment.</p>
        </div>
      )}
    </div>
  );
}