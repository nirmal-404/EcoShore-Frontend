import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import API from '@/api/index.js';

/* GET ALL */
export const useBeaches = () => {
  return useQuery({
    queryKey: ['beaches'],
    queryFn: async () => {
      const { data } = await API.get('/beaches');
      return data;
    },
  });
};

/* ADD BEACH */
export const useAddBeach = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newBeach) => {
      const { response } = await API.post('/beaches', newBeach);
      return response;
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
      const { response } = await API.put(`/beaches/${id}`, updatedData);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beaches'] });
    },
  });
};
