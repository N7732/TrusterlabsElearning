import { apiClient } from '../api/apiClient';

export const fetchMyEnrollments = async () => {
  const res = await apiClient.get('/api/enrollments/');
  return res.results ? res.results : (Array.isArray(res) ? res : []);
};

export const fetchMyTrainings = async () => {
  const res = await apiClient.get('/training/trainings/my-trainings/');
  return res.results ? res.results : (Array.isArray(res) ? res : []);
};

export const fetchMyGrades = async () => {
  const res = await apiClient.get('/auth/api/my-grades/');
  return res.results ? res.results : (Array.isArray(res) ? res : []);
};

export const fetchMyCertificates = async () => {
  const res = await apiClient.get('/certification/api/certificates/my_certificates/');
  return res.results ? res.results : (Array.isArray(res) ? res : []);
};

export const fetchTrainingDetails = async (id) => {
  const res = await apiClient.get(`/training/trainings/${id}/`);
  return res;
};

export const submitClasswork = async ({ classworkId, formData }) => {
  const res = await apiClient.post(`/training/classwork/${classworkId}/submit/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res;
};

