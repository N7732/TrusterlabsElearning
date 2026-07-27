import { useQuery } from '@tanstack/react-query';
import { fetchMyEnrollments, fetchMyTrainings, fetchMyGrades, fetchMyCertificates } from '../../services/learnerService';

export const useMyEnrollments = () => {
  return useQuery({
    queryKey: ['myEnrollments'],
    queryFn: fetchMyEnrollments,
  });
};

export const useMyTrainings = () => {
  return useQuery({
    queryKey: ['myTrainings'],
    queryFn: fetchMyTrainings,
  });
};

export const useMyGrades = () => {
  return useQuery({
    queryKey: ['myGrades'],
    queryFn: fetchMyGrades,
  });
};

export const useMyCertificates = () => {
  return useQuery({
    queryKey: ['myCertificates'],
    queryFn: fetchMyCertificates,
  });
};

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchTrainingDetails, submitClasswork } from '../../services/learnerService';

export const useTrainingDetails = (id) => {
  return useQuery({
    queryKey: ['trainingDetails', id],
    queryFn: () => fetchTrainingDetails(id),
    enabled: !!id,
  });
};

export const useSubmitClasswork = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitClasswork,
    onSuccess: (data, variables) => {
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['trainingDetails'] });
    }
  });
};

