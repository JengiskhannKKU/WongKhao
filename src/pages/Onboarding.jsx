import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { localStore } from '@/api/apiStore';
import { createPageUrl } from '@/utils';
import { useAuth } from '@/lib/AuthContext';
import ProfileForm from '@/components/onboarding/ProfileForm';
import { syncUserProfileToGraph } from '@/api/behaviorAnalytics';

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      const profileData = {
        health_goal: Array.isArray(formData.health_goals) ? formData.health_goals[0] || null : null,
        sodium_limit: 1500,
        points: 0,
        streak_days: 1,
      };

      const savedProfile = await localStore.entities.UserProfile.update(user.id, profileData);

      void syncUserProfileToGraph({ ...savedProfile, ...formData }, savedProfile.id);
      navigate(createPageUrl('Discover'));
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return <ProfileForm onSubmit={handleSubmit} />;
}
