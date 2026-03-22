import { useMutation } from '@tanstack/react-query';
import API from '@/api/index.js';

export const useUploadImage = () => {
  return useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append('file', file);

      const { data } = await API.post(
        `${import.meta.env.VITE_API_URL}/upload-file`,
        formData
      );

      if (!data?.success) {
        throw new Error('Image upload failed');
      }

      return data.data.url;
    },
  });
};
