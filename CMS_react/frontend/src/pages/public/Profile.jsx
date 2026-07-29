import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Determine user specific data
  const isLearner = user?.user_type === 'learner';
  const isInstructor = user?.user_type === 'instructor';
  const profileSpecificData = isLearner ? user?.learner_profile : user?.instructor_profile;

  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    bio: user?.extended_profile?.bio || profileSpecificData?.bio || '',
    phone_number: profileSpecificData?.phone_number || '',
    city: user?.extended_profile?.city || '',
    country: user?.extended_profile?.country || '',
    profile_picture: null
  });

  useEffect(() => {
    if (user) {
      const pSpecific = user.user_type === 'learner' ? user.learner_profile : user.instructor_profile;
      setFormData(prev => ({
        ...prev,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        bio: user.extended_profile?.bio || pSpecific?.bio || '',
        phone_number: pSpecific?.phone_number || '',
        city: user.extended_profile?.city || '',
        country: user.extended_profile?.country || '',
        profile_picture: null
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'profile_picture') {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });
    
    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
          submitData.append(key, formData[key]);
        }
      });
      
      await updateProfile(submitData);
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
    } catch (error) {
      console.error("Failed to update profile:", error);
      setMessage({ text: 'Failed to update profile. Please try again.', type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="p-5 text-center">Loading...</div>;
  }

  const getInitials = () => {
    if (user.first_name) return user.first_name.charAt(0).toUpperCase();
    if (user.username) return user.username.charAt(0).toUpperCase();
    return 'U';
  };

  return (
    <>
      <style>{`
        #accountSettings input, #accountSettings select, #accountSettings textarea {
          display: block;
          width: 100%;
          padding: 0.875rem 1rem;
          font-size: 1rem;
          font-weight: 400;
          line-height: 1.5;
          color: var(--text-primary, #212529);
          background-color: var(--background, #fff);
          background-clip: padding-box;
          border: 1px solid var(--border-color, #dee2e6);
          border-radius: 0.5rem;
          transition: border-color .15s ease-in-out,box-shadow .15s ease-in-out;
        }
        #accountSettings input:focus, #accountSettings select:focus, #accountSettings textarea:focus {
          border-color: var(--primary, #0d6efd);
          outline: 0;
          box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
        }
      `}</style>

      {/* Profile Header Banner */}
      <div className="bg-primary text-white pt-5 pb-4 mb-5" style={{ backgroundColor: 'var(--primary, #0d6efd)' }}>
        <div className="container">
          <h1 className="fw-bold mb-1">My Profile</h1>
          <p className="mb-0 text-white-50">Manage your personal information and preferences.</p>
        </div>
      </div>

      <div className="container pb-5">
        <div className="row">
          {/* Sidebar */}
          <div className="col-lg-4 mb-4 mb-lg-0">
            <div className="card border-0 shadow-sm rounded-4 bg-white text-center p-4">
              <div className="mb-4">
                {user.extended_profile?.profile_picture || (isInstructor && profileSpecificData?.profile_picture_url) ? (
                  <img 
                    src={user.extended_profile?.profile_picture || profileSpecificData?.profile_picture_url} 
                    alt="Profile"
                    className="img-fluid rounded-circle border border-4 border-white shadow-sm"
                    style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                  />
                ) : (
                  <div 
                    className="bg-light rounded-circle mx-auto d-flex align-items-center justify-content-center shadow-sm border border-4 border-white"
                    style={{ width: '150px', height: '150px' }}
                  >
                    <span className="fs-1 fw-bold text-primary">{getInitials()}</span>
                  </div>
                )}
              </div>
              
              <h4 className="fw-bold text-dark mb-1">
                {user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : (user.username || 'User')}
              </h4>
              <div className="badge bg-primary bg-opacity-10 text-primary mb-3 px-3 py-2 rounded-pill text-capitalize">
                {user.user_type || 'Student'}
              </div>
              <p className="text-muted mb-0"><i className="fas fa-envelope me-2"></i>{user.email}</p>
              
              <hr className="my-4" />
              
              <div className="d-grid gap-2">
                {user.is_learner && (
                  <Link to="/edit-profile" className="btn btn-primary rounded-pill fw-bold shadow-sm">
                    <i className="fas fa-user-edit me-2"></i> Edit Profile
                  </Link>
                )}
                {user.is_instructor && (
                  <Link to="/edit-profile/instructor" className="btn btn-primary rounded-pill fw-bold shadow-sm">
                    <i className="fas fa-user-edit me-2"></i> Edit Profile
                  </Link>
                )}
                
                <button 
                  className="btn btn-outline-secondary rounded-pill fw-bold" 
                  type="button" 
                  onClick={() => setShowSettings(!showSettings)}
                >
                  <i className="fas fa-cog me-2"></i> Account Settings
                </button>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm rounded-4 bg-white p-4 p-md-5 mb-4">
              <h5 className="fw-bold mb-4 text-dark border-bottom pb-3">About Me</h5>
              <p className="text-muted" style={{ lineHeight: 1.8 }}>
                {user.extended_profile?.bio || "No bio information added yet. Add a bio to tell others about yourself!"}
              </p>

              <h5 className="fw-bold mb-4 text-dark border-bottom pb-3 mt-5">Contact Information</h5>
              <div className="row g-4">
                <div className="col-md-6">
                  <div className="d-flex align-items-center">
                    <div className="bg-light rounded-circle d-flex align-items-center justify-content-center text-primary me-3" style={{ width: '45px', height: '45px' }}>
                      <i className="fas fa-phone"></i>
                    </div>
                    <div>
                      <small className="text-muted d-block fw-bold text-uppercase" style={{ fontSize: '0.7rem' }}>Phone</small>
                      <span className="text-dark fw-medium">
                        {profileSpecificData?.phone_number || "Not provided"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="d-flex align-items-center">
                    <div className="bg-light rounded-circle d-flex align-items-center justify-content-center text-primary me-3" style={{ width: '45px', height: '45px' }}>
                      <i className="fas fa-map-marker-alt"></i>
                    </div>
                    <div>
                      <small className="text-muted d-block fw-bold text-uppercase" style={{ fontSize: '0.7rem' }}>Location</small>
                      <span className="text-dark fw-medium">
                        {user.extended_profile?.city || "City not set"}, {user.extended_profile?.country || "Country not set"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {showSettings && (
              <div id="accountSettings">
                <div className="card border-0 shadow-sm rounded-4 bg-white p-4 p-md-5">
                  <h5 className="fw-bold mb-4 text-dark border-bottom pb-3">Account Settings</h5>
                  <form onSubmit={handleSaveSettings}>
                    {message.text && (
                      <div className={`alert alert-${message.type} mb-4`} role="alert">
                        {message.text}
                      </div>
                    )}
                    
                    <div className="mb-4">
                      <label className="form-label fw-bold text-dark">Profile Picture / Logo</label>
                      <input type="file" name="profile_picture" onChange={handleChange} className="form-control" accept="image/*" />
                    </div>

                    <div className="mb-4">
                      <label className="form-label fw-bold text-dark">First Name</label>
                      <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} />
                    </div>

                    <div className="mb-4">
                      <label className="form-label fw-bold text-dark">Last Name</label>
                      <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} />
                    </div>

                    <div className="mb-4">
                      <label className="form-label fw-bold text-dark">Phone Number</label>
                      <input type="tel" name="phone_number" value={formData.phone_number} onChange={handleChange} />
                    </div>

                    <div className="mb-4">
                      <label className="form-label fw-bold text-dark">Bio</label>
                      <textarea name="bio" rows="4" value={formData.bio} onChange={handleChange}></textarea>
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-4">
                        <label className="form-label fw-bold text-dark">City</label>
                        <input type="text" name="city" value={formData.city} onChange={handleChange} />
                      </div>
                      <div className="col-md-6 mb-4">
                        <label className="form-label fw-bold text-dark">Country</label>
                        <input type="text" name="country" value={formData.country} onChange={handleChange} />
                      </div>
                    </div>

                    <div className="text-end mt-4">
                      <button className="btn btn-primary rounded-pill fw-bold shadow-sm px-5 py-2" type="submit" disabled={loading}>
                        {loading ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </>
  );
}
