import { useAuthStore } from '@/store';

export interface PermissionCheck {
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  isDemoUser: boolean;
  canAccessAdmin: boolean;
  canManageUsers: boolean;
}

/**
 * Hook to check user permissions based on role
 * Returns permission flags based on the user's role
 */
export function usePermissions(): PermissionCheck {
  const { user } = useAuthStore();
  const userRole = user?.role || 'DEMO';

  const isDemoUser = userRole === 'DEMO';
  const isAdmin = userRole === 'ADMIN';
  const isStaff = userRole === 'STAFF';

  return {
    // Demo users have read-only access
    canCreate: !isDemoUser,
    canEdit: !isDemoUser,
    canDelete: !isDemoUser,
    isDemoUser,
    // Only admin and staff can access admin features
    canAccessAdmin: isAdmin || isStaff,
    // Only admin can manage users
    canManageUsers: isAdmin,
  };
}

export default usePermissions;
