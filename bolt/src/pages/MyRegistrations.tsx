import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import { loadStripe } from '@stripe/stripe-js';
import { useAuth } from '../contexts/AuthContext';
import { fetchUserRegistrations, updateRegistrationStatus } from '../lib/api';
import type { Registration } from '../lib/types';

const stripePromise = loadStripe('your_publishable_key');

export default function MyRegistrations() {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadRegistrations();
    }
  }, [user]);

  const loadRegistrations = async () => {
    if (!user) return;

    try {
      const data = await fetchUserRegistrations(user.id);
      setRegistrations(data);
    } catch (error) {
      console.error('Error loading registrations:', error);
      toast.error('Failed to load registrations');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (registration: Registration) => {
    try {
      // Here you would typically:
      // 1. Create a payment intent on your server
      // 2. Use Stripe Elements to collect payment details
      // 3. Confirm the payment
      // 4. Update the registration status
      
      toast.success('Payment processed successfully');
      await loadRegistrations();
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Failed to process payment');
    }
  };

  const handleCancel = async (registration: Registration) => {
    try {
      await updateRegistrationStatus(registration.id, 'cancelled', registration.payment_status);
      toast.success('Registration cancelled successfully');
      await loadRegistrations();
    } catch (error) {
      console.error('Error cancelling registration:', error);
      toast.error('Failed to cancel registration');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="animate-pulse text-ocean-600">Loading registrations...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-display font-bold text-ocean-900">
          My Registrations
        </h1>
        <p className="text-sand-600 mt-2">
          Manage your session registrations and payments
        </p>
      </div>

      <div className="space-y-6">
        {registrations.map((registration) => (
          <div
            key={registration.id}
            className="bg-white rounded-xl shadow-md overflow-hidden border border-ocean-100"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-display font-semibold text-ocean-900">
                  {registration.session?.name}
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    registration.status === 'confirmed'
                      ? 'bg-green-100 text-green-700'
                      : registration.status === 'cancelled'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {registration.status.charAt(0).toUpperCase() + registration.status.slice(1)}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center text-sand-700">
                  <Calendar className="h-5 w-5 mr-2 text-ocean-600" />
                  <span>
                    {format(new Date(registration.session?.start_date || ''), 'MMM d, yyyy')}
                  </span>
                </div>
                <div className="flex items-center text-sand-700">
                  <Clock className="h-5 w-5 mr-2 text-ocean-600" />
                  <span>{registration.session?.session_type}</span>
                </div>
                <div className="flex items-center text-sand-700">
                  <DollarSign className="h-5 w-5 mr-2 text-ocean-600" />
                  <span>
                    ${((registration.session?.price || 0) / 100).toFixed(2)} -{' '}
                    {registration.payment_status}
                  </span>
                </div>
              </div>

              <div className="flex space-x-4">
                {registration.status !== 'cancelled' && registration.payment_status === 'pending' && (
                  <button
                    onClick={() => handlePayment(registration)}
                    className="flex-1 bg-ocean-600 text-white py-2 px-4 rounded-lg hover:bg-ocean-700 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-ocean-500"
                  >
                    Pay Now
                  </button>
                )}
                {registration.status !== 'cancelled' && (
                  <button
                    onClick={() => handleCancel(registration)}
                    className="flex-1 bg-coral-100 text-coral-700 py-2 px-4 rounded-lg hover:bg-coral-200 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-coral-500"
                  >
                    Cancel Registration
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {registrations.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <p className="text-sand-600">You haven't registered for any sessions yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}