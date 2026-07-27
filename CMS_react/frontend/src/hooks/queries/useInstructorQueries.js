import { useQuery } from '@tanstack/react-query';
import { fetchInstructorStats } from '../../services/instructorService';

export const useInstructorStats = () => {
  return useQuery({
    queryKey: ['instructorStats'],
    queryFn: fetchInstructorStats,
  });
};
