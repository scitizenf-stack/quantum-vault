import { useAuth } from '@/lib/AuthContext';

const FOUNDER_EMAIL = 'securecitizenfoundation@gmail.com';

const ROLE_LEVELS = {
  FOUNDER:   5,
  ADMIN:     4,
  DEVELOPER: 3,
  ANALYST:   2,
  VIEWER:    1,
};

const SECTION_MIN_LEVEL = {
  dashboard:    1,
  watchlist:    1,
  marketplace:  1,
  portfolio:    2,
  transactions: 2,
  wallet:       4,
  developer:    3,
  treasury:     4,
  admin:        4,
  hft:          3,
  yield:        2,
  identity:     2,
  hosting:      3,
  telecom:      2,
  ai:           2,
  'ai-insights': 2,
  platform:     4,
  settings:     4,
};

export function useRBAC() {
  const { user } = useAuth();

  // Nehemie is always FOUNDER
  const isFounder = user?.email === FOUNDER_EMAIL;
  const rawRole = isFounder ? 'FOUNDER' : (user?.role?.toUpperCase() || 'VIEWER');
  const role = ROLE_LEVELS[rawRole] != null ? rawRole : 'VIEWER';
  const level = ROLE_LEVELS[role] || 1;

  const canView = (section) => {
    const min = SECTION_MIN_LEVEL[section] ?? 1;
    return level >= min;
  };

  const canEdit = (section) => {
    const min = SECTION_MIN_LEVEL[section] ?? 1;
    return level >= Math.max(min, ROLE_LEVELS.ANALYST);
  };

  const canAdmin = () => level >= ROLE_LEVELS.ADMIN;

  return { user, role, level, canView, canEdit, canAdmin, isFounder };
}