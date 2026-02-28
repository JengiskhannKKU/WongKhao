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
        health_goal: Array.isArray(formData.health_goals) ? formData.health_goals[0] || null : formData.primary_goal || null,
        sodium_limit: 1500,
        points: 0,
        streak_days: 1,
        // The rest of the fields are commented out to prevent backend errors 
        // since the SQLite database schema hasn't been pushed yet.
        /*
        birthday: formData.birthday || null,
        waist_cm: formData.waist_cm || null,
        body_fat_pct: formData.body_fat_pct || null,
        bmr: formData.bmr || null,
        primary_goal: formData.primary_goal || null,
        target_weight_kg: formData.target_weight_kg || null,
        daily_calorie_target: formData.daily_calorie_target || null,
        chronic_diseases: formData.chronic_diseases || null,
        food_allergies: formData.food_allergies || null,
        religious_restrictions: formData.religious_restrictions || null,
        medications_affecting_diet: formData.medications_affecting_diet || null,
        */
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
