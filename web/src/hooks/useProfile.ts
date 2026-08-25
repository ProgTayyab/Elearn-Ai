import { useMutation } from '@tanstack/react-query';
import api from '../api/client';
import { useAuthStore } from '../store/authStore';
import { AuthUser, UserPreferences } from '../types';

export interface UpdateProfilePayload {
  name?: string;
  username?: string;
  profilePicture?: string;
  preferences?: Partial<UserPreferences>;
}

export function useUpdateProfile() {
  const updateUser = useAuthStore((s) => s.updateUser);

  return useMutation({
    mutationFn: async (payload: UpdateProfilePayload) => {
      const { data } = await api.patch('/auth/profile', payload);
      return data.user as AuthUser;
    },
    onSuccess: (user) => {
      updateUser(user);
    },
  });
}
