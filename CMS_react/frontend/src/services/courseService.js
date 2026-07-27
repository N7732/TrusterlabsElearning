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

export const fetchCourseProgress = async (courseId) => {
  return await apiClient.get(`/api/courses//progress/`);
};

export const enrollInCoursePlayer = async (courseId) => {
  return await apiClient.post(`/api/courses//enroll/`);
};

export const submitQuiz = async ({ quizId, answers }) => {
  return await apiClient.post(`/api/quizes//submit_quiz/`, { answers });
};

export const fetchQuizSubmission = async (quizId) => {
  return await apiClient.get(`/api/quizes//my_submission/`);
};

export const markLessonComplete = async (lessonId) => {
  return await apiClient.post(`/api/lessons//mark_complete/`);
};

