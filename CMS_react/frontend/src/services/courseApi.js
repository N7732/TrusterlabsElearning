import { apiClient } from '../api/apiClient';

/**
 * Fetch all courses for the catalog.
 */
export const fetchCourses = async () => {
  return await apiClient.get('/api/courses/');
};

/**
 * Fetch details for a specific course, including its outline.
 */
export const fetchCourseDetails = async (courseId) => {
  return await apiClient.get(`/api/courses/${courseId}/`);
};

export const fetchModules = async () => {
  return await apiClient.get('/api/modules/');
};

export const fetchLessons = async () => {
  return await apiClient.get('/api/lessons/');
};

export const enrollInCourse = async (courseId, paymentData = null) => {
  return await apiClient.post(`/enroll/${courseId}/`, paymentData || {});
};
