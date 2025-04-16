import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { fetchUserCrews } from '../lib/api';
import { UserCircle, LogOut, Calendar, Award, Users } from 'lucide-react';
import type { Profile, CrewAssignment } from '../lib/types';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [crews, setCrews] = useState<CrewAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);

        // Fetch crews
        const crewData = await fetchUserCrews(user.id);
        setCrews(crewData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!profile || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-ocean-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-display font-bold text-ocean-900">
            Welcome, {profile.full_name}
          </h1>
          <p className="text-sand-600 mt-1">Manage your rowing profile and schedule</p>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center px-4 py-2 text-ocean-700 hover:text-ocean-800 font-medium"
        >
          <LogOut className="h-5 w-5 mr-2" />
          Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Profile Information */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-ocean-100">
          <div className="flex items-center mb-6">
            <div className="bg-ocean-100 p-2 rounded-full">
              <Award className="h-6 w-6 text-ocean-700" />
            </div>
            <h2 className="text-2xl font-display font-semibold text-ocean-900 ml-3">
              Profile Information
            </h2>
          </div>
          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium text-sand-600">Experience Level</p>
              <p className="text-lg font-medium text-ocean-900 capitalize mt-1">
                {profile.experience_level}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-sand-600">Years of Experience</p>
              <p className="text-lg font-medium text-ocean-900 mt-1">
                {profile.years_rowing} years
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-sand-600">Preferred Position</p>
              <p className="text-lg font-medium text-ocean-900 capitalize mt-1">
                {profile.preferred_position}
              </p>
            </div>
          </div>
        </div>

        {/* Availability Schedule */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-ocean-100">
          <div className="flex items-center mb-6">
            <div className="bg-ocean-100 p-2 rounded-full">
              <Calendar className="h-6 w-6 text-ocean-700" />
            </div>
            <h2 className="text-2xl font-display font-semibold text-ocean-900 ml-3">
              Availability Schedule
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-sand-600"></th>
                  <th className="px-4 py-2 text-center text-sm font-medium text-sand-600">Morning</th>
                  <th className="px-4 py-2 text-center text-sm font-medium text-sand-600">Afternoon</th>
                  <th className="px-4 py-2 text-center text-sm font-medium text-sand-600">Evening</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(profile.availability).map(([day, slots]) => (
                  <tr key={day} className="border-t border-sand-100">
                    <td className="px-4 py-3 font-medium text-ocean-900">{day}</td>
                    {slots.map((available, index) => (
                      <td key={index} className="px-4 py-3 text-center">
                        {available ? (
                          <span className="inline-block w-6 h-6 bg-ocean-100 text-ocean-700 rounded-full flex items-center justify-center">
                            ✓
                          </span>
                        ) : (
                          <span className="inline-block w-6 h-6 bg-sand-100 text-sand-400 rounded-full flex items-center justify-center">
                            −
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Crew Assignments */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-ocean-100">
          <div className="flex items-center mb-6">
            <div className="bg-ocean-100 p-2 rounded-full">
              <Users className="h-6 w-6 text-ocean-700" />
            </div>
            <h2 className="text-2xl font-display font-semibold text-ocean-900 ml-3">
              My Crews
            </h2>
          </div>
          <div className="space-y-4">
            {crews.length > 0 ? (
              crews.map((assignment) => (
                <div
                  key={`${assignment.crew_id}-${assignment.user_id}`}
                  className="p-4 rounded-lg bg-ocean-50 border border-ocean-100"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-ocean-900">
                      {assignment.crew?.name}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      assignment.status === 'confirmed'
                        ? 'bg-green-100 text-green-700'
                        : assignment.status === 'declined'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {assignment.status}
                    </span>
                  </div>
                  <p className="text-sm text-ocean-700">
                    Position: <span className="font-medium capitalize">{assignment.position}</span>
                  </p>
                  <p className="text-sm text-ocean-700">
                    Session: <span className="font-medium">{assignment.crew?.session?.name}</span>
                  </p>
                </div>
              ))
            ) : (
              <p className="text-center text-sand-600">No crew assignments yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}