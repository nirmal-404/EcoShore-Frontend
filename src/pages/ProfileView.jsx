import React, { useState, useMemo } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Edit2,
  Award,
  Zap,
  Heart,
  Users,
  Calendar,
  Loader2,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  getUserProfile,
  getUserEvents,
  getUserWasteRecords,
  getUserCommunityPosts,
} from '@/api/userApi';

export default function ProfileView() {
  const [isEditing, setIsEditing] = useState(false);

  // Fetch current user profile
  const {
    data: userProfile,
    isLoading: profileLoading,
    error: profileError,
  } = useQuery({
    queryKey: ['userProfile'],
    queryFn: getUserProfile,
  });

  // Fetch user events
  const { data: userEvents = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['userEvents', userProfile?._id],
    queryFn: () => getUserEvents(userProfile?._id),
    enabled: !!userProfile?._id,
  });

  // Fetch user waste records
  const { data: wasteRecords = [], isLoading: wasteLoading } = useQuery({
    queryKey: ['userWasteRecords'],
    queryFn: () => getUserWasteRecords(userProfile?._id),
    enabled: !!userProfile?._id,
  });

  // Fetch user community posts
  const { data: communityPosts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['userCommunityPosts', userProfile?._id],
    queryFn: () => getUserCommunityPosts(userProfile?._id),
    enabled: !!userProfile?._id,
  });

  // Calculate stats
  const stats = useMemo(() => {
    const uniqueBeaches = new Set();
    wasteRecords.forEach((record) => {
      if (record.beachId) {
        const beachId =
          typeof record.beachId === 'object'
            ? record.beachId._id
            : record.beachId;
        uniqueBeaches.add(beachId);
      }
    });

    return {
      eventsAttended: userEvents.length,
      beachesVisited: uniqueBeaches.size,
      communityPosts: communityPosts.length,
      wasterecordsSubmitted: wasteRecords.length,
    };
  }, [userEvents, wasteRecords, communityPosts]);

  // Generate user initials for avatar
  const userInitials =
    userProfile?.name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase() || 'U';

  // Prepare activities from recent events and posts
  const activities = useMemo(() => {
    const acts = [];

    // Add recent events
    userEvents.slice(0, 2).forEach((event) => {
      acts.push({
        id: event._id,
        type: 'event',
        title: event.title,
        date: event.startDate,
        status: event.status === 'COMPLETED' ? 'completed' : 'active',
      });
    });

    // Add recent posts
    communityPosts.slice(0, 1).forEach((post) => {
      acts.push({
        id: post._id,
        type: 'post',
        title: `Shared a community post: ${post.text.substring(0, 50)}...`,
        date: post.createdAt,
        status: 'active',
      });
    });

    // Add recent waste records
    wasteRecords.slice(0, 1).forEach((record) => {
      acts.push({
        id: record._id,
        type: 'record',
        title: `Submitted waste record - ${record.plasticType} collection (${record.weight}kg)`,
        date: record.createdAt,
        status: 'completed',
      });
    });

    return acts.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [userEvents, communityPosts, wasteRecords]);

  // Badges based on user stats
  const badges = useMemo(() => {
    const badgeList = [];

    if (stats.eventsAttended >= 5) {
      badgeList.push({
        id: 1,
        name: 'Ocean Guardian',
        icon: '🌊',
        color: 'blue',
      });
    }
    if (stats.beachesVisited >= 3) {
      badgeList.push({
        id: 2,
        name: 'Beach Hero',
        icon: '⭐',
        color: 'yellow',
      });
    }
    if (stats.wasterecordsSubmitted >= 10) {
      badgeList.push({
        id: 3,
        name: 'Active Member',
        icon: '🔥',
        color: 'orange',
      });
    }

    return badgeList.length > 0
      ? badgeList
      : [
          { id: 1, name: 'Ocean Guardian', icon: '🌊', color: 'blue' },
          { id: 2, name: 'Beach Hero', icon: '⭐', color: 'yellow' },
          { id: 3, name: 'Active Member', icon: '🔥', color: 'orange' },
        ];
  }, [stats]);

  const isLoading =
    profileLoading || eventsLoading || wasteLoading || postsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-blue-600" size={48} />
          <p className="text-gray-600 dark:text-gray-300">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 text-lg font-semibold">
            Error loading profile. Please try again.
          </p>
        </div>
      </div>
    );
  }

  const profile = {
    id: userProfile?._id,
    name: userProfile?.name || 'Unknown User',
    email: userProfile?.email || 'N/A',
    phone: userProfile?.phone || 'N/A',
    location: userProfile?.address || 'Not specified',
    bio:
      userProfile?.bio ||
      'Environmental enthusiast passionate about ocean conservation. Volunteer with EcoShore team.',
    role:
      userProfile?.role?.charAt(0).toUpperCase() +
        userProfile?.role?.slice(1).toLowerCase() || 'Volunteer',
    joinDate: userProfile?.createdAt
      ? new Date(userProfile.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
        })
      : 'January 2024',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile?.name || 'user'}`,
    stats,
    badges,
    activities,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg overflow-hidden mb-8">
          {/* Cover Image */}
          <div className="h-32 bg-gradient-to-r from-blue-400 to-teal-400"></div>

          {/* Profile Info */}
          <div className="px-6 md:px-12 pb-8">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-16 mb-6">
              <div className="flex items-end mb-6 md:mb-0">
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-700 shadow-lg"
                />
                <div className="ml-6 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {profile.name}
                  </h1>
                  <p className="text-lg text-blue-600 dark:text-blue-400 font-semibold">
                    {profile.role}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setIsEditing(!isEditing)}
                variant="outline"
                className="flex items-center gap-2 mb-2"
              >
                <Edit2 size={18} />
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </Button>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                <Mail size={18} className="text-blue-600" />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="font-medium">{profile.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                <Phone size={18} className="text-blue-600" />
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="font-medium">{profile.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                <MapPin size={18} className="text-blue-600" />
                <div>
                  <p className="text-xs text-gray-500">Location</p>
                  <p className="font-medium">{profile.location}</p>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div>
              <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                {profile.bio}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1">
                <Calendar size={16} />
                Member since {profile.joinDate}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<Users size={24} className="text-blue-600" />}
            label="Events Attended"
            value={profile.stats.eventsAttended}
          />
          <StatCard
            icon={<Heart size={24} className="text-red-600" />}
            label="Beaches Visited"
            value={profile.stats.beachesVisited}
          />
          <StatCard
            icon={<Zap size={24} className="text-yellow-600" />}
            label="Community Posts"
            value={profile.stats.communityPosts}
          />
          <StatCard
            icon={<Award size={24} className="text-purple-600" />}
            label="Waste Records"
            value={profile.stats.wasterecordsSubmitted}
          />
        </div>

        {/* Badges Section */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Achievements
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {profile.badges.map((badge) => (
              <div
                key={badge.id}
                className="bg-gradient-to-br from-blue-50 to-teal-50 dark:from-gray-700 dark:to-gray-600 rounded-2xl p-6 text-center border-2 border-blue-200 dark:border-gray-500"
              >
                <div className="text-4xl mb-3">{badge.icon}</div>
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                  {badge.name}
                </h3>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Recent Activity
          </h2>
          <div className="space-y-4">
            {profile.activities.map((activity, index) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  {activity.type === 'event' && (
                    <Users size={20} className="text-blue-600" />
                  )}
                  {activity.type === 'post' && (
                    <Heart size={20} className="text-red-600" />
                  )}
                  {activity.type === 'record' && (
                    <Award size={20} className="text-purple-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {activity.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(activity.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                    activity.status === 'completed'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  }`}
                >
                  {activity.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 text-center">
      <div className="flex justify-center mb-3">{icon}</div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
        {value}
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
    </div>
  );
}
