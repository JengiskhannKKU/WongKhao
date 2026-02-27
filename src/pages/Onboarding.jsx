import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { localStore } from '@/api/apiStore';
import { createPageUrl } from '@/utils';
import ProfileForm from '@/components/onboarding/ProfileForm';

export default function Onboarding() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      // Create or update user profile
      const profiles = await localStore.entities.UserProfile.list();

      if (profiles.length > 0) {
        await localStore.entities.UserProfile.update(profiles[0].id, {
          ...formData,
          points: profiles[0].points || 0,
          streak_days: profiles[0].streak_days || 1
        });
      } else {
        await localStore.entities.UserProfile.create({
          ...formData,
          points: 0,
          streak_days: 1
        });
      }

      navigate(createPageUrl('Discover'));
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return <ProfileForm onSubmit={handleSubmit} />;
}