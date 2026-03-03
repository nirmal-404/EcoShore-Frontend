import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import API from '@/api/index.js';

/* GET ALL */
export const useBeaches = () => {
  return useQuery({
    queryKey: ['beaches'],
    queryFn: async () => {
      const { data } = await API.get('/beaches');
      return data.data;
    },
  });
};

/* ADD BEACH */
export const useAddBeach = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newBeach) => {
      const { data } = await API.post('/beaches', newBeach);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beaches'] });
    },
  });
};

/* EDIT BEACH */
export const useEditBeach = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updatedData }) => {
      const { data } = await API.put(`/beaches/${id}`, updatedData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beaches'] });
    },
  });
};
