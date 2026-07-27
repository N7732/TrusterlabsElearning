import { apiClient } from '../api/apiClient';

export const fetchPartners = async () => {
  const res = await apiClient.get('/settings/partners/');
  return res.results ? res.results : (Array.isArray(res) ? res : []);
};

export const fetchPublicCourses = async () => {
  const res = await apiClient.get('/api/courses/');
  return res;
};

export const fetchStudentStats = async () => {
  const res = await apiClient.get('/auth/api/learners/');
  return res;
};

export const fetchTrainings = async () => {
  const res = await apiClient.get('/training/trainings/');
  return res;
};

export const applyForTraining = async ({ id, formData }) => {
  const res = await apiClient.post(`/training/trainings/${id}/apply/`, formData);
  return res;
};

export const requestCustomTraining = async (formData) => {
  const res = await apiClient.post('/training/custom-requests/', formData);
  return res;
};

export const fetchPublications = async () => {
  const res = await apiClient.get('/api/research/publications/');
  return res.results ? res.results : (Array.isArray(res) ? res : []);
};

export const fetchWebinars = async () => {
  const res = await apiClient.get('/api/research/webinars/');
  return res.results ? res.results : (Array.isArray(res) ? res : []);
};

export const registerForWebinar = async (formData) => {
  const res = await apiClient.post('/api/research/webinar_registrations/', formData);
  return res;
};

export const checkMembership = async (membershipId) => {
  const res = await apiClient.get(`/api/membership/memberships/check/?membership_id=${membershipId.trim()}`);
  return res;
};

export const createMembership = async (payload) => {
  const res = await apiClient.post('/api/membership/memberships/', payload);
  return res;
};
