import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { localStore } from '@/api/apiStore';
import { createPageUrl } from '@/utils';
import { useAuth } from '@/lib/AuthContext';
import ProfileForm from '@/components/onboarding/ProfileForm';
import { syncUserProfileToGraph } from '@/api/behaviorAnalytics';

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      let existing = null;
      try {
        existing = await localStore.entities.UserProfile.get(user.id);
      } catch {
        existing = null;
      }

      const profileData = {
        health_goal: Array.isArray(formData.health_goals) ? formData.health_goals[0] || null : null,
        sodium_limit: existing?.sodium_limit || 1500,
      };

      const payload = {
        ...profileData,
        points: existing?.points || 0,
        streak_days: existing?.streak_days || 1,
      };

      let savedProfile;
      if (existing) {
        savedProfile = await localStore.entities.UserProfile.update(user.id, payload);
      } else {
        savedProfile = await localStore.entities.UserProfile.create({
          id: user.id,
          email: user?.email || null,
          name: user?.name || null,
          ...payload,
        });
      }

      void syncUserProfileToGraph({
        ...savedProfile,
        ...formData,
        id: user.id,
      }, user.id);

      navigate(createPageUrl('Discover'));
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <ProfileForm onSubmit={handleSubmit} />
    </div>
  );
}
