const PUBLIC_BASE = process.env.PUBLIC_URL || '';

export const withBasePath = (relativePath = '') => {
  if (!relativePath) return PUBLIC_BASE || '';
  const normalized = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
  return `${PUBLIC_BASE}${normalized}`;
};

export const PLACEHOLDER_IMAGE = withBasePath('/placeholder-card.png');

export const isPlaceholderImage = (url) => {
  if (!url) return false;
  const normalized = url.replace(PUBLIC_BASE, '');
  return normalized === '/placeholder-card.png' || normalized === 'placeholder-card.png';
};

