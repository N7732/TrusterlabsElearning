import { apiClient } from '../api/apiClient';

export const fetchInstructorStats = async () => {
  const [cRes, mRes, tRes, eRes] = await Promise.all([
    apiClient.get('/api/courses/?my_courses=true').catch(() => null),
    apiClient.get('/api/modules/?my_modules=true').catch(() => null),
    apiClient.get('/api/training/trainings/?my_trainings=true').catch(() => null),
    apiClient.get('/api/enquiry/requirement/?my_enquiries=true').catch(() => null),
  ]);

  return {
    courses: cRes?.results?.length || cRes?.length || 0,
    modules: mRes?.results?.length || mRes?.length || 0,
    trainings: tRes?.results?.length || tRes?.length || 0,
    enquiries: eRes?.results?.length || eRes?.length || 0,
  };
};
