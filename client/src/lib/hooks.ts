
import { useAuth } from './auth-provider';

export const useDogName = () => {
  const { userProfile } = useAuth();
  return userProfile?.pet_name || 'your dog';
};
