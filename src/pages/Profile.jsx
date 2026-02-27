import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { localStore } from '@/api/apiStore';
import { createPageUrl } from '@/utils';
import { useAuth } from '@/lib/AuthContext';
import ProfileForm from '@/components/onboarding/ProfileForm';

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      const existing = await localStore.entities.UserProfile.get(user.id);
      await localStore.entities.UserProfile.update(user.id, {
        ...formData,
        points: existing?.points || 0,
        streak_days: existing?.streak_days || 1,
      });
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
