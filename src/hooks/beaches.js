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
      // const newBeach = response.data.beach;
      // queryClient.setQueryData(['beaches'], (old) => {
      //   if (!old || !old.data) {
      //     return { data: [newBeach] };
      //   }

      //   return {
      //     ...old,
      //     data: [...old.data, newBeach],
      //   };
      // });
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
    onSuccess: (response) => {
      const updatedBeach = response.data.beach;
      queryClient.setQueryData(['beaches'], (old) => {
        if (!old || !old.data) {
          return { data: [updatedBeach] };
        }

        return {
          ...old,
          data: old.data.map((beach) =>
            beach.id === updatedBeach.id ? updatedBeach : beach
          ),
        };
      });
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
