import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchCourses, fetchCourseDetails, fetchCourseProgress, enrollInCoursePlayer, submitQuiz, fetchQuizSubmission, markLessonComplete } from '../../services/courseService';

export const useCourses = () => {
  return useQuery({
    queryKey: ['courses'],
    queryFn: fetchCourses,
  });
};

export const useCourseDetails = (courseId) => {
  return useQuery({
    queryKey: ['courseDetails', courseId],
    queryFn: () => fetchCourseDetails(courseId),
    enabled: !!courseId,
  });
};

export const useCourseProgress = (courseId) => {
  return useQuery({
    queryKey: ['courseProgress', courseId],
    queryFn: () => fetchCourseProgress(courseId),
    enabled: !!courseId,
  });
};

export const useEnrollInCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: enrollInCoursePlayer,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['courseProgress', variables] });
      queryClient.invalidateQueries({ queryKey: ['myEnrollments'] });
    }
  });
};

export const useSubmitQuiz = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitQuiz,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quizSubmission', variables.quizId] });
      queryClient.invalidateQueries({ queryKey: ['courseProgress'] });
    }
  });
};

export const useQuizSubmission = (quizId) => {
  return useQuery({
    queryKey: ['quizSubmission', quizId],
    queryFn: () => fetchQuizSubmission(quizId),
    enabled: !!quizId,
  });
};

export const useMarkLessonComplete = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markLessonComplete,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['courseProgress'] });
    }
  });
};
