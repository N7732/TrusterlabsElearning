import useSWR, { mutate } from 'swr';
import { 
  fetchPartners, 
  fetchPublicCourses, 
  fetchStudentStats, 
  fetchTrainings, 
  applyForTraining, 
  requestCustomTraining, 
  fetchPublications, 
  fetchWebinars, 
  registerForWebinar, 
  checkMembership, 
  createMembership 
} from '../../services/publicService';

export const usePartners = () => {
  return useSWR('/settings/partners/', fetchPartners, {
    dedupingInterval: 60000,
    keepPreviousData: true
  });
};

export const usePublicCourses = () => {
  return useSWR('/api/courses/', fetchPublicCourses, {
    dedupingInterval: 10000,
    revalidateOnFocus: true,
    keepPreviousData: true
  });
};

export const useStudentStats = () => {
  return useSWR('/auth/api/learners/', fetchStudentStats, {
    dedupingInterval: 10000,
    keepPreviousData: true
  });
};

export const useTrainings = () => {
  return useSWR('/training/trainings/', fetchTrainings, {
    dedupingInterval: 10000,
    revalidateOnFocus: true,
    keepPreviousData: true
  });
};

const createCompatibleMutation = (mutationFn, onSuccessKeys = []) => {
  const mutateAsync = async (vars) => {
    const res = await mutationFn(vars);
    onSuccessKeys.forEach(k => mutate(k));
    return res;
  };
  const mutateCall = (vars, options = {}) => {
    mutationFn(vars).then(res => {
      onSuccessKeys.forEach(k => mutate(k));
      if (options.onSuccess) options.onSuccess(res, vars);
    }).catch(err => {
      if (options.onError) options.onError(err, vars);
      else console.error('Mutation error:', err);
    });
  };
  return { mutateAsync, mutate: mutateCall };
};

export const useApplyForTraining = () => {
  return createCompatibleMutation(applyForTraining, ['/training/trainings/', '/training/trainings/my-trainings/']);
};

export const useRequestCustomTraining = () => {
  return createCompatibleMutation(requestCustomTraining);
};

export const usePublications = () => {
  return useSWR('/api/research/publications/', fetchPublications, {
    dedupingInterval: 30000,
    keepPreviousData: true
  });
};

export const useWebinars = () => {
  return useSWR('/api/research/webinars/', fetchWebinars, {
    dedupingInterval: 30000,
    keepPreviousData: true
  });
};

export const useRegisterForWebinar = () => {
  return createCompatibleMutation(registerForWebinar, ['/api/research/webinars/']);
};

export const useCheckMembership = () => {
  return createCompatibleMutation(checkMembership);
};

export const useCreateMembership = () => {
  return createCompatibleMutation(createMembership);
};
