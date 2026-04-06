import API from '@/api/index.js';
import axios from 'axios';
import Cookies from 'js-cookie';

const BASE_URL = 'http://localhost:4000/api';

const getAuthHeaders = () => {
  const token = Cookies.get('token') || localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Get current user profile
 */
export const getUserProfile = async () => {
  try {
    const response = await API.get('/auth/me');
    return response.data.user;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

/**
 * Get user's events (events they're volunteering in)
 */
export const getUserEvents = async (userId) => {
  try {
    const response = await axios.get(`${BASE_URL}/events`, {
      params: {
        limit: 100, // Get more events for stats
      },
      headers: getAuthHeaders(),
    });

    if (response.data.data && response.data.data.data) {
      // Filter events where current user is in volunteers array
      return response.data.data.data.filter((event) =>
        event.volunteers?.some((vol) => vol._id === userId || vol === userId)
      );
    }
    return [];
  } catch (error) {
    console.error('Error fetching user events:', error);
    return [];
  }
};

/**
 * Get user's waste records
 */
export const getUserWasteRecords = async (userId) => {
  try {
    const response = await axios.get(`${BASE_URL}/waste-records`, {
      params: {
        limit: 100,
      },
      headers: getAuthHeaders(),
    });

    if (response.data.data) {
      return response.data.data;
    }
    return [];
  } catch (error) {
    console.error('Error fetching waste records:', error);
    return [];
  }
};

/**
 * Get user's community posts
 */
export const getUserCommunityPosts = async (userId) => {
  try {
    const response = await axios.get(`${BASE_URL}/posts`, {
      params: {
        authorId: userId,
        limit: 100,
      },
      headers: getAuthHeaders(),
    });

    if (response.data.data && response.data.data.posts) {
      return response.data.data.posts;
    }
    return [];
  } catch (error) {
    console.error('Error fetching community posts:', error);
    return [];
  }
};

/**
 * Get beaches visited (distinct beaches from waste records)
 */
export const getUserBeachesVisited = async (userId) => {
  try {
    const response = await axios.get(`${BASE_URL}/waste-records`, {
      params: {
        limit: 100,
      },
      headers: getAuthHeaders(),
    });

    if (response.data.data) {
      // Get unique beaches
      const beaches = new Set();
      response.data.data.forEach((record) => {
        if (record.beachId) {
          beaches.add(
            typeof record.beachId === 'object'
              ? record.beachId._id
              : record.beachId
          );
        }
      });
      return Array.from(beaches).length;
    }
    return 0;
  } catch (error) {
    console.error('Error fetching beaches visited:', error);
    return 0;
  }
};

/**
 * Get user biography/profile info from user data
 */
export const getUserBio = async () => {
  try {
    const user = await getUserProfile();
    return (
      user.bio ||
      'Environmental enthusiast passionate about ocean conservation.'
    );
  } catch (error) {
    return 'Environmental enthusiast passionate about ocean conservation.';
  }
};

/**
 * Generate user avatar initials
 */
export const generateAvatarInitials = (name) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
};

/**
 * Get user initials for avatar
 */
export const getUserInitials = (name) => {
  return generateAvatarInitials(name);
};
