import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { localStore } from '@/api/apiStore';
import { createPageUrl } from '@/utils';
import ProfileForm from '@/components/onboarding/ProfileForm';
import { syncUserProfileToGraph } from '@/api/behaviorAnalytics';

export default function Onboarding() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      // Create or update user profile
      const profiles = await localStore.entities.UserProfile.list();
      const profileData = {
        health_goal: Array.isArray(formData.health_goals) ? formData.health_goals[0] || null : null,
        sodium_limit: profiles[0]?.sodium_limit || 1500,
      };
      let savedProfile;

      if (profiles.length > 0) {
        savedProfile = await localStore.entities.UserProfile.update(profiles[0].id, {
          ...profileData,
          points: profiles[0].points || 0,
          streak_days: profiles[0].streak_days || 1
        });
      } else {
        savedProfile = await localStore.entities.UserProfile.create({
          ...profileData,
          points: 0,
          streak_days: 1
        });
      }

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
