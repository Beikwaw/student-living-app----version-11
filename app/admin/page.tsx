'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserData, getPendingApplications, processRequest } from '../../lib/firestore';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [pendingApplications, setPendingApplications] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const applications = await getPendingApplications();
        setPendingApplications(applications);
      } catch (err) {
        setError('Failed to fetch applications');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const handleProcessApplication = async (
    userId: string,
    status: 'accepted' | 'denied',
    message: string
  ) => {
    try {
      await processRequest(userId, status, message, user?.uid || '');
      // Remove the processed application from the list
      setPendingApplications(prev => prev.filter(app => app.id !== userId));
    } catch (err) {
      setError('Failed to process application');
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Pending Applications ({pendingApplications.length})</h2>
        
        {pendingApplications.length === 0 ? (
          <p className="text-gray-500">No pending applications</p>
        ) : (
          <div className="space-y-6">
            {pendingApplications.map((application) => (
              <div key={application.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium">{application.name}</h3>
                    <p className="text-gray-600">{application.email}</p>
                    
                    {application.requestDetails && (
                      <div className="mt-2">
                        <p><span className="font-medium">Accommodation Type:</span> {application.requestDetails.accommodationType}</p>
                        <p><span className="font-medium">Location:</span> {application.requestDetails.location}</p>
                        <p><span className="font-medium">Date Submitted:</span> {application.requestDetails.dateSubmitted?.toLocaleDateString() ?? 'Not submitted'}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-x-2">
                    <button
                      onClick={() => handleProcessApplication(
                        application.id,
                        'accepted',
                        'Your application has been accepted. Welcome to MDO Student Living!'
                      )}
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleProcessApplication(
                        application.id,
                        'denied',
                        'We regret to inform you that your application has been denied at this time.'
                      )}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                      Deny
                    </button>
                  </div>
                </div>
                
                {application.communicationLog && application.communicationLog.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Communication History</h4>
                    <div className="space-y-2">
                      {application.communicationLog.map((log, index) => (
                        <div key={index} className={`p-2 rounded ${
                          log.sentBy === 'admin' ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                          <p className="text-sm">{log.message}</p>
                          <p className="text-xs text-gray-500">
                            {log.sentBy === 'admin' ? 'Admin' : 'Student'} - {log.timestamp.toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 