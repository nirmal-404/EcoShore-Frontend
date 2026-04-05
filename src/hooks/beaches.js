import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import API from '@/api/index.js';

/* GET ALL */
export const useBeaches = (params = {}) => {
  return useQuery({
    queryKey: ['beaches', params],
    queryFn: async () => {
      const { data } = await API.get('/beaches', { params });
      return data;
    },
    staleTime: 1000 * 60 * 5,
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
      queryClient.invalidateQueries(['beaches']);
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
      queryClient.invalidateQueries(['beaches']);
    },
  });
};

export const useDeleteBeach = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      await API.delete(`/beaches/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['beaches']);
    },
  });
};
