export const checkRole = (requiredRole: string) => {
  return (context: any) => {
    if (!context.userId) {
      throw new Error('Authentication required');
    }

    if (context.role !== requiredRole && context.role !== 'ADMIN') {
      throw new Error(`Access denied. Required role: ${requiredRole}`);
    }

    return true;
  };
};

export const isAdmin = (context: any) => {
  if (!context.userId) {
    throw new Error('Authentication required');
  }

  if (context.role !== 'ADMIN') {
    throw new Error('Admin access required');
  }

  return true;
};

export const isAuthenticated = (context: any) => {
  if (!context.userId) {
    throw new Error('Authentication required');
  }

  return true;
};
