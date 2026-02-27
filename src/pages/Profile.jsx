import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { localStore } from '@/api/apiStore';
import { createPageUrl } from '@/utils';
import { useAuth } from '@/lib/AuthContext';
import ProfileForm from '@/components/onboarding/ProfileForm';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
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

  const handleLogout = () => {
    logout();
    navigate(createPageUrl('Login'));
  };

  return (
    <div className="relative">
      <div className="absolute top-4 right-4 z-10">
        <Button
          onClick={handleLogout}
          variant="ghost"
          size="sm"
          className="text-slate-500 hover:text-rose-500 hover:bg-rose-50 rounded-xl gap-2"
        >
          <LogOut className="w-4 h-4" />
          ออกจากระบบ
        </Button>
      </div>
      <ProfileForm onSubmit={handleSubmit} />
    </div>
  );
}
