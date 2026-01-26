import { mergeResolvers } from '@graphql-tools/merge';
import { GraphQLUpload } from 'graphql-upload-ts';
import { userResolvers } from './userResolvers';
import { carResolvers } from './carResolvers';
import { bookingResolvers } from './bookingResolvers';
import { paymentResolvers } from './paymentResolvers';
import { platformResolvers } from './platformResolvers';

const scalarResolvers = {
  Upload: GraphQLUpload,
};

// Field resolvers for DocumentVerification to convert DateTime to String
const documentVerificationResolvers = {
  DocumentVerification: {
    licenseExpiry: (parent: any) => parent.licenseExpiry?.toISOString() || null,
    licenseIssueDate: (parent: any) => parent.licenseIssueDate?.toISOString() || null,
    driverDob: (parent: any) => parent.driverDob?.toISOString() || null,
    idExpiry: (parent: any) => parent.idExpiry?.toISOString() || null,
    verifiedAt: (parent: any) => parent.verifiedAt?.toISOString() || null,
    createdAt: (parent: any) => parent.createdAt?.toISOString() || null,
    updatedAt: (parent: any) => parent.updatedAt?.toISOString() || null,
  }
};

const resolvers = mergeResolvers([
  scalarResolvers,
  documentVerificationResolvers,
  userResolvers,
  carResolvers,
  bookingResolvers,
  paymentResolvers,
  platformResolvers
]);

export default resolvers;