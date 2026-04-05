import { useMutation } from '@tanstack/react-query';
import API from '@/api/index.js';

export const useChangePassword = () => {
  return useMutation({
    mutationFn: async (data) => {
      const response = await API.patch('/auth/profile/password', data);
      return response.data;
    },
  });
};

export const useDeleteAccount = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await API.delete('/auth/profile');
      return response.data;
    },
  });
};
