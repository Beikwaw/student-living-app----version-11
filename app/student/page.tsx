'use client';

import React from 'react';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserData, getUserById, addCommunication, getPendingApplications, processRequest } from '../../lib/firestore';
import { useRouter } from 'next/navigation';

export default function StudentDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        router.push('/login');
        return;
      }

      try {
        const data = await getUserById(user.uid);
        if (data) {
          setUserData(data);
        } else {
          setError('User data not found');
        }
      } catch (err) {
        setError('Failed to fetch user data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, router]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newMessage.trim()) return;

    try {
      await addCommunication(user.uid, newMessage.trim(), 'user');
      // Refresh user data to get updated communication log
      const updatedData = await getUserById(user.uid);
      if (updatedData) {
        setUserData(updatedData);
      }
      setNewMessage('');
    } catch (err) {
      setError('Failed to send message');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  if (!userData) {
    return <div className="text-center p-4">No user data available</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Student Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Application Status */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Application Status</h2>
          <div className="space-y-4">
            <div>
              <p className="font-medium">Status:</p>
              <p className={`text-lg ${
                userData.applicationStatus === 'accepted' ? 'text-green-600' :
                userData.applicationStatus === 'denied' ? 'text-red-600' :
                'text-yellow-600'
              }`}>
                {(userData.applicationStatus || 'pending').charAt(0).toUpperCase() + (userData.applicationStatus || 'pending').slice(1)}
              </p>
            </div>
            
            {userData.requestDetails && (
              <>
                <div>
                  <p className="font-medium">Accommodation Type:</p>
                  <p>{userData.requestDetails.accommodationType}</p>
                </div>
                <div>
                  <p className="font-medium">Location:</p>
                  <p>{userData.requestDetails.location}</p>
                </div>
                <div>
                  <p className="font-medium">Date Submitted:</p>
                  <p>{userData.requestDetails.dateSubmitted?.toLocaleDateString() ?? 'Not submitted'}</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Communication */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Communication</h2>
          
          <div className="space-y-4">
            <div className="h-64 overflow-y-auto space-y-2">
              {userData.communicationLog && userData.communicationLog.length > 0 ? (
                userData.communicationLog.map((log, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${
                      log.sentBy === 'admin' ? 'bg-blue-100 ml-4' : 'bg-gray-100 mr-4'
                    }`}
                  >
                    <p className="text-sm">{log.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {log.sentBy === 'admin' ? 'Admin' : 'You'} - {log.timestamp.toLocaleString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center">No messages yet</p>
              )}
            </div>

            <form onSubmit={handleSendMessage} className="mt-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 