import { GraphQLContext } from '../types/graphql';
export declare const isAuthenticated: (context: GraphQLContext) => void;
export declare const isAdmin: (context: GraphQLContext) => void;
export declare const isOwnerOrAdmin: (context: GraphQLContext, ownerId: string) => void;
//# sourceMappingURL=authguard.d.ts.map