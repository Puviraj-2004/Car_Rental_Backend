import { mergeResolvers } from '@graphql-tools/merge';
import { userResolvers } from './userResolvers';
import { carResolvers } from './carResolvers';
import { bookingResolvers } from './bookingResolvers';
import { paymentResolvers } from './paymentResolvers';

const resolvers = mergeResolvers([
  userResolvers,
  carResolvers,
  bookingResolvers,
  paymentResolvers
]);

export default resolvers;