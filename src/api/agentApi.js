import API from '@/api/index.js';

/**
 * Create a new agent (admin only)
 */
export const createAgent = async (agentData) => {
  const { email, name, nic, assignedBeach } = agentData;
  const response = await API.post('/agents', {
    email,
    name,
    nic,
    assignedBeach,
  });
  return response.data;
};

/**
 * Get all agents
 */
export const getAllAgents = async () => {
  const response = await API.get('/agents');
  return response.data;
};

/**
 * Get agent by ID
 */
export const getAgentById = async (agentId) => {
  const response = await API.get(`/agents/${agentId}`);
  return response.data;
};

/**
 * Update agent details
 */
export const updateAgent = async (agentId, updateData) => {
  const response = await API.put(`/agents/${agentId}`, updateData);
  return response.data;
};

/**
 * Delete(deactivate) an agent
 */
export const deleteAgent = async (agentId) => {
  const response = await API.delete(`/agents/${agentId}`);
  return response.data;
};

/**
 * Get agents assigned to a specific beach
 */
export const getAgentsByBeach = async (beachId) => {
  const response = await API.get(`/agents/beach/${beachId}`);
  return response.data;
};

/**
 * Get all beaches with agent count for each beach
 */
export const getBeachesWithAgentCount = async () => {
  const response = await API.get('/beaches');
  const beaches = response.data?.data || [];

  // For each beach, get the agent count
  const beachesWithCount = await Promise.all(
    beaches.map(async (beach) => {
      try {
        const agentsResponse = await API.get(
          `/agents/beach/${beach._id || beach.id}`
        );
        const agentCount = agentsResponse.data?.data?.length || 0;
        return {
          ...beach,
          agentCount,
        };
      } catch (err) {
        // If the endpoint fails, default to 0
        return {
          ...beach,
          agentCount: 0,
        };
      }
    })
  );

  return { data: beachesWithCount };
};
