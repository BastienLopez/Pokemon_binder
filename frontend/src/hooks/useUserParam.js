import { useLocation } from 'react-router-dom';

export const useUserParam = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  // Chercher d'abord 'id', puis 'user_id' comme fallback
  const userId = searchParams.get('id') || searchParams.get('user_id');
  
  return userId;
};
