import { GraphQLError } from 'graphql';

// 1. Check if User is Logged In
export const isAuthenticated = (context: any) => {
  if (!context.userId) {
    throw new GraphQLError('Authentication required. Please login.', {
      extensions: { code: 'UNAUTHENTICATED', http: { status: 401 } },
    });
  }
};

// 2. Check if User is Admin
export const isAdmin = (context: any) => {
  isAuthenticated(context); // First check login

  if (context.role !== 'ADMIN') {
    throw new GraphQLError('Access denied. Admin rights required.', {
      extensions: { code: 'FORBIDDEN', http: { status: 403 } },
    });
  }
};

// 3. Check if User owns the data OR is Admin
export const isOwnerOrAdmin = (context: any, ownerId: string) => {
  isAuthenticated(context);

  if (context.role !== 'ADMIN' && context.userId !== ownerId) {
    throw new GraphQLError('Access denied. You do not own this resource.', {
      extensions: { code: 'FORBIDDEN', http: { status: 403 } },
    });
  }
};