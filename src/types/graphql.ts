// GraphQL Type Definitions for Type Safety
// Manually maintained - Keep in sync with GraphQL schemas in typeDefs/

import { FileUpload } from 'graphql-upload-ts';
import { PrismaClient } from '@prisma/client';
import { Role } from '@prisma/client';

// GraphQL Context Type
export interface GraphQLContext {
  prisma: PrismaClient;
  req: Request & { ip?: string };
  userId?: string;
  role?: Role;
}

// Re-export FileUpload for convenience
export { FileUpload };

// Enums
export enum CritAirCategory {
  CRIT_AIR_0 = 'CRIT_AIR_0',
  CRIT_AIR_1 = 'CRIT_AIR_1',
  CRIT_AIR_2 = 'CRIT_AIR_2',
  CRIT_AIR_3 = 'CRIT_AIR_3',
  CRIT_AIR_4 = 'CRIT_AIR_4',
  CRIT_AIR_5 = 'CRIT_AIR_5',
  NO_STICKER = 'NO_STICKER'
}

export enum FuelType {
  PETROL = 'PETROL',
  DIESEL = 'DIESEL',
  ELECTRIC = 'ELECTRIC',
  HYBRID = 'HYBRID',
  LPG = 'LPG',
  CNG = 'CNG'
}

export enum Transmission {
  MANUAL = 'MANUAL',
  AUTOMATIC = 'AUTOMATIC',
  CVT = 'CVT',
  DCT = 'DCT'
}

export enum CarStatus {
  AVAILABLE = 'AVAILABLE',
  RENTED = 'RENTED',
  MAINTENANCE = 'MAINTENANCE',
  OUT_OF_SERVICE = 'OUT_OF_SERVICE'
}

