import React, { useState, useEffect } from 'react';
import { X, PhoneCall } from 'lucide-react';
import Button from '../common/Button';
import { getImageUrl, apiClient } from '../../api/apiClient';

const InquiryDrawer = ({ isOpen, onClose, course }) => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setSuccess(false);
      setError(null);
      setFormData({ name: '', email: '', phone: '' });
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!course) return;
    setLoading(true);
    setError(null);
    try {
      await apiClient.post('/enquiry/', {
        course: course.id,
        name: formData.name,
        email: formData.email,
        phone_number: formData.phone
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to submit request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex justify-end p-4 sm:p-6 transition-all duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Block */}
      <div className={`relative w-full max-w-md bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden h-fit my-auto transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-[120%]'}`}>
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">Request Course Inquiry</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>
        
        {course && (
          <div className="p-5 flex-grow">
            {/* Course Summary */}
            <div className="flex gap-3 mb-4 items-center">
              <img src={getImageUrl(course.thumbnail || course.thumbnail_url)} onError={(e) => { e.target.onerror = null; e.target.src = "https://images.unsplash.com/photo-1573164713988-8665fc963095?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" }} alt={course.title} className="w-16 h-16 object-cover rounded-lg shadow-sm" />
              <div>
                <h3 className="font-bold text-slate-900 line-clamp-2 text-sm leading-tight">{course.title}</h3>
                <div className="mt-1 font-black text-amber-600 text-sm">
                  Consultation
                </div>
              </div>
            </div>
            
            {success ? (
              <div className="bg-green-50 text-green-700 p-6 rounded-xl border border-green-100 text-center">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="font-bold text-lg mb-2">Request Submitted!</h3>
                <p className="text-sm">We'll be in touch with you shortly.</p>
                <Button onClick={onClose} className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white border-transparent">Close</Button>
              </div>
            ) : (
              <>
                {/* Info */}
                <div className="bg-amber-50 rounded-xl p-3 border border-amber-100 mb-4 flex gap-3 items-start">
                  <PhoneCall size={16} className="text-amber-700 shrink-0 mt-0.5" />
                  <p className="text-[13px] text-amber-700/90 leading-tight">
                    <span className="font-bold text-amber-800 block mb-0.5">We will call you</span>
                    Provide your details below and an advisor will contact you to start learning.
                  </p>
                </div>
                
                {error && <div className="text-red-500 text-sm mb-3">{error}</div>}

                {/* Form */}
                <form id="inquiry-form" onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-medium" 
                      placeholder="Full Name" 
                      required 
                    />
                  </div>
                  <div>
                    <input 
                      type="email" 
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-medium" 
                      placeholder="Email Address" 
                      required 
                    />
                  </div>
                  <div>
                    <input 
                      type="tel" 
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-medium" 
                      placeholder="Phone Number" 
                      required 
                    />
                  </div>
                </form>
              </>
            )}
          </div>
        )}
        
        {!success && (
          <div className="p-5 border-t border-slate-100 bg-slate-50">
            <Button form="inquiry-form" type="submit" disabled={loading} className="w-full h-11 text-base font-bold shadow hover:shadow-md !bg-amber-500 hover:!bg-amber-600 text-white border-transparent rounded-xl">
              {loading ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InquiryDrawer;
