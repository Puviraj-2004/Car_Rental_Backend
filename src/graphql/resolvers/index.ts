import { mergeResolvers } from '@graphql-tools/merge';
import { GraphQLUpload } from 'graphql-upload-ts';
import { userResolvers } from './userResolvers';
import { carResolvers } from './carResolvers';
import { bookingResolvers } from './bookingResolvers';
import { paymentResolvers } from './paymentResolvers';

const scalarResolvers = {
  Upload: GraphQLUpload,
};

const resolvers = mergeResolvers([
  scalarResolvers,
  userResolvers,
  carResolvers,
  bookingResolvers,
  paymentResolvers
]);

export default resolvers;