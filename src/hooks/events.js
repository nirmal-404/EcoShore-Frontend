import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import API from '@/api/index.js';

/* GET ALL EVENTS */
export const useEvents = () => {
  return useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const { data } = await API.get('/events');
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });
};

/* ADD EVENT */
export const useAddEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newEvent) => {
      const { data } = await API.post('/events', newEvent);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['events']);
    },
  });
};

/* EDIT EVENT */
export const useEditEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updatedData }) => {
      const { data } = await API.put(`/events/${id}`, updatedData);
      return data;
    },
    onSuccess: (response) => {
      const updatedEvent = response.data.event;
      queryClient.setQueryData(['events'], (old) => {
        if (!old || !old.data) {
          return { data: [updatedEvent] };
        }

        return {
          ...old,
          data: old.data.map((event) =>
            event._id === updatedEvent._id ? updatedEvent : event
          ),
        };
      });
    },
  });
};

/* DELETE EVENT */
export const useDeleteEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      await API.delete(`/events/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['events']);
    },
  });
};

/* JOIN EVENT */
export const useJoinEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventId) => {
      const { data } = await API.post(`/events/${eventId}/join`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['events']);
    },
  });
};

/* LEAVE EVENT */
export const useLeaveEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventId) => {
      const { data } = await API.post(`/events/${eventId}/leave`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['events']);
    },
  });
};

/* ASSIGN AGENT TO EVENT */
export const useAssignAgent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ eventId, agentId }) => {
      const { data } = await API.patch(`/events/${eventId}`, { agentId });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['events']);
    },
  });
};
