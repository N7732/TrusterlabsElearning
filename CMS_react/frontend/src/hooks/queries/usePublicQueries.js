import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchPartners, fetchPublicCourses, fetchStudentStats, fetchTrainings, applyForTraining, requestCustomTraining, fetchPublications, fetchWebinars, registerForWebinar, checkMembership, createMembership } from '../../services/publicService';

export const usePartners = () => {
  return useQuery({
    queryKey: ['partners'],
    queryFn: fetchPartners,
    staleTime: 10 * 60 * 1000, // Partners rarely change
  });
};

export const usePublicCourses = () => {
  return useQuery({
    queryKey: ['publicCourses'],
    queryFn: fetchPublicCourses,
  });
};

export const useStudentStats = () => {
  return useQuery({
    queryKey: ['studentStats'],
    queryFn: fetchStudentStats,
  });
};

export const useTrainings = () => {
  return useQuery({
    queryKey: ['trainings'],
    queryFn: fetchTrainings,
  });
};



export const useApplyForTraining = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: applyForTraining,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainings'] });
    },
  });
};

export const useRequestCustomTraining = () => {
  return useMutation({
    mutationFn: requestCustomTraining,
  });
};

export const usePublications = () => {
  return useQuery({
    queryKey: ['publications'],
    queryFn: fetchPublications,
  });
};

export const useWebinars = () => {
  return useQuery({
    queryKey: ['webinars'],
    queryFn: fetchWebinars,
  });
};

export const useRegisterForWebinar = () => {
  return useMutation({
    mutationFn: registerForWebinar,
  });
};

export const useCheckMembership = () => {
  return useMutation({
    mutationFn: checkMembership,
  });
};

export const useCreateMembership = () => {
  return useMutation({
    mutationFn: createMembership,
  });
};
