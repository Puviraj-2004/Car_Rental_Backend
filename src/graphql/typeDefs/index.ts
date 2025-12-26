import { mergeTypeDefs } from '@graphql-tools/merge';
import { userTypeDefs } from './userTypeDefs';
import { carTypeDefs } from './carTypeDefs';
import { bookingTypeDefs } from './bookingTypeDefs';
import { paymentTypeDefs } from './paymentTypeDefs';
import { platformTypeDefs } from './platformTypeDefs';

const typeDefs = mergeTypeDefs([
  userTypeDefs,
  carTypeDefs,
  bookingTypeDefs,
  paymentTypeDefs,
  platformTypeDefs,
]);

export default typeDefs;