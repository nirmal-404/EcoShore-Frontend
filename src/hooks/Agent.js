import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import API from '@/api/index.js';

/* GET ALL AGENTS */
export const useAgents = () => {
  return useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const { data } = await API.get('/agents');
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });
};

/* GET AGENT BY ID */
export const useAgent = (agentId) => {
  return useQuery({
    queryKey: ['agent', agentId],
    queryFn: async () => {
      const { data } = await API.get(`/agents/${agentId}`);
      return data;
    },
    enabled: !!agentId,
    staleTime: 1000 * 60 * 5,
  });
};

/* ADD AGENT */
export const useAddAgent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newAgent) => {
      const { data } = await API.post('/agents', newAgent);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['agents']);
    },
  });
};

/* EDIT AGENT */
export const useEditAgent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updatedData }) => {
      const { data } = await API.put(`/agents/${id}`, updatedData);
      return data;
    },
    onSuccess: (response) => {
      const updatedAgent = response.data?.agent || response.data;
      queryClient.invalidateQueries(['agents']);
      queryClient.invalidateQueries(['agent']);
    },
  });
};

/* DELETE AGENT */
export const useDeleteAgent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      await API.delete(`/agents/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['agents']);
    },
  });
};

/* REASSIGN AGENT TO DIFFERENT BEACH */
export const useReassignAgent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ agentId, beachId }) => {
      const { data } = await API.patch(
        `/agents/${agentId}/reassign/${beachId}`
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['agents']);
      queryClient.invalidateQueries(['agent']);
      queryClient.invalidateQueries(['beaches']);
    },
  });
};

/* GET AGENTS BY BEACH */
export const useAgentsByBeach = (beachId) => {
  return useQuery({
    queryKey: ['agents', beachId],
    queryFn: async () => {
      const { data } = await API.get(`/agents/beach/${beachId}`);
      return data;
    },
    enabled: !!beachId,
    staleTime: 1000 * 60 * 5,
  });
};

/* UPDATE AGENT STATUS */
export const useUpdateAgentStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ agentId, status }) => {
      const { data } = await API.patch(`/agents/${agentId}/status`, { status });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['agents']);
      queryClient.invalidateQueries(['agent']);
    },
  });
};

/* GET EVENTS BY AGENT ID */
export const useEventsByAgent = (agentId) => {
  return useQuery({
    queryKey: ['events', 'agent', agentId],
    queryFn: async () => {
      const { data } = await API.get(`/events/agent/${agentId}`);
      return data;
    },
    enabled: !!agentId,
    staleTime: 1000 * 60 * 5,
  });
};
