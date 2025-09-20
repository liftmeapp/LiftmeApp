
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  clerkId: 'clerkId',
  email: 'email',
  firstName: 'firstName',
  lastName: 'lastName',
  phone: 'phone',
  role: 'role',
  isPremium: 'isPremium',
  isBanned: 'isBanned',
  unsafeMetadata: 'unsafeMetadata',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  stripeCustomerId: 'stripeCustomerId'
};

exports.Prisma.VehicleScalarFieldEnum = {
  id: 'id',
  brand: 'brand',
  name: 'name',
  model: 'model',
  year: 'year',
  plateNumber: 'plateNumber',
  color: 'color',
  type: 'type',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  userId: 'userId'
};

exports.Prisma.ServiceScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  icon: 'icon',
  type: 'type'
};

exports.Prisma.GarageScalarFieldEnum = {
  id: 'id',
  name: 'name',
  licenseNumber: 'licenseNumber',
  address: 'address',
  ownerName: 'ownerName',
  contactEmail: 'contactEmail',
  contactPhone: 'contactPhone',
  numberOfEmployees: 'numberOfEmployees',
  rating: 'rating',
  reviewCount: 'reviewCount',
  isOpen: 'isOpen',
  operatingHours: 'operatingHours',
  stripeAccountId: 'stripeAccountId',
  location: 'location',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  status: 'status',
  rejectionReason: 'rejectionReason',
  ownerId: 'ownerId'
};

exports.Prisma.GarageServiceScalarFieldEnum = {
  id: 'id',
  price: 'price',
  garageId: 'garageId',
  serviceId: 'serviceId'
};

exports.Prisma.TowTruckScalarFieldEnum = {
  id: 'id',
  name: 'name',
  driverName: 'driverName',
  model: 'model',
  make: 'make',
  year: 'year',
  plateNumber: 'plateNumber',
  licenseNumber: 'licenseNumber',
  status: 'status',
  rejectionReason: 'rejectionReason',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  ownerId: 'ownerId',
  stripeAccountId: 'stripeAccountId'
};

exports.Prisma.TowTruckServiceScalarFieldEnum = {
  id: 'id',
  price: 'price',
  vehicleType: 'vehicleType',
  towTruckId: 'towTruckId'
};

exports.Prisma.LiveTruckLocationScalarFieldEnum = {
  id: 'id',
  location: 'location',
  lastUpdated: 'lastUpdated',
  isAvailable: 'isAvailable',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  towTruckId: 'towTruckId'
};

exports.Prisma.SparePartScalarFieldEnum = {
  id: 'id',
  partName: 'partName',
  compatibleMake: 'compatibleMake',
  compatibleModel: 'compatibleModel',
  compatibleYear: 'compatibleYear',
  price: 'price',
  quantityAvailable: 'quantityAvailable',
  garageId: 'garageId'
};

exports.Prisma.BookingScalarFieldEnum = {
  id: 'id',
  status: 'status',
  bookedAt: 'bookedAt',
  expiresAt: 'expiresAt',
  paymentExpiresAt: 'paymentExpiresAt',
  notes: 'notes',
  otp: 'otp',
  otpExpiresAt: 'otpExpiresAt',
  pickupLocation: 'pickupLocation',
  destinationLocation: 'destinationLocation',
  serviceStartedAt: 'serviceStartedAt',
  serviceEndedAt: 'serviceEndedAt',
  basePrice: 'basePrice',
  additionalFees: 'additionalFees',
  discountAmount: 'discountAmount',
  finalAmount: 'finalAmount',
  paymentStatus: 'paymentStatus',
  paymentIntentId: 'paymentIntentId',
  userRating: 'userRating',
  userReview: 'userReview',
  providerRating: 'providerRating',
  providerReview: 'providerReview',
  userId: 'userId',
  vehicleId: 'vehicleId',
  eligibleProviderIds: 'eligibleProviderIds',
  serviceId: 'serviceId',
  garageId: 'garageId',
  garageServiceId: 'garageServiceId',
  towTruckId: 'towTruckId',
  towTruckServiceId: 'towTruckServiceId',
  promoCodeId: 'promoCodeId'
};

exports.Prisma.PromoCodeScalarFieldEnum = {
  id: 'id',
  code: 'code',
  discountType: 'discountType',
  discountValue: 'discountValue',
  expiresAt: 'expiresAt',
  maxUses: 'maxUses',
  timesUsed: 'timesUsed',
  isActive: 'isActive'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};
exports.Role = exports.$Enums.Role = {
  CUSTOMER: 'CUSTOMER',
  GARAGE_OWNER: 'GARAGE_OWNER',
  TOW_TRUCK_OWNER: 'TOW_TRUCK_OWNER',
  ADMIN: 'ADMIN'
};

exports.VehicleType = exports.$Enums.VehicleType = {
  SEDAN: 'SEDAN',
  HATCHBACK: 'HATCHBACK',
  SUV: 'SUV',
  BIKE: 'BIKE'
};

exports.VerificationStatus = exports.$Enums.VerificationStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED'
};

exports.BookingStatus = exports.$Enums.BookingStatus = {
  SEARCHING: 'SEARCHING',
  PENDING: 'PENDING',
  AWAITING_PAYMENT: 'AWAITING_PAYMENT',
  CONFIRMED: 'CONFIRMED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED'
};

exports.DiscountType = exports.$Enums.DiscountType = {
  PERCENTAGE: 'PERCENTAGE',
  FIXED_AMOUNT: 'FIXED_AMOUNT'
};

exports.Prisma.ModelName = {
  User: 'User',
  Vehicle: 'Vehicle',
  Service: 'Service',
  Garage: 'Garage',
  GarageService: 'GarageService',
  TowTruck: 'TowTruck',
  TowTruckService: 'TowTruckService',
  LiveTruckLocation: 'LiveTruckLocation',
  SparePart: 'SparePart',
  Booking: 'Booking',
  PromoCode: 'PromoCode'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