export enum LicenseCategory {
  A = 'A',
  A1 = 'A1',
  A2 = 'A2',
  B = 'B',
  C = 'C',
  D = 'D',
  BE = 'BE',
  CE = 'CE',
  DE = 'DE'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

export enum BookingStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  CONFIRMED = 'CONFIRMED',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

// GraphQL Context Type
export interface GraphQLContext {
  userId?: string;
  role?: Role;
}

// Car Domain Types
export interface CarFilterInput {
  brandIds?: string[];
  modelIds?: string[];
  fuelTypes?: FuelType[];
  transmissions?: Transmission[];
  statuses?: CarStatus[];
  critAirRatings?: CritAirCategory[];
  startDate?: string;
  endDate?: string;
  includeOutOfService?: boolean;
}

export interface CreateCarInput {
  modelId: string;
  year: number;
  plateNumber: string;
  transmission: Transmission;
  fuelType?: FuelType;
  seats: number;
  requiredLicense?: LicenseCategory;
  pricePerDay: number;
  depositAmount?: number;
  dailyKmLimit?: number;
  extraKmCharge?: number;
  currentOdometer?: number;
  critAirRating: CritAirCategory;
  status?: CarStatus;
}

export interface UpdateCarInput {
  modelId?: string;
  year?: number;
  plateNumber?: string;
  transmission?: Transmission;
  fuelType?: FuelType;
  seats?: number;
  requiredLicense?: LicenseCategory;
  pricePerDay?: number;
  depositAmount?: number;
  dailyKmLimit?: number;
  extraKmCharge?: number;
  currentOdometer?: number;
  critAirRating?: CritAirCategory;
  status?: CarStatus;
}

export interface CreateBrandInput {
  name: string;
  logoUrl?: string;
}

export interface UpdateBrandInput {
  name?: string;
  logoUrl?: string;
}

export interface CreateModelInput {
  name: string;
  brandId: string;
}

export interface UpdateModelInput {
  name?: string;
}

// Payment Domain Types
export interface CreatePaymentInput {
  bookingId: string;
  amount: number;
  status?: PaymentStatus;
  stripeId?: string;
}

export interface UpdatePaymentInput {
  amount?: number;
  status?: PaymentStatus;
  stripeId?: string;
}

export interface StripeCheckoutSession {
  url: string;
  sessionId: string;
}

// Booking Domain Types
export interface CreateBookingInput {
  carId: string;
  startDate: string;
  endDate: string;
  bookingType?: string;
  damageFee?: number;
  extraKmFee?: number;
}

export interface UpdateBookingInput {
  startDate?: string;
  endDate?: string;
  status?: BookingStatus;
  damageFee?: number;
  extraKmFee?: number;
}

// User Domain Types
export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface GoogleLoginInput {
  idToken: string;
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
}

export interface CreateVerificationInput {
  documentType: string;
  side: string;
  // File uploads
  licenseFrontFile?: FileUpload; // File upload type
  licenseBackFile?: FileUpload;
  idCardFile?: FileUpload;
  addressProofFile?: FileUpload;
  // URLs after upload
  licenseFrontUrl?: string;
  licenseBackUrl?: string;
  idCardUrl?: string;
  addressProofUrl?: string;
  // License details
  licenseCategory?: LicenseCategory;
  licenseNumber?: string;
  licenseExpiry?: string;
  // ID details
  idNumber?: string;
  idExpiry?: string;
  // Booking verification
  bookingToken?: string;
}

// Platform Domain Types
export interface PlatformSettingsInput {
  businessName?: string;
  businessEmail?: string;
  businessPhone?: string;
  businessAddress?: string;
  stripePublishableKey?: string;
  stripeSecretKey?: string;
  defaultCurrency?: string;
  timezone?: string;
  // Additional properties used by platformService
  companyName?: string;
  supportEmail?: string;
  supportPhone?: string;
  address?: string;
  facebookUrl?: string;
  twitterUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  youngDriverMinAge?: number;
  youngDriverFee?: number;
  termsAndConditions?: string;
  privacyPolicy?: string;
  currency?: string;
  taxPercentage?: number;
  noviceLicenseYears?: number;
  logoUrl?: string;
}

// Generic GraphQL Resolver Args
export interface BaseArgs {
  [key: string]: any;
}

// Specific Query Args
export interface CarQueryArgs extends BaseArgs {
  filter?: CarFilterInput;
}

export interface CarByIdArgs extends BaseArgs {
  id: string;
}

export interface ModelsByBrandArgs extends BaseArgs {
  brandId: string;
}

export interface AvailableCarsArgs extends BaseArgs {
  startDate: string;
  endDate: string;
}

// Mutation Args
export interface CreateCarArgs extends BaseArgs {
  input: CreateCarInput;
}

export interface UpdateCarArgs extends BaseArgs {
  id: string;
  input: UpdateCarInput;
}

export interface DeleteCarArgs extends BaseArgs {
  id: string;
}

export interface CreateBrandArgs extends BaseArgs {
  name: string;
  logoUrl?: string;
}

export interface UpdateBrandArgs extends BaseArgs {
  id: string;
  name: string;
  logoUrl?: string;
}

export interface DeleteBrandArgs extends BaseArgs {
  id: string;
}

export interface CreateModelArgs extends BaseArgs {
  name: string;
  brandId: string;
}

export interface UpdateModelArgs extends BaseArgs {
  id: string;
  name: string;
}

export interface DeleteModelArgs extends BaseArgs {
  id: string;
}

export interface AddCarImageArgs extends BaseArgs {
  carId: string;
  file: FileUpload; // File upload type from GraphQL Upload
  isPrimary: boolean;
}

export interface DeleteCarImageArgs extends BaseArgs {
  imageId: string;
}

export interface SetPrimaryCarImageArgs extends BaseArgs {
  carId: string;
  imageId: string;
}

// Payment Args
export interface BookingPaymentArgs extends BaseArgs {
  bookingId: string;
}

export interface CreateStripeSessionArgs extends BaseArgs {
  bookingId: string;
}

export interface MockFinalizePaymentArgs extends BaseArgs {
  bookingId: string;
  success: boolean;
}

export interface CreatePaymentArgs extends BaseArgs {
  input: CreatePaymentInput;
}

export interface UpdatePaymentStatusArgs extends BaseArgs {
  input: { id: string; status: PaymentStatus };
}

// Booking Args
export interface CreateBookingArgs extends BaseArgs {
  input: CreateBookingInput;
}

export interface UpdateBookingArgs extends BaseArgs {
  id: string;
  input: UpdateBookingInput;
}

// User Args
export interface RegisterArgs extends BaseArgs {
  input: RegisterInput;
}

export interface LoginArgs extends BaseArgs {
  input: LoginInput;
}

export interface GoogleLoginArgs extends BaseArgs {
  idToken: string;
}

export interface UpdateUserArgs extends BaseArgs {
  input: UpdateUserInput;
}

// OCR Result Types
export interface OCRResult {
  firstName?: string;
  lastName?: string;
  fullName?: string;
  documentId?: string;
  birthDate?: string;
  expiryDate?: string;
  licenseNumber?: string;
  licenseCategories?: string[];
  licenseCategory?: string;
  restrictsToAutomatic?: boolean;
  address?: string;
  // Additional properties used in OCR processing
  prenom?: string; // French first name
  nom?: string;    // French last name
  idNumber?: string;
  documentDate?: string;
  issueDate?: string;
  dateOfBirth?: string;
  email?: string;
  phoneNumber?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  fullAddress?: string;
}

// Validation Result Type
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

// Generic result types
export type ResolverResult<T> = T | null | Promise<T | null>;
export type MutationResult<T> = T | Promise<T>;
