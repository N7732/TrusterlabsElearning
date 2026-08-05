import useSWR, { mutate } from 'swr';
import { 
  fetchMyEnrollments, 
  fetchMyTrainings, 
  fetchMyGrades, 
  fetchMyCertificates,
  fetchTrainingDetails, 
  submitClasswork, 
  submitExam 
} from '../../services/learnerService';

export const useMyEnrollments = () => {
  return useSWR('/api/enrollments/', fetchMyEnrollments, {
    revalidateOnFocus: true,
    dedupingInterval: 5000,
    keepPreviousData: true
  });
};

export const useMyTrainings = () => {
  return useSWR('/training/trainings/my-trainings/', fetchMyTrainings, {
    revalidateOnFocus: true,
    dedupingInterval: 5000,
    keepPreviousData: true
  });
};

export const useMyGrades = () => {
  return useSWR('/auth/api/my-grades/', fetchMyGrades, {
    revalidateOnFocus: true,
    dedupingInterval: 5000,
    keepPreviousData: true
  });
};

export const useMyCertificates = () => {
  return useSWR('/certification/api/certificates/my_certificates/', fetchMyCertificates, {
    revalidateOnFocus: true,
    dedupingInterval: 5000,
    keepPreviousData: true
  });
};

export const useTrainingDetails = (id) => {
  return useSWR(id ? `/training/trainings/${id}/` : null, () => fetchTrainingDetails(id), {
    revalidateOnFocus: true,
    dedupingInterval: 3000,
    keepPreviousData: true
  });
};

export const useSubmitClasswork = () => {
  const mutateAsync = async ({ classworkId, formData, trainingId }) => {
    const res = await submitClasswork({ classworkId, formData });
    if (trainingId) {
      mutate(`/training/trainings/${trainingId}/`);
    }
    mutate('/training/trainings/my-trainings/');
    mutate('/auth/api/my-grades/');
    return res;
  };
  return { mutateAsync };
};

export const useSubmitExam = () => {
  const mutateAsync = async ({ examId, formData, trainingId }) => {
    const res = await submitExam({ examId, formData });
    if (trainingId) {
      mutate(`/training/trainings/${trainingId}/`);
    }
    mutate('/training/trainings/my-trainings/');
    mutate('/auth/api/my-grades/');
    mutate('/certification/api/certificates/my_certificates/');
    return res;
  };
  return { mutateAsync };
};
