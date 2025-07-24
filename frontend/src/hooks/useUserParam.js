import { useLocation } from 'react-router-dom';

export const useUserParam = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const userId = searchParams.get('id');
  
  return userId;
};
