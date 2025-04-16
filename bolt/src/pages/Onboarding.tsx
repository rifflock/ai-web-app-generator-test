import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Availability {
  [key: string]: boolean[];
}

export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    full_name: '',
    experience_level: 'novice',
    years_rowing: 0,
    preferred_position: 'any',
    availability: {} as Availability
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const timeSlots = ['Morning', 'Afternoon', 'Evening'];

  const handleAvailabilityChange = (day: string, timeIndex: number) => {
    setFormData(prev => {
      const newAvailability = { ...prev.availability };
      if (!newAvailability[day]) {
        newAvailability[day] = Array(3).fill(false);
      }
      newAvailability[day][timeIndex] = !newAvailability[day][timeIndex];
      return { ...prev, availability: newAvailability };
    });
  };

  const handleSubmit = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .insert([
          {
            id: user?.id,
            email: user?.email,
            ...formData
          }
        ]);

      if (error) throw error;
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {[1, 2, 3].map((stepNumber) => (
              <div
                key={stepNumber}
                className={`w-1/3 h-2 rounded ${
                  step >= stepNumber ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <h2 className="text-2xl font-bold text-center">
            {step === 1 && 'Personal Information'}
            {step === 2 && 'Rowing Experience'}
            {step === 3 && 'Availability'}
          </h2>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setStep(2)}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">Experience Level</label>
              <select
                value={formData.experience_level}
                onChange={(e) => setFormData({ ...formData, experience_level: e.target.value })}
                className="w-full p-2 border rounded"
              >
                <option value="novice">Novice</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="elite">Elite</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Years of Rowing Experience</label>
              <input
                type="number"
                value={formData.years_rowing}
                onChange={(e) => setFormData({ ...formData, years_rowing: parseInt(e.target.value) })}
                className="w-full p-2 border rounded"
                min="0"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Preferred Position</label>
              <select
                value={formData.preferred_position}
                onChange={(e) => setFormData({ ...formData, preferred_position: e.target.value })}
                className="w-full p-2 border rounded"
              >
                <option value="any">Any Position</option>
                <option value="bow">Bow</option>
                <option value="stroke">Stroke</option>
                <option value="port">Port</option>
                <option value="starboard">Starboard</option>
                <option value="cox">Cox</option>
              </select>
            </div>
            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded hover:bg-gray-300"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="px-4 py-2"></th>
                    {timeSlots.map(slot => (
                      <th key={slot} className="px-4 py-2">{slot}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {days.map(day => (
                    <tr key={day}>
                      <td className="px-4 py-2 font-medium">{day}</td>
                      {timeSlots.map((_, index) => (
                        <td key={index} className="px-4 py-2 text-center">
                          <input
                            type="checkbox"
                            checked={formData.availability[day]?.[index] || false}
                            onChange={() => handleAvailabilityChange(day, index)}
                            className="h-5 w-5 text-blue-600"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between">
              <button
                onClick={() => setStep(2)}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded hover:bg-gray-300"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              >
                Complete Profile
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}