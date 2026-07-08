import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../api/apiClient';

const Profile = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [membershipData, setMembershipData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get('/auth/api/auth/profile/');
      setProfileData(data);
      
      // Also try to fetch membership using user email
      if (user?.email) {
        const memRes = await apiClient.get(`/api/membership/memberships/?email=${user.email}`);
        if (memRes && Array.isArray(memRes) && memRes.length > 0) {
          setMembershipData(memRes[0]);
        } else if (memRes && memRes.results && memRes.results.length > 0) {
          setMembershipData(memRes.results[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load profile or membership', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7] py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-[#273B76] h-32 relative">
            <div className="absolute -bottom-12 left-8 w-24 h-24 bg-white rounded-full p-1 shadow-md">
              <div className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center text-3xl font-bold text-[#273B76]">
                {user?.first_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
              </div>
            </div>
          </div>
          
          <div className="pt-16 pb-8 px-8">
            <h1 className="text-2xl font-bold text-slate-900">
              {user?.first_name} {user?.last_name}
            </h1>
            <p className="text-slate-500 mb-6">{user?.email}</p>
            
            {loading ? (
              <div className="animate-pulse flex space-x-4">
                <div className="flex-1 space-y-4 py-1">
                  <div className="h-2 bg-slate-200 rounded"></div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="h-2 bg-slate-200 rounded col-span-2"></div>
                      <div className="h-2 bg-slate-200 rounded col-span-1"></div>
                    </div>
                    <div className="h-2 bg-slate-200 rounded"></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Account Type</h3>
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 capitalize">
                    {profileData?.user_type || user?.user_type || 'User'}
                  </div>
                </div>
                
                {profileData?.instructor_profile && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Instructor Details</h3>
                    <p className="text-slate-700"><span className="font-medium">Specialization:</span> {profileData.instructor_profile.specialization || 'Not specified'}</p>
                    <p className="text-slate-700 mt-1"><span className="font-medium">Bio:</span> {profileData.instructor_profile.bio || 'Not specified'}</p>
                  </div>
                )}

                {profileData?.learner_profile && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Learner Details</h3>
                    <p className="text-slate-700">Student account active.</p>
                  </div>
                )}
                
                <div>
                  <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Membership Status</h3>
                  {membershipData ? (
                    <div className="bg-[#273B76]/5 border border-[#273B76]/10 p-4 rounded-lg">
                      <p className="text-slate-700 font-medium">Active Member</p>
                      <p className="text-slate-600 text-sm mt-1">Membership ID: <span className="font-bold text-[#273B76]">{membershipData.MembershipID}</span></p>
                      <p className="text-slate-500 text-xs mt-1">Duration: {membershipData.duration_days} days</p>
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg">
                      <p className="text-slate-600">You do not have an active membership.</p>
                      <a href="/membership" className="text-blue-600 hover:underline text-sm mt-2 inline-block">Learn about Memberships &rarr;</a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
