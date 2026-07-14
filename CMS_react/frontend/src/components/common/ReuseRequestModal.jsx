import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { apiClient } from '../../api/apiClient';

const ReuseRequestModal = ({ isOpen, onClose, entityType, entityId, entityTitle }) => {
  const [destinations, setDestinations] = useState([]);
  const [selectedDestId, setSelectedDestId] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchDestinations();
      setSelectedDestId('');
      setError(null);
    }
  }, [isOpen, entityType]);

  const fetchDestinations = async () => {
    try {
      setLoading(true);
      let endpoint = '';
      if (['module', 'lesson'].includes(entityType)) {
        endpoint = '/course/api/courses/?my_courses=true';
      } else if (['classwork', 'exam'].includes(entityType)) {
        endpoint = '/training/api/trainings/?my_trainings=true';
      } else {
        // Course and Training don't strictly need a destination, they become standalone
        setDestinations([]);
        setLoading(false);
        return;
      }

      const res = await apiClient.get(endpoint);
      let data = [];
      if (Array.isArray(res)) data = res;
      else if (res && Array.isArray(res.results)) data = res.results;
      setDestinations(data);
    } catch (err) {
      setError('Failed to load destinations.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (['module', 'lesson', 'classwork', 'exam'].includes(entityType) && !selectedDestId) {
      setError('Please select a destination.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await apiClient.post('/course/api/reuse-requests/', {
        content_type: entityType,
        object_id: entityId,
        destination_id: selectedDestId || null,
      });
      alert('Reuse request submitted successfully! Wait for approval.');
      onClose();
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to submit reuse request.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const needsDestination = ['module', 'lesson', 'classwork', 'exam'].includes(entityType);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">Request to Reuse Content</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <p className="text-sm text-slate-600 mb-6">
            You are requesting to reuse the <strong>{entityType}</strong>: "{entityTitle}". 
            An approval request will be sent to the owner or system administrator. Once approved, a copy will be added to your account.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}

          {needsDestination && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Select Destination {['classwork', 'exam'].includes(entityType) ? 'Training' : 'Course'}
              </label>
              {loading ? (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Loader2 size={16} className="animate-spin" /> Loading your {['classwork', 'exam'].includes(entityType) ? 'trainings' : 'courses'}...
                </div>
              ) : (
                <select
                  value={selectedDestId}
                  onChange={(e) => setSelectedDestId(e.target.value)}
                  className="w-full rounded-lg border-slate-200 focus:border-[#3182ce] focus:ring-[#3182ce] text-sm py-2 px-3 border"
                  required
                >
                  <option value="">-- Select Destination --</option>
                  {destinations.map(dest => (
                    <option key={dest.id} value={dest.id}>{dest.title}</option>
                  ))}
                </select>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-white bg-[#3182ce] hover:bg-[#2b6cb0] rounded-lg transition-colors flex items-center gap-2 disabled:opacity-70"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReuseRequestModal;
