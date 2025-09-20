
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model Vehicle
 * 
 */
export type Vehicle = $Result.DefaultSelection<Prisma.$VehiclePayload>
/**
 * Model Service
 * 
 */
export type Service = $Result.DefaultSelection<Prisma.$ServicePayload>
/**
 * Model Garage
 * 
 */
export type Garage = $Result.DefaultSelection<Prisma.$GaragePayload>
/**
 * Model GarageService
 * 
 */
export type GarageService = $Result.DefaultSelection<Prisma.$GarageServicePayload>
/**
 * Model TowTruck
 * 
 */
export type TowTruck = $Result.DefaultSelection<Prisma.$TowTruckPayload>
/**
 * Model TowTruckService
 * 
 */
export type TowTruckService = $Result.DefaultSelection<Prisma.$TowTruckServicePayload>
/**
 * Model LiveTruckLocation
 * 
 */
export type LiveTruckLocation = $Result.DefaultSelection<Prisma.$LiveTruckLocationPayload>
/**
 * Model SparePart
 * 
 */
export type SparePart = $Result.DefaultSelection<Prisma.$SparePartPayload>
/**
 * Model Booking
 * 
 */
export type Booking = $Result.DefaultSelection<Prisma.$BookingPayload>
/**
 * Model PromoCode
 * 
 */
export type PromoCode = $Result.DefaultSelection<Prisma.$PromoCodePayload>

/**
 * Enums
 */
export namespace $Enums {
  export const Role: {
  CUSTOMER: 'CUSTOMER',
  GARAGE_OWNER: 'GARAGE_OWNER',
  TOW_TRUCK_OWNER: 'TOW_TRUCK_OWNER',
  ADMIN: 'ADMIN'
};

export type Role = (typeof Role)[keyof typeof Role]


export const VehicleType: {
  SEDAN: 'SEDAN',
  HATCHBACK: 'HATCHBACK',
  SUV: 'SUV',
  BIKE: 'BIKE'
};

export type VehicleType = (typeof VehicleType)[keyof typeof VehicleType]


export const VerificationStatus: {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED'
};

export type VerificationStatus = (typeof VerificationStatus)[keyof typeof VerificationStatus]


export const BookingStatus: {
  SEARCHING: 'SEARCHING',
  PENDING: 'PENDING',
  AWAITING_PAYMENT: 'AWAITING_PAYMENT',
  CONFIRMED: 'CONFIRMED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED'
};

export type BookingStatus = (typeof BookingStatus)[keyof typeof BookingStatus]


export const DiscountType: {
  PERCENTAGE: 'PERCENTAGE',
  FIXED_AMOUNT: 'FIXED_AMOUNT'
};

export type DiscountType = (typeof DiscountType)[keyof typeof DiscountType]

}

export type Role = $Enums.Role

export const Role: typeof $Enums.Role

export type VehicleType = $Enums.VehicleType

export const VehicleType: typeof $Enums.VehicleType

export type VerificationStatus = $Enums.VerificationStatus

export const VerificationStatus: typeof $Enums.VerificationStatus

export type BookingStatus = $Enums.BookingStatus

export const BookingStatus: typeof $Enums.BookingStatus

export type DiscountType = $Enums.DiscountType

export const DiscountType: typeof $Enums.DiscountType

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 * 
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   * 
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   *
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): void;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P]): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number }): $Utils.JsPromise<R>

  /**
   * Executes a raw MongoDB command and returns the result of it.
   * @example
   * ```
   * const user = await prisma.$runCommandRaw({
   *   aggregate: 'User',
   *   pipeline: [{ $match: { name: 'Bob' } }, { $project: { email: true, _id: false } }],
   *   explain: false,
   * })
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $runCommandRaw(command: Prisma.InputJsonObject): Prisma.PrismaPromise<Prisma.JsonObject>

  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb, ExtArgs>

      /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs>;

  /**
   * `prisma.vehicle`: Exposes CRUD operations for the **Vehicle** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Vehicles
    * const vehicles = await prisma.vehicle.findMany()
    * ```
    */
  get vehicle(): Prisma.VehicleDelegate<ExtArgs>;

  /**
   * `prisma.service`: Exposes CRUD operations for the **Service** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Services
    * const services = await prisma.service.findMany()
    * ```
    */
  get service(): Prisma.ServiceDelegate<ExtArgs>;

  /**
   * `prisma.garage`: Exposes CRUD operations for the **Garage** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Garages
    * const garages = await prisma.garage.findMany()
    * ```
    */
  get garage(): Prisma.GarageDelegate<ExtArgs>;

  /**
   * `prisma.garageService`: Exposes CRUD operations for the **GarageService** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more GarageServices
    * const garageServices = await prisma.garageService.findMany()
    * ```
    */
  get garageService(): Prisma.GarageServiceDelegate<ExtArgs>;

  /**
   * `prisma.towTruck`: Exposes CRUD operations for the **TowTruck** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more TowTrucks
    * const towTrucks = await prisma.towTruck.findMany()
    * ```
    */
  get towTruck(): Prisma.TowTruckDelegate<ExtArgs>;

  /**
   * `prisma.towTruckService`: Exposes CRUD operations for the **TowTruckService** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more TowTruckServices
    * const towTruckServices = await prisma.towTruckService.findMany()
    * ```
    */
  get towTruckService(): Prisma.TowTruckServiceDelegate<ExtArgs>;

  /**
   * `prisma.liveTruckLocation`: Exposes CRUD operations for the **LiveTruckLocation** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more LiveTruckLocations
    * const liveTruckLocations = await prisma.liveTruckLocation.findMany()
    * ```
    */
  get liveTruckLocation(): Prisma.LiveTruckLocationDelegate<ExtArgs>;

  /**
   * `prisma.sparePart`: Exposes CRUD operations for the **SparePart** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more SpareParts
    * const spareParts = await prisma.sparePart.findMany()
    * ```
    */
  get sparePart(): Prisma.SparePartDelegate<ExtArgs>;

  /**
   * `prisma.booking`: Exposes CRUD operations for the **Booking** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Bookings
    * const bookings = await prisma.booking.findMany()
    * ```
    */
  get booking(): Prisma.BookingDelegate<ExtArgs>;

  /**
   * `prisma.promoCode`: Exposes CRUD operations for the **PromoCode** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PromoCodes
    * const promoCodes = await prisma.promoCode.findMany()
    * ```
    */
  get promoCode(): Prisma.PromoCodeDelegate<ExtArgs>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError
  export import NotFoundError = runtime.NotFoundError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics 
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 5.22.0
   * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion 

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? K : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
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

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb extends $Utils.Fn<{extArgs: $Extensions.InternalArgs, clientOptions: PrismaClientOptions }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], this['params']['clientOptions']>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> = {
    meta: {
      modelProps: "user" | "vehicle" | "service" | "garage" | "garageService" | "towTruck" | "towTruckService" | "liveTruckLocation" | "sparePart" | "booking" | "promoCode"
      txIsolationLevel: never
    }
    model: {
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          findRaw: {
            args: Prisma.UserFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.UserAggregateRawArgs<ExtArgs>
            result: JsonObject
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      Vehicle: {
        payload: Prisma.$VehiclePayload<ExtArgs>
        fields: Prisma.VehicleFieldRefs
        operations: {
          findUnique: {
            args: Prisma.VehicleFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VehiclePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.VehicleFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VehiclePayload>
          }
          findFirst: {
            args: Prisma.VehicleFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VehiclePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.VehicleFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VehiclePayload>
          }
          findMany: {
            args: Prisma.VehicleFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VehiclePayload>[]
          }
          create: {
            args: Prisma.VehicleCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VehiclePayload>
          }
          createMany: {
            args: Prisma.VehicleCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.VehicleDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VehiclePayload>
          }
          update: {
            args: Prisma.VehicleUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VehiclePayload>
          }
          deleteMany: {
            args: Prisma.VehicleDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.VehicleUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.VehicleUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VehiclePayload>
          }
          aggregate: {
            args: Prisma.VehicleAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateVehicle>
          }
          groupBy: {
            args: Prisma.VehicleGroupByArgs<ExtArgs>
            result: $Utils.Optional<VehicleGroupByOutputType>[]
          }
          findRaw: {
            args: Prisma.VehicleFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.VehicleAggregateRawArgs<ExtArgs>
            result: JsonObject
          }
          count: {
            args: Prisma.VehicleCountArgs<ExtArgs>
            result: $Utils.Optional<VehicleCountAggregateOutputType> | number
          }
        }
      }
      Service: {
        payload: Prisma.$ServicePayload<ExtArgs>
        fields: Prisma.ServiceFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ServiceFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServicePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ServiceFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServicePayload>
          }
          findFirst: {
            args: Prisma.ServiceFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServicePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ServiceFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServicePayload>
          }
          findMany: {
            args: Prisma.ServiceFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServicePayload>[]
          }
          create: {
            args: Prisma.ServiceCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServicePayload>
          }
          createMany: {
            args: Prisma.ServiceCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.ServiceDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServicePayload>
          }
          update: {
            args: Prisma.ServiceUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServicePayload>
          }
          deleteMany: {
            args: Prisma.ServiceDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ServiceUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ServiceUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServicePayload>
          }
          aggregate: {
            args: Prisma.ServiceAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateService>
          }
          groupBy: {
            args: Prisma.ServiceGroupByArgs<ExtArgs>
            result: $Utils.Optional<ServiceGroupByOutputType>[]
          }
          findRaw: {
            args: Prisma.ServiceFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.ServiceAggregateRawArgs<ExtArgs>
            result: JsonObject
          }
          count: {
            args: Prisma.ServiceCountArgs<ExtArgs>
            result: $Utils.Optional<ServiceCountAggregateOutputType> | number
          }
        }
      }
      Garage: {
        payload: Prisma.$GaragePayload<ExtArgs>
        fields: Prisma.GarageFieldRefs
        operations: {
          findUnique: {
            args: Prisma.GarageFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GaragePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.GarageFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GaragePayload>
          }
          findFirst: {
            args: Prisma.GarageFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GaragePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.GarageFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GaragePayload>
          }
          findMany: {
            args: Prisma.GarageFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GaragePayload>[]
          }
          create: {
            args: Prisma.GarageCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GaragePayload>
          }
          createMany: {
            args: Prisma.GarageCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.GarageDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GaragePayload>
          }
          update: {
            args: Prisma.GarageUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GaragePayload>
          }
          deleteMany: {
            args: Prisma.GarageDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.GarageUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.GarageUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GaragePayload>
          }
          aggregate: {
            args: Prisma.GarageAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateGarage>
          }
          groupBy: {
            args: Prisma.GarageGroupByArgs<ExtArgs>
            result: $Utils.Optional<GarageGroupByOutputType>[]
          }
          findRaw: {
            args: Prisma.GarageFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.GarageAggregateRawArgs<ExtArgs>
            result: JsonObject
          }
          count: {
            args: Prisma.GarageCountArgs<ExtArgs>
            result: $Utils.Optional<GarageCountAggregateOutputType> | number
          }
        }
      }
      GarageService: {
        payload: Prisma.$GarageServicePayload<ExtArgs>
        fields: Prisma.GarageServiceFieldRefs
        operations: {
          findUnique: {
            args: Prisma.GarageServiceFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GarageServicePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.GarageServiceFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GarageServicePayload>
          }
          findFirst: {
            args: Prisma.GarageServiceFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GarageServicePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.GarageServiceFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GarageServicePayload>
          }
          findMany: {
            args: Prisma.GarageServiceFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GarageServicePayload>[]
          }
          create: {
            args: Prisma.GarageServiceCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GarageServicePayload>
          }
          createMany: {
            args: Prisma.GarageServiceCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.GarageServiceDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GarageServicePayload>
          }
          update: {
            args: Prisma.GarageServiceUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GarageServicePayload>
          }
          deleteMany: {
            args: Prisma.GarageServiceDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.GarageServiceUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.GarageServiceUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GarageServicePayload>
          }
          aggregate: {
            args: Prisma.GarageServiceAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateGarageService>
          }
          groupBy: {
            args: Prisma.GarageServiceGroupByArgs<ExtArgs>
            result: $Utils.Optional<GarageServiceGroupByOutputType>[]
          }
          findRaw: {
            args: Prisma.GarageServiceFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.GarageServiceAggregateRawArgs<ExtArgs>
            result: JsonObject
          }
          count: {
            args: Prisma.GarageServiceCountArgs<ExtArgs>
            result: $Utils.Optional<GarageServiceCountAggregateOutputType> | number
          }
        }
      }
      TowTruck: {
        payload: Prisma.$TowTruckPayload<ExtArgs>
        fields: Prisma.TowTruckFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TowTruckFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TowTruckPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TowTruckFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TowTruckPayload>
          }
          findFirst: {
            args: Prisma.TowTruckFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TowTruckPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TowTruckFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TowTruckPayload>
          }
          findMany: {
            args: Prisma.TowTruckFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TowTruckPayload>[]
          }
          create: {
            args: Prisma.TowTruckCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TowTruckPayload>
          }
          createMany: {
            args: Prisma.TowTruckCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.TowTruckDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TowTruckPayload>
          }
          update: {
            args: Prisma.TowTruckUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TowTruckPayload>
          }
          deleteMany: {
            args: Prisma.TowTruckDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TowTruckUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.TowTruckUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TowTruckPayload>
          }
          aggregate: {
            args: Prisma.TowTruckAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTowTruck>
          }
          groupBy: {
            args: Prisma.TowTruckGroupByArgs<ExtArgs>
            result: $Utils.Optional<TowTruckGroupByOutputType>[]
          }
          findRaw: {
            args: Prisma.TowTruckFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.TowTruckAggregateRawArgs<ExtArgs>
            result: JsonObject
          }
          count: {
            args: Prisma.TowTruckCountArgs<ExtArgs>
            result: $Utils.Optional<TowTruckCountAggregateOutputType> | number
          }
        }
      }
      TowTruckService: {
        payload: Prisma.$TowTruckServicePayload<ExtArgs>
        fields: Prisma.TowTruckServiceFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TowTruckServiceFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TowTruckServicePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TowTruckServiceFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TowTruckServicePayload>
          }
          findFirst: {
            args: Prisma.TowTruckServiceFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TowTruckServicePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TowTruckServiceFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TowTruckServicePayload>
          }
          findMany: {
            args: Prisma.TowTruckServiceFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TowTruckServicePayload>[]
          }
          create: {
            args: Prisma.TowTruckServiceCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TowTruckServicePayload>
          }
          createMany: {
            args: Prisma.TowTruckServiceCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.TowTruckServiceDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TowTruckServicePayload>
          }
          update: {
            args: Prisma.TowTruckServiceUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TowTruckServicePayload>
          }
          deleteMany: {
            args: Prisma.TowTruckServiceDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TowTruckServiceUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.TowTruckServiceUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TowTruckServicePayload>
          }
          aggregate: {
            args: Prisma.TowTruckServiceAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTowTruckService>
          }
          groupBy: {
            args: Prisma.TowTruckServiceGroupByArgs<ExtArgs>
            result: $Utils.Optional<TowTruckServiceGroupByOutputType>[]
          }
          findRaw: {
            args: Prisma.TowTruckServiceFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.TowTruckServiceAggregateRawArgs<ExtArgs>
            result: JsonObject
          }
          count: {
            args: Prisma.TowTruckServiceCountArgs<ExtArgs>
            result: $Utils.Optional<TowTruckServiceCountAggregateOutputType> | number
          }
        }
      }
      LiveTruckLocation: {
        payload: Prisma.$LiveTruckLocationPayload<ExtArgs>
        fields: Prisma.LiveTruckLocationFieldRefs
        operations: {
          findUnique: {
            args: Prisma.LiveTruckLocationFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LiveTruckLocationPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.LiveTruckLocationFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LiveTruckLocationPayload>
          }
          findFirst: {
            args: Prisma.LiveTruckLocationFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LiveTruckLocationPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.LiveTruckLocationFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LiveTruckLocationPayload>
          }
          findMany: {
            args: Prisma.LiveTruckLocationFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LiveTruckLocationPayload>[]
          }
          create: {
            args: Prisma.LiveTruckLocationCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LiveTruckLocationPayload>
          }
          createMany: {
            args: Prisma.LiveTruckLocationCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.LiveTruckLocationDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LiveTruckLocationPayload>
          }
          update: {
            args: Prisma.LiveTruckLocationUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LiveTruckLocationPayload>
          }
          deleteMany: {
            args: Prisma.LiveTruckLocationDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.LiveTruckLocationUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.LiveTruckLocationUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LiveTruckLocationPayload>
          }
          aggregate: {
            args: Prisma.LiveTruckLocationAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateLiveTruckLocation>
          }
          groupBy: {
            args: Prisma.LiveTruckLocationGroupByArgs<ExtArgs>
            result: $Utils.Optional<LiveTruckLocationGroupByOutputType>[]
          }
          findRaw: {
            args: Prisma.LiveTruckLocationFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.LiveTruckLocationAggregateRawArgs<ExtArgs>
            result: JsonObject
          }
          count: {
            args: Prisma.LiveTruckLocationCountArgs<ExtArgs>
            result: $Utils.Optional<LiveTruckLocationCountAggregateOutputType> | number
          }
        }
      }
      SparePart: {
        payload: Prisma.$SparePartPayload<ExtArgs>
        fields: Prisma.SparePartFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SparePartFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SparePartPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SparePartFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SparePartPayload>
          }
          findFirst: {
            args: Prisma.SparePartFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SparePartPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SparePartFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SparePartPayload>
          }
          findMany: {
            args: Prisma.SparePartFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SparePartPayload>[]
          }
          create: {
            args: Prisma.SparePartCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SparePartPayload>
          }
          createMany: {
            args: Prisma.SparePartCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.SparePartDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SparePartPayload>
          }
          update: {
            args: Prisma.SparePartUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SparePartPayload>
          }
          deleteMany: {
            args: Prisma.SparePartDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SparePartUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.SparePartUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SparePartPayload>
          }
          aggregate: {
            args: Prisma.SparePartAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSparePart>
          }
          groupBy: {
            args: Prisma.SparePartGroupByArgs<ExtArgs>
            result: $Utils.Optional<SparePartGroupByOutputType>[]
          }
          findRaw: {
            args: Prisma.SparePartFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.SparePartAggregateRawArgs<ExtArgs>
            result: JsonObject
          }
          count: {
            args: Prisma.SparePartCountArgs<ExtArgs>
            result: $Utils.Optional<SparePartCountAggregateOutputType> | number
          }
        }
      }
      Booking: {
        payload: Prisma.$BookingPayload<ExtArgs>
        fields: Prisma.BookingFieldRefs
        operations: {
          findUnique: {
            args: Prisma.BookingFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BookingPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.BookingFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BookingPayload>
          }
          findFirst: {
            args: Prisma.BookingFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BookingPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.BookingFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BookingPayload>
          }
          findMany: {
            args: Prisma.BookingFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BookingPayload>[]
          }
          create: {
            args: Prisma.BookingCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BookingPayload>
          }
          createMany: {
            args: Prisma.BookingCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.BookingDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BookingPayload>
          }
          update: {
            args: Prisma.BookingUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BookingPayload>
          }
          deleteMany: {
            args: Prisma.BookingDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.BookingUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.BookingUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BookingPayload>
          }
          aggregate: {
            args: Prisma.BookingAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateBooking>
          }
          groupBy: {
            args: Prisma.BookingGroupByArgs<ExtArgs>
            result: $Utils.Optional<BookingGroupByOutputType>[]
          }
          findRaw: {
            args: Prisma.BookingFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.BookingAggregateRawArgs<ExtArgs>
            result: JsonObject
          }
          count: {
            args: Prisma.BookingCountArgs<ExtArgs>
            result: $Utils.Optional<BookingCountAggregateOutputType> | number
          }
        }
      }
      PromoCode: {
        payload: Prisma.$PromoCodePayload<ExtArgs>
        fields: Prisma.PromoCodeFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PromoCodeFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PromoCodePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PromoCodeFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PromoCodePayload>
          }
          findFirst: {
            args: Prisma.PromoCodeFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PromoCodePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PromoCodeFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PromoCodePayload>
          }
          findMany: {
            args: Prisma.PromoCodeFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PromoCodePayload>[]
          }
          create: {
            args: Prisma.PromoCodeCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PromoCodePayload>
          }
          createMany: {
            args: Prisma.PromoCodeCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.PromoCodeDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PromoCodePayload>
          }
          update: {
            args: Prisma.PromoCodeUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PromoCodePayload>
          }
          deleteMany: {
            args: Prisma.PromoCodeDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PromoCodeUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.PromoCodeUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PromoCodePayload>
          }
          aggregate: {
            args: Prisma.PromoCodeAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePromoCode>
          }
          groupBy: {
            args: Prisma.PromoCodeGroupByArgs<ExtArgs>
            result: $Utils.Optional<PromoCodeGroupByOutputType>[]
          }
          findRaw: {
            args: Prisma.PromoCodeFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.PromoCodeAggregateRawArgs<ExtArgs>
            result: JsonObject
          }
          count: {
            args: Prisma.PromoCodeCountArgs<ExtArgs>
            result: $Utils.Optional<PromoCodeCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $runCommandRaw: {
          args: Prisma.InputJsonObject,
          result: Prisma.JsonObject
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
    }
  }


  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    vehicles: number
    bookings: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    vehicles?: boolean | UserCountOutputTypeCountVehiclesArgs
    bookings?: boolean | UserCountOutputTypeCountBookingsArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountVehiclesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: VehicleWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountBookingsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BookingWhereInput
  }


  /**
   * Count Type VehicleCountOutputType
   */

  export type VehicleCountOutputType = {
    bookings: number
  }

  export type VehicleCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    bookings?: boolean | VehicleCountOutputTypeCountBookingsArgs
  }

  // Custom InputTypes
  /**
   * VehicleCountOutputType without action
   */
  export type VehicleCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VehicleCountOutputType
     */
    select?: VehicleCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * VehicleCountOutputType without action
   */
  export type VehicleCountOutputTypeCountBookingsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BookingWhereInput
  }


  /**
   * Count Type ServiceCountOutputType
   */

  export type ServiceCountOutputType = {
    offeredByGarages: number
    bookings: number
  }

  export type ServiceCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    offeredByGarages?: boolean | ServiceCountOutputTypeCountOfferedByGaragesArgs
    bookings?: boolean | ServiceCountOutputTypeCountBookingsArgs
  }

  // Custom InputTypes
  /**
   * ServiceCountOutputType without action
   */
  export type ServiceCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ServiceCountOutputType
     */
    select?: ServiceCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ServiceCountOutputType without action
   */
  export type ServiceCountOutputTypeCountOfferedByGaragesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: GarageServiceWhereInput
  }

  /**
   * ServiceCountOutputType without action
   */
  export type ServiceCountOutputTypeCountBookingsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BookingWhereInput
  }


  /**
   * Count Type GarageCountOutputType
   */

  export type GarageCountOutputType = {
    services: number
    spareParts: number
    bookings: number
  }

  export type GarageCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    services?: boolean | GarageCountOutputTypeCountServicesArgs
    spareParts?: boolean | GarageCountOutputTypeCountSparePartsArgs
    bookings?: boolean | GarageCountOutputTypeCountBookingsArgs
  }

  // Custom InputTypes
  /**
   * GarageCountOutputType without action
   */
  export type GarageCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GarageCountOutputType
     */
    select?: GarageCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * GarageCountOutputType without action
   */
  export type GarageCountOutputTypeCountServicesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: GarageServiceWhereInput
  }

  /**
   * GarageCountOutputType without action
   */
  export type GarageCountOutputTypeCountSparePartsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SparePartWhereInput
  }

  /**
   * GarageCountOutputType without action
   */
  export type GarageCountOutputTypeCountBookingsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BookingWhereInput
  }


  /**
   * Count Type GarageServiceCountOutputType
   */

  export type GarageServiceCountOutputType = {
    bookings: number
  }

  export type GarageServiceCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    bookings?: boolean | GarageServiceCountOutputTypeCountBookingsArgs
  }

  // Custom InputTypes
  /**
   * GarageServiceCountOutputType without action
   */
  export type GarageServiceCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GarageServiceCountOutputType
     */
    select?: GarageServiceCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * GarageServiceCountOutputType without action
   */
  export type GarageServiceCountOutputTypeCountBookingsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BookingWhereInput
  }


  /**
   * Count Type TowTruckCountOutputType
   */

  export type TowTruckCountOutputType = {
    services: number
    bookings: number
  }

  export type TowTruckCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    services?: boolean | TowTruckCountOutputTypeCountServicesArgs
    bookings?: boolean | TowTruckCountOutputTypeCountBookingsArgs
  }

  // Custom InputTypes
  /**
   * TowTruckCountOutputType without action
   */
  export type TowTruckCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TowTruckCountOutputType
     */
    select?: TowTruckCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * TowTruckCountOutputType without action
   */
  export type TowTruckCountOutputTypeCountServicesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TowTruckServiceWhereInput
  }

  /**
   * TowTruckCountOutputType without action
   */
  export type TowTruckCountOutputTypeCountBookingsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BookingWhereInput
  }


  /**
   * Count Type TowTruckServiceCountOutputType
   */

  export type TowTruckServiceCountOutputType = {
    bookings: number
  }

  export type TowTruckServiceCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    bookings?: boolean | TowTruckServiceCountOutputTypeCountBookingsArgs
  }

  // Custom InputTypes
  /**
   * TowTruckServiceCountOutputType without action
   */
  export type TowTruckServiceCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TowTruckServiceCountOutputType
     */
    select?: TowTruckServiceCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * TowTruckServiceCountOutputType without action
   */
  export type TowTruckServiceCountOutputTypeCountBookingsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BookingWhereInput
  }


  /**
   * Count Type PromoCodeCountOutputType
   */

  export type PromoCodeCountOutputType = {
    bookings: number
  }

  export type PromoCodeCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    bookings?: boolean | PromoCodeCountOutputTypeCountBookingsArgs
  }

  // Custom InputTypes
  /**
   * PromoCodeCountOutputType without action
   */
  export type PromoCodeCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PromoCodeCountOutputType
     */
    select?: PromoCodeCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * PromoCodeCountOutputType without action
   */
  export type PromoCodeCountOutputTypeCountBookingsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BookingWhereInput
  }


  /**
   * Models
   */

  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserMinAggregateOutputType = {
    id: string | null
    clerkId: string | null
    email: string | null
    firstName: string | null
    lastName: string | null
    phone: string | null
    isPremium: boolean | null
    isBanned: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
    stripeCustomerId: string | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    clerkId: string | null
    email: string | null
    firstName: string | null
    lastName: string | null
    phone: string | null
    isPremium: boolean | null
    isBanned: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
    stripeCustomerId: string | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    clerkId: number
    email: number
    firstName: number
    lastName: number
    phone: number
    role: number
    isPremium: number
    isBanned: number
    unsafeMetadata: number
    createdAt: number
    updatedAt: number
    stripeCustomerId: number
    _all: number
  }


  export type UserMinAggregateInputType = {
    id?: true
    clerkId?: true
    email?: true
    firstName?: true
    lastName?: true
    phone?: true
    isPremium?: true
    isBanned?: true
    createdAt?: true
    updatedAt?: true
    stripeCustomerId?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    clerkId?: true
    email?: true
    firstName?: true
    lastName?: true
    phone?: true
    isPremium?: true
    isBanned?: true
    createdAt?: true
    updatedAt?: true
    stripeCustomerId?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    clerkId?: true
    email?: true
    firstName?: true
    lastName?: true
    phone?: true
    role?: true
    isPremium?: true
    isBanned?: true
    unsafeMetadata?: true
    createdAt?: true
    updatedAt?: true
    stripeCustomerId?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: string
    clerkId: string
    email: string
    firstName: string
    lastName: string | null
    phone: string
    role: $Enums.Role[]
    isPremium: boolean
    isBanned: boolean
    unsafeMetadata: JsonValue | null
    createdAt: Date
    updatedAt: Date
    stripeCustomerId: string | null
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    clerkId?: boolean
    email?: boolean
    firstName?: boolean
    lastName?: boolean
    phone?: boolean
    role?: boolean
    isPremium?: boolean
    isBanned?: boolean
    unsafeMetadata?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    stripeCustomerId?: boolean
    vehicles?: boolean | User$vehiclesArgs<ExtArgs>
    garage?: boolean | User$garageArgs<ExtArgs>
    towTruck?: boolean | User$towTruckArgs<ExtArgs>
    bookings?: boolean | User$bookingsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>


  export type UserSelectScalar = {
    id?: boolean
    clerkId?: boolean
    email?: boolean
    firstName?: boolean
    lastName?: boolean
    phone?: boolean
    role?: boolean
    isPremium?: boolean
    isBanned?: boolean
    unsafeMetadata?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    stripeCustomerId?: boolean
  }

  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    vehicles?: boolean | User$vehiclesArgs<ExtArgs>
    garage?: boolean | User$garageArgs<ExtArgs>
    towTruck?: boolean | User$towTruckArgs<ExtArgs>
    bookings?: boolean | User$bookingsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      vehicles: Prisma.$VehiclePayload<ExtArgs>[]
      garage: Prisma.$GaragePayload<ExtArgs> | null
      towTruck: Prisma.$TowTruckPayload<ExtArgs> | null
      bookings: Prisma.$BookingPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      clerkId: string
      email: string
      firstName: string
      lastName: string | null
      phone: string
      role: $Enums.Role[]
      isPremium: boolean
      isBanned: boolean
      unsafeMetadata: Prisma.JsonValue | null
      createdAt: Date
      updatedAt: Date
      stripeCustomerId: string | null
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert">, never, ExtArgs>

    /**
     * Find zero or more Users that matches the filter.
     * @param {UserFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const user = await prisma.user.findRaw({
     *   filter: { age: { $gt: 25 } } 
     * })
     */
    findRaw(args?: UserFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a User.
     * @param {UserAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const user = await prisma.user.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: UserAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    vehicles<T extends User$vehiclesArgs<ExtArgs> = {}>(args?: Subset<T, User$vehiclesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VehiclePayload<ExtArgs>, T, "findMany"> | Null>
    garage<T extends User$garageArgs<ExtArgs> = {}>(args?: Subset<T, User$garageArgs<ExtArgs>>): Prisma__GarageClient<$Result.GetResult<Prisma.$GaragePayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    towTruck<T extends User$towTruckArgs<ExtArgs> = {}>(args?: Subset<T, User$towTruckArgs<ExtArgs>>): Prisma__TowTruckClient<$Result.GetResult<Prisma.$TowTruckPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    bookings<T extends User$bookingsArgs<ExtArgs> = {}>(args?: Subset<T, User$bookingsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BookingPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */ 
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'String'>
    readonly clerkId: FieldRef<"User", 'String'>
    readonly email: FieldRef<"User", 'String'>
    readonly firstName: FieldRef<"User", 'String'>
    readonly lastName: FieldRef<"User", 'String'>
    readonly phone: FieldRef<"User", 'String'>
    readonly role: FieldRef<"User", 'Role[]'>
    readonly isPremium: FieldRef<"User", 'Boolean'>
    readonly isBanned: FieldRef<"User", 'Boolean'>
    readonly unsafeMetadata: FieldRef<"User", 'Json'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
    readonly updatedAt: FieldRef<"User", 'DateTime'>
    readonly stripeCustomerId: FieldRef<"User", 'String'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
  }

  /**
   * User findRaw
   */
  export type UserFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The query predicate filter. If unspecified, then all documents in the collection will match the predicate. ${@link https://docs.mongodb.com/manual/reference/operator/query MongoDB Docs}.
     */
    filter?: InputJsonValue
    /**
     * Additional options to pass to the `find` command ${@link https://docs.mongodb.com/manual/reference/command/find/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * User aggregateRaw
   */
  export type UserAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * An array of aggregation stages to process and transform the document stream via the aggregation pipeline. ${@link https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline MongoDB Docs}.
     */
    pipeline?: InputJsonValue[]
    /**
     * Additional options to pass to the `aggregate` command ${@link https://docs.mongodb.com/manual/reference/command/aggregate/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * User.vehicles
   */
  export type User$vehiclesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Vehicle
     */
    select?: VehicleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VehicleInclude<ExtArgs> | null
    where?: VehicleWhereInput
    orderBy?: VehicleOrderByWithRelationInput | VehicleOrderByWithRelationInput[]
    cursor?: VehicleWhereUniqueInput
    take?: number
    skip?: number
    distinct?: VehicleScalarFieldEnum | VehicleScalarFieldEnum[]
  }

  /**
   * User.garage
   */
  export type User$garageArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Garage
     */
    select?: GarageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GarageInclude<ExtArgs> | null
    where?: GarageWhereInput
  }

  /**
   * User.towTruck
   */
  export type User$towTruckArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TowTruck
     */
    select?: TowTruckSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TowTruckInclude<ExtArgs> | null
    where?: TowTruckWhereInput
  }

  /**
   * User.bookings
   */
  export type User$bookingsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Booking
     */
    select?: BookingSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BookingInclude<ExtArgs> | null
    where?: BookingWhereInput
    orderBy?: BookingOrderByWithRelationInput | BookingOrderByWithRelationInput[]
    cursor?: BookingWhereUniqueInput
    take?: number
    skip?: number
    distinct?: BookingScalarFieldEnum | BookingScalarFieldEnum[]
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model Vehicle
   */

  export type AggregateVehicle = {
    _count: VehicleCountAggregateOutputType | null
    _avg: VehicleAvgAggregateOutputType | null
    _sum: VehicleSumAggregateOutputType | null
    _min: VehicleMinAggregateOutputType | null
    _max: VehicleMaxAggregateOutputType | null
  }

  export type VehicleAvgAggregateOutputType = {
    year: number | null
  }

  export type VehicleSumAggregateOutputType = {
    year: number | null
  }

  export type VehicleMinAggregateOutputType = {
    id: string | null
    brand: string | null
    name: string | null
    model: string | null
    year: number | null
    plateNumber: string | null
    color: string | null
    type: $Enums.VehicleType | null
    createdAt: Date | null
    updatedAt: Date | null
    userId: string | null
  }

  export type VehicleMaxAggregateOutputType = {
    id: string | null
    brand: string | null
    name: string | null
    model: string | null
    year: number | null
    plateNumber: string | null
    color: string | null
    type: $Enums.VehicleType | null
    createdAt: Date | null
    updatedAt: Date | null
    userId: string | null
  }

  export type VehicleCountAggregateOutputType = {
    id: number
    brand: number
    name: number
    model: number
    year: number
    plateNumber: number
    color: number
    type: number
    createdAt: number
    updatedAt: number
    userId: number
    _all: number
  }


  export type VehicleAvgAggregateInputType = {
    year?: true
  }

  export type VehicleSumAggregateInputType = {
    year?: true
  }

  export type VehicleMinAggregateInputType = {
    id?: true
    brand?: true
    name?: true
    model?: true
    year?: true
    plateNumber?: true
    color?: true
    type?: true
    createdAt?: true
    updatedAt?: true
    userId?: true
  }

  export type VehicleMaxAggregateInputType = {
    id?: true
    brand?: true
    name?: true
    model?: true
    year?: true
    plateNumber?: true
    color?: true
    type?: true
    createdAt?: true
    updatedAt?: true
    userId?: true
  }

  export type VehicleCountAggregateInputType = {
    id?: true
    brand?: true
    name?: true
    model?: true
    year?: true
    plateNumber?: true
    color?: true
    type?: true
    createdAt?: true
    updatedAt?: true
    userId?: true
    _all?: true
  }

  export type VehicleAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Vehicle to aggregate.
     */
    where?: VehicleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Vehicles to fetch.
     */
    orderBy?: VehicleOrderByWithRelationInput | VehicleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: VehicleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Vehicles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Vehicles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Vehicles
    **/
    _count?: true | VehicleCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: VehicleAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: VehicleSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: VehicleMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: VehicleMaxAggregateInputType
  }

  export type GetVehicleAggregateType<T extends VehicleAggregateArgs> = {
        [P in keyof T & keyof AggregateVehicle]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateVehicle[P]>
      : GetScalarType<T[P], AggregateVehicle[P]>
  }




  export type VehicleGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: VehicleWhereInput
    orderBy?: VehicleOrderByWithAggregationInput | VehicleOrderByWithAggregationInput[]
    by: VehicleScalarFieldEnum[] | VehicleScalarFieldEnum
    having?: VehicleScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: VehicleCountAggregateInputType | true
    _avg?: VehicleAvgAggregateInputType
    _sum?: VehicleSumAggregateInputType
    _min?: VehicleMinAggregateInputType
    _max?: VehicleMaxAggregateInputType
  }

  export type VehicleGroupByOutputType = {
    id: string
    brand: string
    name: string
    model: string
    year: number
    plateNumber: string
    color: string | null
    type: $Enums.VehicleType
    createdAt: Date
    updatedAt: Date
    userId: string
    _count: VehicleCountAggregateOutputType | null
    _avg: VehicleAvgAggregateOutputType | null
    _sum: VehicleSumAggregateOutputType | null
    _min: VehicleMinAggregateOutputType | null
    _max: VehicleMaxAggregateOutputType | null
  }

  type GetVehicleGroupByPayload<T extends VehicleGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<VehicleGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof VehicleGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], VehicleGroupByOutputType[P]>
            : GetScalarType<T[P], VehicleGroupByOutputType[P]>
        }
      >
    >


  export type VehicleSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    brand?: boolean
    name?: boolean
    model?: boolean
    year?: boolean
    plateNumber?: boolean
    color?: boolean
    type?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    userId?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    bookings?: boolean | Vehicle$bookingsArgs<ExtArgs>
    _count?: boolean | VehicleCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["vehicle"]>


  export type VehicleSelectScalar = {
    id?: boolean
    brand?: boolean
    name?: boolean
    model?: boolean
    year?: boolean
    plateNumber?: boolean
    color?: boolean
    type?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    userId?: boolean
  }

  export type VehicleInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    bookings?: boolean | Vehicle$bookingsArgs<ExtArgs>
    _count?: boolean | VehicleCountOutputTypeDefaultArgs<ExtArgs>
  }

  export type $VehiclePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Vehicle"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
      bookings: Prisma.$BookingPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      brand: string
      name: string
      model: string
      year: number
      plateNumber: string
      color: string | null
      type: $Enums.VehicleType
      createdAt: Date
      updatedAt: Date
      userId: string
    }, ExtArgs["result"]["vehicle"]>
    composites: {}
  }

  type VehicleGetPayload<S extends boolean | null | undefined | VehicleDefaultArgs> = $Result.GetResult<Prisma.$VehiclePayload, S>

  type VehicleCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<VehicleFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: VehicleCountAggregateInputType | true
    }

  export interface VehicleDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Vehicle'], meta: { name: 'Vehicle' } }
    /**
     * Find zero or one Vehicle that matches the filter.
     * @param {VehicleFindUniqueArgs} args - Arguments to find a Vehicle
     * @example
     * // Get one Vehicle
     * const vehicle = await prisma.vehicle.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends VehicleFindUniqueArgs>(args: SelectSubset<T, VehicleFindUniqueArgs<ExtArgs>>): Prisma__VehicleClient<$Result.GetResult<Prisma.$VehiclePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Vehicle that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {VehicleFindUniqueOrThrowArgs} args - Arguments to find a Vehicle
     * @example
     * // Get one Vehicle
     * const vehicle = await prisma.vehicle.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends VehicleFindUniqueOrThrowArgs>(args: SelectSubset<T, VehicleFindUniqueOrThrowArgs<ExtArgs>>): Prisma__VehicleClient<$Result.GetResult<Prisma.$VehiclePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Vehicle that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VehicleFindFirstArgs} args - Arguments to find a Vehicle
     * @example
     * // Get one Vehicle
     * const vehicle = await prisma.vehicle.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends VehicleFindFirstArgs>(args?: SelectSubset<T, VehicleFindFirstArgs<ExtArgs>>): Prisma__VehicleClient<$Result.GetResult<Prisma.$VehiclePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Vehicle that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VehicleFindFirstOrThrowArgs} args - Arguments to find a Vehicle
     * @example
     * // Get one Vehicle
     * const vehicle = await prisma.vehicle.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends VehicleFindFirstOrThrowArgs>(args?: SelectSubset<T, VehicleFindFirstOrThrowArgs<ExtArgs>>): Prisma__VehicleClient<$Result.GetResult<Prisma.$VehiclePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Vehicles that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VehicleFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Vehicles
     * const vehicles = await prisma.vehicle.findMany()
     * 
     * // Get first 10 Vehicles
     * const vehicles = await prisma.vehicle.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const vehicleWithIdOnly = await prisma.vehicle.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends VehicleFindManyArgs>(args?: SelectSubset<T, VehicleFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VehiclePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Vehicle.
     * @param {VehicleCreateArgs} args - Arguments to create a Vehicle.
     * @example
     * // Create one Vehicle
     * const Vehicle = await prisma.vehicle.create({
     *   data: {
     *     // ... data to create a Vehicle
     *   }
     * })
     * 
     */
    create<T extends VehicleCreateArgs>(args: SelectSubset<T, VehicleCreateArgs<ExtArgs>>): Prisma__VehicleClient<$Result.GetResult<Prisma.$VehiclePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Vehicles.
     * @param {VehicleCreateManyArgs} args - Arguments to create many Vehicles.
     * @example
     * // Create many Vehicles
     * const vehicle = await prisma.vehicle.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends VehicleCreateManyArgs>(args?: SelectSubset<T, VehicleCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Vehicle.
     * @param {VehicleDeleteArgs} args - Arguments to delete one Vehicle.
     * @example
     * // Delete one Vehicle
     * const Vehicle = await prisma.vehicle.delete({
     *   where: {
     *     // ... filter to delete one Vehicle
     *   }
     * })
     * 
     */
    delete<T extends VehicleDeleteArgs>(args: SelectSubset<T, VehicleDeleteArgs<ExtArgs>>): Prisma__VehicleClient<$Result.GetResult<Prisma.$VehiclePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Vehicle.
     * @param {VehicleUpdateArgs} args - Arguments to update one Vehicle.
     * @example
     * // Update one Vehicle
     * const vehicle = await prisma.vehicle.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends VehicleUpdateArgs>(args: SelectSubset<T, VehicleUpdateArgs<ExtArgs>>): Prisma__VehicleClient<$Result.GetResult<Prisma.$VehiclePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Vehicles.
     * @param {VehicleDeleteManyArgs} args - Arguments to filter Vehicles to delete.
     * @example
     * // Delete a few Vehicles
     * const { count } = await prisma.vehicle.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends VehicleDeleteManyArgs>(args?: SelectSubset<T, VehicleDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Vehicles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VehicleUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Vehicles
     * const vehicle = await prisma.vehicle.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends VehicleUpdateManyArgs>(args: SelectSubset<T, VehicleUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Vehicle.
     * @param {VehicleUpsertArgs} args - Arguments to update or create a Vehicle.
     * @example
     * // Update or create a Vehicle
     * const vehicle = await prisma.vehicle.upsert({
     *   create: {
     *     // ... data to create a Vehicle
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Vehicle we want to update
     *   }
     * })
     */
    upsert<T extends VehicleUpsertArgs>(args: SelectSubset<T, VehicleUpsertArgs<ExtArgs>>): Prisma__VehicleClient<$Result.GetResult<Prisma.$VehiclePayload<ExtArgs>, T, "upsert">, never, ExtArgs>

    /**
     * Find zero or more Vehicles that matches the filter.
     * @param {VehicleFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const vehicle = await prisma.vehicle.findRaw({
     *   filter: { age: { $gt: 25 } } 
     * })
     */
    findRaw(args?: VehicleFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a Vehicle.
     * @param {VehicleAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const vehicle = await prisma.vehicle.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: VehicleAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


    /**
     * Count the number of Vehicles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VehicleCountArgs} args - Arguments to filter Vehicles to count.
     * @example
     * // Count the number of Vehicles
     * const count = await prisma.vehicle.count({
     *   where: {
     *     // ... the filter for the Vehicles we want to count
     *   }
     * })
    **/
    count<T extends VehicleCountArgs>(
      args?: Subset<T, VehicleCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], VehicleCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Vehicle.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VehicleAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends VehicleAggregateArgs>(args: Subset<T, VehicleAggregateArgs>): Prisma.PrismaPromise<GetVehicleAggregateType<T>>

    /**
     * Group by Vehicle.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VehicleGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends VehicleGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: VehicleGroupByArgs['orderBy'] }
        : { orderBy?: VehicleGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, VehicleGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetVehicleGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Vehicle model
   */
  readonly fields: VehicleFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Vehicle.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__VehicleClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    bookings<T extends Vehicle$bookingsArgs<ExtArgs> = {}>(args?: Subset<T, Vehicle$bookingsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BookingPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Vehicle model
   */ 
  interface VehicleFieldRefs {
    readonly id: FieldRef<"Vehicle", 'String'>
    readonly brand: FieldRef<"Vehicle", 'String'>
    readonly name: FieldRef<"Vehicle", 'String'>
    readonly model: FieldRef<"Vehicle", 'String'>
    readonly year: FieldRef<"Vehicle", 'Int'>
    readonly plateNumber: FieldRef<"Vehicle", 'String'>
    readonly color: FieldRef<"Vehicle", 'String'>
    readonly type: FieldRef<"Vehicle", 'VehicleType'>
    readonly createdAt: FieldRef<"Vehicle", 'DateTime'>
    readonly updatedAt: FieldRef<"Vehicle", 'DateTime'>
    readonly userId: FieldRef<"Vehicle", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Vehicle findUnique
   */
  export type VehicleFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Vehicle
     */
    select?: VehicleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VehicleInclude<ExtArgs> | null
    /**
     * Filter, which Vehicle to fetch.
     */
    where: VehicleWhereUniqueInput
  }

  /**
   * Vehicle findUniqueOrThrow
   */
  export type VehicleFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Vehicle
     */
    select?: VehicleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VehicleInclude<ExtArgs> | null
    /**
     * Filter, which Vehicle to fetch.
     */
    where: VehicleWhereUniqueInput
  }

  /**
   * Vehicle findFirst
   */
  export type VehicleFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Vehicle
     */
    select?: VehicleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VehicleInclude<ExtArgs> | null
    /**
     * Filter, which Vehicle to fetch.
     */
    where?: VehicleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Vehicles to fetch.
     */
    orderBy?: VehicleOrderByWithRelationInput | VehicleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Vehicles.
     */
    cursor?: VehicleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Vehicles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Vehicles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Vehicles.
     */
    distinct?: VehicleScalarFieldEnum | VehicleScalarFieldEnum[]
  }

  /**
   * Vehicle findFirstOrThrow
   */
  export type VehicleFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Vehicle
     */
    select?: VehicleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VehicleInclude<ExtArgs> | null
    /**
     * Filter, which Vehicle to fetch.
     */
    where?: VehicleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Vehicles to fetch.
     */
    orderBy?: VehicleOrderByWithRelationInput | VehicleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Vehicles.
     */
    cursor?: VehicleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Vehicles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Vehicles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Vehicles.
     */
    distinct?: VehicleScalarFieldEnum | VehicleScalarFieldEnum[]
  }

  /**
   * Vehicle findMany
   */
  export type VehicleFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Vehicle
     */
    select?: VehicleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VehicleInclude<ExtArgs> | null
    /**
     * Filter, which Vehicles to fetch.
     */
    where?: VehicleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Vehicles to fetch.
     */
    orderBy?: VehicleOrderByWithRelationInput | VehicleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Vehicles.
     */
    cursor?: VehicleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Vehicles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Vehicles.
     */
    skip?: number
    distinct?: VehicleScalarFieldEnum | VehicleScalarFieldEnum[]
  }

  /**
   * Vehicle create
   */
  export type VehicleCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Vehicle
     */
    select?: VehicleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VehicleInclude<ExtArgs> | null
    /**
     * The data needed to create a Vehicle.
     */
    data: XOR<VehicleCreateInput, VehicleUncheckedCreateInput>
  }

  /**
   * Vehicle createMany
   */
  export type VehicleCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Vehicles.
     */
    data: VehicleCreateManyInput | VehicleCreateManyInput[]
  }

  /**
   * Vehicle update
   */
  export type VehicleUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Vehicle
     */
    select?: VehicleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VehicleInclude<ExtArgs> | null
    /**
     * The data needed to update a Vehicle.
     */
    data: XOR<VehicleUpdateInput, VehicleUncheckedUpdateInput>
    /**
     * Choose, which Vehicle to update.
     */
    where: VehicleWhereUniqueInput
  }

  /**
   * Vehicle updateMany
   */
  export type VehicleUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Vehicles.
     */
    data: XOR<VehicleUpdateManyMutationInput, VehicleUncheckedUpdateManyInput>
    /**
     * Filter which Vehicles to update
     */
    where?: VehicleWhereInput
  }

  /**
   * Vehicle upsert
   */
  export type VehicleUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Vehicle
     */
    select?: VehicleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VehicleInclude<ExtArgs> | null
    /**
     * The filter to search for the Vehicle to update in case it exists.
     */
    where: VehicleWhereUniqueInput
    /**
     * In case the Vehicle found by the `where` argument doesn't exist, create a new Vehicle with this data.
     */
    create: XOR<VehicleCreateInput, VehicleUncheckedCreateInput>
    /**
     * In case the Vehicle was found with the provided `where` argument, update it with this data.
     */
    update: XOR<VehicleUpdateInput, VehicleUncheckedUpdateInput>
  }

  /**
   * Vehicle delete
   */
  export type VehicleDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Vehicle
     */
    select?: VehicleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VehicleInclude<ExtArgs> | null
    /**
     * Filter which Vehicle to delete.
     */
    where: VehicleWhereUniqueInput
  }

  /**
   * Vehicle deleteMany
   */
  export type VehicleDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Vehicles to delete
     */
    where?: VehicleWhereInput
  }

  /**
   * Vehicle findRaw
   */
  export type VehicleFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The query predicate filter. If unspecified, then all documents in the collection will match the predicate. ${@link https://docs.mongodb.com/manual/reference/operator/query MongoDB Docs}.
     */
    filter?: InputJsonValue
    /**
     * Additional options to pass to the `find` command ${@link https://docs.mongodb.com/manual/reference/command/find/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * Vehicle aggregateRaw
   */
  export type VehicleAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * An array of aggregation stages to process and transform the document stream via the aggregation pipeline. ${@link https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline MongoDB Docs}.
     */
    pipeline?: InputJsonValue[]
    /**
     * Additional options to pass to the `aggregate` command ${@link https://docs.mongodb.com/manual/reference/command/aggregate/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * Vehicle.bookings
   */
  export type Vehicle$bookingsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Booking
     */
    select?: BookingSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BookingInclude<ExtArgs> | null
    where?: BookingWhereInput
    orderBy?: BookingOrderByWithRelationInput | BookingOrderByWithRelationInput[]
    cursor?: BookingWhereUniqueInput
    take?: number
    skip?: number
    distinct?: BookingScalarFieldEnum | BookingScalarFieldEnum[]
  }

  /**
   * Vehicle without action
   */
  export type VehicleDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Vehicle
     */
    select?: VehicleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VehicleInclude<ExtArgs> | null
  }


  /**
   * Model Service
   */

  export type AggregateService = {
    _count: ServiceCountAggregateOutputType | null
    _min: ServiceMinAggregateOutputType | null
    _max: ServiceMaxAggregateOutputType | null
  }

  export type ServiceMinAggregateOutputType = {
    id: string | null
    name: string | null
    description: string | null
    icon: string | null
    type: string | null
  }

  export type ServiceMaxAggregateOutputType = {
    id: string | null
    name: string | null
    description: string | null
    icon: string | null
    type: string | null
  }

  export type ServiceCountAggregateOutputType = {
    id: number
    name: number
    description: number
    icon: number
    type: number
    _all: number
  }


  export type ServiceMinAggregateInputType = {
    id?: true
    name?: true
    description?: true
    icon?: true
    type?: true
  }

  export type ServiceMaxAggregateInputType = {
    id?: true
    name?: true
    description?: true
    icon?: true
    type?: true
  }

  export type ServiceCountAggregateInputType = {
    id?: true
    name?: true
    description?: true
    icon?: true
    type?: true
    _all?: true
  }

  export type ServiceAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Service to aggregate.
     */
    where?: ServiceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Services to fetch.
     */
    orderBy?: ServiceOrderByWithRelationInput | ServiceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ServiceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Services from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Services.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Services
    **/
    _count?: true | ServiceCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ServiceMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ServiceMaxAggregateInputType
  }

  export type GetServiceAggregateType<T extends ServiceAggregateArgs> = {
        [P in keyof T & keyof AggregateService]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateService[P]>
      : GetScalarType<T[P], AggregateService[P]>
  }




  export type ServiceGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ServiceWhereInput
    orderBy?: ServiceOrderByWithAggregationInput | ServiceOrderByWithAggregationInput[]
    by: ServiceScalarFieldEnum[] | ServiceScalarFieldEnum
    having?: ServiceScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ServiceCountAggregateInputType | true
    _min?: ServiceMinAggregateInputType
    _max?: ServiceMaxAggregateInputType
  }

  export type ServiceGroupByOutputType = {
    id: string
    name: string
    description: string
    icon: string | null
    type: string
    _count: ServiceCountAggregateOutputType | null
    _min: ServiceMinAggregateOutputType | null
    _max: ServiceMaxAggregateOutputType | null
  }

  type GetServiceGroupByPayload<T extends ServiceGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ServiceGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ServiceGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ServiceGroupByOutputType[P]>
            : GetScalarType<T[P], ServiceGroupByOutputType[P]>
        }
      >
    >


  export type ServiceSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    icon?: boolean
    type?: boolean
    offeredByGarages?: boolean | Service$offeredByGaragesArgs<ExtArgs>
    bookings?: boolean | Service$bookingsArgs<ExtArgs>
    _count?: boolean | ServiceCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["service"]>


  export type ServiceSelectScalar = {
    id?: boolean
    name?: boolean
    description?: boolean
    icon?: boolean
    type?: boolean
  }

  export type ServiceInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    offeredByGarages?: boolean | Service$offeredByGaragesArgs<ExtArgs>
    bookings?: boolean | Service$bookingsArgs<ExtArgs>
    _count?: boolean | ServiceCountOutputTypeDefaultArgs<ExtArgs>
  }

  export type $ServicePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Service"
    objects: {
      offeredByGarages: Prisma.$GarageServicePayload<ExtArgs>[]
      bookings: Prisma.$BookingPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      description: string
      icon: string | null
      type: string
    }, ExtArgs["result"]["service"]>
    composites: {}
  }

  type ServiceGetPayload<S extends boolean | null | undefined | ServiceDefaultArgs> = $Result.GetResult<Prisma.$ServicePayload, S>

  type ServiceCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ServiceFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ServiceCountAggregateInputType | true
    }

  export interface ServiceDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Service'], meta: { name: 'Service' } }
    /**
     * Find zero or one Service that matches the filter.
     * @param {ServiceFindUniqueArgs} args - Arguments to find a Service
     * @example
     * // Get one Service
     * const service = await prisma.service.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ServiceFindUniqueArgs>(args: SelectSubset<T, ServiceFindUniqueArgs<ExtArgs>>): Prisma__ServiceClient<$Result.GetResult<Prisma.$ServicePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Service that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ServiceFindUniqueOrThrowArgs} args - Arguments to find a Service
     * @example
     * // Get one Service
     * const service = await prisma.service.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ServiceFindUniqueOrThrowArgs>(args: SelectSubset<T, ServiceFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ServiceClient<$Result.GetResult<Prisma.$ServicePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Service that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ServiceFindFirstArgs} args - Arguments to find a Service
     * @example
     * // Get one Service
     * const service = await prisma.service.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ServiceFindFirstArgs>(args?: SelectSubset<T, ServiceFindFirstArgs<ExtArgs>>): Prisma__ServiceClient<$Result.GetResult<Prisma.$ServicePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Service that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ServiceFindFirstOrThrowArgs} args - Arguments to find a Service
     * @example
     * // Get one Service
     * const service = await prisma.service.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ServiceFindFirstOrThrowArgs>(args?: SelectSubset<T, ServiceFindFirstOrThrowArgs<ExtArgs>>): Prisma__ServiceClient<$Result.GetResult<Prisma.$ServicePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Services that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ServiceFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Services
     * const services = await prisma.service.findMany()
     * 
     * // Get first 10 Services
     * const services = await prisma.service.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const serviceWithIdOnly = await prisma.service.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ServiceFindManyArgs>(args?: SelectSubset<T, ServiceFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ServicePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Service.
     * @param {ServiceCreateArgs} args - Arguments to create a Service.
     * @example
     * // Create one Service
     * const Service = await prisma.service.create({
     *   data: {
     *     // ... data to create a Service
     *   }
     * })
     * 
     */
    create<T extends ServiceCreateArgs>(args: SelectSubset<T, ServiceCreateArgs<ExtArgs>>): Prisma__ServiceClient<$Result.GetResult<Prisma.$ServicePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Services.
     * @param {ServiceCreateManyArgs} args - Arguments to create many Services.
     * @example
     * // Create many Services
     * const service = await prisma.service.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ServiceCreateManyArgs>(args?: SelectSubset<T, ServiceCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Service.
     * @param {ServiceDeleteArgs} args - Arguments to delete one Service.
     * @example
     * // Delete one Service
     * const Service = await prisma.service.delete({
     *   where: {
     *     // ... filter to delete one Service
     *   }
     * })
     * 
     */
    delete<T extends ServiceDeleteArgs>(args: SelectSubset<T, ServiceDeleteArgs<ExtArgs>>): Prisma__ServiceClient<$Result.GetResult<Prisma.$ServicePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Service.
     * @param {ServiceUpdateArgs} args - Arguments to update one Service.
     * @example
     * // Update one Service
     * const service = await prisma.service.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ServiceUpdateArgs>(args: SelectSubset<T, ServiceUpdateArgs<ExtArgs>>): Prisma__ServiceClient<$Result.GetResult<Prisma.$ServicePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Services.
     * @param {ServiceDeleteManyArgs} args - Arguments to filter Services to delete.
     * @example
     * // Delete a few Services
     * const { count } = await prisma.service.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ServiceDeleteManyArgs>(args?: SelectSubset<T, ServiceDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Services.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ServiceUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Services
     * const service = await prisma.service.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ServiceUpdateManyArgs>(args: SelectSubset<T, ServiceUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Service.
     * @param {ServiceUpsertArgs} args - Arguments to update or create a Service.
     * @example
     * // Update or create a Service
     * const service = await prisma.service.upsert({
     *   create: {
     *     // ... data to create a Service
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Service we want to update
     *   }
     * })
     */
    upsert<T extends ServiceUpsertArgs>(args: SelectSubset<T, ServiceUpsertArgs<ExtArgs>>): Prisma__ServiceClient<$Result.GetResult<Prisma.$ServicePayload<ExtArgs>, T, "upsert">, never, ExtArgs>

    /**
     * Find zero or more Services that matches the filter.
     * @param {ServiceFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const service = await prisma.service.findRaw({
     *   filter: { age: { $gt: 25 } } 
     * })
     */
    findRaw(args?: ServiceFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a Service.
     * @param {ServiceAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const service = await prisma.service.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: ServiceAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


    /**
     * Count the number of Services.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ServiceCountArgs} args - Arguments to filter Services to count.
     * @example
     * // Count the number of Services
     * const count = await prisma.service.count({
     *   where: {
     *     // ... the filter for the Services we want to count
     *   }
     * })
    **/
    count<T extends ServiceCountArgs>(
      args?: Subset<T, ServiceCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ServiceCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Service.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ServiceAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ServiceAggregateArgs>(args: Subset<T, ServiceAggregateArgs>): Prisma.PrismaPromise<GetServiceAggregateType<T>>

    /**
     * Group by Service.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ServiceGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ServiceGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ServiceGroupByArgs['orderBy'] }
        : { orderBy?: ServiceGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ServiceGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetServiceGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Service model
   */
  readonly fields: ServiceFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Service.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ServiceClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    offeredByGarages<T extends Service$offeredByGaragesArgs<ExtArgs> = {}>(args?: Subset<T, Service$offeredByGaragesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GarageServicePayload<ExtArgs>, T, "findMany"> | Null>
    bookings<T extends Service$bookingsArgs<ExtArgs> = {}>(args?: Subset<T, Service$bookingsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BookingPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Service model
   */ 
  interface ServiceFieldRefs {
    readonly id: FieldRef<"Service", 'String'>
    readonly name: FieldRef<"Service", 'String'>
    readonly description: FieldRef<"Service", 'String'>
    readonly icon: FieldRef<"Service", 'String'>
    readonly type: FieldRef<"Service", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Service findUnique
   */
  export type ServiceFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Service
     */
    select?: ServiceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServiceInclude<ExtArgs> | null
    /**
     * Filter, which Service to fetch.
     */
    where: ServiceWhereUniqueInput
  }

  /**
   * Service findUniqueOrThrow
   */
  export type ServiceFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Service
     */
    select?: ServiceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServiceInclude<ExtArgs> | null
    /**
     * Filter, which Service to fetch.
     */
    where: ServiceWhereUniqueInput
  }

  /**
   * Service findFirst
   */
  export type ServiceFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Service
     */
    select?: ServiceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServiceInclude<ExtArgs> | null
    /**
     * Filter, which Service to fetch.
     */
    where?: ServiceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Services to fetch.
     */
    orderBy?: ServiceOrderByWithRelationInput | ServiceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Services.
     */
    cursor?: ServiceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Services from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Services.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Services.
     */
    distinct?: ServiceScalarFieldEnum | ServiceScalarFieldEnum[]
  }

  /**
   * Service findFirstOrThrow
   */
  export type ServiceFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Service
     */
    select?: ServiceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServiceInclude<ExtArgs> | null
    /**
     * Filter, which Service to fetch.
     */
    where?: ServiceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Services to fetch.
     */
    orderBy?: ServiceOrderByWithRelationInput | ServiceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Services.
     */
    cursor?: ServiceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Services from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Services.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Services.
     */
    distinct?: ServiceScalarFieldEnum | ServiceScalarFieldEnum[]
  }

  /**
   * Service findMany
   */
  export type ServiceFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Service
     */
    select?: ServiceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServiceInclude<ExtArgs> | null
    /**
     * Filter, which Services to fetch.
     */
    where?: ServiceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Services to fetch.
     */
    orderBy?: ServiceOrderByWithRelationInput | ServiceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Services.
     */
    cursor?: ServiceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Services from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Services.
     */
    skip?: number
    distinct?: ServiceScalarFieldEnum | ServiceScalarFieldEnum[]
  }

  /**
   * Service create
   */
  export type ServiceCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Service
     */
    select?: ServiceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServiceInclude<ExtArgs> | null
    /**
     * The data needed to create a Service.
     */
    data: XOR<ServiceCreateInput, ServiceUncheckedCreateInput>
  }

  /**
   * Service createMany
   */
  export type ServiceCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Services.
     */
    data: ServiceCreateManyInput | ServiceCreateManyInput[]
  }

  /**
   * Service update
   */
  export type ServiceUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Service
     */
    select?: ServiceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServiceInclude<ExtArgs> | null
    /**
     * The data needed to update a Service.
     */
    data: XOR<ServiceUpdateInput, ServiceUncheckedUpdateInput>
    /**
     * Choose, which Service to update.
     */
    where: ServiceWhereUniqueInput
  }

  /**
   * Service updateMany
   */
  export type ServiceUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Services.
     */
    data: XOR<ServiceUpdateManyMutationInput, ServiceUncheckedUpdateManyInput>
    /**
     * Filter which Services to update
     */
    where?: ServiceWhereInput
  }

  /**
   * Service upsert
   */
  export type ServiceUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Service
     */
    select?: ServiceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServiceInclude<ExtArgs> | null
    /**
     * The filter to search for the Service to update in case it exists.
     */
    where: ServiceWhereUniqueInput
    /**
     * In case the Service found by the `where` argument doesn't exist, create a new Service with this data.
     */
    create: XOR<ServiceCreateInput, ServiceUncheckedCreateInput>
    /**
     * In case the Service was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ServiceUpdateInput, ServiceUncheckedUpdateInput>
  }

  /**
   * Service delete
   */
  export type ServiceDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Service
     */
    select?: ServiceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServiceInclude<ExtArgs> | null
    /**
     * Filter which Service to delete.
     */
    where: ServiceWhereUniqueInput
  }

  /**
   * Service deleteMany
   */
  export type ServiceDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Services to delete
     */
    where?: ServiceWhereInput
  }

  /**
   * Service findRaw
   */
  export type ServiceFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The query predicate filter. If unspecified, then all documents in the collection will match the predicate. ${@link https://docs.mongodb.com/manual/reference/operator/query MongoDB Docs}.
     */
    filter?: InputJsonValue
    /**
     * Additional options to pass to the `find` command ${@link https://docs.mongodb.com/manual/reference/command/find/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * Service aggregateRaw
   */
  export type ServiceAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * An array of aggregation stages to process and transform the document stream via the aggregation pipeline. ${@link https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline MongoDB Docs}.
     */
    pipeline?: InputJsonValue[]
    /**
     * Additional options to pass to the `aggregate` command ${@link https://docs.mongodb.com/manual/reference/command/aggregate/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * Service.offeredByGarages
   */
  export type Service$offeredByGaragesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GarageService
     */
    select?: GarageServiceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GarageServiceInclude<ExtArgs> | null
    where?: GarageServiceWhereInput
    orderBy?: GarageServiceOrderByWithRelationInput | GarageServiceOrderByWithRelationInput[]
    cursor?: GarageServiceWhereUniqueInput
    take?: number
    skip?: number
    distinct?: GarageServiceScalarFieldEnum | GarageServiceScalarFieldEnum[]
  }

  /**
   * Service.bookings
   */
  export type Service$bookingsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Booking
     */
    select?: BookingSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BookingInclude<ExtArgs> | null
    where?: BookingWhereInput
    orderBy?: BookingOrderByWithRelationInput | BookingOrderByWithRelationInput[]
    cursor?: BookingWhereUniqueInput
    take?: number
    skip?: number
    distinct?: BookingScalarFieldEnum | BookingScalarFieldEnum[]
  }

  /**
   * Service without action
   */
  export type ServiceDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Service
     */
    select?: ServiceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServiceInclude<ExtArgs> | null
  }


  /**
   * Model Garage
   */

  export type AggregateGarage = {
    _count: GarageCountAggregateOutputType | null
    _avg: GarageAvgAggregateOutputType | null
    _sum: GarageSumAggregateOutputType | null
    _min: GarageMinAggregateOutputType | null
    _max: GarageMaxAggregateOutputType | null
  }

  export type GarageAvgAggregateOutputType = {
    numberOfEmployees: number | null
    rating: number | null
    reviewCount: number | null
  }

  export type GarageSumAggregateOutputType = {
    numberOfEmployees: number | null
    rating: number | null
    reviewCount: number | null
  }

  export type GarageMinAggregateOutputType = {
    id: string | null
    name: string | null
    licenseNumber: string | null
    address: string | null
    ownerName: string | null
    contactEmail: string | null
    contactPhone: string | null
    numberOfEmployees: number | null
    rating: number | null
    reviewCount: number | null
    isOpen: boolean | null
    stripeAccountId: string | null
    createdAt: Date | null
    updatedAt: Date | null
    status: $Enums.VerificationStatus | null
    rejectionReason: string | null
    ownerId: string | null
  }

  export type GarageMaxAggregateOutputType = {
    id: string | null
    name: string | null
    licenseNumber: string | null
    address: string | null
    ownerName: string | null
    contactEmail: string | null
    contactPhone: string | null
    numberOfEmployees: number | null
    rating: number | null
    reviewCount: number | null
    isOpen: boolean | null
    stripeAccountId: string | null
    createdAt: Date | null
    updatedAt: Date | null
    status: $Enums.VerificationStatus | null
    rejectionReason: string | null
    ownerId: string | null
  }

  export type GarageCountAggregateOutputType = {
    id: number
    name: number
    licenseNumber: number
    address: number
    ownerName: number
    contactEmail: number
    contactPhone: number
    numberOfEmployees: number
    rating: number
    reviewCount: number
    isOpen: number
    operatingHours: number
    stripeAccountId: number
    location: number
    createdAt: number
    updatedAt: number
    status: number
    rejectionReason: number
    ownerId: number
    _all: number
  }


  export type GarageAvgAggregateInputType = {
    numberOfEmployees?: true
    rating?: true
    reviewCount?: true
  }

  export type GarageSumAggregateInputType = {
    numberOfEmployees?: true
    rating?: true
    reviewCount?: true
  }

  export type GarageMinAggregateInputType = {
    id?: true
    name?: true
    licenseNumber?: true
    address?: true
    ownerName?: true
    contactEmail?: true
    contactPhone?: true
    numberOfEmployees?: true
    rating?: true
    reviewCount?: true
    isOpen?: true
    stripeAccountId?: true
    createdAt?: true
    updatedAt?: true
    status?: true
    rejectionReason?: true
    ownerId?: true
  }

  export type GarageMaxAggregateInputType = {
    id?: true
    name?: true
    licenseNumber?: true
    address?: true
    ownerName?: true
    contactEmail?: true
    contactPhone?: true
    numberOfEmployees?: true
    rating?: true
    reviewCount?: true
    isOpen?: true
    stripeAccountId?: true
    createdAt?: true
    updatedAt?: true
    status?: true
    rejectionReason?: true
    ownerId?: true
  }

  export type GarageCountAggregateInputType = {
    id?: true
    name?: true
    licenseNumber?: true
    address?: true
    ownerName?: true
    contactEmail?: true
    contactPhone?: true
    numberOfEmployees?: true
    rating?: true
    reviewCount?: true
    isOpen?: true
    operatingHours?: true
    stripeAccountId?: true
    location?: true
    createdAt?: true
    updatedAt?: true
    status?: true
    rejectionReason?: true
    ownerId?: true
    _all?: true
  }

  export type GarageAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Garage to aggregate.
     */
    where?: GarageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Garages to fetch.
     */
    orderBy?: GarageOrderByWithRelationInput | GarageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: GarageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Garages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Garages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Garages
    **/
    _count?: true | GarageCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: GarageAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: GarageSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: GarageMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: GarageMaxAggregateInputType
  }

  export type GetGarageAggregateType<T extends GarageAggregateArgs> = {
        [P in keyof T & keyof AggregateGarage]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateGarage[P]>
      : GetScalarType<T[P], AggregateGarage[P]>
  }




  export type GarageGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: GarageWhereInput
    orderBy?: GarageOrderByWithAggregationInput | GarageOrderByWithAggregationInput[]
    by: GarageScalarFieldEnum[] | GarageScalarFieldEnum
    having?: GarageScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: GarageCountAggregateInputType | true
    _avg?: GarageAvgAggregateInputType
    _sum?: GarageSumAggregateInputType
    _min?: GarageMinAggregateInputType
    _max?: GarageMaxAggregateInputType
  }

  export type GarageGroupByOutputType = {
    id: string
    name: string
    licenseNumber: string
    address: string
    ownerName: string
    contactEmail: string | null
    contactPhone: string | null
    numberOfEmployees: number
    rating: number | null
    reviewCount: number | null
    isOpen: boolean
    operatingHours: JsonValue | null
    stripeAccountId: string | null
    location: JsonValue
    createdAt: Date
    updatedAt: Date
    status: $Enums.VerificationStatus
    rejectionReason: string | null
    ownerId: string
    _count: GarageCountAggregateOutputType | null
    _avg: GarageAvgAggregateOutputType | null
    _sum: GarageSumAggregateOutputType | null
    _min: GarageMinAggregateOutputType | null
    _max: GarageMaxAggregateOutputType | null
  }

  type GetGarageGroupByPayload<T extends GarageGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<GarageGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof GarageGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], GarageGroupByOutputType[P]>
            : GetScalarType<T[P], GarageGroupByOutputType[P]>
        }
      >
    >


  export type GarageSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    licenseNumber?: boolean
    address?: boolean
    ownerName?: boolean
    contactEmail?: boolean
    contactPhone?: boolean
    numberOfEmployees?: boolean
    rating?: boolean
    reviewCount?: boolean
    isOpen?: boolean
    operatingHours?: boolean
    stripeAccountId?: boolean
    location?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    status?: boolean
    rejectionReason?: boolean
    ownerId?: boolean
    owner?: boolean | UserDefaultArgs<ExtArgs>
    services?: boolean | Garage$servicesArgs<ExtArgs>
    spareParts?: boolean | Garage$sparePartsArgs<ExtArgs>
    bookings?: boolean | Garage$bookingsArgs<ExtArgs>
    _count?: boolean | GarageCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["garage"]>


  export type GarageSelectScalar = {
    id?: boolean
    name?: boolean
    licenseNumber?: boolean
    address?: boolean
    ownerName?: boolean
    contactEmail?: boolean
    contactPhone?: boolean
    numberOfEmployees?: boolean
    rating?: boolean
    reviewCount?: boolean
    isOpen?: boolean
    operatingHours?: boolean
    stripeAccountId?: boolean
    location?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    status?: boolean
    rejectionReason?: boolean
    ownerId?: boolean
  }

  export type GarageInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    owner?: boolean | UserDefaultArgs<ExtArgs>
    services?: boolean | Garage$servicesArgs<ExtArgs>
    spareParts?: boolean | Garage$sparePartsArgs<ExtArgs>
    bookings?: boolean | Garage$bookingsArgs<ExtArgs>
    _count?: boolean | GarageCountOutputTypeDefaultArgs<ExtArgs>
  }

  export type $GaragePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Garage"
    objects: {
      owner: Prisma.$UserPayload<ExtArgs>
      services: Prisma.$GarageServicePayload<ExtArgs>[]
      spareParts: Prisma.$SparePartPayload<ExtArgs>[]
      bookings: Prisma.$BookingPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      licenseNumber: string
      address: string
      ownerName: string
      contactEmail: string | null
      contactPhone: string | null
      numberOfEmployees: number
      rating: number | null
      reviewCount: number | null
      isOpen: boolean
      operatingHours: Prisma.JsonValue | null
      stripeAccountId: string | null
      location: Prisma.JsonValue
      createdAt: Date
      updatedAt: Date
      status: $Enums.VerificationStatus
      rejectionReason: string | null
      ownerId: string
    }, ExtArgs["result"]["garage"]>
    composites: {}
  }

  type GarageGetPayload<S extends boolean | null | undefined | GarageDefaultArgs> = $Result.GetResult<Prisma.$GaragePayload, S>

  type GarageCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<GarageFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: GarageCountAggregateInputType | true
    }

  export interface GarageDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Garage'], meta: { name: 'Garage' } }
    /**
     * Find zero or one Garage that matches the filter.
     * @param {GarageFindUniqueArgs} args - Arguments to find a Garage
     * @example
     * // Get one Garage
     * const garage = await prisma.garage.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends GarageFindUniqueArgs>(args: SelectSubset<T, GarageFindUniqueArgs<ExtArgs>>): Prisma__GarageClient<$Result.GetResult<Prisma.$GaragePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Garage that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {GarageFindUniqueOrThrowArgs} args - Arguments to find a Garage
     * @example
     * // Get one Garage
     * const garage = await prisma.garage.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends GarageFindUniqueOrThrowArgs>(args: SelectSubset<T, GarageFindUniqueOrThrowArgs<ExtArgs>>): Prisma__GarageClient<$Result.GetResult<Prisma.$GaragePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Garage that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GarageFindFirstArgs} args - Arguments to find a Garage
     * @example
     * // Get one Garage
     * const garage = await prisma.garage.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends GarageFindFirstArgs>(args?: SelectSubset<T, GarageFindFirstArgs<ExtArgs>>): Prisma__GarageClient<$Result.GetResult<Prisma.$GaragePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Garage that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GarageFindFirstOrThrowArgs} args - Arguments to find a Garage
     * @example
     * // Get one Garage
     * const garage = await prisma.garage.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends GarageFindFirstOrThrowArgs>(args?: SelectSubset<T, GarageFindFirstOrThrowArgs<ExtArgs>>): Prisma__GarageClient<$Result.GetResult<Prisma.$GaragePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Garages that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GarageFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Garages
     * const garages = await prisma.garage.findMany()
     * 
     * // Get first 10 Garages
     * const garages = await prisma.garage.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const garageWithIdOnly = await prisma.garage.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends GarageFindManyArgs>(args?: SelectSubset<T, GarageFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GaragePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Garage.
     * @param {GarageCreateArgs} args - Arguments to create a Garage.
     * @example
     * // Create one Garage
     * const Garage = await prisma.garage.create({
     *   data: {
     *     // ... data to create a Garage
     *   }
     * })
     * 
     */
    create<T extends GarageCreateArgs>(args: SelectSubset<T, GarageCreateArgs<ExtArgs>>): Prisma__GarageClient<$Result.GetResult<Prisma.$GaragePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Garages.
     * @param {GarageCreateManyArgs} args - Arguments to create many Garages.
     * @example
     * // Create many Garages
     * const garage = await prisma.garage.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends GarageCreateManyArgs>(args?: SelectSubset<T, GarageCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Garage.
     * @param {GarageDeleteArgs} args - Arguments to delete one Garage.
     * @example
     * // Delete one Garage
     * const Garage = await prisma.garage.delete({
     *   where: {
     *     // ... filter to delete one Garage
     *   }
     * })
     * 
     */
    delete<T extends GarageDeleteArgs>(args: SelectSubset<T, GarageDeleteArgs<ExtArgs>>): Prisma__GarageClient<$Result.GetResult<Prisma.$GaragePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Garage.
     * @param {GarageUpdateArgs} args - Arguments to update one Garage.
     * @example
     * // Update one Garage
     * const garage = await prisma.garage.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends GarageUpdateArgs>(args: SelectSubset<T, GarageUpdateArgs<ExtArgs>>): Prisma__GarageClient<$Result.GetResult<Prisma.$GaragePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Garages.
     * @param {GarageDeleteManyArgs} args - Arguments to filter Garages to delete.
     * @example
     * // Delete a few Garages
     * const { count } = await prisma.garage.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends GarageDeleteManyArgs>(args?: SelectSubset<T, GarageDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Garages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GarageUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Garages
     * const garage = await prisma.garage.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends GarageUpdateManyArgs>(args: SelectSubset<T, GarageUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Garage.
     * @param {GarageUpsertArgs} args - Arguments to update or create a Garage.
     * @example
     * // Update or create a Garage
     * const garage = await prisma.garage.upsert({
     *   create: {
     *     // ... data to create a Garage
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Garage we want to update
     *   }
     * })
     */
    upsert<T extends GarageUpsertArgs>(args: SelectSubset<T, GarageUpsertArgs<ExtArgs>>): Prisma__GarageClient<$Result.GetResult<Prisma.$GaragePayload<ExtArgs>, T, "upsert">, never, ExtArgs>

    /**
     * Find zero or more Garages that matches the filter.
     * @param {GarageFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const garage = await prisma.garage.findRaw({
     *   filter: { age: { $gt: 25 } } 
     * })
     */
    findRaw(args?: GarageFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a Garage.
     * @param {GarageAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const garage = await prisma.garage.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: GarageAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


    /**
     * Count the number of Garages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GarageCountArgs} args - Arguments to filter Garages to count.
     * @example
     * // Count the number of Garages
     * const count = await prisma.garage.count({
     *   where: {
     *     // ... the filter for the Garages we want to count
     *   }
     * })
    **/
    count<T extends GarageCountArgs>(
      args?: Subset<T, GarageCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], GarageCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Garage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GarageAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends GarageAggregateArgs>(args: Subset<T, GarageAggregateArgs>): Prisma.PrismaPromise<GetGarageAggregateType<T>>

    /**
     * Group by Garage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GarageGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends GarageGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: GarageGroupByArgs['orderBy'] }
        : { orderBy?: GarageGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, GarageGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetGarageGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Garage model
   */
  readonly fields: GarageFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Garage.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__GarageClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    owner<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    services<T extends Garage$servicesArgs<ExtArgs> = {}>(args?: Subset<T, Garage$servicesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GarageServicePayload<ExtArgs>, T, "findMany"> | Null>
    spareParts<T extends Garage$sparePartsArgs<ExtArgs> = {}>(args?: Subset<T, Garage$sparePartsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SparePartPayload<ExtArgs>, T, "findMany"> | Null>
    bookings<T extends Garage$bookingsArgs<ExtArgs> = {}>(args?: Subset<T, Garage$bookingsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BookingPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Garage model
   */ 
  interface GarageFieldRefs {
    readonly id: FieldRef<"Garage", 'String'>
    readonly name: FieldRef<"Garage", 'String'>
    readonly licenseNumber: FieldRef<"Garage", 'String'>
    readonly address: FieldRef<"Garage", 'String'>
    readonly ownerName: FieldRef<"Garage", 'String'>
    readonly contactEmail: FieldRef<"Garage", 'String'>
    readonly contactPhone: FieldRef<"Garage", 'String'>
    readonly numberOfEmployees: FieldRef<"Garage", 'Int'>
    readonly rating: FieldRef<"Garage", 'Float'>
    readonly reviewCount: FieldRef<"Garage", 'Int'>
    readonly isOpen: FieldRef<"Garage", 'Boolean'>
    readonly operatingHours: FieldRef<"Garage", 'Json'>
    readonly stripeAccountId: FieldRef<"Garage", 'String'>
    readonly location: FieldRef<"Garage", 'Json'>
    readonly createdAt: FieldRef<"Garage", 'DateTime'>
    readonly updatedAt: FieldRef<"Garage", 'DateTime'>
    readonly status: FieldRef<"Garage", 'VerificationStatus'>
    readonly rejectionReason: FieldRef<"Garage", 'String'>
    readonly ownerId: FieldRef<"Garage", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Garage findUnique
   */
  export type GarageFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Garage
     */
    select?: GarageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GarageInclude<ExtArgs> | null
    /**
     * Filter, which Garage to fetch.
     */
    where: GarageWhereUniqueInput
  }

  /**
   * Garage findUniqueOrThrow
   */
  export type GarageFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Garage
     */
    select?: GarageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GarageInclude<ExtArgs> | null
    /**
     * Filter, which Garage to fetch.
     */
    where: GarageWhereUniqueInput
  }

  /**
   * Garage findFirst
   */
  export type GarageFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Garage
     */
    select?: GarageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GarageInclude<ExtArgs> | null
    /**
     * Filter, which Garage to fetch.
     */
    where?: GarageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Garages to fetch.
     */
    orderBy?: GarageOrderByWithRelationInput | GarageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Garages.
     */
    cursor?: GarageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Garages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Garages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Garages.
     */
    distinct?: GarageScalarFieldEnum | GarageScalarFieldEnum[]
  }

  /**
   * Garage findFirstOrThrow
   */
  export type GarageFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Garage
     */
    select?: GarageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GarageInclude<ExtArgs> | null
    /**
     * Filter, which Garage to fetch.
     */
    where?: GarageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Garages to fetch.
     */
    orderBy?: GarageOrderByWithRelationInput | GarageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Garages.
     */
    cursor?: GarageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Garages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Garages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Garages.
     */
    distinct?: GarageScalarFieldEnum | GarageScalarFieldEnum[]
  }

  /**
   * Garage findMany
   */
  export type GarageFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Garage
     */
    select?: GarageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GarageInclude<ExtArgs> | null
    /**
     * Filter, which Garages to fetch.
     */
    where?: GarageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Garages to fetch.
     */
    orderBy?: GarageOrderByWithRelationInput | GarageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Garages.
     */
    cursor?: GarageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Garages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Garages.
     */
    skip?: number
    distinct?: GarageScalarFieldEnum | GarageScalarFieldEnum[]
  }

  /**
   * Garage create
   */
  export type GarageCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Garage
     */
    select?: GarageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GarageInclude<ExtArgs> | null
    /**
     * The data needed to create a Garage.
     */
    data: XOR<GarageCreateInput, GarageUncheckedCreateInput>
  }

  /**
   * Garage createMany
   */
  export type GarageCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Garages.
     */
    data: GarageCreateManyInput | GarageCreateManyInput[]
  }

  /**
   * Garage update
   */
  export type GarageUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Garage
     */
    select?: GarageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GarageInclude<ExtArgs> | null
    /**
     * The data needed to update a Garage.
     */
    data: XOR<GarageUpdateInput, GarageUncheckedUpdateInput>
    /**
     * Choose, which Garage to update.
     */
    where: GarageWhereUniqueInput
  }

  /**
   * Garage updateMany
   */
  export type GarageUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Garages.
     */
    data: XOR<GarageUpdateManyMutationInput, GarageUncheckedUpdateManyInput>
    /**
     * Filter which Garages to update
     */
    where?: GarageWhereInput
  }

  /**
   * Garage upsert
   */
  export type GarageUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Garage
     */
    select?: GarageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GarageInclude<ExtArgs> | null
    /**
     * The filter to search for the Garage to update in case it exists.
     */
    where: GarageWhereUniqueInput
    /**
     * In case the Garage found by the `where` argument doesn't exist, create a new Garage with this data.
     */
    create: XOR<GarageCreateInput, GarageUncheckedCreateInput>
    /**
     * In case the Garage was found with the provided `where` argument, update it with this data.
     */
    update: XOR<GarageUpdateInput, GarageUncheckedUpdateInput>
  }

  /**
   * Garage delete
   */
  export type GarageDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Garage
     */
    select?: GarageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GarageInclude<ExtArgs> | null
    /**
     * Filter which Garage to delete.
     */
    where: GarageWhereUniqueInput
  }

  /**
   * Garage deleteMany
   */
  export type GarageDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Garages to delete
     */
    where?: GarageWhereInput
  }

  /**
   * Garage findRaw
   */
  export type GarageFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The query predicate filter. If unspecified, then all documents in the collection will match the predicate. ${@link https://docs.mongodb.com/manual/reference/operator/query MongoDB Docs}.
     */
    filter?: InputJsonValue
    /**
     * Additional options to pass to the `find` command ${@link https://docs.mongodb.com/manual/reference/command/find/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * Garage aggregateRaw
   */
  export type GarageAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * An array of aggregation stages to process and transform the document stream via the aggregation pipeline. ${@link https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline MongoDB Docs}.
     */
    pipeline?: InputJsonValue[]
    /**
     * Additional options to pass to the `aggregate` command ${@link https://docs.mongodb.com/manual/reference/command/aggregate/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * Garage.services
   */
  export type Garage$servicesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GarageService
     */
    select?: GarageServiceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GarageServiceInclude<ExtArgs> | null
    where?: GarageServiceWhereInput
    orderBy?: GarageServiceOrderByWithRelationInput | GarageServiceOrderByWithRelationInput[]
    cursor?: GarageServiceWhereUniqueInput
    take?: number
    skip?: number
    distinct?: GarageServiceScalarFieldEnum | GarageServiceScalarFieldEnum[]
  }

  /**
   * Garage.spareParts
   */
  export type Garage$sparePartsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SparePart
     */
    select?: SparePartSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SparePartInclude<ExtArgs> | null
    where?: SparePartWhereInput
    orderBy?: SparePartOrderByWithRelationInput | SparePartOrderByWithRelationInput[]
    cursor?: SparePartWhereUniqueInput
    take?: number
    skip?: number
    distinct?: SparePartScalarFieldEnum | SparePartScalarFieldEnum[]
  }

  /**
   * Garage.bookings
   */
  export type Garage$bookingsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Booking
     */
    select?: BookingSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BookingInclude<ExtArgs> | null
    where?: BookingWhereInput
    orderBy?: BookingOrderByWithRelationInput | BookingOrderByWithRelationInput[]
    cursor?: BookingWhereUniqueInput
    take?: number
    skip?: number
    distinct?: BookingScalarFieldEnum | BookingScalarFieldEnum[]
  }

  /**
   * Garage without action
   */
  export type GarageDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Garage
     */
    select?: GarageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GarageInclude<ExtArgs> | null
  }


  /**
   * Model GarageService
   */

  export type AggregateGarageService = {
    _count: GarageServiceCountAggregateOutputType | null
    _avg: GarageServiceAvgAggregateOutputType | null
    _sum: GarageServiceSumAggregateOutputType | null
    _min: GarageServiceMinAggregateOutputType | null
    _max: GarageServiceMaxAggregateOutputType | null
  }

  export type GarageServiceAvgAggregateOutputType = {
    price: number | null
  }

  export type GarageServiceSumAggregateOutputType = {
    price: number | null
  }

  export type GarageServiceMinAggregateOutputType = {
    id: string | null
    price: number | null
    garageId: string | null
    serviceId: string | null
  }

  export type GarageServiceMaxAggregateOutputType = {
    id: string | null
    price: number | null
    garageId: string | null
    serviceId: string | null
  }

  export type GarageServiceCountAggregateOutputType = {
    id: number
    price: number
    garageId: number
    serviceId: number
    _all: number
  }


  export type GarageServiceAvgAggregateInputType = {
    price?: true
  }

  export type GarageServiceSumAggregateInputType = {
    price?: true
  }

  export type GarageServiceMinAggregateInputType = {
    id?: true
    price?: true
    garageId?: true
    serviceId?: true
  }

  export type GarageServiceMaxAggregateInputType = {
    id?: true
    price?: true
    garageId?: true
    serviceId?: true
  }

  export type GarageServiceCountAggregateInputType = {
    id?: true
    price?: true
    garageId?: true
    serviceId?: true
    _all?: true
  }

  export type GarageServiceAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which GarageService to aggregate.
     */
    where?: GarageServiceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GarageServices to fetch.
     */
    orderBy?: GarageServiceOrderByWithRelationInput | GarageServiceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: GarageServiceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GarageServices from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GarageServices.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned GarageServices
    **/
    _count?: true | GarageServiceCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: GarageServiceAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: GarageServiceSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: GarageServiceMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: GarageServiceMaxAggregateInputType
  }

  export type GetGarageServiceAggregateType<T extends GarageServiceAggregateArgs> = {
        [P in keyof T & keyof AggregateGarageService]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateGarageService[P]>
      : GetScalarType<T[P], AggregateGarageService[P]>
  }




  export type GarageServiceGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: GarageServiceWhereInput
    orderBy?: GarageServiceOrderByWithAggregationInput | GarageServiceOrderByWithAggregationInput[]
    by: GarageServiceScalarFieldEnum[] | GarageServiceScalarFieldEnum
    having?: GarageServiceScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: GarageServiceCountAggregateInputType | true
    _avg?: GarageServiceAvgAggregateInputType
    _sum?: GarageServiceSumAggregateInputType
    _min?: GarageServiceMinAggregateInputType
    _max?: GarageServiceMaxAggregateInputType
  }

  export type GarageServiceGroupByOutputType = {
    id: string
    price: number
    garageId: string
    serviceId: string
    _count: GarageServiceCountAggregateOutputType | null
    _avg: GarageServiceAvgAggregateOutputType | null
    _sum: GarageServiceSumAggregateOutputType | null
    _min: GarageServiceMinAggregateOutputType | null
    _max: GarageServiceMaxAggregateOutputType | null
  }

  type GetGarageServiceGroupByPayload<T extends GarageServiceGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<GarageServiceGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof GarageServiceGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], GarageServiceGroupByOutputType[P]>
            : GetScalarType<T[P], GarageServiceGroupByOutputType[P]>
        }
      >
    >


  export type GarageServiceSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    price?: boolean
    garageId?: boolean
    serviceId?: boolean
    garage?: boolean | GarageDefaultArgs<ExtArgs>
    service?: boolean | ServiceDefaultArgs<ExtArgs>
    bookings?: boolean | GarageService$bookingsArgs<ExtArgs>
    _count?: boolean | GarageServiceCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["garageService"]>


  export type GarageServiceSelectScalar = {
    id?: boolean
    price?: boolean
    garageId?: boolean
    serviceId?: boolean
  }

  export type GarageServiceInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    garage?: boolean | GarageDefaultArgs<ExtArgs>
    service?: boolean | ServiceDefaultArgs<ExtArgs>
    bookings?: boolean | GarageService$bookingsArgs<ExtArgs>
    _count?: boolean | GarageServiceCountOutputTypeDefaultArgs<ExtArgs>
  }

  export type $GarageServicePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "GarageService"
    objects: {
      garage: Prisma.$GaragePayload<ExtArgs>
      service: Prisma.$ServicePayload<ExtArgs>
      bookings: Prisma.$BookingPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      price: number
      garageId: string
      serviceId: string
    }, ExtArgs["result"]["garageService"]>
    composites: {}
  }

  type GarageServiceGetPayload<S extends boolean | null | undefined | GarageServiceDefaultArgs> = $Result.GetResult<Prisma.$GarageServicePayload, S>

  type GarageServiceCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<GarageServiceFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: GarageServiceCountAggregateInputType | true
    }

  export interface GarageServiceDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['GarageService'], meta: { name: 'GarageService' } }
    /**
     * Find zero or one GarageService that matches the filter.
     * @param {GarageServiceFindUniqueArgs} args - Arguments to find a GarageService
     * @example
     * // Get one GarageService
     * const garageService = await prisma.garageService.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends GarageServiceFindUniqueArgs>(args: SelectSubset<T, GarageServiceFindUniqueArgs<ExtArgs>>): Prisma__GarageServiceClient<$Result.GetResult<Prisma.$GarageServicePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one GarageService that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {GarageServiceFindUniqueOrThrowArgs} args - Arguments to find a GarageService
     * @example
     * // Get one GarageService
     * const garageService = await prisma.garageService.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends GarageServiceFindUniqueOrThrowArgs>(args: SelectSubset<T, GarageServiceFindUniqueOrThrowArgs<ExtArgs>>): Prisma__GarageServiceClient<$Result.GetResult<Prisma.$GarageServicePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first GarageService that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GarageServiceFindFirstArgs} args - Arguments to find a GarageService
     * @example
     * // Get one GarageService
     * const garageService = await prisma.garageService.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends GarageServiceFindFirstArgs>(args?: SelectSubset<T, GarageServiceFindFirstArgs<ExtArgs>>): Prisma__GarageServiceClient<$Result.GetResult<Prisma.$GarageServicePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first GarageService that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GarageServiceFindFirstOrThrowArgs} args - Arguments to find a GarageService
     * @example
     * // Get one GarageService
     * const garageService = await prisma.garageService.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends GarageServiceFindFirstOrThrowArgs>(args?: SelectSubset<T, GarageServiceFindFirstOrThrowArgs<ExtArgs>>): Prisma__GarageServiceClient<$Result.GetResult<Prisma.$GarageServicePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more GarageServices that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GarageServiceFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all GarageServices
     * const garageServices = await prisma.garageService.findMany()
     * 
     * // Get first 10 GarageServices
     * const garageServices = await prisma.garageService.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const garageServiceWithIdOnly = await prisma.garageService.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends GarageServiceFindManyArgs>(args?: SelectSubset<T, GarageServiceFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GarageServicePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a GarageService.
     * @param {GarageServiceCreateArgs} args - Arguments to create a GarageService.
     * @example
     * // Create one GarageService
     * const GarageService = await prisma.garageService.create({
     *   data: {
     *     // ... data to create a GarageService
     *   }
     * })
     * 
     */
    create<T extends GarageServiceCreateArgs>(args: SelectSubset<T, GarageServiceCreateArgs<ExtArgs>>): Prisma__GarageServiceClient<$Result.GetResult<Prisma.$GarageServicePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many GarageServices.
     * @param {GarageServiceCreateManyArgs} args - Arguments to create many GarageServices.
     * @example
     * // Create many GarageServices
     * const garageService = await prisma.garageService.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends GarageServiceCreateManyArgs>(args?: SelectSubset<T, GarageServiceCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a GarageService.
     * @param {GarageServiceDeleteArgs} args - Arguments to delete one GarageService.
     * @example
     * // Delete one GarageService
     * const GarageService = await prisma.garageService.delete({
     *   where: {
     *     // ... filter to delete one GarageService
     *   }
     * })
     * 
     */
    delete<T extends GarageServiceDeleteArgs>(args: SelectSubset<T, GarageServiceDeleteArgs<ExtArgs>>): Prisma__GarageServiceClient<$Result.GetResult<Prisma.$GarageServicePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one GarageService.
     * @param {GarageServiceUpdateArgs} args - Arguments to update one GarageService.
     * @example
     * // Update one GarageService
     * const garageService = await prisma.garageService.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends GarageServiceUpdateArgs>(args: SelectSubset<T, GarageServiceUpdateArgs<ExtArgs>>): Prisma__GarageServiceClient<$Result.GetResult<Prisma.$GarageServicePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more GarageServices.
     * @param {GarageServiceDeleteManyArgs} args - Arguments to filter GarageServices to delete.
     * @example
     * // Delete a few GarageServices
     * const { count } = await prisma.garageService.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends GarageServiceDeleteManyArgs>(args?: SelectSubset<T, GarageServiceDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more GarageServices.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GarageServiceUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many GarageServices
     * const garageService = await prisma.garageService.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends GarageServiceUpdateManyArgs>(args: SelectSubset<T, GarageServiceUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one GarageService.
     * @param {GarageServiceUpsertArgs} args - Arguments to update or create a GarageService.
     * @example
     * // Update or create a GarageService
     * const garageService = await prisma.garageService.upsert({
     *   create: {
     *     // ... data to create a GarageService
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the GarageService we want to update
     *   }
     * })
     */
    upsert<T extends GarageServiceUpsertArgs>(args: SelectSubset<T, GarageServiceUpsertArgs<ExtArgs>>): Prisma__GarageServiceClient<$Result.GetResult<Prisma.$GarageServicePayload<ExtArgs>, T, "upsert">, never, ExtArgs>

    /**
     * Find zero or more GarageServices that matches the filter.
     * @param {GarageServiceFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const garageService = await prisma.garageService.findRaw({
     *   filter: { age: { $gt: 25 } } 
     * })
     */
    findRaw(args?: GarageServiceFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a GarageService.
     * @param {GarageServiceAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const garageService = await prisma.garageService.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: GarageServiceAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


    /**
     * Count the number of GarageServices.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GarageServiceCountArgs} args - Arguments to filter GarageServices to count.
     * @example
     * // Count the number of GarageServices
     * const count = await prisma.garageService.count({
     *   where: {
     *     // ... the filter for the GarageServices we want to count
     *   }
     * })
    **/
    count<T extends GarageServiceCountArgs>(
      args?: Subset<T, GarageServiceCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], GarageServiceCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a GarageService.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GarageServiceAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends GarageServiceAggregateArgs>(args: Subset<T, GarageServiceAggregateArgs>): Prisma.PrismaPromise<GetGarageServiceAggregateType<T>>

    /**
     * Group by GarageService.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GarageServiceGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends GarageServiceGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: GarageServiceGroupByArgs['orderBy'] }
        : { orderBy?: GarageServiceGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, GarageServiceGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetGarageServiceGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the GarageService model
   */
  readonly fields: GarageServiceFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for GarageService.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__GarageServiceClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    garage<T extends GarageDefaultArgs<ExtArgs> = {}>(args?: Subset<T, GarageDefaultArgs<ExtArgs>>): Prisma__GarageClient<$Result.GetResult<Prisma.$GaragePayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    service<T extends ServiceDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ServiceDefaultArgs<ExtArgs>>): Prisma__ServiceClient<$Result.GetResult<Prisma.$ServicePayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    bookings<T extends GarageService$bookingsArgs<ExtArgs> = {}>(args?: Subset<T, GarageService$bookingsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BookingPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the GarageService model
   */ 
  interface GarageServiceFieldRefs {
    readonly id: FieldRef<"GarageService", 'String'>
    readonly price: FieldRef<"GarageService", 'Float'>
    readonly garageId: FieldRef<"GarageService", 'String'>
    readonly serviceId: FieldRef<"GarageService", 'String'>
  }
    

  // Custom InputTypes
  /**
   * GarageService findUnique
   */
  export type GarageServiceFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GarageService
     */
    select?: GarageServiceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GarageServiceInclude<ExtArgs> | null
    /**
     * Filter, which GarageService to fetch.
     */
    where: GarageServiceWhereUniqueInput
  }

  /**
   * GarageService findUniqueOrThrow
   */
  export type GarageServiceFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GarageService
     */
    select?: GarageServiceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GarageServiceInclude<ExtArgs> | null
    /**
     * Filter, which GarageService to fetch.
     */
    where: GarageServiceWhereUniqueInput
  }

  /**
   * GarageService findFirst
   */
  export type GarageServiceFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GarageService
     */
    select?: GarageServiceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GarageServiceInclude<ExtArgs> | null
    /**
     * Filter, which GarageService to fetch.
     */
    where?: GarageServiceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GarageServices to fetch.
     */
    orderBy?: GarageServiceOrderByWithRelationInput | GarageServiceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for GarageServices.
     */
    cursor?: GarageServiceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GarageServices from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GarageServices.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of GarageServices.
     */
    distinct?: GarageServiceScalarFieldEnum | GarageServiceScalarFieldEnum[]
  }

  /**
   * GarageService findFirstOrThrow
   */
  export type GarageServiceFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GarageService
     */
    select?: GarageServiceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GarageServiceInclude<ExtArgs> | null
    /**
     * Filter, which GarageService to fetch.
     */
    where?: GarageServiceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GarageServices to fetch.
     */
    orderBy?: GarageServiceOrderByWithRelationInput | GarageServiceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for GarageServices.
     */
    cursor?: GarageServiceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GarageServices from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GarageServices.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of GarageServices.
     */
    distinct?: GarageServiceScalarFieldEnum | GarageServiceScalarFieldEnum[]
  }

  /**
   * GarageService findMany
   */
  export type GarageServiceFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GarageService
     */
    select?: GarageServiceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GarageServiceInclude<ExtArgs> | null
    /**
     * Filter, which GarageServices to fetch.
     */
    where?: GarageServiceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GarageServices to fetch.
     */
    orderBy?: GarageServiceOrderByWithRelationInput | GarageServiceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing GarageServices.
     */
    cursor?: GarageServiceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GarageServices from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GarageServices.
     */
    skip?: number
    distinct?: GarageServiceScalarFieldEnum | GarageServiceScalarFieldEnum[]
  }

  /**
   * GarageService create
   */
  export type GarageServiceCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GarageService
     */
    select?: GarageServiceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GarageServiceInclude<ExtArgs> | null
    /**
     * The data needed to create a GarageService.
     */
    data: XOR<GarageServiceCreateInput, GarageServiceUncheckedCreateInput>
  }

  /**
   * GarageService createMany
   */
  export type GarageServiceCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many GarageServices.
     */
    data: GarageServiceCreateManyInput | GarageServiceCreateManyInput[]
  }

  /**
   * GarageService update
   */
  export type GarageServiceUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GarageService
     */
    select?: GarageServiceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GarageServiceInclude<ExtArgs> | null
    /**
     * The data needed to update a GarageService.
     */
    data: XOR<GarageServiceUpdateInput, GarageServiceUncheckedUpdateInput>
    /**
     * Choose, which GarageService to update.
     */
    where: GarageServiceWhereUniqueInput
  }

  /**
   * GarageService updateMany
   */
  export type GarageServiceUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update GarageServices.
     */
    data: XOR<GarageServiceUpdateManyMutationInput, GarageServiceUncheckedUpdateManyInput>
    /**
     * Filter which GarageServices to update
     */
    where?: GarageServiceWhereInput
  }

  /**
   * GarageService upsert
   */
  export type GarageServiceUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GarageService
     */
    select?: GarageServiceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GarageServiceInclude<ExtArgs> | null
    /**
     * The filter to search for the GarageService to update in case it exists.
     */
    where: GarageServiceWhereUniqueInput
    /**
     * In case the GarageService found by the `where` argument doesn't exist, create a new GarageService with this data.
     */
    create: XOR<GarageServiceCreateInput, GarageServiceUncheckedCreateInput>
    /**
     * In case the GarageService was found with the provided `where` argument, update it with this data.
     */
    update: XOR<GarageServiceUpdateInput, GarageServiceUncheckedUpdateInput>
  }

  /**
   * GarageService delete
   */
  export type GarageServiceDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GarageService
     */
    select?: GarageServiceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GarageServiceInclude<ExtArgs> | null
    /**
     * Filter which GarageService to delete.
     */
    where: GarageServiceWhereUniqueInput
  }

  /**
   * GarageService deleteMany
   */
  export type GarageServiceDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which GarageServices to delete
     */
    where?: GarageServiceWhereInput
  }

  /**
   * GarageService findRaw
   */
  export type GarageServiceFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The query predicate filter. If unspecified, then all documents in the collection will match the predicate. ${@link https://docs.mongodb.com/manual/reference/operator/query MongoDB Docs}.
     */
    filter?: InputJsonValue
    /**
     * Additional options to pass to the `find` command ${@link https://docs.mongodb.com/manual/reference/command/find/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * GarageService aggregateRaw
   */
  export type GarageServiceAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * An array of aggregation stages to process and transform the document stream via the aggregation pipeline. ${@link https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline MongoDB Docs}.
     */
    pipeline?: InputJsonValue[]
    /**
     * Additional options to pass to the `aggregate` command ${@link https://docs.mongodb.com/manual/reference/command/aggregate/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * GarageService.bookings
   */
  export type GarageService$bookingsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Booking
     */
    select?: BookingSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BookingInclude<ExtArgs> | null
    where?: BookingWhereInput
    orderBy?: BookingOrderByWithRelationInput | BookingOrderByWithRelationInput[]
    cursor?: BookingWhereUniqueInput
    take?: number
    skip?: number
    distinct?: BookingScalarFieldEnum | BookingScalarFieldEnum[]
  }

  /**
   * GarageService without action
   */
  export type GarageServiceDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GarageService
     */
    select?: GarageServiceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GarageServiceInclude<ExtArgs> | null
  }


  /**
   * Model TowTruck
   */

  export type AggregateTowTruck = {
    _count: TowTruckCountAggregateOutputType | null
    _avg: TowTruckAvgAggregateOutputType | null
    _sum: TowTruckSumAggregateOutputType | null
    _min: TowTruckMinAggregateOutputType | null
    _max: TowTruckMaxAggregateOutputType | null
  }

  export type TowTruckAvgAggregateOutputType = {
    year: number | null
  }

  export type TowTruckSumAggregateOutputType = {
    year: number | null
  }

  export type TowTruckMinAggregateOutputType = {
    id: string | null
    name: string | null
    driverName: string | null
    model: string | null
    make: string | null
    year: number | null
    plateNumber: string | null
    licenseNumber: string | null
    status: $Enums.VerificationStatus | null
    rejectionReason: string | null
    createdAt: Date | null
    updatedAt: Date | null
    ownerId: string | null
    stripeAccountId: string | null
  }

  export type TowTruckMaxAggregateOutputType = {
    id: string | null
    name: string | null
    driverName: string | null
    model: string | null
    make: string | null
    year: number | null
    plateNumber: string | null
    licenseNumber: string | null
    status: $Enums.VerificationStatus | null
    rejectionReason: string | null
    createdAt: Date | null
    updatedAt: Date | null
    ownerId: string | null
    stripeAccountId: string | null
  }

  export type TowTruckCountAggregateOutputType = {
    id: number
    name: number
    driverName: number
    model: number
    make: number
    year: number
    plateNumber: number
    licenseNumber: number
    status: number
    rejectionReason: number
    createdAt: number
    updatedAt: number
    ownerId: number
    stripeAccountId: number
    _all: number
  }


  export type TowTruckAvgAggregateInputType = {
    year?: true
  }

  export type TowTruckSumAggregateInputType = {
    year?: true
  }

  export type TowTruckMinAggregateInputType = {
    id?: true
    name?: true
    driverName?: true
    model?: true
    make?: true
    year?: true
    plateNumber?: true
    licenseNumber?: true
    status?: true
    rejectionReason?: true
    createdAt?: true
    updatedAt?: true
    ownerId?: true
    stripeAccountId?: true
  }

  export type TowTruckMaxAggregateInputType = {
    id?: true
    name?: true
    driverName?: true
    model?: true
    make?: true
    year?: true
    plateNumber?: true
    licenseNumber?: true
    status?: true
    rejectionReason?: true
    createdAt?: true
    updatedAt?: true
    ownerId?: true
    stripeAccountId?: true
  }

  export type TowTruckCountAggregateInputType = {
    id?: true
    name?: true
    driverName?: true
    model?: true
    make?: true
    year?: true
    plateNumber?: true
    licenseNumber?: true
    status?: true
    rejectionReason?: true
    createdAt?: true
    updatedAt?: true
    ownerId?: true
    stripeAccountId?: true
    _all?: true
  }

  export type TowTruckAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TowTruck to aggregate.
     */
    where?: TowTruckWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TowTrucks to fetch.
     */
    orderBy?: TowTruckOrderByWithRelationInput | TowTruckOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TowTruckWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TowTrucks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TowTrucks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned TowTrucks
    **/
    _count?: true | TowTruckCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: TowTruckAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: TowTruckSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TowTruckMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TowTruckMaxAggregateInputType
  }

  export type GetTowTruckAggregateType<T extends TowTruckAggregateArgs> = {
        [P in keyof T & keyof AggregateTowTruck]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTowTruck[P]>
      : GetScalarType<T[P], AggregateTowTruck[P]>
  }




  export type TowTruckGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TowTruckWhereInput
    orderBy?: TowTruckOrderByWithAggregationInput | TowTruckOrderByWithAggregationInput[]
    by: TowTruckScalarFieldEnum[] | TowTruckScalarFieldEnum
    having?: TowTruckScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TowTruckCountAggregateInputType | true
    _avg?: TowTruckAvgAggregateInputType
    _sum?: TowTruckSumAggregateInputType
    _min?: TowTruckMinAggregateInputType
    _max?: TowTruckMaxAggregateInputType
  }

  export type TowTruckGroupByOutputType = {
    id: string
    name: string
    driverName: string
    model: string
    make: string
    year: number
    plateNumber: string
    licenseNumber: string
    status: $Enums.VerificationStatus
    rejectionReason: string | null
    createdAt: Date
    updatedAt: Date
    ownerId: string
    stripeAccountId: string | null
    _count: TowTruckCountAggregateOutputType | null
    _avg: TowTruckAvgAggregateOutputType | null
    _sum: TowTruckSumAggregateOutputType | null
    _min: TowTruckMinAggregateOutputType | null
    _max: TowTruckMaxAggregateOutputType | null
  }

  type GetTowTruckGroupByPayload<T extends TowTruckGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TowTruckGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TowTruckGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TowTruckGroupByOutputType[P]>
            : GetScalarType<T[P], TowTruckGroupByOutputType[P]>
        }
      >
    >


  export type TowTruckSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    driverName?: boolean
    model?: boolean
    make?: boolean
    year?: boolean
    plateNumber?: boolean
    licenseNumber?: boolean
    status?: boolean
    rejectionReason?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    ownerId?: boolean
    stripeAccountId?: boolean
    owner?: boolean | UserDefaultArgs<ExtArgs>
    services?: boolean | TowTruck$servicesArgs<ExtArgs>
    bookings?: boolean | TowTruck$bookingsArgs<ExtArgs>
    liveLocation?: boolean | TowTruck$liveLocationArgs<ExtArgs>
    _count?: boolean | TowTruckCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["towTruck"]>


  export type TowTruckSelectScalar = {
    id?: boolean
    name?: boolean
    driverName?: boolean
    model?: boolean
    make?: boolean
    year?: boolean
    plateNumber?: boolean
    licenseNumber?: boolean
    status?: boolean
    rejectionReason?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    ownerId?: boolean
    stripeAccountId?: boolean
  }

  export type TowTruckInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    owner?: boolean | UserDefaultArgs<ExtArgs>
    services?: boolean | TowTruck$servicesArgs<ExtArgs>
    bookings?: boolean | TowTruck$bookingsArgs<ExtArgs>
    liveLocation?: boolean | TowTruck$liveLocationArgs<ExtArgs>
    _count?: boolean | TowTruckCountOutputTypeDefaultArgs<ExtArgs>
  }

  export type $TowTruckPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "TowTruck"
    objects: {
      owner: Prisma.$UserPayload<ExtArgs>
      services: Prisma.$TowTruckServicePayload<ExtArgs>[]
      bookings: Prisma.$BookingPayload<ExtArgs>[]
      liveLocation: Prisma.$LiveTruckLocationPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      driverName: string
      model: string
      make: string
      year: number
      plateNumber: string
      licenseNumber: string
      status: $Enums.VerificationStatus
      rejectionReason: string | null
      createdAt: Date
      updatedAt: Date
      ownerId: string
      stripeAccountId: string | null
    }, ExtArgs["result"]["towTruck"]>
    composites: {}
  }

  type TowTruckGetPayload<S extends boolean | null | undefined | TowTruckDefaultArgs> = $Result.GetResult<Prisma.$TowTruckPayload, S>

  type TowTruckCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<TowTruckFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: TowTruckCountAggregateInputType | true
    }

  export interface TowTruckDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['TowTruck'], meta: { name: 'TowTruck' } }
    /**
     * Find zero or one TowTruck that matches the filter.
     * @param {TowTruckFindUniqueArgs} args - Arguments to find a TowTruck
     * @example
     * // Get one TowTruck
     * const towTruck = await prisma.towTruck.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TowTruckFindUniqueArgs>(args: SelectSubset<T, TowTruckFindUniqueArgs<ExtArgs>>): Prisma__TowTruckClient<$Result.GetResult<Prisma.$TowTruckPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one TowTruck that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {TowTruckFindUniqueOrThrowArgs} args - Arguments to find a TowTruck
     * @example
     * // Get one TowTruck
     * const towTruck = await prisma.towTruck.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TowTruckFindUniqueOrThrowArgs>(args: SelectSubset<T, TowTruckFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TowTruckClient<$Result.GetResult<Prisma.$TowTruckPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first TowTruck that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TowTruckFindFirstArgs} args - Arguments to find a TowTruck
     * @example
     * // Get one TowTruck
     * const towTruck = await prisma.towTruck.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TowTruckFindFirstArgs>(args?: SelectSubset<T, TowTruckFindFirstArgs<ExtArgs>>): Prisma__TowTruckClient<$Result.GetResult<Prisma.$TowTruckPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first TowTruck that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TowTruckFindFirstOrThrowArgs} args - Arguments to find a TowTruck
     * @example
     * // Get one TowTruck
     * const towTruck = await prisma.towTruck.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TowTruckFindFirstOrThrowArgs>(args?: SelectSubset<T, TowTruckFindFirstOrThrowArgs<ExtArgs>>): Prisma__TowTruckClient<$Result.GetResult<Prisma.$TowTruckPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more TowTrucks that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TowTruckFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all TowTrucks
     * const towTrucks = await prisma.towTruck.findMany()
     * 
     * // Get first 10 TowTrucks
     * const towTrucks = await prisma.towTruck.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const towTruckWithIdOnly = await prisma.towTruck.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TowTruckFindManyArgs>(args?: SelectSubset<T, TowTruckFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TowTruckPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a TowTruck.
     * @param {TowTruckCreateArgs} args - Arguments to create a TowTruck.
     * @example
     * // Create one TowTruck
     * const TowTruck = await prisma.towTruck.create({
     *   data: {
     *     // ... data to create a TowTruck
     *   }
     * })
     * 
     */
    create<T extends TowTruckCreateArgs>(args: SelectSubset<T, TowTruckCreateArgs<ExtArgs>>): Prisma__TowTruckClient<$Result.GetResult<Prisma.$TowTruckPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many TowTrucks.
     * @param {TowTruckCreateManyArgs} args - Arguments to create many TowTrucks.
     * @example
     * // Create many TowTrucks
     * const towTruck = await prisma.towTruck.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TowTruckCreateManyArgs>(args?: SelectSubset<T, TowTruckCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a TowTruck.
     * @param {TowTruckDeleteArgs} args - Arguments to delete one TowTruck.
     * @example
     * // Delete one TowTruck
     * const TowTruck = await prisma.towTruck.delete({
     *   where: {
     *     // ... filter to delete one TowTruck
     *   }
     * })
     * 
     */
    delete<T extends TowTruckDeleteArgs>(args: SelectSubset<T, TowTruckDeleteArgs<ExtArgs>>): Prisma__TowTruckClient<$Result.GetResult<Prisma.$TowTruckPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one TowTruck.
     * @param {TowTruckUpdateArgs} args - Arguments to update one TowTruck.
     * @example
     * // Update one TowTruck
     * const towTruck = await prisma.towTruck.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TowTruckUpdateArgs>(args: SelectSubset<T, TowTruckUpdateArgs<ExtArgs>>): Prisma__TowTruckClient<$Result.GetResult<Prisma.$TowTruckPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more TowTrucks.
     * @param {TowTruckDeleteManyArgs} args - Arguments to filter TowTrucks to delete.
     * @example
     * // Delete a few TowTrucks
     * const { count } = await prisma.towTruck.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TowTruckDeleteManyArgs>(args?: SelectSubset<T, TowTruckDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TowTrucks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TowTruckUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many TowTrucks
     * const towTruck = await prisma.towTruck.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TowTruckUpdateManyArgs>(args: SelectSubset<T, TowTruckUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one TowTruck.
     * @param {TowTruckUpsertArgs} args - Arguments to update or create a TowTruck.
     * @example
     * // Update or create a TowTruck
     * const towTruck = await prisma.towTruck.upsert({
     *   create: {
     *     // ... data to create a TowTruck
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the TowTruck we want to update
     *   }
     * })
     */
    upsert<T extends TowTruckUpsertArgs>(args: SelectSubset<T, TowTruckUpsertArgs<ExtArgs>>): Prisma__TowTruckClient<$Result.GetResult<Prisma.$TowTruckPayload<ExtArgs>, T, "upsert">, never, ExtArgs>

    /**
     * Find zero or more TowTrucks that matches the filter.
     * @param {TowTruckFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const towTruck = await prisma.towTruck.findRaw({
     *   filter: { age: { $gt: 25 } } 
     * })
     */
    findRaw(args?: TowTruckFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a TowTruck.
     * @param {TowTruckAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const towTruck = await prisma.towTruck.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: TowTruckAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


    /**
     * Count the number of TowTrucks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TowTruckCountArgs} args - Arguments to filter TowTrucks to count.
     * @example
     * // Count the number of TowTrucks
     * const count = await prisma.towTruck.count({
     *   where: {
     *     // ... the filter for the TowTrucks we want to count
     *   }
     * })
    **/
    count<T extends TowTruckCountArgs>(
      args?: Subset<T, TowTruckCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TowTruckCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a TowTruck.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TowTruckAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TowTruckAggregateArgs>(args: Subset<T, TowTruckAggregateArgs>): Prisma.PrismaPromise<GetTowTruckAggregateType<T>>

    /**
     * Group by TowTruck.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TowTruckGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TowTruckGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TowTruckGroupByArgs['orderBy'] }
        : { orderBy?: TowTruckGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TowTruckGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTowTruckGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the TowTruck model
   */
  readonly fields: TowTruckFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for TowTruck.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TowTruckClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    owner<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    services<T extends TowTruck$servicesArgs<ExtArgs> = {}>(args?: Subset<T, TowTruck$servicesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TowTruckServicePayload<ExtArgs>, T, "findMany"> | Null>
    bookings<T extends TowTruck$bookingsArgs<ExtArgs> = {}>(args?: Subset<T, TowTruck$bookingsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BookingPayload<ExtArgs>, T, "findMany"> | Null>
    liveLocation<T extends TowTruck$liveLocationArgs<ExtArgs> = {}>(args?: Subset<T, TowTruck$liveLocationArgs<ExtArgs>>): Prisma__LiveTruckLocationClient<$Result.GetResult<Prisma.$LiveTruckLocationPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the TowTruck model
   */ 
  interface TowTruckFieldRefs {
    readonly id: FieldRef<"TowTruck", 'String'>
    readonly name: FieldRef<"TowTruck", 'String'>
    readonly driverName: FieldRef<"TowTruck", 'String'>
    readonly model: FieldRef<"TowTruck", 'String'>
    readonly make: FieldRef<"TowTruck", 'String'>
    readonly year: FieldRef<"TowTruck", 'Int'>
    readonly plateNumber: FieldRef<"TowTruck", 'String'>
    readonly licenseNumber: FieldRef<"TowTruck", 'String'>
    readonly status: FieldRef<"TowTruck", 'VerificationStatus'>
    readonly rejectionReason: FieldRef<"TowTruck", 'String'>
    readonly createdAt: FieldRef<"TowTruck", 'DateTime'>
    readonly updatedAt: FieldRef<"TowTruck", 'DateTime'>
    readonly ownerId: FieldRef<"TowTruck", 'String'>
    readonly stripeAccountId: FieldRef<"TowTruck", 'String'>
  }
    

  // Custom InputTypes
  /**
   * TowTruck findUnique
   */
  export type TowTruckFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TowTruck
     */
    select?: TowTruckSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TowTruckInclude<ExtArgs> | null
    /**
     * Filter, which TowTruck to fetch.
     */
    where: TowTruckWhereUniqueInput
  }

  /**
   * TowTruck findUniqueOrThrow
   */
  export type TowTruckFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TowTruck
     */
    select?: TowTruckSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TowTruckInclude<ExtArgs> | null
    /**
     * Filter, which TowTruck to fetch.
     */
    where: TowTruckWhereUniqueInput
  }

  /**
   * TowTruck findFirst
   */
  export type TowTruckFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TowTruck
     */
    select?: TowTruckSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TowTruckInclude<ExtArgs> | null
    /**
     * Filter, which TowTruck to fetch.
     */
    where?: TowTruckWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TowTrucks to fetch.
     */
    orderBy?: TowTruckOrderByWithRelationInput | TowTruckOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TowTrucks.
     */
    cursor?: TowTruckWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TowTrucks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TowTrucks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TowTrucks.
     */
    distinct?: TowTruckScalarFieldEnum | TowTruckScalarFieldEnum[]
  }

  /**
   * TowTruck findFirstOrThrow
   */
  export type TowTruckFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TowTruck
     */
    select?: TowTruckSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TowTruckInclude<ExtArgs> | null
    /**
     * Filter, which TowTruck to fetch.
     */
    where?: TowTruckWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TowTrucks to fetch.
     */
    orderBy?: TowTruckOrderByWithRelationInput | TowTruckOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TowTrucks.
     */
    cursor?: TowTruckWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TowTrucks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TowTrucks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TowTrucks.
     */
    distinct?: TowTruckScalarFieldEnum | TowTruckScalarFieldEnum[]
  }

  /**
   * TowTruck findMany
   */
  export type TowTruckFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TowTruck
     */
    select?: TowTruckSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TowTruckInclude<ExtArgs> | null
    /**
     * Filter, which TowTrucks to fetch.
     */
    where?: TowTruckWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TowTrucks to fetch.
     */
    orderBy?: TowTruckOrderByWithRelationInput | TowTruckOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing TowTrucks.
     */
    cursor?: TowTruckWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TowTrucks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TowTrucks.
     */
    skip?: number
    distinct?: TowTruckScalarFieldEnum | TowTruckScalarFieldEnum[]
  }

  /**
   * TowTruck create
   */
  export type TowTruckCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TowTruck
     */
    select?: TowTruckSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TowTruckInclude<ExtArgs> | null
    /**
     * The data needed to create a TowTruck.
     */
    data: XOR<TowTruckCreateInput, TowTruckUncheckedCreateInput>
  }

  /**
   * TowTruck createMany
   */
  export type TowTruckCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many TowTrucks.
     */
    data: TowTruckCreateManyInput | TowTruckCreateManyInput[]
  }

  /**
   * TowTruck update
   */
  export type TowTruckUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TowTruck
     */
    select?: TowTruckSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TowTruckInclude<ExtArgs> | null
    /**
     * The data needed to update a TowTruck.
     */
    data: XOR<TowTruckUpdateInput, TowTruckUncheckedUpdateInput>
    /**
     * Choose, which TowTruck to update.
     */
    where: TowTruckWhereUniqueInput
  }

  /**
   * TowTruck updateMany
   */
  export type TowTruckUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update TowTrucks.
     */
    data: XOR<TowTruckUpdateManyMutationInput, TowTruckUncheckedUpdateManyInput>
    /**
     * Filter which TowTrucks to update
     */
    where?: TowTruckWhereInput
  }

  /**
   * TowTruck upsert
   */
  export type TowTruckUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TowTruck
     */
    select?: TowTruckSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TowTruckInclude<ExtArgs> | null
    /**
     * The filter to search for the TowTruck to update in case it exists.
     */
    where: TowTruckWhereUniqueInput
    /**
     * In case the TowTruck found by the `where` argument doesn't exist, create a new TowTruck with this data.
     */
    create: XOR<TowTruckCreateInput, TowTruckUncheckedCreateInput>
    /**
     * In case the TowTruck was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TowTruckUpdateInput, TowTruckUncheckedUpdateInput>
  }

  /**
   * TowTruck delete
   */
  export type TowTruckDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TowTruck
     */
    select?: TowTruckSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TowTruckInclude<ExtArgs> | null
    /**
     * Filter which TowTruck to delete.
     */
    where: TowTruckWhereUniqueInput
  }

  /**
   * TowTruck deleteMany
   */
  export type TowTruckDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TowTrucks to delete
     */
    where?: TowTruckWhereInput
  }

  /**
   * TowTruck findRaw
   */
  export type TowTruckFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The query predicate filter. If unspecified, then all documents in the collection will match the predicate. ${@link https://docs.mongodb.com/manual/reference/operator/query MongoDB Docs}.
     */
    filter?: InputJsonValue
    /**
     * Additional options to pass to the `find` command ${@link https://docs.mongodb.com/manual/reference/command/find/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * TowTruck aggregateRaw
   */
  export type TowTruckAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * An array of aggregation stages to process and transform the document stream via the aggregation pipeline. ${@link https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline MongoDB Docs}.
     */
    pipeline?: InputJsonValue[]
    /**
     * Additional options to pass to the `aggregate` command ${@link https://docs.mongodb.com/manual/reference/command/aggregate/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * TowTruck.services
   */
  export type TowTruck$servicesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TowTruckService
     */
    select?: TowTruckServiceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TowTruckServiceInclude<ExtArgs> | null
    where?: TowTruckServiceWhereInput
    orderBy?: TowTruckServiceOrderByWithRelationInput | TowTruckServiceOrderByWithRelationInput[]
    cursor?: TowTruckServiceWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TowTruckServiceScalarFieldEnum | TowTruckServiceScalarFieldEnum[]
  }

  /**
   * TowTruck.bookings
   */
  export type TowTruck$bookingsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Booking
     */
    select?: BookingSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BookingInclude<ExtArgs> | null
    where?: BookingWhereInput
    orderBy?: BookingOrderByWithRelationInput | BookingOrderByWithRelationInput[]
    cursor?: BookingWhereUniqueInput
    take?: number
    skip?: number
    distinct?: BookingScalarFieldEnum | BookingScalarFieldEnum[]
  }

  /**
   * TowTruck.liveLocation
   */
  export type TowTruck$liveLocationArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LiveTruckLocation
     */
    select?: LiveTruckLocationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LiveTruckLocationInclude<ExtArgs> | null
    where?: LiveTruckLocationWhereInput
  }

  /**
   * TowTruck without action
   */
  export type TowTruckDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TowTruck
     */
    select?: TowTruckSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TowTruckInclude<ExtArgs> | null
  }


  /**
   * Model TowTruckService
   */

  export type AggregateTowTruckService = {
    _count: TowTruckServiceCountAggregateOutputType | null
    _avg: TowTruckServiceAvgAggregateOutputType | null
    _sum: TowTruckServiceSumAggregateOutputType | null
    _min: TowTruckServiceMinAggregateOutputType | null
    _max: TowTruckServiceMaxAggregateOutputType | null
  }

  export type TowTruckServiceAvgAggregateOutputType = {
    price: number | null
  }

  export type TowTruckServiceSumAggregateOutputType = {
    price: number | null
  }

  export type TowTruckServiceMinAggregateOutputType = {
    id: string | null
    price: number | null
    vehicleType: $Enums.VehicleType | null
    towTruckId: string | null
  }

  export type TowTruckServiceMaxAggregateOutputType = {
    id: string | null
    price: number | null
    vehicleType: $Enums.VehicleType | null
    towTruckId: string | null
  }

  export type TowTruckServiceCountAggregateOutputType = {
    id: number
    price: number
    vehicleType: number
    towTruckId: number
    _all: number
  }


  export type TowTruckServiceAvgAggregateInputType = {
    price?: true
  }

  export type TowTruckServiceSumAggregateInputType = {
    price?: true
  }

  export type TowTruckServiceMinAggregateInputType = {
    id?: true
    price?: true
    vehicleType?: true
    towTruckId?: true
  }

  export type TowTruckServiceMaxAggregateInputType = {
    id?: true
    price?: true
    vehicleType?: true
    towTruckId?: true
  }

  export type TowTruckServiceCountAggregateInputType = {
    id?: true
    price?: true
    vehicleType?: true
    towTruckId?: true
    _all?: true
  }

  export type TowTruckServiceAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TowTruckService to aggregate.
     */
    where?: TowTruckServiceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TowTruckServices to fetch.
     */
    orderBy?: TowTruckServiceOrderByWithRelationInput | TowTruckServiceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TowTruckServiceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TowTruckServices from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TowTruckServices.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned TowTruckServices
    **/
    _count?: true | TowTruckServiceCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: TowTruckServiceAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: TowTruckServiceSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TowTruckServiceMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TowTruckServiceMaxAggregateInputType
  }

  export type GetTowTruckServiceAggregateType<T extends TowTruckServiceAggregateArgs> = {
        [P in keyof T & keyof AggregateTowTruckService]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTowTruckService[P]>
      : GetScalarType<T[P], AggregateTowTruckService[P]>
  }




  export type TowTruckServiceGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TowTruckServiceWhereInput
    orderBy?: TowTruckServiceOrderByWithAggregationInput | TowTruckServiceOrderByWithAggregationInput[]
    by: TowTruckServiceScalarFieldEnum[] | TowTruckServiceScalarFieldEnum
    having?: TowTruckServiceScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TowTruckServiceCountAggregateInputType | true
    _avg?: TowTruckServiceAvgAggregateInputType
    _sum?: TowTruckServiceSumAggregateInputType
    _min?: TowTruckServiceMinAggregateInputType
    _max?: TowTruckServiceMaxAggregateInputType
  }

  export type TowTruckServiceGroupByOutputType = {
    id: string
    price: number
    vehicleType: $Enums.VehicleType
    towTruckId: string
    _count: TowTruckServiceCountAggregateOutputType | null
    _avg: TowTruckServiceAvgAggregateOutputType | null
    _sum: TowTruckServiceSumAggregateOutputType | null
    _min: TowTruckServiceMinAggregateOutputType | null
    _max: TowTruckServiceMaxAggregateOutputType | null
  }

  type GetTowTruckServiceGroupByPayload<T extends TowTruckServiceGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TowTruckServiceGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TowTruckServiceGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TowTruckServiceGroupByOutputType[P]>
            : GetScalarType<T[P], TowTruckServiceGroupByOutputType[P]>
        }
      >
    >


  export type TowTruckServiceSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    price?: boolean
    vehicleType?: boolean
    towTruckId?: boolean
    towTruck?: boolean | TowTruckDefaultArgs<ExtArgs>
    bookings?: boolean | TowTruckService$bookingsArgs<ExtArgs>
    _count?: boolean | TowTruckServiceCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["towTruckService"]>


  export type TowTruckServiceSelectScalar = {
    id?: boolean
    price?: boolean
    vehicleType?: boolean
    towTruckId?: boolean
  }

  export type TowTruckServiceInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    towTruck?: boolean | TowTruckDefaultArgs<ExtArgs>
    bookings?: boolean | TowTruckService$bookingsArgs<ExtArgs>
    _count?: boolean | TowTruckServiceCountOutputTypeDefaultArgs<ExtArgs>
  }

  export type $TowTruckServicePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "TowTruckService"
    objects: {
      towTruck: Prisma.$TowTruckPayload<ExtArgs>
      bookings: Prisma.$BookingPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      price: number
      vehicleType: $Enums.VehicleType
      towTruckId: string
    }, ExtArgs["result"]["towTruckService"]>
    composites: {}
  }

  type TowTruckServiceGetPayload<S extends boolean | null | undefined | TowTruckServiceDefaultArgs> = $Result.GetResult<Prisma.$TowTruckServicePayload, S>

  type TowTruckServiceCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<TowTruckServiceFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: TowTruckServiceCountAggregateInputType | true
    }

  export interface TowTruckServiceDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['TowTruckService'], meta: { name: 'TowTruckService' } }
    /**
     * Find zero or one TowTruckService that matches the filter.
     * @param {TowTruckServiceFindUniqueArgs} args - Arguments to find a TowTruckService
     * @example
     * // Get one TowTruckService
     * const towTruckService = await prisma.towTruckService.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TowTruckServiceFindUniqueArgs>(args: SelectSubset<T, TowTruckServiceFindUniqueArgs<ExtArgs>>): Prisma__TowTruckServiceClient<$Result.GetResult<Prisma.$TowTruckServicePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one TowTruckService that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {TowTruckServiceFindUniqueOrThrowArgs} args - Arguments to find a TowTruckService
     * @example
     * // Get one TowTruckService
     * const towTruckService = await prisma.towTruckService.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TowTruckServiceFindUniqueOrThrowArgs>(args: SelectSubset<T, TowTruckServiceFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TowTruckServiceClient<$Result.GetResult<Prisma.$TowTruckServicePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first TowTruckService that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TowTruckServiceFindFirstArgs} args - Arguments to find a TowTruckService
     * @example
     * // Get one TowTruckService
     * const towTruckService = await prisma.towTruckService.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TowTruckServiceFindFirstArgs>(args?: SelectSubset<T, TowTruckServiceFindFirstArgs<ExtArgs>>): Prisma__TowTruckServiceClient<$Result.GetResult<Prisma.$TowTruckServicePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first TowTruckService that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TowTruckServiceFindFirstOrThrowArgs} args - Arguments to find a TowTruckService
     * @example
     * // Get one TowTruckService
     * const towTruckService = await prisma.towTruckService.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TowTruckServiceFindFirstOrThrowArgs>(args?: SelectSubset<T, TowTruckServiceFindFirstOrThrowArgs<ExtArgs>>): Prisma__TowTruckServiceClient<$Result.GetResult<Prisma.$TowTruckServicePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more TowTruckServices that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TowTruckServiceFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all TowTruckServices
     * const towTruckServices = await prisma.towTruckService.findMany()
     * 
     * // Get first 10 TowTruckServices
     * const towTruckServices = await prisma.towTruckService.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const towTruckServiceWithIdOnly = await prisma.towTruckService.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TowTruckServiceFindManyArgs>(args?: SelectSubset<T, TowTruckServiceFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TowTruckServicePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a TowTruckService.
     * @param {TowTruckServiceCreateArgs} args - Arguments to create a TowTruckService.
     * @example
     * // Create one TowTruckService
     * const TowTruckService = await prisma.towTruckService.create({
     *   data: {
     *     // ... data to create a TowTruckService
     *   }
     * })
     * 
     */
    create<T extends TowTruckServiceCreateArgs>(args: SelectSubset<T, TowTruckServiceCreateArgs<ExtArgs>>): Prisma__TowTruckServiceClient<$Result.GetResult<Prisma.$TowTruckServicePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many TowTruckServices.
     * @param {TowTruckServiceCreateManyArgs} args - Arguments to create many TowTruckServices.
     * @example
     * // Create many TowTruckServices
     * const towTruckService = await prisma.towTruckService.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TowTruckServiceCreateManyArgs>(args?: SelectSubset<T, TowTruckServiceCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a TowTruckService.
     * @param {TowTruckServiceDeleteArgs} args - Arguments to delete one TowTruckService.
     * @example
     * // Delete one TowTruckService
     * const TowTruckService = await prisma.towTruckService.delete({
     *   where: {
     *     // ... filter to delete one TowTruckService
     *   }
     * })
     * 
     */
    delete<T extends TowTruckServiceDeleteArgs>(args: SelectSubset<T, TowTruckServiceDeleteArgs<ExtArgs>>): Prisma__TowTruckServiceClient<$Result.GetResult<Prisma.$TowTruckServicePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one TowTruckService.
     * @param {TowTruckServiceUpdateArgs} args - Arguments to update one TowTruckService.
     * @example
     * // Update one TowTruckService
     * const towTruckService = await prisma.towTruckService.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TowTruckServiceUpdateArgs>(args: SelectSubset<T, TowTruckServiceUpdateArgs<ExtArgs>>): Prisma__TowTruckServiceClient<$Result.GetResult<Prisma.$TowTruckServicePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more TowTruckServices.
     * @param {TowTruckServiceDeleteManyArgs} args - Arguments to filter TowTruckServices to delete.
     * @example
     * // Delete a few TowTruckServices
     * const { count } = await prisma.towTruckService.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TowTruckServiceDeleteManyArgs>(args?: SelectSubset<T, TowTruckServiceDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TowTruckServices.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TowTruckServiceUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many TowTruckServices
     * const towTruckService = await prisma.towTruckService.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TowTruckServiceUpdateManyArgs>(args: SelectSubset<T, TowTruckServiceUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one TowTruckService.
     * @param {TowTruckServiceUpsertArgs} args - Arguments to update or create a TowTruckService.
     * @example
     * // Update or create a TowTruckService
     * const towTruckService = await prisma.towTruckService.upsert({
     *   create: {
     *     // ... data to create a TowTruckService
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the TowTruckService we want to update
     *   }
     * })
     */
    upsert<T extends TowTruckServiceUpsertArgs>(args: SelectSubset<T, TowTruckServiceUpsertArgs<ExtArgs>>): Prisma__TowTruckServiceClient<$Result.GetResult<Prisma.$TowTruckServicePayload<ExtArgs>, T, "upsert">, never, ExtArgs>

    /**
     * Find zero or more TowTruckServices that matches the filter.
     * @param {TowTruckServiceFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const towTruckService = await prisma.towTruckService.findRaw({
     *   filter: { age: { $gt: 25 } } 
     * })
     */
    findRaw(args?: TowTruckServiceFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a TowTruckService.
     * @param {TowTruckServiceAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const towTruckService = await prisma.towTruckService.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: TowTruckServiceAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


    /**
     * Count the number of TowTruckServices.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TowTruckServiceCountArgs} args - Arguments to filter TowTruckServices to count.
     * @example
     * // Count the number of TowTruckServices
     * const count = await prisma.towTruckService.count({
     *   where: {
     *     // ... the filter for the TowTruckServices we want to count
     *   }
     * })
    **/
    count<T extends TowTruckServiceCountArgs>(
      args?: Subset<T, TowTruckServiceCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TowTruckServiceCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a TowTruckService.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TowTruckServiceAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TowTruckServiceAggregateArgs>(args: Subset<T, TowTruckServiceAggregateArgs>): Prisma.PrismaPromise<GetTowTruckServiceAggregateType<T>>

    /**
     * Group by TowTruckService.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TowTruckServiceGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TowTruckServiceGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TowTruckServiceGroupByArgs['orderBy'] }
        : { orderBy?: TowTruckServiceGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TowTruckServiceGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTowTruckServiceGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the TowTruckService model
   */
  readonly fields: TowTruckServiceFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for TowTruckService.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TowTruckServiceClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    towTruck<T extends TowTruckDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TowTruckDefaultArgs<ExtArgs>>): Prisma__TowTruckClient<$Result.GetResult<Prisma.$TowTruckPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    bookings<T extends TowTruckService$bookingsArgs<ExtArgs> = {}>(args?: Subset<T, TowTruckService$bookingsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BookingPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the TowTruckService model
   */ 
  interface TowTruckServiceFieldRefs {
    readonly id: FieldRef<"TowTruckService", 'String'>
    readonly price: FieldRef<"TowTruckService", 'Float'>
    readonly vehicleType: FieldRef<"TowTruckService", 'VehicleType'>
    readonly towTruckId: FieldRef<"TowTruckService", 'String'>
  }
    

  // Custom InputTypes
  /**
   * TowTruckService findUnique
   */
  export type TowTruckServiceFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TowTruckService
     */
    select?: TowTruckServiceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TowTruckServiceInclude<ExtArgs> | null
    /**
     * Filter, which TowTruckService to fetch.
     */
    where: TowTruckServiceWhereUniqueInput
  }

  /**
   * TowTruckService findUniqueOrThrow
   */
  export type TowTruckServiceFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TowTruckService
     */
    select?: TowTruckServiceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TowTruckServiceInclude<ExtArgs> | null
    /**
     * Filter, which TowTruckService to fetch.
     */
    where: TowTruckServiceWhereUniqueInput
  }

  /**
   * TowTruckService findFirst
   */
  export type TowTruckServiceFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TowTruckService
     */
    select?: TowTruckServiceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TowTruckServiceInclude<ExtArgs> | null
    /**
     * Filter, which TowTruckService to fetch.
     */
    where?: TowTruckServiceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TowTruckServices to fetch.
     */
    orderBy?: TowTruckServiceOrderByWithRelationInput | TowTruckServiceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TowTruckServices.
     */
    cursor?: TowTruckServiceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TowTruckServices from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TowTruckServices.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TowTruckServices.
     */
    distinct?: TowTruckServiceScalarFieldEnum | TowTruckServiceScalarFieldEnum[]
  }

  /**
   * TowTruckService findFirstOrThrow
   */
  export type TowTruckServiceFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TowTruckService
     */
    select?: TowTruckServiceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TowTruckServiceInclude<ExtArgs> | null
    /**
     * Filter, which TowTruckService to fetch.
     */
    where?: TowTruckServiceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TowTruckServices to fetch.
     */
    orderBy?: TowTruckServiceOrderByWithRelationInput | TowTruckServiceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TowTruckServices.
     */
    cursor?: TowTruckServiceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TowTruckServices from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TowTruckServices.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TowTruckServices.
     */
    distinct?: TowTruckServiceScalarFieldEnum | TowTruckServiceScalarFieldEnum[]
  }

  /**
   * TowTruckService findMany
   */
  export type TowTruckServiceFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TowTruckService
     */
    select?: TowTruckServiceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TowTruckServiceInclude<ExtArgs> | null
    /**
     * Filter, which TowTruckServices to fetch.
     */
    where?: TowTruckServiceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TowTruckServices to fetch.
     */
    orderBy?: TowTruckServiceOrderByWithRelationInput | TowTruckServiceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing TowTruckServices.
     */
    cursor?: TowTruckServiceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TowTruckServices from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TowTruckServices.
     */
    skip?: number
    distinct?: TowTruckServiceScalarFieldEnum | TowTruckServiceScalarFieldEnum[]
  }

  /**
   * TowTruckService create
   */
  export type TowTruckServiceCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TowTruckService
     */
    select?: TowTruckServiceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TowTruckServiceInclude<ExtArgs> | null
    /**
     * The data needed to create a TowTruckService.
     */
    data: XOR<TowTruckServiceCreateInput, TowTruckServiceUncheckedCreateInput>
  }

  /**
   * TowTruckService createMany
   */
  export type TowTruckServiceCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many TowTruckServices.
     */
    data: TowTruckServiceCreateManyInput | TowTruckServiceCreateManyInput[]
  }

  /**
   * TowTruckService update
   */
  export type TowTruckServiceUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TowTruckService
     */
    select?: TowTruckServiceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TowTruckServiceInclude<ExtArgs> | null
    /**
     * The data needed to update a TowTruckService.
     */
    data: XOR<TowTruckServiceUpdateInput, TowTruckServiceUncheckedUpdateInput>
    /**
     * Choose, which TowTruckService to update.
     */
    where: TowTruckServiceWhereUniqueInput
  }

  /**
   * TowTruckService updateMany
   */
  export type TowTruckServiceUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update TowTruckServices.
     */
    data: XOR<TowTruckServiceUpdateManyMutationInput, TowTruckServiceUncheckedUpdateManyInput>
    /**
     * Filter which TowTruckServices to update
     */
    where?: TowTruckServiceWhereInput
  }

  /**
   * TowTruckService upsert
   */
  export type TowTruckServiceUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TowTruckService
     */
    select?: TowTruckServiceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TowTruckServiceInclude<ExtArgs> | null
    /**
     * The filter to search for the TowTruckService to update in case it exists.
     */
    where: TowTruckServiceWhereUniqueInput
    /**
     * In case the TowTruckService found by the `where` argument doesn't exist, create a new TowTruckService with this data.
     */
    create: XOR<TowTruckServiceCreateInput, TowTruckServiceUncheckedCreateInput>
    /**
     * In case the TowTruckService was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TowTruckServiceUpdateInput, TowTruckServiceUncheckedUpdateInput>
  }

  /**
   * TowTruckService delete
   */
  export type TowTruckServiceDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TowTruckService
     */
    select?: TowTruckServiceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TowTruckServiceInclude<ExtArgs> | null
    /**
     * Filter which TowTruckService to delete.
     */
    where: TowTruckServiceWhereUniqueInput
  }

  /**
   * TowTruckService deleteMany
   */
  export type TowTruckServiceDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TowTruckServices to delete
     */
    where?: TowTruckServiceWhereInput
  }

  /**
   * TowTruckService findRaw
   */
  export type TowTruckServiceFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The query predicate filter. If unspecified, then all documents in the collection will match the predicate. ${@link https://docs.mongodb.com/manual/reference/operator/query MongoDB Docs}.
     */
    filter?: InputJsonValue
    /**
     * Additional options to pass to the `find` command ${@link https://docs.mongodb.com/manual/reference/command/find/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * TowTruckService aggregateRaw
   */
  export type TowTruckServiceAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * An array of aggregation stages to process and transform the document stream via the aggregation pipeline. ${@link https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline MongoDB Docs}.
     */
    pipeline?: InputJsonValue[]
    /**
     * Additional options to pass to the `aggregate` command ${@link https://docs.mongodb.com/manual/reference/command/aggregate/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * TowTruckService.bookings
   */
  export type TowTruckService$bookingsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Booking
     */
    select?: BookingSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BookingInclude<ExtArgs> | null
    where?: BookingWhereInput
    orderBy?: BookingOrderByWithRelationInput | BookingOrderByWithRelationInput[]
    cursor?: BookingWhereUniqueInput
    take?: number
    skip?: number
    distinct?: BookingScalarFieldEnum | BookingScalarFieldEnum[]
  }

  /**
   * TowTruckService without action
   */
  export type TowTruckServiceDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TowTruckService
     */
    select?: TowTruckServiceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TowTruckServiceInclude<ExtArgs> | null
  }


  /**
   * Model LiveTruckLocation
   */

  export type AggregateLiveTruckLocation = {
    _count: LiveTruckLocationCountAggregateOutputType | null
    _min: LiveTruckLocationMinAggregateOutputType | null
    _max: LiveTruckLocationMaxAggregateOutputType | null
  }

  export type LiveTruckLocationMinAggregateOutputType = {
    id: string | null
    lastUpdated: Date | null
    isAvailable: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
    towTruckId: string | null
  }

  export type LiveTruckLocationMaxAggregateOutputType = {
    id: string | null
    lastUpdated: Date | null
    isAvailable: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
    towTruckId: string | null
  }

  export type LiveTruckLocationCountAggregateOutputType = {
    id: number
    location: number
    lastUpdated: number
    isAvailable: number
    createdAt: number
    updatedAt: number
    towTruckId: number
    _all: number
  }


  export type LiveTruckLocationMinAggregateInputType = {
    id?: true
    lastUpdated?: true
    isAvailable?: true
    createdAt?: true
    updatedAt?: true
    towTruckId?: true
  }

  export type LiveTruckLocationMaxAggregateInputType = {
    id?: true
    lastUpdated?: true
    isAvailable?: true
    createdAt?: true
    updatedAt?: true
    towTruckId?: true
  }

  export type LiveTruckLocationCountAggregateInputType = {
    id?: true
    location?: true
    lastUpdated?: true
    isAvailable?: true
    createdAt?: true
    updatedAt?: true
    towTruckId?: true
    _all?: true
  }

  export type LiveTruckLocationAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which LiveTruckLocation to aggregate.
     */
    where?: LiveTruckLocationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LiveTruckLocations to fetch.
     */
    orderBy?: LiveTruckLocationOrderByWithRelationInput | LiveTruckLocationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: LiveTruckLocationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LiveTruckLocations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LiveTruckLocations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned LiveTruckLocations
    **/
    _count?: true | LiveTruckLocationCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: LiveTruckLocationMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: LiveTruckLocationMaxAggregateInputType
  }

  export type GetLiveTruckLocationAggregateType<T extends LiveTruckLocationAggregateArgs> = {
        [P in keyof T & keyof AggregateLiveTruckLocation]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateLiveTruckLocation[P]>
      : GetScalarType<T[P], AggregateLiveTruckLocation[P]>
  }




  export type LiveTruckLocationGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: LiveTruckLocationWhereInput
    orderBy?: LiveTruckLocationOrderByWithAggregationInput | LiveTruckLocationOrderByWithAggregationInput[]
    by: LiveTruckLocationScalarFieldEnum[] | LiveTruckLocationScalarFieldEnum
    having?: LiveTruckLocationScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: LiveTruckLocationCountAggregateInputType | true
    _min?: LiveTruckLocationMinAggregateInputType
    _max?: LiveTruckLocationMaxAggregateInputType
  }

  export type LiveTruckLocationGroupByOutputType = {
    id: string
    location: JsonValue
    lastUpdated: Date
    isAvailable: boolean
    createdAt: Date
    updatedAt: Date
    towTruckId: string
    _count: LiveTruckLocationCountAggregateOutputType | null
    _min: LiveTruckLocationMinAggregateOutputType | null
    _max: LiveTruckLocationMaxAggregateOutputType | null
  }

  type GetLiveTruckLocationGroupByPayload<T extends LiveTruckLocationGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<LiveTruckLocationGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof LiveTruckLocationGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], LiveTruckLocationGroupByOutputType[P]>
            : GetScalarType<T[P], LiveTruckLocationGroupByOutputType[P]>
        }
      >
    >


  export type LiveTruckLocationSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    location?: boolean
    lastUpdated?: boolean
    isAvailable?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    towTruckId?: boolean
    towTruck?: boolean | TowTruckDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["liveTruckLocation"]>


  export type LiveTruckLocationSelectScalar = {
    id?: boolean
    location?: boolean
    lastUpdated?: boolean
    isAvailable?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    towTruckId?: boolean
  }

  export type LiveTruckLocationInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    towTruck?: boolean | TowTruckDefaultArgs<ExtArgs>
  }

  export type $LiveTruckLocationPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "LiveTruckLocation"
    objects: {
      towTruck: Prisma.$TowTruckPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      location: Prisma.JsonValue
      lastUpdated: Date
      isAvailable: boolean
      createdAt: Date
      updatedAt: Date
      towTruckId: string
    }, ExtArgs["result"]["liveTruckLocation"]>
    composites: {}
  }

  type LiveTruckLocationGetPayload<S extends boolean | null | undefined | LiveTruckLocationDefaultArgs> = $Result.GetResult<Prisma.$LiveTruckLocationPayload, S>

  type LiveTruckLocationCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<LiveTruckLocationFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: LiveTruckLocationCountAggregateInputType | true
    }

  export interface LiveTruckLocationDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['LiveTruckLocation'], meta: { name: 'LiveTruckLocation' } }
    /**
     * Find zero or one LiveTruckLocation that matches the filter.
     * @param {LiveTruckLocationFindUniqueArgs} args - Arguments to find a LiveTruckLocation
     * @example
     * // Get one LiveTruckLocation
     * const liveTruckLocation = await prisma.liveTruckLocation.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends LiveTruckLocationFindUniqueArgs>(args: SelectSubset<T, LiveTruckLocationFindUniqueArgs<ExtArgs>>): Prisma__LiveTruckLocationClient<$Result.GetResult<Prisma.$LiveTruckLocationPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one LiveTruckLocation that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {LiveTruckLocationFindUniqueOrThrowArgs} args - Arguments to find a LiveTruckLocation
     * @example
     * // Get one LiveTruckLocation
     * const liveTruckLocation = await prisma.liveTruckLocation.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends LiveTruckLocationFindUniqueOrThrowArgs>(args: SelectSubset<T, LiveTruckLocationFindUniqueOrThrowArgs<ExtArgs>>): Prisma__LiveTruckLocationClient<$Result.GetResult<Prisma.$LiveTruckLocationPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first LiveTruckLocation that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LiveTruckLocationFindFirstArgs} args - Arguments to find a LiveTruckLocation
     * @example
     * // Get one LiveTruckLocation
     * const liveTruckLocation = await prisma.liveTruckLocation.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends LiveTruckLocationFindFirstArgs>(args?: SelectSubset<T, LiveTruckLocationFindFirstArgs<ExtArgs>>): Prisma__LiveTruckLocationClient<$Result.GetResult<Prisma.$LiveTruckLocationPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first LiveTruckLocation that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LiveTruckLocationFindFirstOrThrowArgs} args - Arguments to find a LiveTruckLocation
     * @example
     * // Get one LiveTruckLocation
     * const liveTruckLocation = await prisma.liveTruckLocation.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends LiveTruckLocationFindFirstOrThrowArgs>(args?: SelectSubset<T, LiveTruckLocationFindFirstOrThrowArgs<ExtArgs>>): Prisma__LiveTruckLocationClient<$Result.GetResult<Prisma.$LiveTruckLocationPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more LiveTruckLocations that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LiveTruckLocationFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all LiveTruckLocations
     * const liveTruckLocations = await prisma.liveTruckLocation.findMany()
     * 
     * // Get first 10 LiveTruckLocations
     * const liveTruckLocations = await prisma.liveTruckLocation.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const liveTruckLocationWithIdOnly = await prisma.liveTruckLocation.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends LiveTruckLocationFindManyArgs>(args?: SelectSubset<T, LiveTruckLocationFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LiveTruckLocationPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a LiveTruckLocation.
     * @param {LiveTruckLocationCreateArgs} args - Arguments to create a LiveTruckLocation.
     * @example
     * // Create one LiveTruckLocation
     * const LiveTruckLocation = await prisma.liveTruckLocation.create({
     *   data: {
     *     // ... data to create a LiveTruckLocation
     *   }
     * })
     * 
     */
    create<T extends LiveTruckLocationCreateArgs>(args: SelectSubset<T, LiveTruckLocationCreateArgs<ExtArgs>>): Prisma__LiveTruckLocationClient<$Result.GetResult<Prisma.$LiveTruckLocationPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many LiveTruckLocations.
     * @param {LiveTruckLocationCreateManyArgs} args - Arguments to create many LiveTruckLocations.
     * @example
     * // Create many LiveTruckLocations
     * const liveTruckLocation = await prisma.liveTruckLocation.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends LiveTruckLocationCreateManyArgs>(args?: SelectSubset<T, LiveTruckLocationCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a LiveTruckLocation.
     * @param {LiveTruckLocationDeleteArgs} args - Arguments to delete one LiveTruckLocation.
     * @example
     * // Delete one LiveTruckLocation
     * const LiveTruckLocation = await prisma.liveTruckLocation.delete({
     *   where: {
     *     // ... filter to delete one LiveTruckLocation
     *   }
     * })
     * 
     */
    delete<T extends LiveTruckLocationDeleteArgs>(args: SelectSubset<T, LiveTruckLocationDeleteArgs<ExtArgs>>): Prisma__LiveTruckLocationClient<$Result.GetResult<Prisma.$LiveTruckLocationPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one LiveTruckLocation.
     * @param {LiveTruckLocationUpdateArgs} args - Arguments to update one LiveTruckLocation.
     * @example
     * // Update one LiveTruckLocation
     * const liveTruckLocation = await prisma.liveTruckLocation.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends LiveTruckLocationUpdateArgs>(args: SelectSubset<T, LiveTruckLocationUpdateArgs<ExtArgs>>): Prisma__LiveTruckLocationClient<$Result.GetResult<Prisma.$LiveTruckLocationPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more LiveTruckLocations.
     * @param {LiveTruckLocationDeleteManyArgs} args - Arguments to filter LiveTruckLocations to delete.
     * @example
     * // Delete a few LiveTruckLocations
     * const { count } = await prisma.liveTruckLocation.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends LiveTruckLocationDeleteManyArgs>(args?: SelectSubset<T, LiveTruckLocationDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more LiveTruckLocations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LiveTruckLocationUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many LiveTruckLocations
     * const liveTruckLocation = await prisma.liveTruckLocation.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends LiveTruckLocationUpdateManyArgs>(args: SelectSubset<T, LiveTruckLocationUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one LiveTruckLocation.
     * @param {LiveTruckLocationUpsertArgs} args - Arguments to update or create a LiveTruckLocation.
     * @example
     * // Update or create a LiveTruckLocation
     * const liveTruckLocation = await prisma.liveTruckLocation.upsert({
     *   create: {
     *     // ... data to create a LiveTruckLocation
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the LiveTruckLocation we want to update
     *   }
     * })
     */
    upsert<T extends LiveTruckLocationUpsertArgs>(args: SelectSubset<T, LiveTruckLocationUpsertArgs<ExtArgs>>): Prisma__LiveTruckLocationClient<$Result.GetResult<Prisma.$LiveTruckLocationPayload<ExtArgs>, T, "upsert">, never, ExtArgs>

    /**
     * Find zero or more LiveTruckLocations that matches the filter.
     * @param {LiveTruckLocationFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const liveTruckLocation = await prisma.liveTruckLocation.findRaw({
     *   filter: { age: { $gt: 25 } } 
     * })
     */
    findRaw(args?: LiveTruckLocationFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a LiveTruckLocation.
     * @param {LiveTruckLocationAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const liveTruckLocation = await prisma.liveTruckLocation.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: LiveTruckLocationAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


    /**
     * Count the number of LiveTruckLocations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LiveTruckLocationCountArgs} args - Arguments to filter LiveTruckLocations to count.
     * @example
     * // Count the number of LiveTruckLocations
     * const count = await prisma.liveTruckLocation.count({
     *   where: {
     *     // ... the filter for the LiveTruckLocations we want to count
     *   }
     * })
    **/
    count<T extends LiveTruckLocationCountArgs>(
      args?: Subset<T, LiveTruckLocationCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], LiveTruckLocationCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a LiveTruckLocation.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LiveTruckLocationAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends LiveTruckLocationAggregateArgs>(args: Subset<T, LiveTruckLocationAggregateArgs>): Prisma.PrismaPromise<GetLiveTruckLocationAggregateType<T>>

    /**
     * Group by LiveTruckLocation.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LiveTruckLocationGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends LiveTruckLocationGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: LiveTruckLocationGroupByArgs['orderBy'] }
        : { orderBy?: LiveTruckLocationGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, LiveTruckLocationGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetLiveTruckLocationGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the LiveTruckLocation model
   */
  readonly fields: LiveTruckLocationFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for LiveTruckLocation.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__LiveTruckLocationClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    towTruck<T extends TowTruckDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TowTruckDefaultArgs<ExtArgs>>): Prisma__TowTruckClient<$Result.GetResult<Prisma.$TowTruckPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the LiveTruckLocation model
   */ 
  interface LiveTruckLocationFieldRefs {
    readonly id: FieldRef<"LiveTruckLocation", 'String'>
    readonly location: FieldRef<"LiveTruckLocation", 'Json'>
    readonly lastUpdated: FieldRef<"LiveTruckLocation", 'DateTime'>
    readonly isAvailable: FieldRef<"LiveTruckLocation", 'Boolean'>
    readonly createdAt: FieldRef<"LiveTruckLocation", 'DateTime'>
    readonly updatedAt: FieldRef<"LiveTruckLocation", 'DateTime'>
    readonly towTruckId: FieldRef<"LiveTruckLocation", 'String'>
  }
    

  // Custom InputTypes
  /**
   * LiveTruckLocation findUnique
   */
  export type LiveTruckLocationFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LiveTruckLocation
     */
    select?: LiveTruckLocationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LiveTruckLocationInclude<ExtArgs> | null
    /**
     * Filter, which LiveTruckLocation to fetch.
     */
    where: LiveTruckLocationWhereUniqueInput
  }

  /**
   * LiveTruckLocation findUniqueOrThrow
   */
  export type LiveTruckLocationFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LiveTruckLocation
     */
    select?: LiveTruckLocationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LiveTruckLocationInclude<ExtArgs> | null
    /**
     * Filter, which LiveTruckLocation to fetch.
     */
    where: LiveTruckLocationWhereUniqueInput
  }

  /**
   * LiveTruckLocation findFirst
   */
  export type LiveTruckLocationFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LiveTruckLocation
     */
    select?: LiveTruckLocationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LiveTruckLocationInclude<ExtArgs> | null
    /**
     * Filter, which LiveTruckLocation to fetch.
     */
    where?: LiveTruckLocationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LiveTruckLocations to fetch.
     */
    orderBy?: LiveTruckLocationOrderByWithRelationInput | LiveTruckLocationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for LiveTruckLocations.
     */
    cursor?: LiveTruckLocationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LiveTruckLocations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LiveTruckLocations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of LiveTruckLocations.
     */
    distinct?: LiveTruckLocationScalarFieldEnum | LiveTruckLocationScalarFieldEnum[]
  }

  /**
   * LiveTruckLocation findFirstOrThrow
   */
  export type LiveTruckLocationFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LiveTruckLocation
     */
    select?: LiveTruckLocationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LiveTruckLocationInclude<ExtArgs> | null
    /**
     * Filter, which LiveTruckLocation to fetch.
     */
    where?: LiveTruckLocationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LiveTruckLocations to fetch.
     */
    orderBy?: LiveTruckLocationOrderByWithRelationInput | LiveTruckLocationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for LiveTruckLocations.
     */
    cursor?: LiveTruckLocationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LiveTruckLocations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LiveTruckLocations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of LiveTruckLocations.
     */
    distinct?: LiveTruckLocationScalarFieldEnum | LiveTruckLocationScalarFieldEnum[]
  }

  /**
   * LiveTruckLocation findMany
   */
  export type LiveTruckLocationFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LiveTruckLocation
     */
    select?: LiveTruckLocationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LiveTruckLocationInclude<ExtArgs> | null
    /**
     * Filter, which LiveTruckLocations to fetch.
     */
    where?: LiveTruckLocationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LiveTruckLocations to fetch.
     */
    orderBy?: LiveTruckLocationOrderByWithRelationInput | LiveTruckLocationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing LiveTruckLocations.
     */
    cursor?: LiveTruckLocationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LiveTruckLocations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LiveTruckLocations.
     */
    skip?: number
    distinct?: LiveTruckLocationScalarFieldEnum | LiveTruckLocationScalarFieldEnum[]
  }

  /**
   * LiveTruckLocation create
   */
  export type LiveTruckLocationCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LiveTruckLocation
     */
    select?: LiveTruckLocationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LiveTruckLocationInclude<ExtArgs> | null
    /**
     * The data needed to create a LiveTruckLocation.
     */
    data: XOR<LiveTruckLocationCreateInput, LiveTruckLocationUncheckedCreateInput>
  }

  /**
   * LiveTruckLocation createMany
   */
  export type LiveTruckLocationCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many LiveTruckLocations.
     */
    data: LiveTruckLocationCreateManyInput | LiveTruckLocationCreateManyInput[]
  }

  /**
   * LiveTruckLocation update
   */
  export type LiveTruckLocationUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LiveTruckLocation
     */
    select?: LiveTruckLocationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LiveTruckLocationInclude<ExtArgs> | null
    /**
     * The data needed to update a LiveTruckLocation.
     */
    data: XOR<LiveTruckLocationUpdateInput, LiveTruckLocationUncheckedUpdateInput>
    /**
     * Choose, which LiveTruckLocation to update.
     */
    where: LiveTruckLocationWhereUniqueInput
  }

  /**
   * LiveTruckLocation updateMany
   */
  export type LiveTruckLocationUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update LiveTruckLocations.
     */
    data: XOR<LiveTruckLocationUpdateManyMutationInput, LiveTruckLocationUncheckedUpdateManyInput>
    /**
     * Filter which LiveTruckLocations to update
     */
    where?: LiveTruckLocationWhereInput
  }

  /**
   * LiveTruckLocation upsert
   */
  export type LiveTruckLocationUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LiveTruckLocation
     */
    select?: LiveTruckLocationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LiveTruckLocationInclude<ExtArgs> | null
    /**
     * The filter to search for the LiveTruckLocation to update in case it exists.
     */
    where: LiveTruckLocationWhereUniqueInput
    /**
     * In case the LiveTruckLocation found by the `where` argument doesn't exist, create a new LiveTruckLocation with this data.
     */
    create: XOR<LiveTruckLocationCreateInput, LiveTruckLocationUncheckedCreateInput>
    /**
     * In case the LiveTruckLocation was found with the provided `where` argument, update it with this data.
     */
    update: XOR<LiveTruckLocationUpdateInput, LiveTruckLocationUncheckedUpdateInput>
  }

  /**
   * LiveTruckLocation delete
   */
  export type LiveTruckLocationDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LiveTruckLocation
     */
    select?: LiveTruckLocationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LiveTruckLocationInclude<ExtArgs> | null
    /**
     * Filter which LiveTruckLocation to delete.
     */
    where: LiveTruckLocationWhereUniqueInput
  }

  /**
   * LiveTruckLocation deleteMany
   */
  export type LiveTruckLocationDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which LiveTruckLocations to delete
     */
    where?: LiveTruckLocationWhereInput
  }

  /**
   * LiveTruckLocation findRaw
   */
  export type LiveTruckLocationFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The query predicate filter. If unspecified, then all documents in the collection will match the predicate. ${@link https://docs.mongodb.com/manual/reference/operator/query MongoDB Docs}.
     */
    filter?: InputJsonValue
    /**
     * Additional options to pass to the `find` command ${@link https://docs.mongodb.com/manual/reference/command/find/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * LiveTruckLocation aggregateRaw
   */
  export type LiveTruckLocationAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * An array of aggregation stages to process and transform the document stream via the aggregation pipeline. ${@link https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline MongoDB Docs}.
     */
    pipeline?: InputJsonValue[]
    /**
     * Additional options to pass to the `aggregate` command ${@link https://docs.mongodb.com/manual/reference/command/aggregate/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * LiveTruckLocation without action
   */
  export type LiveTruckLocationDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LiveTruckLocation
     */
    select?: LiveTruckLocationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LiveTruckLocationInclude<ExtArgs> | null
  }


  /**
   * Model SparePart
   */

  export type AggregateSparePart = {
    _count: SparePartCountAggregateOutputType | null
    _avg: SparePartAvgAggregateOutputType | null
    _sum: SparePartSumAggregateOutputType | null
    _min: SparePartMinAggregateOutputType | null
    _max: SparePartMaxAggregateOutputType | null
  }

  export type SparePartAvgAggregateOutputType = {
    compatibleYear: number | null
    price: number | null
    quantityAvailable: number | null
  }

  export type SparePartSumAggregateOutputType = {
    compatibleYear: number | null
    price: number | null
    quantityAvailable: number | null
  }

  export type SparePartMinAggregateOutputType = {
    id: string | null
    partName: string | null
    compatibleMake: string | null
    compatibleModel: string | null
    compatibleYear: number | null
    price: number | null
    quantityAvailable: number | null
    garageId: string | null
  }

  export type SparePartMaxAggregateOutputType = {
    id: string | null
    partName: string | null
    compatibleMake: string | null
    compatibleModel: string | null
    compatibleYear: number | null
    price: number | null
    quantityAvailable: number | null
    garageId: string | null
  }

  export type SparePartCountAggregateOutputType = {
    id: number
    partName: number
    compatibleMake: number
    compatibleModel: number
    compatibleYear: number
    price: number
    quantityAvailable: number
    garageId: number
    _all: number
  }


  export type SparePartAvgAggregateInputType = {
    compatibleYear?: true
    price?: true
    quantityAvailable?: true
  }

  export type SparePartSumAggregateInputType = {
    compatibleYear?: true
    price?: true
    quantityAvailable?: true
  }

  export type SparePartMinAggregateInputType = {
    id?: true
    partName?: true
    compatibleMake?: true
    compatibleModel?: true
    compatibleYear?: true
    price?: true
    quantityAvailable?: true
    garageId?: true
  }

  export type SparePartMaxAggregateInputType = {
    id?: true
    partName?: true
    compatibleMake?: true
    compatibleModel?: true
    compatibleYear?: true
    price?: true
    quantityAvailable?: true
    garageId?: true
  }

  export type SparePartCountAggregateInputType = {
    id?: true
    partName?: true
    compatibleMake?: true
    compatibleModel?: true
    compatibleYear?: true
    price?: true
    quantityAvailable?: true
    garageId?: true
    _all?: true
  }

  export type SparePartAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SparePart to aggregate.
     */
    where?: SparePartWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SpareParts to fetch.
     */
    orderBy?: SparePartOrderByWithRelationInput | SparePartOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SparePartWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SpareParts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SpareParts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned SpareParts
    **/
    _count?: true | SparePartCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: SparePartAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: SparePartSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SparePartMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SparePartMaxAggregateInputType
  }

  export type GetSparePartAggregateType<T extends SparePartAggregateArgs> = {
        [P in keyof T & keyof AggregateSparePart]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSparePart[P]>
      : GetScalarType<T[P], AggregateSparePart[P]>
  }




  export type SparePartGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SparePartWhereInput
    orderBy?: SparePartOrderByWithAggregationInput | SparePartOrderByWithAggregationInput[]
    by: SparePartScalarFieldEnum[] | SparePartScalarFieldEnum
    having?: SparePartScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SparePartCountAggregateInputType | true
    _avg?: SparePartAvgAggregateInputType
    _sum?: SparePartSumAggregateInputType
    _min?: SparePartMinAggregateInputType
    _max?: SparePartMaxAggregateInputType
  }

  export type SparePartGroupByOutputType = {
    id: string
    partName: string
    compatibleMake: string
    compatibleModel: string
    compatibleYear: number
    price: number
    quantityAvailable: number
    garageId: string
    _count: SparePartCountAggregateOutputType | null
    _avg: SparePartAvgAggregateOutputType | null
    _sum: SparePartSumAggregateOutputType | null
    _min: SparePartMinAggregateOutputType | null
    _max: SparePartMaxAggregateOutputType | null
  }

  type GetSparePartGroupByPayload<T extends SparePartGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SparePartGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SparePartGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SparePartGroupByOutputType[P]>
            : GetScalarType<T[P], SparePartGroupByOutputType[P]>
        }
      >
    >


  export type SparePartSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    partName?: boolean
    compatibleMake?: boolean
    compatibleModel?: boolean
    compatibleYear?: boolean
    price?: boolean
    quantityAvailable?: boolean
    garageId?: boolean
    garage?: boolean | GarageDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["sparePart"]>


  export type SparePartSelectScalar = {
    id?: boolean
    partName?: boolean
    compatibleMake?: boolean
    compatibleModel?: boolean
    compatibleYear?: boolean
    price?: boolean
    quantityAvailable?: boolean
    garageId?: boolean
  }

  export type SparePartInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    garage?: boolean | GarageDefaultArgs<ExtArgs>
  }

  export type $SparePartPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "SparePart"
    objects: {
      garage: Prisma.$GaragePayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      partName: string
      compatibleMake: string
      compatibleModel: string
      compatibleYear: number
      price: number
      quantityAvailable: number
      garageId: string
    }, ExtArgs["result"]["sparePart"]>
    composites: {}
  }

  type SparePartGetPayload<S extends boolean | null | undefined | SparePartDefaultArgs> = $Result.GetResult<Prisma.$SparePartPayload, S>

  type SparePartCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<SparePartFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: SparePartCountAggregateInputType | true
    }

  export interface SparePartDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['SparePart'], meta: { name: 'SparePart' } }
    /**
     * Find zero or one SparePart that matches the filter.
     * @param {SparePartFindUniqueArgs} args - Arguments to find a SparePart
     * @example
     * // Get one SparePart
     * const sparePart = await prisma.sparePart.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SparePartFindUniqueArgs>(args: SelectSubset<T, SparePartFindUniqueArgs<ExtArgs>>): Prisma__SparePartClient<$Result.GetResult<Prisma.$SparePartPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one SparePart that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {SparePartFindUniqueOrThrowArgs} args - Arguments to find a SparePart
     * @example
     * // Get one SparePart
     * const sparePart = await prisma.sparePart.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SparePartFindUniqueOrThrowArgs>(args: SelectSubset<T, SparePartFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SparePartClient<$Result.GetResult<Prisma.$SparePartPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first SparePart that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SparePartFindFirstArgs} args - Arguments to find a SparePart
     * @example
     * // Get one SparePart
     * const sparePart = await prisma.sparePart.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SparePartFindFirstArgs>(args?: SelectSubset<T, SparePartFindFirstArgs<ExtArgs>>): Prisma__SparePartClient<$Result.GetResult<Prisma.$SparePartPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first SparePart that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SparePartFindFirstOrThrowArgs} args - Arguments to find a SparePart
     * @example
     * // Get one SparePart
     * const sparePart = await prisma.sparePart.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SparePartFindFirstOrThrowArgs>(args?: SelectSubset<T, SparePartFindFirstOrThrowArgs<ExtArgs>>): Prisma__SparePartClient<$Result.GetResult<Prisma.$SparePartPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more SpareParts that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SparePartFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all SpareParts
     * const spareParts = await prisma.sparePart.findMany()
     * 
     * // Get first 10 SpareParts
     * const spareParts = await prisma.sparePart.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const sparePartWithIdOnly = await prisma.sparePart.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SparePartFindManyArgs>(args?: SelectSubset<T, SparePartFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SparePartPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a SparePart.
     * @param {SparePartCreateArgs} args - Arguments to create a SparePart.
     * @example
     * // Create one SparePart
     * const SparePart = await prisma.sparePart.create({
     *   data: {
     *     // ... data to create a SparePart
     *   }
     * })
     * 
     */
    create<T extends SparePartCreateArgs>(args: SelectSubset<T, SparePartCreateArgs<ExtArgs>>): Prisma__SparePartClient<$Result.GetResult<Prisma.$SparePartPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many SpareParts.
     * @param {SparePartCreateManyArgs} args - Arguments to create many SpareParts.
     * @example
     * // Create many SpareParts
     * const sparePart = await prisma.sparePart.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SparePartCreateManyArgs>(args?: SelectSubset<T, SparePartCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a SparePart.
     * @param {SparePartDeleteArgs} args - Arguments to delete one SparePart.
     * @example
     * // Delete one SparePart
     * const SparePart = await prisma.sparePart.delete({
     *   where: {
     *     // ... filter to delete one SparePart
     *   }
     * })
     * 
     */
    delete<T extends SparePartDeleteArgs>(args: SelectSubset<T, SparePartDeleteArgs<ExtArgs>>): Prisma__SparePartClient<$Result.GetResult<Prisma.$SparePartPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one SparePart.
     * @param {SparePartUpdateArgs} args - Arguments to update one SparePart.
     * @example
     * // Update one SparePart
     * const sparePart = await prisma.sparePart.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SparePartUpdateArgs>(args: SelectSubset<T, SparePartUpdateArgs<ExtArgs>>): Prisma__SparePartClient<$Result.GetResult<Prisma.$SparePartPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more SpareParts.
     * @param {SparePartDeleteManyArgs} args - Arguments to filter SpareParts to delete.
     * @example
     * // Delete a few SpareParts
     * const { count } = await prisma.sparePart.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SparePartDeleteManyArgs>(args?: SelectSubset<T, SparePartDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SpareParts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SparePartUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many SpareParts
     * const sparePart = await prisma.sparePart.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SparePartUpdateManyArgs>(args: SelectSubset<T, SparePartUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one SparePart.
     * @param {SparePartUpsertArgs} args - Arguments to update or create a SparePart.
     * @example
     * // Update or create a SparePart
     * const sparePart = await prisma.sparePart.upsert({
     *   create: {
     *     // ... data to create a SparePart
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the SparePart we want to update
     *   }
     * })
     */
    upsert<T extends SparePartUpsertArgs>(args: SelectSubset<T, SparePartUpsertArgs<ExtArgs>>): Prisma__SparePartClient<$Result.GetResult<Prisma.$SparePartPayload<ExtArgs>, T, "upsert">, never, ExtArgs>

    /**
     * Find zero or more SpareParts that matches the filter.
     * @param {SparePartFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const sparePart = await prisma.sparePart.findRaw({
     *   filter: { age: { $gt: 25 } } 
     * })
     */
    findRaw(args?: SparePartFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a SparePart.
     * @param {SparePartAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const sparePart = await prisma.sparePart.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: SparePartAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


    /**
     * Count the number of SpareParts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SparePartCountArgs} args - Arguments to filter SpareParts to count.
     * @example
     * // Count the number of SpareParts
     * const count = await prisma.sparePart.count({
     *   where: {
     *     // ... the filter for the SpareParts we want to count
     *   }
     * })
    **/
    count<T extends SparePartCountArgs>(
      args?: Subset<T, SparePartCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SparePartCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a SparePart.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SparePartAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SparePartAggregateArgs>(args: Subset<T, SparePartAggregateArgs>): Prisma.PrismaPromise<GetSparePartAggregateType<T>>

    /**
     * Group by SparePart.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SparePartGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SparePartGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SparePartGroupByArgs['orderBy'] }
        : { orderBy?: SparePartGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SparePartGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSparePartGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the SparePart model
   */
  readonly fields: SparePartFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for SparePart.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SparePartClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    garage<T extends GarageDefaultArgs<ExtArgs> = {}>(args?: Subset<T, GarageDefaultArgs<ExtArgs>>): Prisma__GarageClient<$Result.GetResult<Prisma.$GaragePayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the SparePart model
   */ 
  interface SparePartFieldRefs {
    readonly id: FieldRef<"SparePart", 'String'>
    readonly partName: FieldRef<"SparePart", 'String'>
    readonly compatibleMake: FieldRef<"SparePart", 'String'>
    readonly compatibleModel: FieldRef<"SparePart", 'String'>
    readonly compatibleYear: FieldRef<"SparePart", 'Int'>
    readonly price: FieldRef<"SparePart", 'Float'>
    readonly quantityAvailable: FieldRef<"SparePart", 'Int'>
    readonly garageId: FieldRef<"SparePart", 'String'>
  }
    

  // Custom InputTypes
  /**
   * SparePart findUnique
   */
  export type SparePartFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SparePart
     */
    select?: SparePartSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SparePartInclude<ExtArgs> | null
    /**
     * Filter, which SparePart to fetch.
     */
    where: SparePartWhereUniqueInput
  }

  /**
   * SparePart findUniqueOrThrow
   */
  export type SparePartFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SparePart
     */
    select?: SparePartSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SparePartInclude<ExtArgs> | null
    /**
     * Filter, which SparePart to fetch.
     */
    where: SparePartWhereUniqueInput
  }

  /**
   * SparePart findFirst
   */
  export type SparePartFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SparePart
     */
    select?: SparePartSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SparePartInclude<ExtArgs> | null
    /**
     * Filter, which SparePart to fetch.
     */
    where?: SparePartWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SpareParts to fetch.
     */
    orderBy?: SparePartOrderByWithRelationInput | SparePartOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SpareParts.
     */
    cursor?: SparePartWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SpareParts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SpareParts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SpareParts.
     */
    distinct?: SparePartScalarFieldEnum | SparePartScalarFieldEnum[]
  }

  /**
   * SparePart findFirstOrThrow
   */
  export type SparePartFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SparePart
     */
    select?: SparePartSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SparePartInclude<ExtArgs> | null
    /**
     * Filter, which SparePart to fetch.
     */
    where?: SparePartWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SpareParts to fetch.
     */
    orderBy?: SparePartOrderByWithRelationInput | SparePartOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SpareParts.
     */
    cursor?: SparePartWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SpareParts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SpareParts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SpareParts.
     */
    distinct?: SparePartScalarFieldEnum | SparePartScalarFieldEnum[]
  }

  /**
   * SparePart findMany
   */
  export type SparePartFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SparePart
     */
    select?: SparePartSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SparePartInclude<ExtArgs> | null
    /**
     * Filter, which SpareParts to fetch.
     */
    where?: SparePartWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SpareParts to fetch.
     */
    orderBy?: SparePartOrderByWithRelationInput | SparePartOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing SpareParts.
     */
    cursor?: SparePartWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SpareParts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SpareParts.
     */
    skip?: number
    distinct?: SparePartScalarFieldEnum | SparePartScalarFieldEnum[]
  }

  /**
   * SparePart create
   */
  export type SparePartCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SparePart
     */
    select?: SparePartSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SparePartInclude<ExtArgs> | null
    /**
     * The data needed to create a SparePart.
     */
    data: XOR<SparePartCreateInput, SparePartUncheckedCreateInput>
  }

  /**
   * SparePart createMany
   */
  export type SparePartCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many SpareParts.
     */
    data: SparePartCreateManyInput | SparePartCreateManyInput[]
  }

  /**
   * SparePart update
   */
  export type SparePartUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SparePart
     */
    select?: SparePartSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SparePartInclude<ExtArgs> | null
    /**
     * The data needed to update a SparePart.
     */
    data: XOR<SparePartUpdateInput, SparePartUncheckedUpdateInput>
    /**
     * Choose, which SparePart to update.
     */
    where: SparePartWhereUniqueInput
  }

  /**
   * SparePart updateMany
   */
  export type SparePartUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update SpareParts.
     */
    data: XOR<SparePartUpdateManyMutationInput, SparePartUncheckedUpdateManyInput>
    /**
     * Filter which SpareParts to update
     */
    where?: SparePartWhereInput
  }

  /**
   * SparePart upsert
   */
  export type SparePartUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SparePart
     */
    select?: SparePartSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SparePartInclude<ExtArgs> | null
    /**
     * The filter to search for the SparePart to update in case it exists.
     */
    where: SparePartWhereUniqueInput
    /**
     * In case the SparePart found by the `where` argument doesn't exist, create a new SparePart with this data.
     */
    create: XOR<SparePartCreateInput, SparePartUncheckedCreateInput>
    /**
     * In case the SparePart was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SparePartUpdateInput, SparePartUncheckedUpdateInput>
  }

  /**
   * SparePart delete
   */
  export type SparePartDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SparePart
     */
    select?: SparePartSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SparePartInclude<ExtArgs> | null
    /**
     * Filter which SparePart to delete.
     */
    where: SparePartWhereUniqueInput
  }

  /**
   * SparePart deleteMany
   */
  export type SparePartDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SpareParts to delete
     */
    where?: SparePartWhereInput
  }

  /**
   * SparePart findRaw
   */
  export type SparePartFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The query predicate filter. If unspecified, then all documents in the collection will match the predicate. ${@link https://docs.mongodb.com/manual/reference/operator/query MongoDB Docs}.
     */
    filter?: InputJsonValue
    /**
     * Additional options to pass to the `find` command ${@link https://docs.mongodb.com/manual/reference/command/find/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * SparePart aggregateRaw
   */
  export type SparePartAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * An array of aggregation stages to process and transform the document stream via the aggregation pipeline. ${@link https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline MongoDB Docs}.
     */
    pipeline?: InputJsonValue[]
    /**
     * Additional options to pass to the `aggregate` command ${@link https://docs.mongodb.com/manual/reference/command/aggregate/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * SparePart without action
   */
  export type SparePartDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SparePart
     */
    select?: SparePartSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SparePartInclude<ExtArgs> | null
  }


  /**
   * Model Booking
   */

  export type AggregateBooking = {
    _count: BookingCountAggregateOutputType | null
    _avg: BookingAvgAggregateOutputType | null
    _sum: BookingSumAggregateOutputType | null
    _min: BookingMinAggregateOutputType | null
    _max: BookingMaxAggregateOutputType | null
  }

  export type BookingAvgAggregateOutputType = {
    basePrice: number | null
    additionalFees: number | null
    discountAmount: number | null
    finalAmount: number | null
    userRating: number | null
    providerRating: number | null
  }

  export type BookingSumAggregateOutputType = {
    basePrice: number | null
    additionalFees: number | null
    discountAmount: number | null
    finalAmount: number | null
    userRating: number | null
    providerRating: number | null
  }

  export type BookingMinAggregateOutputType = {
    id: string | null
    status: $Enums.BookingStatus | null
    bookedAt: Date | null
    expiresAt: Date | null
    paymentExpiresAt: Date | null
    notes: string | null
    otp: string | null
    otpExpiresAt: Date | null
    serviceStartedAt: Date | null
    serviceEndedAt: Date | null
    basePrice: number | null
    additionalFees: number | null
    discountAmount: number | null
    finalAmount: number | null
    paymentStatus: string | null
    paymentIntentId: string | null
    userRating: number | null
    userReview: string | null
    providerRating: number | null
    providerReview: string | null
    userId: string | null
    vehicleId: string | null
    serviceId: string | null
    garageId: string | null
    garageServiceId: string | null
    towTruckId: string | null
    towTruckServiceId: string | null
    promoCodeId: string | null
  }

  export type BookingMaxAggregateOutputType = {
    id: string | null
    status: $Enums.BookingStatus | null
    bookedAt: Date | null
    expiresAt: Date | null
    paymentExpiresAt: Date | null
    notes: string | null
    otp: string | null
    otpExpiresAt: Date | null
    serviceStartedAt: Date | null
    serviceEndedAt: Date | null
    basePrice: number | null
    additionalFees: number | null
    discountAmount: number | null
    finalAmount: number | null
    paymentStatus: string | null
    paymentIntentId: string | null
    userRating: number | null
    userReview: string | null
    providerRating: number | null
    providerReview: string | null
    userId: string | null
    vehicleId: string | null
    serviceId: string | null
    garageId: string | null
    garageServiceId: string | null
    towTruckId: string | null
    towTruckServiceId: string | null
    promoCodeId: string | null
  }

  export type BookingCountAggregateOutputType = {
    id: number
    status: number
    bookedAt: number
    expiresAt: number
    paymentExpiresAt: number
    notes: number
    otp: number
    otpExpiresAt: number
    pickupLocation: number
    destinationLocation: number
    serviceStartedAt: number
    serviceEndedAt: number
    basePrice: number
    additionalFees: number
    discountAmount: number
    finalAmount: number
    paymentStatus: number
    paymentIntentId: number
    userRating: number
    userReview: number
    providerRating: number
    providerReview: number
    userId: number
    vehicleId: number
    eligibleProviderIds: number
    serviceId: number
    garageId: number
    garageServiceId: number
    towTruckId: number
    towTruckServiceId: number
    promoCodeId: number
    _all: number
  }


  export type BookingAvgAggregateInputType = {
    basePrice?: true
    additionalFees?: true
    discountAmount?: true
    finalAmount?: true
    userRating?: true
    providerRating?: true
  }

  export type BookingSumAggregateInputType = {
    basePrice?: true
    additionalFees?: true
    discountAmount?: true
    finalAmount?: true
    userRating?: true
    providerRating?: true
  }

  export type BookingMinAggregateInputType = {
    id?: true
    status?: true
    bookedAt?: true
    expiresAt?: true
    paymentExpiresAt?: true
    notes?: true
    otp?: true
    otpExpiresAt?: true
    serviceStartedAt?: true
    serviceEndedAt?: true
    basePrice?: true
    additionalFees?: true
    discountAmount?: true
    finalAmount?: true
    paymentStatus?: true
    paymentIntentId?: true
    userRating?: true
    userReview?: true
    providerRating?: true
    providerReview?: true
    userId?: true
    vehicleId?: true
    serviceId?: true
    garageId?: true
    garageServiceId?: true
    towTruckId?: true
    towTruckServiceId?: true
    promoCodeId?: true
  }

  export type BookingMaxAggregateInputType = {
    id?: true
    status?: true
    bookedAt?: true
    expiresAt?: true
    paymentExpiresAt?: true
    notes?: true
    otp?: true
    otpExpiresAt?: true
    serviceStartedAt?: true
    serviceEndedAt?: true
    basePrice?: true
    additionalFees?: true
    discountAmount?: true
    finalAmount?: true
    paymentStatus?: true
    paymentIntentId?: true
    userRating?: true
    userReview?: true
    providerRating?: true
    providerReview?: true
    userId?: true
    vehicleId?: true
    serviceId?: true
    garageId?: true
    garageServiceId?: true
    towTruckId?: true
    towTruckServiceId?: true
    promoCodeId?: true
  }

  export type BookingCountAggregateInputType = {
    id?: true
    status?: true
    bookedAt?: true
    expiresAt?: true
    paymentExpiresAt?: true
    notes?: true
    otp?: true
    otpExpiresAt?: true
    pickupLocation?: true
    destinationLocation?: true
    serviceStartedAt?: true
    serviceEndedAt?: true
    basePrice?: true
    additionalFees?: true
    discountAmount?: true
    finalAmount?: true
    paymentStatus?: true
    paymentIntentId?: true
    userRating?: true
    userReview?: true
    providerRating?: true
    providerReview?: true
    userId?: true
    vehicleId?: true
    eligibleProviderIds?: true
    serviceId?: true
    garageId?: true
    garageServiceId?: true
    towTruckId?: true
    towTruckServiceId?: true
    promoCodeId?: true
    _all?: true
  }

  export type BookingAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Booking to aggregate.
     */
    where?: BookingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Bookings to fetch.
     */
    orderBy?: BookingOrderByWithRelationInput | BookingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: BookingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Bookings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Bookings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Bookings
    **/
    _count?: true | BookingCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: BookingAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: BookingSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: BookingMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: BookingMaxAggregateInputType
  }

  export type GetBookingAggregateType<T extends BookingAggregateArgs> = {
        [P in keyof T & keyof AggregateBooking]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateBooking[P]>
      : GetScalarType<T[P], AggregateBooking[P]>
  }




  export type BookingGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BookingWhereInput
    orderBy?: BookingOrderByWithAggregationInput | BookingOrderByWithAggregationInput[]
    by: BookingScalarFieldEnum[] | BookingScalarFieldEnum
    having?: BookingScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: BookingCountAggregateInputType | true
    _avg?: BookingAvgAggregateInputType
    _sum?: BookingSumAggregateInputType
    _min?: BookingMinAggregateInputType
    _max?: BookingMaxAggregateInputType
  }

  export type BookingGroupByOutputType = {
    id: string
    status: $Enums.BookingStatus
    bookedAt: Date
    expiresAt: Date | null
    paymentExpiresAt: Date | null
    notes: string | null
    otp: string | null
    otpExpiresAt: Date | null
    pickupLocation: JsonValue | null
    destinationLocation: JsonValue | null
    serviceStartedAt: Date | null
    serviceEndedAt: Date | null
    basePrice: number
    additionalFees: number | null
    discountAmount: number | null
    finalAmount: number
    paymentStatus: string
    paymentIntentId: string | null
    userRating: number | null
    userReview: string | null
    providerRating: number | null
    providerReview: string | null
    userId: string
    vehicleId: string
    eligibleProviderIds: string[]
    serviceId: string | null
    garageId: string | null
    garageServiceId: string | null
    towTruckId: string | null
    towTruckServiceId: string | null
    promoCodeId: string | null
    _count: BookingCountAggregateOutputType | null
    _avg: BookingAvgAggregateOutputType | null
    _sum: BookingSumAggregateOutputType | null
    _min: BookingMinAggregateOutputType | null
    _max: BookingMaxAggregateOutputType | null
  }

  type GetBookingGroupByPayload<T extends BookingGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<BookingGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof BookingGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], BookingGroupByOutputType[P]>
            : GetScalarType<T[P], BookingGroupByOutputType[P]>
        }
      >
    >


  export type BookingSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    status?: boolean
    bookedAt?: boolean
    expiresAt?: boolean
    paymentExpiresAt?: boolean
    notes?: boolean
    otp?: boolean
    otpExpiresAt?: boolean
    pickupLocation?: boolean
    destinationLocation?: boolean
    serviceStartedAt?: boolean
    serviceEndedAt?: boolean
    basePrice?: boolean
    additionalFees?: boolean
    discountAmount?: boolean
    finalAmount?: boolean
    paymentStatus?: boolean
    paymentIntentId?: boolean
    userRating?: boolean
    userReview?: boolean
    providerRating?: boolean
    providerReview?: boolean
    userId?: boolean
    vehicleId?: boolean
    eligibleProviderIds?: boolean
    serviceId?: boolean
    garageId?: boolean
    garageServiceId?: boolean
    towTruckId?: boolean
    towTruckServiceId?: boolean
    promoCodeId?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    vehicle?: boolean | VehicleDefaultArgs<ExtArgs>
    service?: boolean | Booking$serviceArgs<ExtArgs>
    garage?: boolean | Booking$garageArgs<ExtArgs>
    garageService?: boolean | Booking$garageServiceArgs<ExtArgs>
    towTruck?: boolean | Booking$towTruckArgs<ExtArgs>
    towTruckService?: boolean | Booking$towTruckServiceArgs<ExtArgs>
    promoCode?: boolean | Booking$promoCodeArgs<ExtArgs>
  }, ExtArgs["result"]["booking"]>


  export type BookingSelectScalar = {
    id?: boolean
    status?: boolean
    bookedAt?: boolean
    expiresAt?: boolean
    paymentExpiresAt?: boolean
    notes?: boolean
    otp?: boolean
    otpExpiresAt?: boolean
    pickupLocation?: boolean
    destinationLocation?: boolean
    serviceStartedAt?: boolean
    serviceEndedAt?: boolean
    basePrice?: boolean
    additionalFees?: boolean
    discountAmount?: boolean
    finalAmount?: boolean
    paymentStatus?: boolean
    paymentIntentId?: boolean
    userRating?: boolean
    userReview?: boolean
    providerRating?: boolean
    providerReview?: boolean
    userId?: boolean
    vehicleId?: boolean
    eligibleProviderIds?: boolean
    serviceId?: boolean
    garageId?: boolean
    garageServiceId?: boolean
    towTruckId?: boolean
    towTruckServiceId?: boolean
    promoCodeId?: boolean
  }

  export type BookingInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    vehicle?: boolean | VehicleDefaultArgs<ExtArgs>
    service?: boolean | Booking$serviceArgs<ExtArgs>
    garage?: boolean | Booking$garageArgs<ExtArgs>
    garageService?: boolean | Booking$garageServiceArgs<ExtArgs>
    towTruck?: boolean | Booking$towTruckArgs<ExtArgs>
    towTruckService?: boolean | Booking$towTruckServiceArgs<ExtArgs>
    promoCode?: boolean | Booking$promoCodeArgs<ExtArgs>
  }

  export type $BookingPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Booking"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
      vehicle: Prisma.$VehiclePayload<ExtArgs>
      service: Prisma.$ServicePayload<ExtArgs> | null
      garage: Prisma.$GaragePayload<ExtArgs> | null
      garageService: Prisma.$GarageServicePayload<ExtArgs> | null
      towTruck: Prisma.$TowTruckPayload<ExtArgs> | null
      towTruckService: Prisma.$TowTruckServicePayload<ExtArgs> | null
      promoCode: Prisma.$PromoCodePayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      status: $Enums.BookingStatus
      bookedAt: Date
      expiresAt: Date | null
      paymentExpiresAt: Date | null
      notes: string | null
      otp: string | null
      otpExpiresAt: Date | null
      pickupLocation: Prisma.JsonValue | null
      destinationLocation: Prisma.JsonValue | null
      serviceStartedAt: Date | null
      serviceEndedAt: Date | null
      basePrice: number
      additionalFees: number | null
      discountAmount: number | null
      finalAmount: number
      paymentStatus: string
      paymentIntentId: string | null
      userRating: number | null
      userReview: string | null
      providerRating: number | null
      providerReview: string | null
      userId: string
      vehicleId: string
      eligibleProviderIds: string[]
      serviceId: string | null
      garageId: string | null
      garageServiceId: string | null
      towTruckId: string | null
      towTruckServiceId: string | null
      promoCodeId: string | null
    }, ExtArgs["result"]["booking"]>
    composites: {}
  }

  type BookingGetPayload<S extends boolean | null | undefined | BookingDefaultArgs> = $Result.GetResult<Prisma.$BookingPayload, S>

  type BookingCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<BookingFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: BookingCountAggregateInputType | true
    }

  export interface BookingDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Booking'], meta: { name: 'Booking' } }
    /**
     * Find zero or one Booking that matches the filter.
     * @param {BookingFindUniqueArgs} args - Arguments to find a Booking
     * @example
     * // Get one Booking
     * const booking = await prisma.booking.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends BookingFindUniqueArgs>(args: SelectSubset<T, BookingFindUniqueArgs<ExtArgs>>): Prisma__BookingClient<$Result.GetResult<Prisma.$BookingPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Booking that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {BookingFindUniqueOrThrowArgs} args - Arguments to find a Booking
     * @example
     * // Get one Booking
     * const booking = await prisma.booking.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends BookingFindUniqueOrThrowArgs>(args: SelectSubset<T, BookingFindUniqueOrThrowArgs<ExtArgs>>): Prisma__BookingClient<$Result.GetResult<Prisma.$BookingPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Booking that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BookingFindFirstArgs} args - Arguments to find a Booking
     * @example
     * // Get one Booking
     * const booking = await prisma.booking.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends BookingFindFirstArgs>(args?: SelectSubset<T, BookingFindFirstArgs<ExtArgs>>): Prisma__BookingClient<$Result.GetResult<Prisma.$BookingPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Booking that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BookingFindFirstOrThrowArgs} args - Arguments to find a Booking
     * @example
     * // Get one Booking
     * const booking = await prisma.booking.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends BookingFindFirstOrThrowArgs>(args?: SelectSubset<T, BookingFindFirstOrThrowArgs<ExtArgs>>): Prisma__BookingClient<$Result.GetResult<Prisma.$BookingPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Bookings that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BookingFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Bookings
     * const bookings = await prisma.booking.findMany()
     * 
     * // Get first 10 Bookings
     * const bookings = await prisma.booking.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const bookingWithIdOnly = await prisma.booking.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends BookingFindManyArgs>(args?: SelectSubset<T, BookingFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BookingPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Booking.
     * @param {BookingCreateArgs} args - Arguments to create a Booking.
     * @example
     * // Create one Booking
     * const Booking = await prisma.booking.create({
     *   data: {
     *     // ... data to create a Booking
     *   }
     * })
     * 
     */
    create<T extends BookingCreateArgs>(args: SelectSubset<T, BookingCreateArgs<ExtArgs>>): Prisma__BookingClient<$Result.GetResult<Prisma.$BookingPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Bookings.
     * @param {BookingCreateManyArgs} args - Arguments to create many Bookings.
     * @example
     * // Create many Bookings
     * const booking = await prisma.booking.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends BookingCreateManyArgs>(args?: SelectSubset<T, BookingCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Booking.
     * @param {BookingDeleteArgs} args - Arguments to delete one Booking.
     * @example
     * // Delete one Booking
     * const Booking = await prisma.booking.delete({
     *   where: {
     *     // ... filter to delete one Booking
     *   }
     * })
     * 
     */
    delete<T extends BookingDeleteArgs>(args: SelectSubset<T, BookingDeleteArgs<ExtArgs>>): Prisma__BookingClient<$Result.GetResult<Prisma.$BookingPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Booking.
     * @param {BookingUpdateArgs} args - Arguments to update one Booking.
     * @example
     * // Update one Booking
     * const booking = await prisma.booking.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends BookingUpdateArgs>(args: SelectSubset<T, BookingUpdateArgs<ExtArgs>>): Prisma__BookingClient<$Result.GetResult<Prisma.$BookingPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Bookings.
     * @param {BookingDeleteManyArgs} args - Arguments to filter Bookings to delete.
     * @example
     * // Delete a few Bookings
     * const { count } = await prisma.booking.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends BookingDeleteManyArgs>(args?: SelectSubset<T, BookingDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Bookings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BookingUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Bookings
     * const booking = await prisma.booking.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends BookingUpdateManyArgs>(args: SelectSubset<T, BookingUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Booking.
     * @param {BookingUpsertArgs} args - Arguments to update or create a Booking.
     * @example
     * // Update or create a Booking
     * const booking = await prisma.booking.upsert({
     *   create: {
     *     // ... data to create a Booking
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Booking we want to update
     *   }
     * })
     */
    upsert<T extends BookingUpsertArgs>(args: SelectSubset<T, BookingUpsertArgs<ExtArgs>>): Prisma__BookingClient<$Result.GetResult<Prisma.$BookingPayload<ExtArgs>, T, "upsert">, never, ExtArgs>

    /**
     * Find zero or more Bookings that matches the filter.
     * @param {BookingFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const booking = await prisma.booking.findRaw({
     *   filter: { age: { $gt: 25 } } 
     * })
     */
    findRaw(args?: BookingFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a Booking.
     * @param {BookingAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const booking = await prisma.booking.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: BookingAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


    /**
     * Count the number of Bookings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BookingCountArgs} args - Arguments to filter Bookings to count.
     * @example
     * // Count the number of Bookings
     * const count = await prisma.booking.count({
     *   where: {
     *     // ... the filter for the Bookings we want to count
     *   }
     * })
    **/
    count<T extends BookingCountArgs>(
      args?: Subset<T, BookingCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], BookingCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Booking.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BookingAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends BookingAggregateArgs>(args: Subset<T, BookingAggregateArgs>): Prisma.PrismaPromise<GetBookingAggregateType<T>>

    /**
     * Group by Booking.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BookingGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends BookingGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: BookingGroupByArgs['orderBy'] }
        : { orderBy?: BookingGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, BookingGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetBookingGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Booking model
   */
  readonly fields: BookingFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Booking.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__BookingClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    vehicle<T extends VehicleDefaultArgs<ExtArgs> = {}>(args?: Subset<T, VehicleDefaultArgs<ExtArgs>>): Prisma__VehicleClient<$Result.GetResult<Prisma.$VehiclePayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    service<T extends Booking$serviceArgs<ExtArgs> = {}>(args?: Subset<T, Booking$serviceArgs<ExtArgs>>): Prisma__ServiceClient<$Result.GetResult<Prisma.$ServicePayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    garage<T extends Booking$garageArgs<ExtArgs> = {}>(args?: Subset<T, Booking$garageArgs<ExtArgs>>): Prisma__GarageClient<$Result.GetResult<Prisma.$GaragePayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    garageService<T extends Booking$garageServiceArgs<ExtArgs> = {}>(args?: Subset<T, Booking$garageServiceArgs<ExtArgs>>): Prisma__GarageServiceClient<$Result.GetResult<Prisma.$GarageServicePayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    towTruck<T extends Booking$towTruckArgs<ExtArgs> = {}>(args?: Subset<T, Booking$towTruckArgs<ExtArgs>>): Prisma__TowTruckClient<$Result.GetResult<Prisma.$TowTruckPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    towTruckService<T extends Booking$towTruckServiceArgs<ExtArgs> = {}>(args?: Subset<T, Booking$towTruckServiceArgs<ExtArgs>>): Prisma__TowTruckServiceClient<$Result.GetResult<Prisma.$TowTruckServicePayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    promoCode<T extends Booking$promoCodeArgs<ExtArgs> = {}>(args?: Subset<T, Booking$promoCodeArgs<ExtArgs>>): Prisma__PromoCodeClient<$Result.GetResult<Prisma.$PromoCodePayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Booking model
   */ 
  interface BookingFieldRefs {
    readonly id: FieldRef<"Booking", 'String'>
    readonly status: FieldRef<"Booking", 'BookingStatus'>
    readonly bookedAt: FieldRef<"Booking", 'DateTime'>
    readonly expiresAt: FieldRef<"Booking", 'DateTime'>
    readonly paymentExpiresAt: FieldRef<"Booking", 'DateTime'>
    readonly notes: FieldRef<"Booking", 'String'>
    readonly otp: FieldRef<"Booking", 'String'>
    readonly otpExpiresAt: FieldRef<"Booking", 'DateTime'>
    readonly pickupLocation: FieldRef<"Booking", 'Json'>
    readonly destinationLocation: FieldRef<"Booking", 'Json'>
    readonly serviceStartedAt: FieldRef<"Booking", 'DateTime'>
    readonly serviceEndedAt: FieldRef<"Booking", 'DateTime'>
    readonly basePrice: FieldRef<"Booking", 'Float'>
    readonly additionalFees: FieldRef<"Booking", 'Float'>
    readonly discountAmount: FieldRef<"Booking", 'Float'>
    readonly finalAmount: FieldRef<"Booking", 'Float'>
    readonly paymentStatus: FieldRef<"Booking", 'String'>
    readonly paymentIntentId: FieldRef<"Booking", 'String'>
    readonly userRating: FieldRef<"Booking", 'Int'>
    readonly userReview: FieldRef<"Booking", 'String'>
    readonly providerRating: FieldRef<"Booking", 'Int'>
    readonly providerReview: FieldRef<"Booking", 'String'>
    readonly userId: FieldRef<"Booking", 'String'>
    readonly vehicleId: FieldRef<"Booking", 'String'>
    readonly eligibleProviderIds: FieldRef<"Booking", 'String[]'>
    readonly serviceId: FieldRef<"Booking", 'String'>
    readonly garageId: FieldRef<"Booking", 'String'>
    readonly garageServiceId: FieldRef<"Booking", 'String'>
    readonly towTruckId: FieldRef<"Booking", 'String'>
    readonly towTruckServiceId: FieldRef<"Booking", 'String'>
    readonly promoCodeId: FieldRef<"Booking", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Booking findUnique
   */
  export type BookingFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Booking
     */
    select?: BookingSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BookingInclude<ExtArgs> | null
    /**
     * Filter, which Booking to fetch.
     */
    where: BookingWhereUniqueInput
  }

  /**
   * Booking findUniqueOrThrow
   */
  export type BookingFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Booking
     */
    select?: BookingSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BookingInclude<ExtArgs> | null
    /**
     * Filter, which Booking to fetch.
     */
    where: BookingWhereUniqueInput
  }

  /**
   * Booking findFirst
   */
  export type BookingFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Booking
     */
    select?: BookingSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BookingInclude<ExtArgs> | null
    /**
     * Filter, which Booking to fetch.
     */
    where?: BookingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Bookings to fetch.
     */
    orderBy?: BookingOrderByWithRelationInput | BookingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Bookings.
     */
    cursor?: BookingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Bookings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Bookings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Bookings.
     */
    distinct?: BookingScalarFieldEnum | BookingScalarFieldEnum[]
  }

  /**
   * Booking findFirstOrThrow
   */
  export type BookingFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Booking
     */
    select?: BookingSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BookingInclude<ExtArgs> | null
    /**
     * Filter, which Booking to fetch.
     */
    where?: BookingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Bookings to fetch.
     */
    orderBy?: BookingOrderByWithRelationInput | BookingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Bookings.
     */
    cursor?: BookingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Bookings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Bookings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Bookings.
     */
    distinct?: BookingScalarFieldEnum | BookingScalarFieldEnum[]
  }

  /**
   * Booking findMany
   */
  export type BookingFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Booking
     */
    select?: BookingSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BookingInclude<ExtArgs> | null
    /**
     * Filter, which Bookings to fetch.
     */
    where?: BookingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Bookings to fetch.
     */
    orderBy?: BookingOrderByWithRelationInput | BookingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Bookings.
     */
    cursor?: BookingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Bookings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Bookings.
     */
    skip?: number
    distinct?: BookingScalarFieldEnum | BookingScalarFieldEnum[]
  }

  /**
   * Booking create
   */
  export type BookingCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Booking
     */
    select?: BookingSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BookingInclude<ExtArgs> | null
    /**
     * The data needed to create a Booking.
     */
    data: XOR<BookingCreateInput, BookingUncheckedCreateInput>
  }

  /**
   * Booking createMany
   */
  export type BookingCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Bookings.
     */
    data: BookingCreateManyInput | BookingCreateManyInput[]
  }

  /**
   * Booking update
   */
  export type BookingUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Booking
     */
    select?: BookingSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BookingInclude<ExtArgs> | null
    /**
     * The data needed to update a Booking.
     */
    data: XOR<BookingUpdateInput, BookingUncheckedUpdateInput>
    /**
     * Choose, which Booking to update.
     */
    where: BookingWhereUniqueInput
  }

  /**
   * Booking updateMany
   */
  export type BookingUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Bookings.
     */
    data: XOR<BookingUpdateManyMutationInput, BookingUncheckedUpdateManyInput>
    /**
     * Filter which Bookings to update
     */
    where?: BookingWhereInput
  }

  /**
   * Booking upsert
   */
  export type BookingUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Booking
     */
    select?: BookingSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BookingInclude<ExtArgs> | null
    /**
     * The filter to search for the Booking to update in case it exists.
     */
    where: BookingWhereUniqueInput
    /**
     * In case the Booking found by the `where` argument doesn't exist, create a new Booking with this data.
     */
    create: XOR<BookingCreateInput, BookingUncheckedCreateInput>
    /**
     * In case the Booking was found with the provided `where` argument, update it with this data.
     */
    update: XOR<BookingUpdateInput, BookingUncheckedUpdateInput>
  }

  /**
   * Booking delete
   */
  export type BookingDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Booking
     */
    select?: BookingSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BookingInclude<ExtArgs> | null
    /**
     * Filter which Booking to delete.
     */
    where: BookingWhereUniqueInput
  }

  /**
   * Booking deleteMany
   */
  export type BookingDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Bookings to delete
     */
    where?: BookingWhereInput
  }

  /**
   * Booking findRaw
   */
  export type BookingFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The query predicate filter. If unspecified, then all documents in the collection will match the predicate. ${@link https://docs.mongodb.com/manual/reference/operator/query MongoDB Docs}.
     */
    filter?: InputJsonValue
    /**
     * Additional options to pass to the `find` command ${@link https://docs.mongodb.com/manual/reference/command/find/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * Booking aggregateRaw
   */
  export type BookingAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * An array of aggregation stages to process and transform the document stream via the aggregation pipeline. ${@link https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline MongoDB Docs}.
     */
    pipeline?: InputJsonValue[]
    /**
     * Additional options to pass to the `aggregate` command ${@link https://docs.mongodb.com/manual/reference/command/aggregate/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * Booking.service
   */
  export type Booking$serviceArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Service
     */
    select?: ServiceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServiceInclude<ExtArgs> | null
    where?: ServiceWhereInput
  }

  /**
   * Booking.garage
   */
  export type Booking$garageArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Garage
     */
    select?: GarageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GarageInclude<ExtArgs> | null
    where?: GarageWhereInput
  }

  /**
   * Booking.garageService
   */
  export type Booking$garageServiceArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GarageService
     */
    select?: GarageServiceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GarageServiceInclude<ExtArgs> | null
    where?: GarageServiceWhereInput
  }

  /**
   * Booking.towTruck
   */
  export type Booking$towTruckArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TowTruck
     */
    select?: TowTruckSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TowTruckInclude<ExtArgs> | null
    where?: TowTruckWhereInput
  }

  /**
   * Booking.towTruckService
   */
  export type Booking$towTruckServiceArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TowTruckService
     */
    select?: TowTruckServiceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TowTruckServiceInclude<ExtArgs> | null
    where?: TowTruckServiceWhereInput
  }

  /**
   * Booking.promoCode
   */
  export type Booking$promoCodeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PromoCode
     */
    select?: PromoCodeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PromoCodeInclude<ExtArgs> | null
    where?: PromoCodeWhereInput
  }

  /**
   * Booking without action
   */
  export type BookingDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Booking
     */
    select?: BookingSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BookingInclude<ExtArgs> | null
  }


  /**
   * Model PromoCode
   */

  export type AggregatePromoCode = {
    _count: PromoCodeCountAggregateOutputType | null
    _avg: PromoCodeAvgAggregateOutputType | null
    _sum: PromoCodeSumAggregateOutputType | null
    _min: PromoCodeMinAggregateOutputType | null
    _max: PromoCodeMaxAggregateOutputType | null
  }

  export type PromoCodeAvgAggregateOutputType = {
    discountValue: number | null
    maxUses: number | null
    timesUsed: number | null
  }

  export type PromoCodeSumAggregateOutputType = {
    discountValue: number | null
    maxUses: number | null
    timesUsed: number | null
  }

  export type PromoCodeMinAggregateOutputType = {
    id: string | null
    code: string | null
    discountType: $Enums.DiscountType | null
    discountValue: number | null
    expiresAt: Date | null
    maxUses: number | null
    timesUsed: number | null
    isActive: boolean | null
  }

  export type PromoCodeMaxAggregateOutputType = {
    id: string | null
    code: string | null
    discountType: $Enums.DiscountType | null
    discountValue: number | null
    expiresAt: Date | null
    maxUses: number | null
    timesUsed: number | null
    isActive: boolean | null
  }

  export type PromoCodeCountAggregateOutputType = {
    id: number
    code: number
    discountType: number
    discountValue: number
    expiresAt: number
    maxUses: number
    timesUsed: number
    isActive: number
    _all: number
  }


  export type PromoCodeAvgAggregateInputType = {
    discountValue?: true
    maxUses?: true
    timesUsed?: true
  }

  export type PromoCodeSumAggregateInputType = {
    discountValue?: true
    maxUses?: true
    timesUsed?: true
  }

  export type PromoCodeMinAggregateInputType = {
    id?: true
    code?: true
    discountType?: true
    discountValue?: true
    expiresAt?: true
    maxUses?: true
    timesUsed?: true
    isActive?: true
  }

  export type PromoCodeMaxAggregateInputType = {
    id?: true
    code?: true
    discountType?: true
    discountValue?: true
    expiresAt?: true
    maxUses?: true
    timesUsed?: true
    isActive?: true
  }

  export type PromoCodeCountAggregateInputType = {
    id?: true
    code?: true
    discountType?: true
    discountValue?: true
    expiresAt?: true
    maxUses?: true
    timesUsed?: true
    isActive?: true
    _all?: true
  }

  export type PromoCodeAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PromoCode to aggregate.
     */
    where?: PromoCodeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PromoCodes to fetch.
     */
    orderBy?: PromoCodeOrderByWithRelationInput | PromoCodeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PromoCodeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PromoCodes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PromoCodes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PromoCodes
    **/
    _count?: true | PromoCodeCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PromoCodeAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PromoCodeSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PromoCodeMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PromoCodeMaxAggregateInputType
  }

  export type GetPromoCodeAggregateType<T extends PromoCodeAggregateArgs> = {
        [P in keyof T & keyof AggregatePromoCode]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePromoCode[P]>
      : GetScalarType<T[P], AggregatePromoCode[P]>
  }




  export type PromoCodeGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PromoCodeWhereInput
    orderBy?: PromoCodeOrderByWithAggregationInput | PromoCodeOrderByWithAggregationInput[]
    by: PromoCodeScalarFieldEnum[] | PromoCodeScalarFieldEnum
    having?: PromoCodeScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PromoCodeCountAggregateInputType | true
    _avg?: PromoCodeAvgAggregateInputType
    _sum?: PromoCodeSumAggregateInputType
    _min?: PromoCodeMinAggregateInputType
    _max?: PromoCodeMaxAggregateInputType
  }

  export type PromoCodeGroupByOutputType = {
    id: string
    code: string
    discountType: $Enums.DiscountType
    discountValue: number
    expiresAt: Date
    maxUses: number | null
    timesUsed: number
    isActive: boolean
    _count: PromoCodeCountAggregateOutputType | null
    _avg: PromoCodeAvgAggregateOutputType | null
    _sum: PromoCodeSumAggregateOutputType | null
    _min: PromoCodeMinAggregateOutputType | null
    _max: PromoCodeMaxAggregateOutputType | null
  }

  type GetPromoCodeGroupByPayload<T extends PromoCodeGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PromoCodeGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PromoCodeGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PromoCodeGroupByOutputType[P]>
            : GetScalarType<T[P], PromoCodeGroupByOutputType[P]>
        }
      >
    >


  export type PromoCodeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    code?: boolean
    discountType?: boolean
    discountValue?: boolean
    expiresAt?: boolean
    maxUses?: boolean
    timesUsed?: boolean
    isActive?: boolean
    bookings?: boolean | PromoCode$bookingsArgs<ExtArgs>
    _count?: boolean | PromoCodeCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["promoCode"]>


  export type PromoCodeSelectScalar = {
    id?: boolean
    code?: boolean
    discountType?: boolean
    discountValue?: boolean
    expiresAt?: boolean
    maxUses?: boolean
    timesUsed?: boolean
    isActive?: boolean
  }

  export type PromoCodeInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    bookings?: boolean | PromoCode$bookingsArgs<ExtArgs>
    _count?: boolean | PromoCodeCountOutputTypeDefaultArgs<ExtArgs>
  }

  export type $PromoCodePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PromoCode"
    objects: {
      bookings: Prisma.$BookingPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      code: string
      discountType: $Enums.DiscountType
      discountValue: number
      expiresAt: Date
      maxUses: number | null
      timesUsed: number
      isActive: boolean
    }, ExtArgs["result"]["promoCode"]>
    composites: {}
  }

  type PromoCodeGetPayload<S extends boolean | null | undefined | PromoCodeDefaultArgs> = $Result.GetResult<Prisma.$PromoCodePayload, S>

  type PromoCodeCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<PromoCodeFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: PromoCodeCountAggregateInputType | true
    }

  export interface PromoCodeDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PromoCode'], meta: { name: 'PromoCode' } }
    /**
     * Find zero or one PromoCode that matches the filter.
     * @param {PromoCodeFindUniqueArgs} args - Arguments to find a PromoCode
     * @example
     * // Get one PromoCode
     * const promoCode = await prisma.promoCode.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PromoCodeFindUniqueArgs>(args: SelectSubset<T, PromoCodeFindUniqueArgs<ExtArgs>>): Prisma__PromoCodeClient<$Result.GetResult<Prisma.$PromoCodePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one PromoCode that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {PromoCodeFindUniqueOrThrowArgs} args - Arguments to find a PromoCode
     * @example
     * // Get one PromoCode
     * const promoCode = await prisma.promoCode.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PromoCodeFindUniqueOrThrowArgs>(args: SelectSubset<T, PromoCodeFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PromoCodeClient<$Result.GetResult<Prisma.$PromoCodePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first PromoCode that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PromoCodeFindFirstArgs} args - Arguments to find a PromoCode
     * @example
     * // Get one PromoCode
     * const promoCode = await prisma.promoCode.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PromoCodeFindFirstArgs>(args?: SelectSubset<T, PromoCodeFindFirstArgs<ExtArgs>>): Prisma__PromoCodeClient<$Result.GetResult<Prisma.$PromoCodePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first PromoCode that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PromoCodeFindFirstOrThrowArgs} args - Arguments to find a PromoCode
     * @example
     * // Get one PromoCode
     * const promoCode = await prisma.promoCode.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PromoCodeFindFirstOrThrowArgs>(args?: SelectSubset<T, PromoCodeFindFirstOrThrowArgs<ExtArgs>>): Prisma__PromoCodeClient<$Result.GetResult<Prisma.$PromoCodePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more PromoCodes that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PromoCodeFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PromoCodes
     * const promoCodes = await prisma.promoCode.findMany()
     * 
     * // Get first 10 PromoCodes
     * const promoCodes = await prisma.promoCode.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const promoCodeWithIdOnly = await prisma.promoCode.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PromoCodeFindManyArgs>(args?: SelectSubset<T, PromoCodeFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PromoCodePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a PromoCode.
     * @param {PromoCodeCreateArgs} args - Arguments to create a PromoCode.
     * @example
     * // Create one PromoCode
     * const PromoCode = await prisma.promoCode.create({
     *   data: {
     *     // ... data to create a PromoCode
     *   }
     * })
     * 
     */
    create<T extends PromoCodeCreateArgs>(args: SelectSubset<T, PromoCodeCreateArgs<ExtArgs>>): Prisma__PromoCodeClient<$Result.GetResult<Prisma.$PromoCodePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many PromoCodes.
     * @param {PromoCodeCreateManyArgs} args - Arguments to create many PromoCodes.
     * @example
     * // Create many PromoCodes
     * const promoCode = await prisma.promoCode.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PromoCodeCreateManyArgs>(args?: SelectSubset<T, PromoCodeCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a PromoCode.
     * @param {PromoCodeDeleteArgs} args - Arguments to delete one PromoCode.
     * @example
     * // Delete one PromoCode
     * const PromoCode = await prisma.promoCode.delete({
     *   where: {
     *     // ... filter to delete one PromoCode
     *   }
     * })
     * 
     */
    delete<T extends PromoCodeDeleteArgs>(args: SelectSubset<T, PromoCodeDeleteArgs<ExtArgs>>): Prisma__PromoCodeClient<$Result.GetResult<Prisma.$PromoCodePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one PromoCode.
     * @param {PromoCodeUpdateArgs} args - Arguments to update one PromoCode.
     * @example
     * // Update one PromoCode
     * const promoCode = await prisma.promoCode.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PromoCodeUpdateArgs>(args: SelectSubset<T, PromoCodeUpdateArgs<ExtArgs>>): Prisma__PromoCodeClient<$Result.GetResult<Prisma.$PromoCodePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more PromoCodes.
     * @param {PromoCodeDeleteManyArgs} args - Arguments to filter PromoCodes to delete.
     * @example
     * // Delete a few PromoCodes
     * const { count } = await prisma.promoCode.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PromoCodeDeleteManyArgs>(args?: SelectSubset<T, PromoCodeDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PromoCodes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PromoCodeUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PromoCodes
     * const promoCode = await prisma.promoCode.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PromoCodeUpdateManyArgs>(args: SelectSubset<T, PromoCodeUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one PromoCode.
     * @param {PromoCodeUpsertArgs} args - Arguments to update or create a PromoCode.
     * @example
     * // Update or create a PromoCode
     * const promoCode = await prisma.promoCode.upsert({
     *   create: {
     *     // ... data to create a PromoCode
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PromoCode we want to update
     *   }
     * })
     */
    upsert<T extends PromoCodeUpsertArgs>(args: SelectSubset<T, PromoCodeUpsertArgs<ExtArgs>>): Prisma__PromoCodeClient<$Result.GetResult<Prisma.$PromoCodePayload<ExtArgs>, T, "upsert">, never, ExtArgs>

    /**
     * Find zero or more PromoCodes that matches the filter.
     * @param {PromoCodeFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const promoCode = await prisma.promoCode.findRaw({
     *   filter: { age: { $gt: 25 } } 
     * })
     */
    findRaw(args?: PromoCodeFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a PromoCode.
     * @param {PromoCodeAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const promoCode = await prisma.promoCode.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: PromoCodeAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


    /**
     * Count the number of PromoCodes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PromoCodeCountArgs} args - Arguments to filter PromoCodes to count.
     * @example
     * // Count the number of PromoCodes
     * const count = await prisma.promoCode.count({
     *   where: {
     *     // ... the filter for the PromoCodes we want to count
     *   }
     * })
    **/
    count<T extends PromoCodeCountArgs>(
      args?: Subset<T, PromoCodeCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PromoCodeCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PromoCode.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PromoCodeAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PromoCodeAggregateArgs>(args: Subset<T, PromoCodeAggregateArgs>): Prisma.PrismaPromise<GetPromoCodeAggregateType<T>>

    /**
     * Group by PromoCode.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PromoCodeGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PromoCodeGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PromoCodeGroupByArgs['orderBy'] }
        : { orderBy?: PromoCodeGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PromoCodeGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPromoCodeGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PromoCode model
   */
  readonly fields: PromoCodeFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PromoCode.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PromoCodeClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    bookings<T extends PromoCode$bookingsArgs<ExtArgs> = {}>(args?: Subset<T, PromoCode$bookingsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BookingPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the PromoCode model
   */ 
  interface PromoCodeFieldRefs {
    readonly id: FieldRef<"PromoCode", 'String'>
    readonly code: FieldRef<"PromoCode", 'String'>
    readonly discountType: FieldRef<"PromoCode", 'DiscountType'>
    readonly discountValue: FieldRef<"PromoCode", 'Float'>
    readonly expiresAt: FieldRef<"PromoCode", 'DateTime'>
    readonly maxUses: FieldRef<"PromoCode", 'Int'>
    readonly timesUsed: FieldRef<"PromoCode", 'Int'>
    readonly isActive: FieldRef<"PromoCode", 'Boolean'>
  }
    

  // Custom InputTypes
  /**
   * PromoCode findUnique
   */
  export type PromoCodeFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PromoCode
     */
    select?: PromoCodeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PromoCodeInclude<ExtArgs> | null
    /**
     * Filter, which PromoCode to fetch.
     */
    where: PromoCodeWhereUniqueInput
  }

  /**
   * PromoCode findUniqueOrThrow
   */
  export type PromoCodeFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PromoCode
     */
    select?: PromoCodeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PromoCodeInclude<ExtArgs> | null
    /**
     * Filter, which PromoCode to fetch.
     */
    where: PromoCodeWhereUniqueInput
  }

  /**
   * PromoCode findFirst
   */
  export type PromoCodeFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PromoCode
     */
    select?: PromoCodeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PromoCodeInclude<ExtArgs> | null
    /**
     * Filter, which PromoCode to fetch.
     */
    where?: PromoCodeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PromoCodes to fetch.
     */
    orderBy?: PromoCodeOrderByWithRelationInput | PromoCodeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PromoCodes.
     */
    cursor?: PromoCodeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PromoCodes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PromoCodes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PromoCodes.
     */
    distinct?: PromoCodeScalarFieldEnum | PromoCodeScalarFieldEnum[]
  }

  /**
   * PromoCode findFirstOrThrow
   */
  export type PromoCodeFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PromoCode
     */
    select?: PromoCodeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PromoCodeInclude<ExtArgs> | null
    /**
     * Filter, which PromoCode to fetch.
     */
    where?: PromoCodeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PromoCodes to fetch.
     */
    orderBy?: PromoCodeOrderByWithRelationInput | PromoCodeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PromoCodes.
     */
    cursor?: PromoCodeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PromoCodes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PromoCodes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PromoCodes.
     */
    distinct?: PromoCodeScalarFieldEnum | PromoCodeScalarFieldEnum[]
  }

  /**
   * PromoCode findMany
   */
  export type PromoCodeFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PromoCode
     */
    select?: PromoCodeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PromoCodeInclude<ExtArgs> | null
    /**
     * Filter, which PromoCodes to fetch.
     */
    where?: PromoCodeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PromoCodes to fetch.
     */
    orderBy?: PromoCodeOrderByWithRelationInput | PromoCodeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PromoCodes.
     */
    cursor?: PromoCodeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PromoCodes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PromoCodes.
     */
    skip?: number
    distinct?: PromoCodeScalarFieldEnum | PromoCodeScalarFieldEnum[]
  }

  /**
   * PromoCode create
   */
  export type PromoCodeCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PromoCode
     */
    select?: PromoCodeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PromoCodeInclude<ExtArgs> | null
    /**
     * The data needed to create a PromoCode.
     */
    data: XOR<PromoCodeCreateInput, PromoCodeUncheckedCreateInput>
  }

  /**
   * PromoCode createMany
   */
  export type PromoCodeCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PromoCodes.
     */
    data: PromoCodeCreateManyInput | PromoCodeCreateManyInput[]
  }

  /**
   * PromoCode update
   */
  export type PromoCodeUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PromoCode
     */
    select?: PromoCodeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PromoCodeInclude<ExtArgs> | null
    /**
     * The data needed to update a PromoCode.
     */
    data: XOR<PromoCodeUpdateInput, PromoCodeUncheckedUpdateInput>
    /**
     * Choose, which PromoCode to update.
     */
    where: PromoCodeWhereUniqueInput
  }

  /**
   * PromoCode updateMany
   */
  export type PromoCodeUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PromoCodes.
     */
    data: XOR<PromoCodeUpdateManyMutationInput, PromoCodeUncheckedUpdateManyInput>
    /**
     * Filter which PromoCodes to update
     */
    where?: PromoCodeWhereInput
  }

  /**
   * PromoCode upsert
   */
  export type PromoCodeUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PromoCode
     */
    select?: PromoCodeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PromoCodeInclude<ExtArgs> | null
    /**
     * The filter to search for the PromoCode to update in case it exists.
     */
    where: PromoCodeWhereUniqueInput
    /**
     * In case the PromoCode found by the `where` argument doesn't exist, create a new PromoCode with this data.
     */
    create: XOR<PromoCodeCreateInput, PromoCodeUncheckedCreateInput>
    /**
     * In case the PromoCode was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PromoCodeUpdateInput, PromoCodeUncheckedUpdateInput>
  }

  /**
   * PromoCode delete
   */
  export type PromoCodeDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PromoCode
     */
    select?: PromoCodeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PromoCodeInclude<ExtArgs> | null
    /**
     * Filter which PromoCode to delete.
     */
    where: PromoCodeWhereUniqueInput
  }

  /**
   * PromoCode deleteMany
   */
  export type PromoCodeDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PromoCodes to delete
     */
    where?: PromoCodeWhereInput
  }

  /**
   * PromoCode findRaw
   */
  export type PromoCodeFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The query predicate filter. If unspecified, then all documents in the collection will match the predicate. ${@link https://docs.mongodb.com/manual/reference/operator/query MongoDB Docs}.
     */
    filter?: InputJsonValue
    /**
     * Additional options to pass to the `find` command ${@link https://docs.mongodb.com/manual/reference/command/find/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * PromoCode aggregateRaw
   */
  export type PromoCodeAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * An array of aggregation stages to process and transform the document stream via the aggregation pipeline. ${@link https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline MongoDB Docs}.
     */
    pipeline?: InputJsonValue[]
    /**
     * Additional options to pass to the `aggregate` command ${@link https://docs.mongodb.com/manual/reference/command/aggregate/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * PromoCode.bookings
   */
  export type PromoCode$bookingsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Booking
     */
    select?: BookingSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BookingInclude<ExtArgs> | null
    where?: BookingWhereInput
    orderBy?: BookingOrderByWithRelationInput | BookingOrderByWithRelationInput[]
    cursor?: BookingWhereUniqueInput
    take?: number
    skip?: number
    distinct?: BookingScalarFieldEnum | BookingScalarFieldEnum[]
  }

  /**
   * PromoCode without action
   */
  export type PromoCodeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PromoCode
     */
    select?: PromoCodeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PromoCodeInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const UserScalarFieldEnum: {
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

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const VehicleScalarFieldEnum: {
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

  export type VehicleScalarFieldEnum = (typeof VehicleScalarFieldEnum)[keyof typeof VehicleScalarFieldEnum]


  export const ServiceScalarFieldEnum: {
    id: 'id',
    name: 'name',
    description: 'description',
    icon: 'icon',
    type: 'type'
  };

  export type ServiceScalarFieldEnum = (typeof ServiceScalarFieldEnum)[keyof typeof ServiceScalarFieldEnum]


  export const GarageScalarFieldEnum: {
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

  export type GarageScalarFieldEnum = (typeof GarageScalarFieldEnum)[keyof typeof GarageScalarFieldEnum]


  export const GarageServiceScalarFieldEnum: {
    id: 'id',
    price: 'price',
    garageId: 'garageId',
    serviceId: 'serviceId'
  };

  export type GarageServiceScalarFieldEnum = (typeof GarageServiceScalarFieldEnum)[keyof typeof GarageServiceScalarFieldEnum]


  export const TowTruckScalarFieldEnum: {
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

  export type TowTruckScalarFieldEnum = (typeof TowTruckScalarFieldEnum)[keyof typeof TowTruckScalarFieldEnum]


  export const TowTruckServiceScalarFieldEnum: {
    id: 'id',
    price: 'price',
    vehicleType: 'vehicleType',
    towTruckId: 'towTruckId'
  };

  export type TowTruckServiceScalarFieldEnum = (typeof TowTruckServiceScalarFieldEnum)[keyof typeof TowTruckServiceScalarFieldEnum]


  export const LiveTruckLocationScalarFieldEnum: {
    id: 'id',
    location: 'location',
    lastUpdated: 'lastUpdated',
    isAvailable: 'isAvailable',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    towTruckId: 'towTruckId'
  };

  export type LiveTruckLocationScalarFieldEnum = (typeof LiveTruckLocationScalarFieldEnum)[keyof typeof LiveTruckLocationScalarFieldEnum]


  export const SparePartScalarFieldEnum: {
    id: 'id',
    partName: 'partName',
    compatibleMake: 'compatibleMake',
    compatibleModel: 'compatibleModel',
    compatibleYear: 'compatibleYear',
    price: 'price',
    quantityAvailable: 'quantityAvailable',
    garageId: 'garageId'
  };

  export type SparePartScalarFieldEnum = (typeof SparePartScalarFieldEnum)[keyof typeof SparePartScalarFieldEnum]


  export const BookingScalarFieldEnum: {
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

  export type BookingScalarFieldEnum = (typeof BookingScalarFieldEnum)[keyof typeof BookingScalarFieldEnum]


  export const PromoCodeScalarFieldEnum: {
    id: 'id',
    code: 'code',
    discountType: 'discountType',
    discountValue: 'discountValue',
    expiresAt: 'expiresAt',
    maxUses: 'maxUses',
    timesUsed: 'timesUsed',
    isActive: 'isActive'
  };

  export type PromoCodeScalarFieldEnum = (typeof PromoCodeScalarFieldEnum)[keyof typeof PromoCodeScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  /**
   * Field references 
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Role[]'
   */
  export type ListEnumRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Role[]'>
    


  /**
   * Reference to a field of type 'Role'
   */
  export type EnumRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Role'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'VehicleType'
   */
  export type EnumVehicleTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'VehicleType'>
    


  /**
   * Reference to a field of type 'VehicleType[]'
   */
  export type ListEnumVehicleTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'VehicleType[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    


  /**
   * Reference to a field of type 'VerificationStatus'
   */
  export type EnumVerificationStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'VerificationStatus'>
    


  /**
   * Reference to a field of type 'VerificationStatus[]'
   */
  export type ListEnumVerificationStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'VerificationStatus[]'>
    


  /**
   * Reference to a field of type 'BookingStatus'
   */
  export type EnumBookingStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BookingStatus'>
    


  /**
   * Reference to a field of type 'BookingStatus[]'
   */
  export type ListEnumBookingStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BookingStatus[]'>
    


  /**
   * Reference to a field of type 'DiscountType'
   */
  export type EnumDiscountTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DiscountType'>
    


  /**
   * Reference to a field of type 'DiscountType[]'
   */
  export type ListEnumDiscountTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DiscountType[]'>
    
  /**
   * Deep Input Types
   */


  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: StringFilter<"User"> | string
    clerkId?: StringFilter<"User"> | string
    email?: StringFilter<"User"> | string
    firstName?: StringFilter<"User"> | string
    lastName?: StringNullableFilter<"User"> | string | null
    phone?: StringFilter<"User"> | string
    role?: EnumRoleNullableListFilter<"User">
    isPremium?: BoolFilter<"User"> | boolean
    isBanned?: BoolFilter<"User"> | boolean
    unsafeMetadata?: JsonNullableFilter<"User">
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    stripeCustomerId?: StringNullableFilter<"User"> | string | null
    vehicles?: VehicleListRelationFilter
    garage?: XOR<GarageNullableRelationFilter, GarageWhereInput> | null
    towTruck?: XOR<TowTruckNullableRelationFilter, TowTruckWhereInput> | null
    bookings?: BookingListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    clerkId?: SortOrder
    email?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    phone?: SortOrder
    role?: SortOrder
    isPremium?: SortOrder
    isBanned?: SortOrder
    unsafeMetadata?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    stripeCustomerId?: SortOrder
    vehicles?: VehicleOrderByRelationAggregateInput
    garage?: GarageOrderByWithRelationInput
    towTruck?: TowTruckOrderByWithRelationInput
    bookings?: BookingOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    clerkId?: string
    email?: string
    stripeCustomerId?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    firstName?: StringFilter<"User"> | string
    lastName?: StringNullableFilter<"User"> | string | null
    phone?: StringFilter<"User"> | string
    role?: EnumRoleNullableListFilter<"User">
    isPremium?: BoolFilter<"User"> | boolean
    isBanned?: BoolFilter<"User"> | boolean
    unsafeMetadata?: JsonNullableFilter<"User">
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    vehicles?: VehicleListRelationFilter
    garage?: XOR<GarageNullableRelationFilter, GarageWhereInput> | null
    towTruck?: XOR<TowTruckNullableRelationFilter, TowTruckWhereInput> | null
    bookings?: BookingListRelationFilter
  }, "id" | "clerkId" | "email" | "stripeCustomerId">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    clerkId?: SortOrder
    email?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    phone?: SortOrder
    role?: SortOrder
    isPremium?: SortOrder
    isBanned?: SortOrder
    unsafeMetadata?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    stripeCustomerId?: SortOrder
    _count?: UserCountOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"User"> | string
    clerkId?: StringWithAggregatesFilter<"User"> | string
    email?: StringWithAggregatesFilter<"User"> | string
    firstName?: StringWithAggregatesFilter<"User"> | string
    lastName?: StringNullableWithAggregatesFilter<"User"> | string | null
    phone?: StringWithAggregatesFilter<"User"> | string
    role?: EnumRoleNullableListFilter<"User">
    isPremium?: BoolWithAggregatesFilter<"User"> | boolean
    isBanned?: BoolWithAggregatesFilter<"User"> | boolean
    unsafeMetadata?: JsonNullableWithAggregatesFilter<"User">
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    stripeCustomerId?: StringNullableWithAggregatesFilter<"User"> | string | null
  }

  export type VehicleWhereInput = {
    AND?: VehicleWhereInput | VehicleWhereInput[]
    OR?: VehicleWhereInput[]
    NOT?: VehicleWhereInput | VehicleWhereInput[]
    id?: StringFilter<"Vehicle"> | string
    brand?: StringFilter<"Vehicle"> | string
    name?: StringFilter<"Vehicle"> | string
    model?: StringFilter<"Vehicle"> | string
    year?: IntFilter<"Vehicle"> | number
    plateNumber?: StringFilter<"Vehicle"> | string
    color?: StringNullableFilter<"Vehicle"> | string | null
    type?: EnumVehicleTypeFilter<"Vehicle"> | $Enums.VehicleType
    createdAt?: DateTimeFilter<"Vehicle"> | Date | string
    updatedAt?: DateTimeFilter<"Vehicle"> | Date | string
    userId?: StringFilter<"Vehicle"> | string
    user?: XOR<UserRelationFilter, UserWhereInput>
    bookings?: BookingListRelationFilter
  }

  export type VehicleOrderByWithRelationInput = {
    id?: SortOrder
    brand?: SortOrder
    name?: SortOrder
    model?: SortOrder
    year?: SortOrder
    plateNumber?: SortOrder
    color?: SortOrder
    type?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    user?: UserOrderByWithRelationInput
    bookings?: BookingOrderByRelationAggregateInput
  }

  export type VehicleWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    plateNumber?: string
    AND?: VehicleWhereInput | VehicleWhereInput[]
    OR?: VehicleWhereInput[]
    NOT?: VehicleWhereInput | VehicleWhereInput[]
    brand?: StringFilter<"Vehicle"> | string
    name?: StringFilter<"Vehicle"> | string
    model?: StringFilter<"Vehicle"> | string
    year?: IntFilter<"Vehicle"> | number
    color?: StringNullableFilter<"Vehicle"> | string | null
    type?: EnumVehicleTypeFilter<"Vehicle"> | $Enums.VehicleType
    createdAt?: DateTimeFilter<"Vehicle"> | Date | string
    updatedAt?: DateTimeFilter<"Vehicle"> | Date | string
    userId?: StringFilter<"Vehicle"> | string
    user?: XOR<UserRelationFilter, UserWhereInput>
    bookings?: BookingListRelationFilter
  }, "id" | "plateNumber">

  export type VehicleOrderByWithAggregationInput = {
    id?: SortOrder
    brand?: SortOrder
    name?: SortOrder
    model?: SortOrder
    year?: SortOrder
    plateNumber?: SortOrder
    color?: SortOrder
    type?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    _count?: VehicleCountOrderByAggregateInput
    _avg?: VehicleAvgOrderByAggregateInput
    _max?: VehicleMaxOrderByAggregateInput
    _min?: VehicleMinOrderByAggregateInput
    _sum?: VehicleSumOrderByAggregateInput
  }

  export type VehicleScalarWhereWithAggregatesInput = {
    AND?: VehicleScalarWhereWithAggregatesInput | VehicleScalarWhereWithAggregatesInput[]
    OR?: VehicleScalarWhereWithAggregatesInput[]
    NOT?: VehicleScalarWhereWithAggregatesInput | VehicleScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Vehicle"> | string
    brand?: StringWithAggregatesFilter<"Vehicle"> | string
    name?: StringWithAggregatesFilter<"Vehicle"> | string
    model?: StringWithAggregatesFilter<"Vehicle"> | string
    year?: IntWithAggregatesFilter<"Vehicle"> | number
    plateNumber?: StringWithAggregatesFilter<"Vehicle"> | string
    color?: StringNullableWithAggregatesFilter<"Vehicle"> | string | null
    type?: EnumVehicleTypeWithAggregatesFilter<"Vehicle"> | $Enums.VehicleType
    createdAt?: DateTimeWithAggregatesFilter<"Vehicle"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Vehicle"> | Date | string
    userId?: StringWithAggregatesFilter<"Vehicle"> | string
  }

  export type ServiceWhereInput = {
    AND?: ServiceWhereInput | ServiceWhereInput[]
    OR?: ServiceWhereInput[]
    NOT?: ServiceWhereInput | ServiceWhereInput[]
    id?: StringFilter<"Service"> | string
    name?: StringFilter<"Service"> | string
    description?: StringFilter<"Service"> | string
    icon?: StringNullableFilter<"Service"> | string | null
    type?: StringFilter<"Service"> | string
    offeredByGarages?: GarageServiceListRelationFilter
    bookings?: BookingListRelationFilter
  }

  export type ServiceOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    icon?: SortOrder
    type?: SortOrder
    offeredByGarages?: GarageServiceOrderByRelationAggregateInput
    bookings?: BookingOrderByRelationAggregateInput
  }

  export type ServiceWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    name?: string
    AND?: ServiceWhereInput | ServiceWhereInput[]
    OR?: ServiceWhereInput[]
    NOT?: ServiceWhereInput | ServiceWhereInput[]
    description?: StringFilter<"Service"> | string
    icon?: StringNullableFilter<"Service"> | string | null
    type?: StringFilter<"Service"> | string
    offeredByGarages?: GarageServiceListRelationFilter
    bookings?: BookingListRelationFilter
  }, "id" | "name">

  export type ServiceOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    icon?: SortOrder
    type?: SortOrder
    _count?: ServiceCountOrderByAggregateInput
    _max?: ServiceMaxOrderByAggregateInput
    _min?: ServiceMinOrderByAggregateInput
  }

  export type ServiceScalarWhereWithAggregatesInput = {
    AND?: ServiceScalarWhereWithAggregatesInput | ServiceScalarWhereWithAggregatesInput[]
    OR?: ServiceScalarWhereWithAggregatesInput[]
    NOT?: ServiceScalarWhereWithAggregatesInput | ServiceScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Service"> | string
    name?: StringWithAggregatesFilter<"Service"> | string
    description?: StringWithAggregatesFilter<"Service"> | string
    icon?: StringNullableWithAggregatesFilter<"Service"> | string | null
    type?: StringWithAggregatesFilter<"Service"> | string
  }

  export type GarageWhereInput = {
    AND?: GarageWhereInput | GarageWhereInput[]
    OR?: GarageWhereInput[]
    NOT?: GarageWhereInput | GarageWhereInput[]
    id?: StringFilter<"Garage"> | string
    name?: StringFilter<"Garage"> | string
    licenseNumber?: StringFilter<"Garage"> | string
    address?: StringFilter<"Garage"> | string
    ownerName?: StringFilter<"Garage"> | string
    contactEmail?: StringNullableFilter<"Garage"> | string | null
    contactPhone?: StringNullableFilter<"Garage"> | string | null
    numberOfEmployees?: IntFilter<"Garage"> | number
    rating?: FloatNullableFilter<"Garage"> | number | null
    reviewCount?: IntNullableFilter<"Garage"> | number | null
    isOpen?: BoolFilter<"Garage"> | boolean
    operatingHours?: JsonNullableFilter<"Garage">
    stripeAccountId?: StringNullableFilter<"Garage"> | string | null
    location?: JsonFilter<"Garage">
    createdAt?: DateTimeFilter<"Garage"> | Date | string
    updatedAt?: DateTimeFilter<"Garage"> | Date | string
    status?: EnumVerificationStatusFilter<"Garage"> | $Enums.VerificationStatus
    rejectionReason?: StringNullableFilter<"Garage"> | string | null
    ownerId?: StringFilter<"Garage"> | string
    owner?: XOR<UserRelationFilter, UserWhereInput>
    services?: GarageServiceListRelationFilter
    spareParts?: SparePartListRelationFilter
    bookings?: BookingListRelationFilter
  }

  export type GarageOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    licenseNumber?: SortOrder
    address?: SortOrder
    ownerName?: SortOrder
    contactEmail?: SortOrder
    contactPhone?: SortOrder
    numberOfEmployees?: SortOrder
    rating?: SortOrder
    reviewCount?: SortOrder
    isOpen?: SortOrder
    operatingHours?: SortOrder
    stripeAccountId?: SortOrder
    location?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    status?: SortOrder
    rejectionReason?: SortOrder
    ownerId?: SortOrder
    owner?: UserOrderByWithRelationInput
    services?: GarageServiceOrderByRelationAggregateInput
    spareParts?: SparePartOrderByRelationAggregateInput
    bookings?: BookingOrderByRelationAggregateInput
  }

  export type GarageWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    licenseNumber?: string
    stripeAccountId?: string
    ownerId?: string
    AND?: GarageWhereInput | GarageWhereInput[]
    OR?: GarageWhereInput[]
    NOT?: GarageWhereInput | GarageWhereInput[]
    name?: StringFilter<"Garage"> | string
    address?: StringFilter<"Garage"> | string
    ownerName?: StringFilter<"Garage"> | string
    contactEmail?: StringNullableFilter<"Garage"> | string | null
    contactPhone?: StringNullableFilter<"Garage"> | string | null
    numberOfEmployees?: IntFilter<"Garage"> | number
    rating?: FloatNullableFilter<"Garage"> | number | null
    reviewCount?: IntNullableFilter<"Garage"> | number | null
    isOpen?: BoolFilter<"Garage"> | boolean
    operatingHours?: JsonNullableFilter<"Garage">
    location?: JsonFilter<"Garage">
    createdAt?: DateTimeFilter<"Garage"> | Date | string
    updatedAt?: DateTimeFilter<"Garage"> | Date | string
    status?: EnumVerificationStatusFilter<"Garage"> | $Enums.VerificationStatus
    rejectionReason?: StringNullableFilter<"Garage"> | string | null
    owner?: XOR<UserRelationFilter, UserWhereInput>
    services?: GarageServiceListRelationFilter
    spareParts?: SparePartListRelationFilter
    bookings?: BookingListRelationFilter
  }, "id" | "licenseNumber" | "stripeAccountId" | "ownerId">

  export type GarageOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    licenseNumber?: SortOrder
    address?: SortOrder
    ownerName?: SortOrder
    contactEmail?: SortOrder
    contactPhone?: SortOrder
    numberOfEmployees?: SortOrder
    rating?: SortOrder
    reviewCount?: SortOrder
    isOpen?: SortOrder
    operatingHours?: SortOrder
    stripeAccountId?: SortOrder
    location?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    status?: SortOrder
    rejectionReason?: SortOrder
    ownerId?: SortOrder
    _count?: GarageCountOrderByAggregateInput
    _avg?: GarageAvgOrderByAggregateInput
    _max?: GarageMaxOrderByAggregateInput
    _min?: GarageMinOrderByAggregateInput
    _sum?: GarageSumOrderByAggregateInput
  }

  export type GarageScalarWhereWithAggregatesInput = {
    AND?: GarageScalarWhereWithAggregatesInput | GarageScalarWhereWithAggregatesInput[]
    OR?: GarageScalarWhereWithAggregatesInput[]
    NOT?: GarageScalarWhereWithAggregatesInput | GarageScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Garage"> | string
    name?: StringWithAggregatesFilter<"Garage"> | string
    licenseNumber?: StringWithAggregatesFilter<"Garage"> | string
    address?: StringWithAggregatesFilter<"Garage"> | string
    ownerName?: StringWithAggregatesFilter<"Garage"> | string
    contactEmail?: StringNullableWithAggregatesFilter<"Garage"> | string | null
    contactPhone?: StringNullableWithAggregatesFilter<"Garage"> | string | null
    numberOfEmployees?: IntWithAggregatesFilter<"Garage"> | number
    rating?: FloatNullableWithAggregatesFilter<"Garage"> | number | null
    reviewCount?: IntNullableWithAggregatesFilter<"Garage"> | number | null
    isOpen?: BoolWithAggregatesFilter<"Garage"> | boolean
    operatingHours?: JsonNullableWithAggregatesFilter<"Garage">
    stripeAccountId?: StringNullableWithAggregatesFilter<"Garage"> | string | null
    location?: JsonWithAggregatesFilter<"Garage">
    createdAt?: DateTimeWithAggregatesFilter<"Garage"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Garage"> | Date | string
    status?: EnumVerificationStatusWithAggregatesFilter<"Garage"> | $Enums.VerificationStatus
    rejectionReason?: StringNullableWithAggregatesFilter<"Garage"> | string | null
    ownerId?: StringWithAggregatesFilter<"Garage"> | string
  }

  export type GarageServiceWhereInput = {
    AND?: GarageServiceWhereInput | GarageServiceWhereInput[]
    OR?: GarageServiceWhereInput[]
    NOT?: GarageServiceWhereInput | GarageServiceWhereInput[]
    id?: StringFilter<"GarageService"> | string
    price?: FloatFilter<"GarageService"> | number
    garageId?: StringFilter<"GarageService"> | string
    serviceId?: StringFilter<"GarageService"> | string
    garage?: XOR<GarageRelationFilter, GarageWhereInput>
    service?: XOR<ServiceRelationFilter, ServiceWhereInput>
    bookings?: BookingListRelationFilter
  }

  export type GarageServiceOrderByWithRelationInput = {
    id?: SortOrder
    price?: SortOrder
    garageId?: SortOrder
    serviceId?: SortOrder
    garage?: GarageOrderByWithRelationInput
    service?: ServiceOrderByWithRelationInput
    bookings?: BookingOrderByRelationAggregateInput
  }

  export type GarageServiceWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    garageId_serviceId?: GarageServiceGarageIdServiceIdCompoundUniqueInput
    AND?: GarageServiceWhereInput | GarageServiceWhereInput[]
    OR?: GarageServiceWhereInput[]
    NOT?: GarageServiceWhereInput | GarageServiceWhereInput[]
    price?: FloatFilter<"GarageService"> | number
    garageId?: StringFilter<"GarageService"> | string
    serviceId?: StringFilter<"GarageService"> | string
    garage?: XOR<GarageRelationFilter, GarageWhereInput>
    service?: XOR<ServiceRelationFilter, ServiceWhereInput>
    bookings?: BookingListRelationFilter
  }, "id" | "garageId_serviceId">

  export type GarageServiceOrderByWithAggregationInput = {
    id?: SortOrder
    price?: SortOrder
    garageId?: SortOrder
    serviceId?: SortOrder
    _count?: GarageServiceCountOrderByAggregateInput
    _avg?: GarageServiceAvgOrderByAggregateInput
    _max?: GarageServiceMaxOrderByAggregateInput
    _min?: GarageServiceMinOrderByAggregateInput
    _sum?: GarageServiceSumOrderByAggregateInput
  }

  export type GarageServiceScalarWhereWithAggregatesInput = {
    AND?: GarageServiceScalarWhereWithAggregatesInput | GarageServiceScalarWhereWithAggregatesInput[]
    OR?: GarageServiceScalarWhereWithAggregatesInput[]
    NOT?: GarageServiceScalarWhereWithAggregatesInput | GarageServiceScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"GarageService"> | string
    price?: FloatWithAggregatesFilter<"GarageService"> | number
    garageId?: StringWithAggregatesFilter<"GarageService"> | string
    serviceId?: StringWithAggregatesFilter<"GarageService"> | string
  }

  export type TowTruckWhereInput = {
    AND?: TowTruckWhereInput | TowTruckWhereInput[]
    OR?: TowTruckWhereInput[]
    NOT?: TowTruckWhereInput | TowTruckWhereInput[]
    id?: StringFilter<"TowTruck"> | string
    name?: StringFilter<"TowTruck"> | string
    driverName?: StringFilter<"TowTruck"> | string
    model?: StringFilter<"TowTruck"> | string
    make?: StringFilter<"TowTruck"> | string
    year?: IntFilter<"TowTruck"> | number
    plateNumber?: StringFilter<"TowTruck"> | string
    licenseNumber?: StringFilter<"TowTruck"> | string
    status?: EnumVerificationStatusFilter<"TowTruck"> | $Enums.VerificationStatus
    rejectionReason?: StringNullableFilter<"TowTruck"> | string | null
    createdAt?: DateTimeFilter<"TowTruck"> | Date | string
    updatedAt?: DateTimeFilter<"TowTruck"> | Date | string
    ownerId?: StringFilter<"TowTruck"> | string
    stripeAccountId?: StringNullableFilter<"TowTruck"> | string | null
    owner?: XOR<UserRelationFilter, UserWhereInput>
    services?: TowTruckServiceListRelationFilter
    bookings?: BookingListRelationFilter
    liveLocation?: XOR<LiveTruckLocationNullableRelationFilter, LiveTruckLocationWhereInput> | null
  }

  export type TowTruckOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    driverName?: SortOrder
    model?: SortOrder
    make?: SortOrder
    year?: SortOrder
    plateNumber?: SortOrder
    licenseNumber?: SortOrder
    status?: SortOrder
    rejectionReason?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    ownerId?: SortOrder
    stripeAccountId?: SortOrder
    owner?: UserOrderByWithRelationInput
    services?: TowTruckServiceOrderByRelationAggregateInput
    bookings?: BookingOrderByRelationAggregateInput
    liveLocation?: LiveTruckLocationOrderByWithRelationInput
  }

  export type TowTruckWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    plateNumber?: string
    licenseNumber?: string
    ownerId?: string
    stripeAccountId?: string
    AND?: TowTruckWhereInput | TowTruckWhereInput[]
    OR?: TowTruckWhereInput[]
    NOT?: TowTruckWhereInput | TowTruckWhereInput[]
    name?: StringFilter<"TowTruck"> | string
    driverName?: StringFilter<"TowTruck"> | string
    model?: StringFilter<"TowTruck"> | string
    make?: StringFilter<"TowTruck"> | string
    year?: IntFilter<"TowTruck"> | number
    status?: EnumVerificationStatusFilter<"TowTruck"> | $Enums.VerificationStatus
    rejectionReason?: StringNullableFilter<"TowTruck"> | string | null
    createdAt?: DateTimeFilter<"TowTruck"> | Date | string
    updatedAt?: DateTimeFilter<"TowTruck"> | Date | string
    owner?: XOR<UserRelationFilter, UserWhereInput>
    services?: TowTruckServiceListRelationFilter
    bookings?: BookingListRelationFilter
    liveLocation?: XOR<LiveTruckLocationNullableRelationFilter, LiveTruckLocationWhereInput> | null
  }, "id" | "plateNumber" | "licenseNumber" | "ownerId" | "stripeAccountId">

  export type TowTruckOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    driverName?: SortOrder
    model?: SortOrder
    make?: SortOrder
    year?: SortOrder
    plateNumber?: SortOrder
    licenseNumber?: SortOrder
    status?: SortOrder
    rejectionReason?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    ownerId?: SortOrder
    stripeAccountId?: SortOrder
    _count?: TowTruckCountOrderByAggregateInput
    _avg?: TowTruckAvgOrderByAggregateInput
    _max?: TowTruckMaxOrderByAggregateInput
    _min?: TowTruckMinOrderByAggregateInput
    _sum?: TowTruckSumOrderByAggregateInput
  }

  export type TowTruckScalarWhereWithAggregatesInput = {
    AND?: TowTruckScalarWhereWithAggregatesInput | TowTruckScalarWhereWithAggregatesInput[]
    OR?: TowTruckScalarWhereWithAggregatesInput[]
    NOT?: TowTruckScalarWhereWithAggregatesInput | TowTruckScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"TowTruck"> | string
    name?: StringWithAggregatesFilter<"TowTruck"> | string
    driverName?: StringWithAggregatesFilter<"TowTruck"> | string
    model?: StringWithAggregatesFilter<"TowTruck"> | string
    make?: StringWithAggregatesFilter<"TowTruck"> | string
    year?: IntWithAggregatesFilter<"TowTruck"> | number
    plateNumber?: StringWithAggregatesFilter<"TowTruck"> | string
    licenseNumber?: StringWithAggregatesFilter<"TowTruck"> | string
    status?: EnumVerificationStatusWithAggregatesFilter<"TowTruck"> | $Enums.VerificationStatus
    rejectionReason?: StringNullableWithAggregatesFilter<"TowTruck"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"TowTruck"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"TowTruck"> | Date | string
    ownerId?: StringWithAggregatesFilter<"TowTruck"> | string
    stripeAccountId?: StringNullableWithAggregatesFilter<"TowTruck"> | string | null
  }

  export type TowTruckServiceWhereInput = {
    AND?: TowTruckServiceWhereInput | TowTruckServiceWhereInput[]
    OR?: TowTruckServiceWhereInput[]
    NOT?: TowTruckServiceWhereInput | TowTruckServiceWhereInput[]
    id?: StringFilter<"TowTruckService"> | string
    price?: FloatFilter<"TowTruckService"> | number
    vehicleType?: EnumVehicleTypeFilter<"TowTruckService"> | $Enums.VehicleType
    towTruckId?: StringFilter<"TowTruckService"> | string
    towTruck?: XOR<TowTruckRelationFilter, TowTruckWhereInput>
    bookings?: BookingListRelationFilter
  }

  export type TowTruckServiceOrderByWithRelationInput = {
    id?: SortOrder
    price?: SortOrder
    vehicleType?: SortOrder
    towTruckId?: SortOrder
    towTruck?: TowTruckOrderByWithRelationInput
    bookings?: BookingOrderByRelationAggregateInput
  }

  export type TowTruckServiceWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    towTruckId_vehicleType?: TowTruckServiceTowTruckIdVehicleTypeCompoundUniqueInput
    AND?: TowTruckServiceWhereInput | TowTruckServiceWhereInput[]
    OR?: TowTruckServiceWhereInput[]
    NOT?: TowTruckServiceWhereInput | TowTruckServiceWhereInput[]
    price?: FloatFilter<"TowTruckService"> | number
    vehicleType?: EnumVehicleTypeFilter<"TowTruckService"> | $Enums.VehicleType
    towTruckId?: StringFilter<"TowTruckService"> | string
    towTruck?: XOR<TowTruckRelationFilter, TowTruckWhereInput>
    bookings?: BookingListRelationFilter
  }, "id" | "towTruckId_vehicleType">

  export type TowTruckServiceOrderByWithAggregationInput = {
    id?: SortOrder
    price?: SortOrder
    vehicleType?: SortOrder
    towTruckId?: SortOrder
    _count?: TowTruckServiceCountOrderByAggregateInput
    _avg?: TowTruckServiceAvgOrderByAggregateInput
    _max?: TowTruckServiceMaxOrderByAggregateInput
    _min?: TowTruckServiceMinOrderByAggregateInput
    _sum?: TowTruckServiceSumOrderByAggregateInput
  }

  export type TowTruckServiceScalarWhereWithAggregatesInput = {
    AND?: TowTruckServiceScalarWhereWithAggregatesInput | TowTruckServiceScalarWhereWithAggregatesInput[]
    OR?: TowTruckServiceScalarWhereWithAggregatesInput[]
    NOT?: TowTruckServiceScalarWhereWithAggregatesInput | TowTruckServiceScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"TowTruckService"> | string
    price?: FloatWithAggregatesFilter<"TowTruckService"> | number
    vehicleType?: EnumVehicleTypeWithAggregatesFilter<"TowTruckService"> | $Enums.VehicleType
    towTruckId?: StringWithAggregatesFilter<"TowTruckService"> | string
  }

  export type LiveTruckLocationWhereInput = {
    AND?: LiveTruckLocationWhereInput | LiveTruckLocationWhereInput[]
    OR?: LiveTruckLocationWhereInput[]
    NOT?: LiveTruckLocationWhereInput | LiveTruckLocationWhereInput[]
    id?: StringFilter<"LiveTruckLocation"> | string
    location?: JsonFilter<"LiveTruckLocation">
    lastUpdated?: DateTimeFilter<"LiveTruckLocation"> | Date | string
    isAvailable?: BoolFilter<"LiveTruckLocation"> | boolean
    createdAt?: DateTimeFilter<"LiveTruckLocation"> | Date | string
    updatedAt?: DateTimeFilter<"LiveTruckLocation"> | Date | string
    towTruckId?: StringFilter<"LiveTruckLocation"> | string
    towTruck?: XOR<TowTruckRelationFilter, TowTruckWhereInput>
  }

  export type LiveTruckLocationOrderByWithRelationInput = {
    id?: SortOrder
    location?: SortOrder
    lastUpdated?: SortOrder
    isAvailable?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    towTruckId?: SortOrder
    towTruck?: TowTruckOrderByWithRelationInput
  }

  export type LiveTruckLocationWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    towTruckId?: string
    AND?: LiveTruckLocationWhereInput | LiveTruckLocationWhereInput[]
    OR?: LiveTruckLocationWhereInput[]
    NOT?: LiveTruckLocationWhereInput | LiveTruckLocationWhereInput[]
    location?: JsonFilter<"LiveTruckLocation">
    lastUpdated?: DateTimeFilter<"LiveTruckLocation"> | Date | string
    isAvailable?: BoolFilter<"LiveTruckLocation"> | boolean
    createdAt?: DateTimeFilter<"LiveTruckLocation"> | Date | string
    updatedAt?: DateTimeFilter<"LiveTruckLocation"> | Date | string
    towTruck?: XOR<TowTruckRelationFilter, TowTruckWhereInput>
  }, "id" | "towTruckId">

  export type LiveTruckLocationOrderByWithAggregationInput = {
    id?: SortOrder
    location?: SortOrder
    lastUpdated?: SortOrder
    isAvailable?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    towTruckId?: SortOrder
    _count?: LiveTruckLocationCountOrderByAggregateInput
    _max?: LiveTruckLocationMaxOrderByAggregateInput
    _min?: LiveTruckLocationMinOrderByAggregateInput
  }

  export type LiveTruckLocationScalarWhereWithAggregatesInput = {
    AND?: LiveTruckLocationScalarWhereWithAggregatesInput | LiveTruckLocationScalarWhereWithAggregatesInput[]
    OR?: LiveTruckLocationScalarWhereWithAggregatesInput[]
    NOT?: LiveTruckLocationScalarWhereWithAggregatesInput | LiveTruckLocationScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"LiveTruckLocation"> | string
    location?: JsonWithAggregatesFilter<"LiveTruckLocation">
    lastUpdated?: DateTimeWithAggregatesFilter<"LiveTruckLocation"> | Date | string
    isAvailable?: BoolWithAggregatesFilter<"LiveTruckLocation"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"LiveTruckLocation"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"LiveTruckLocation"> | Date | string
    towTruckId?: StringWithAggregatesFilter<"LiveTruckLocation"> | string
  }

  export type SparePartWhereInput = {
    AND?: SparePartWhereInput | SparePartWhereInput[]
    OR?: SparePartWhereInput[]
    NOT?: SparePartWhereInput | SparePartWhereInput[]
    id?: StringFilter<"SparePart"> | string
    partName?: StringFilter<"SparePart"> | string
    compatibleMake?: StringFilter<"SparePart"> | string
    compatibleModel?: StringFilter<"SparePart"> | string
    compatibleYear?: IntFilter<"SparePart"> | number
    price?: FloatFilter<"SparePart"> | number
    quantityAvailable?: IntFilter<"SparePart"> | number
    garageId?: StringFilter<"SparePart"> | string
    garage?: XOR<GarageRelationFilter, GarageWhereInput>
  }

  export type SparePartOrderByWithRelationInput = {
    id?: SortOrder
    partName?: SortOrder
    compatibleMake?: SortOrder
    compatibleModel?: SortOrder
    compatibleYear?: SortOrder
    price?: SortOrder
    quantityAvailable?: SortOrder
    garageId?: SortOrder
    garage?: GarageOrderByWithRelationInput
  }

  export type SparePartWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: SparePartWhereInput | SparePartWhereInput[]
    OR?: SparePartWhereInput[]
    NOT?: SparePartWhereInput | SparePartWhereInput[]
    partName?: StringFilter<"SparePart"> | string
    compatibleMake?: StringFilter<"SparePart"> | string
    compatibleModel?: StringFilter<"SparePart"> | string
    compatibleYear?: IntFilter<"SparePart"> | number
    price?: FloatFilter<"SparePart"> | number
    quantityAvailable?: IntFilter<"SparePart"> | number
    garageId?: StringFilter<"SparePart"> | string
    garage?: XOR<GarageRelationFilter, GarageWhereInput>
  }, "id">

  export type SparePartOrderByWithAggregationInput = {
    id?: SortOrder
    partName?: SortOrder
    compatibleMake?: SortOrder
    compatibleModel?: SortOrder
    compatibleYear?: SortOrder
    price?: SortOrder
    quantityAvailable?: SortOrder
    garageId?: SortOrder
    _count?: SparePartCountOrderByAggregateInput
    _avg?: SparePartAvgOrderByAggregateInput
    _max?: SparePartMaxOrderByAggregateInput
    _min?: SparePartMinOrderByAggregateInput
    _sum?: SparePartSumOrderByAggregateInput
  }

  export type SparePartScalarWhereWithAggregatesInput = {
    AND?: SparePartScalarWhereWithAggregatesInput | SparePartScalarWhereWithAggregatesInput[]
    OR?: SparePartScalarWhereWithAggregatesInput[]
    NOT?: SparePartScalarWhereWithAggregatesInput | SparePartScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"SparePart"> | string
    partName?: StringWithAggregatesFilter<"SparePart"> | string
    compatibleMake?: StringWithAggregatesFilter<"SparePart"> | string
    compatibleModel?: StringWithAggregatesFilter<"SparePart"> | string
    compatibleYear?: IntWithAggregatesFilter<"SparePart"> | number
    price?: FloatWithAggregatesFilter<"SparePart"> | number
    quantityAvailable?: IntWithAggregatesFilter<"SparePart"> | number
    garageId?: StringWithAggregatesFilter<"SparePart"> | string
  }

  export type BookingWhereInput = {
    AND?: BookingWhereInput | BookingWhereInput[]
    OR?: BookingWhereInput[]
    NOT?: BookingWhereInput | BookingWhereInput[]
    id?: StringFilter<"Booking"> | string
    status?: EnumBookingStatusFilter<"Booking"> | $Enums.BookingStatus
    bookedAt?: DateTimeFilter<"Booking"> | Date | string
    expiresAt?: DateTimeNullableFilter<"Booking"> | Date | string | null
    paymentExpiresAt?: DateTimeNullableFilter<"Booking"> | Date | string | null
    notes?: StringNullableFilter<"Booking"> | string | null
    otp?: StringNullableFilter<"Booking"> | string | null
    otpExpiresAt?: DateTimeNullableFilter<"Booking"> | Date | string | null
    pickupLocation?: JsonNullableFilter<"Booking">
    destinationLocation?: JsonNullableFilter<"Booking">
    serviceStartedAt?: DateTimeNullableFilter<"Booking"> | Date | string | null
    serviceEndedAt?: DateTimeNullableFilter<"Booking"> | Date | string | null
    basePrice?: FloatFilter<"Booking"> | number
    additionalFees?: FloatNullableFilter<"Booking"> | number | null
    discountAmount?: FloatNullableFilter<"Booking"> | number | null
    finalAmount?: FloatFilter<"Booking"> | number
    paymentStatus?: StringFilter<"Booking"> | string
    paymentIntentId?: StringNullableFilter<"Booking"> | string | null
    userRating?: IntNullableFilter<"Booking"> | number | null
    userReview?: StringNullableFilter<"Booking"> | string | null
    providerRating?: IntNullableFilter<"Booking"> | number | null
    providerReview?: StringNullableFilter<"Booking"> | string | null
    userId?: StringFilter<"Booking"> | string
    vehicleId?: StringFilter<"Booking"> | string
    eligibleProviderIds?: StringNullableListFilter<"Booking">
    serviceId?: StringNullableFilter<"Booking"> | string | null
    garageId?: StringNullableFilter<"Booking"> | string | null
    garageServiceId?: StringNullableFilter<"Booking"> | string | null
    towTruckId?: StringNullableFilter<"Booking"> | string | null
    towTruckServiceId?: StringNullableFilter<"Booking"> | string | null
    promoCodeId?: StringNullableFilter<"Booking"> | string | null
    user?: XOR<UserRelationFilter, UserWhereInput>
    vehicle?: XOR<VehicleRelationFilter, VehicleWhereInput>
    service?: XOR<ServiceNullableRelationFilter, ServiceWhereInput> | null
    garage?: XOR<GarageNullableRelationFilter, GarageWhereInput> | null
    garageService?: XOR<GarageServiceNullableRelationFilter, GarageServiceWhereInput> | null
    towTruck?: XOR<TowTruckNullableRelationFilter, TowTruckWhereInput> | null
    towTruckService?: XOR<TowTruckServiceNullableRelationFilter, TowTruckServiceWhereInput> | null
    promoCode?: XOR<PromoCodeNullableRelationFilter, PromoCodeWhereInput> | null
  }

  export type BookingOrderByWithRelationInput = {
    id?: SortOrder
    status?: SortOrder
    bookedAt?: SortOrder
    expiresAt?: SortOrder
    paymentExpiresAt?: SortOrder
    notes?: SortOrder
    otp?: SortOrder
    otpExpiresAt?: SortOrder
    pickupLocation?: SortOrder
    destinationLocation?: SortOrder
    serviceStartedAt?: SortOrder
    serviceEndedAt?: SortOrder
    basePrice?: SortOrder
    additionalFees?: SortOrder
    discountAmount?: SortOrder
    finalAmount?: SortOrder
    paymentStatus?: SortOrder
    paymentIntentId?: SortOrder
    userRating?: SortOrder
    userReview?: SortOrder
    providerRating?: SortOrder
    providerReview?: SortOrder
    userId?: SortOrder
    vehicleId?: SortOrder
    eligibleProviderIds?: SortOrder
    serviceId?: SortOrder
    garageId?: SortOrder
    garageServiceId?: SortOrder
    towTruckId?: SortOrder
    towTruckServiceId?: SortOrder
    promoCodeId?: SortOrder
    user?: UserOrderByWithRelationInput
    vehicle?: VehicleOrderByWithRelationInput
    service?: ServiceOrderByWithRelationInput
    garage?: GarageOrderByWithRelationInput
    garageService?: GarageServiceOrderByWithRelationInput
    towTruck?: TowTruckOrderByWithRelationInput
    towTruckService?: TowTruckServiceOrderByWithRelationInput
    promoCode?: PromoCodeOrderByWithRelationInput
  }

  export type BookingWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    paymentIntentId?: string
    AND?: BookingWhereInput | BookingWhereInput[]
    OR?: BookingWhereInput[]
    NOT?: BookingWhereInput | BookingWhereInput[]
    status?: EnumBookingStatusFilter<"Booking"> | $Enums.BookingStatus
    bookedAt?: DateTimeFilter<"Booking"> | Date | string
    expiresAt?: DateTimeNullableFilter<"Booking"> | Date | string | null
    paymentExpiresAt?: DateTimeNullableFilter<"Booking"> | Date | string | null
    notes?: StringNullableFilter<"Booking"> | string | null
    otp?: StringNullableFilter<"Booking"> | string | null
    otpExpiresAt?: DateTimeNullableFilter<"Booking"> | Date | string | null
    pickupLocation?: JsonNullableFilter<"Booking">
    destinationLocation?: JsonNullableFilter<"Booking">
    serviceStartedAt?: DateTimeNullableFilter<"Booking"> | Date | string | null
    serviceEndedAt?: DateTimeNullableFilter<"Booking"> | Date | string | null
    basePrice?: FloatFilter<"Booking"> | number
    additionalFees?: FloatNullableFilter<"Booking"> | number | null
    discountAmount?: FloatNullableFilter<"Booking"> | number | null
    finalAmount?: FloatFilter<"Booking"> | number
    paymentStatus?: StringFilter<"Booking"> | string
    userRating?: IntNullableFilter<"Booking"> | number | null
    userReview?: StringNullableFilter<"Booking"> | string | null
    providerRating?: IntNullableFilter<"Booking"> | number | null
    providerReview?: StringNullableFilter<"Booking"> | string | null
    userId?: StringFilter<"Booking"> | string
    vehicleId?: StringFilter<"Booking"> | string
    eligibleProviderIds?: StringNullableListFilter<"Booking">
    serviceId?: StringNullableFilter<"Booking"> | string | null
    garageId?: StringNullableFilter<"Booking"> | string | null
    garageServiceId?: StringNullableFilter<"Booking"> | string | null
    towTruckId?: StringNullableFilter<"Booking"> | string | null
    towTruckServiceId?: StringNullableFilter<"Booking"> | string | null
    promoCodeId?: StringNullableFilter<"Booking"> | string | null
    user?: XOR<UserRelationFilter, UserWhereInput>
    vehicle?: XOR<VehicleRelationFilter, VehicleWhereInput>
    service?: XOR<ServiceNullableRelationFilter, ServiceWhereInput> | null
    garage?: XOR<GarageNullableRelationFilter, GarageWhereInput> | null
    garageService?: XOR<GarageServiceNullableRelationFilter, GarageServiceWhereInput> | null
    towTruck?: XOR<TowTruckNullableRelationFilter, TowTruckWhereInput> | null
    towTruckService?: XOR<TowTruckServiceNullableRelationFilter, TowTruckServiceWhereInput> | null
    promoCode?: XOR<PromoCodeNullableRelationFilter, PromoCodeWhereInput> | null
  }, "id" | "paymentIntentId">

  export type BookingOrderByWithAggregationInput = {
    id?: SortOrder
    status?: SortOrder
    bookedAt?: SortOrder
    expiresAt?: SortOrder
    paymentExpiresAt?: SortOrder
    notes?: SortOrder
    otp?: SortOrder
    otpExpiresAt?: SortOrder
    pickupLocation?: SortOrder
    destinationLocation?: SortOrder
    serviceStartedAt?: SortOrder
    serviceEndedAt?: SortOrder
    basePrice?: SortOrder
    additionalFees?: SortOrder
    discountAmount?: SortOrder
    finalAmount?: SortOrder
    paymentStatus?: SortOrder
    paymentIntentId?: SortOrder
    userRating?: SortOrder
    userReview?: SortOrder
    providerRating?: SortOrder
    providerReview?: SortOrder
    userId?: SortOrder
    vehicleId?: SortOrder
    eligibleProviderIds?: SortOrder
    serviceId?: SortOrder
    garageId?: SortOrder
    garageServiceId?: SortOrder
    towTruckId?: SortOrder
    towTruckServiceId?: SortOrder
    promoCodeId?: SortOrder
    _count?: BookingCountOrderByAggregateInput
    _avg?: BookingAvgOrderByAggregateInput
    _max?: BookingMaxOrderByAggregateInput
    _min?: BookingMinOrderByAggregateInput
    _sum?: BookingSumOrderByAggregateInput
  }

  export type BookingScalarWhereWithAggregatesInput = {
    AND?: BookingScalarWhereWithAggregatesInput | BookingScalarWhereWithAggregatesInput[]
    OR?: BookingScalarWhereWithAggregatesInput[]
    NOT?: BookingScalarWhereWithAggregatesInput | BookingScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Booking"> | string
    status?: EnumBookingStatusWithAggregatesFilter<"Booking"> | $Enums.BookingStatus
    bookedAt?: DateTimeWithAggregatesFilter<"Booking"> | Date | string
    expiresAt?: DateTimeNullableWithAggregatesFilter<"Booking"> | Date | string | null
    paymentExpiresAt?: DateTimeNullableWithAggregatesFilter<"Booking"> | Date | string | null
    notes?: StringNullableWithAggregatesFilter<"Booking"> | string | null
    otp?: StringNullableWithAggregatesFilter<"Booking"> | string | null
    otpExpiresAt?: DateTimeNullableWithAggregatesFilter<"Booking"> | Date | string | null
    pickupLocation?: JsonNullableWithAggregatesFilter<"Booking">
    destinationLocation?: JsonNullableWithAggregatesFilter<"Booking">
    serviceStartedAt?: DateTimeNullableWithAggregatesFilter<"Booking"> | Date | string | null
    serviceEndedAt?: DateTimeNullableWithAggregatesFilter<"Booking"> | Date | string | null
    basePrice?: FloatWithAggregatesFilter<"Booking"> | number
    additionalFees?: FloatNullableWithAggregatesFilter<"Booking"> | number | null
    discountAmount?: FloatNullableWithAggregatesFilter<"Booking"> | number | null
    finalAmount?: FloatWithAggregatesFilter<"Booking"> | number
    paymentStatus?: StringWithAggregatesFilter<"Booking"> | string
    paymentIntentId?: StringNullableWithAggregatesFilter<"Booking"> | string | null
    userRating?: IntNullableWithAggregatesFilter<"Booking"> | number | null
    userReview?: StringNullableWithAggregatesFilter<"Booking"> | string | null
    providerRating?: IntNullableWithAggregatesFilter<"Booking"> | number | null
    providerReview?: StringNullableWithAggregatesFilter<"Booking"> | string | null
    userId?: StringWithAggregatesFilter<"Booking"> | string
    vehicleId?: StringWithAggregatesFilter<"Booking"> | string
    eligibleProviderIds?: StringNullableListFilter<"Booking">
    serviceId?: StringNullableWithAggregatesFilter<"Booking"> | string | null
    garageId?: StringNullableWithAggregatesFilter<"Booking"> | string | null
    garageServiceId?: StringNullableWithAggregatesFilter<"Booking"> | string | null
    towTruckId?: StringNullableWithAggregatesFilter<"Booking"> | string | null
    towTruckServiceId?: StringNullableWithAggregatesFilter<"Booking"> | string | null
    promoCodeId?: StringNullableWithAggregatesFilter<"Booking"> | string | null
  }

  export type PromoCodeWhereInput = {
    AND?: PromoCodeWhereInput | PromoCodeWhereInput[]
    OR?: PromoCodeWhereInput[]
    NOT?: PromoCodeWhereInput | PromoCodeWhereInput[]
    id?: StringFilter<"PromoCode"> | string
    code?: StringFilter<"PromoCode"> | string
    discountType?: EnumDiscountTypeFilter<"PromoCode"> | $Enums.DiscountType
    discountValue?: FloatFilter<"PromoCode"> | number
    expiresAt?: DateTimeFilter<"PromoCode"> | Date | string
    maxUses?: IntNullableFilter<"PromoCode"> | number | null
    timesUsed?: IntFilter<"PromoCode"> | number
    isActive?: BoolFilter<"PromoCode"> | boolean
    bookings?: BookingListRelationFilter
  }

  export type PromoCodeOrderByWithRelationInput = {
    id?: SortOrder
    code?: SortOrder
    discountType?: SortOrder
    discountValue?: SortOrder
    expiresAt?: SortOrder
    maxUses?: SortOrder
    timesUsed?: SortOrder
    isActive?: SortOrder
    bookings?: BookingOrderByRelationAggregateInput
  }

  export type PromoCodeWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    code?: string
    AND?: PromoCodeWhereInput | PromoCodeWhereInput[]
    OR?: PromoCodeWhereInput[]
    NOT?: PromoCodeWhereInput | PromoCodeWhereInput[]
    discountType?: EnumDiscountTypeFilter<"PromoCode"> | $Enums.DiscountType
    discountValue?: FloatFilter<"PromoCode"> | number
    expiresAt?: DateTimeFilter<"PromoCode"> | Date | string
    maxUses?: IntNullableFilter<"PromoCode"> | number | null
    timesUsed?: IntFilter<"PromoCode"> | number
    isActive?: BoolFilter<"PromoCode"> | boolean
    bookings?: BookingListRelationFilter
  }, "id" | "code">

  export type PromoCodeOrderByWithAggregationInput = {
    id?: SortOrder
    code?: SortOrder
    discountType?: SortOrder
    discountValue?: SortOrder
    expiresAt?: SortOrder
    maxUses?: SortOrder
    timesUsed?: SortOrder
    isActive?: SortOrder
    _count?: PromoCodeCountOrderByAggregateInput
    _avg?: PromoCodeAvgOrderByAggregateInput
    _max?: PromoCodeMaxOrderByAggregateInput
    _min?: PromoCodeMinOrderByAggregateInput
    _sum?: PromoCodeSumOrderByAggregateInput
  }

  export type PromoCodeScalarWhereWithAggregatesInput = {
    AND?: PromoCodeScalarWhereWithAggregatesInput | PromoCodeScalarWhereWithAggregatesInput[]
    OR?: PromoCodeScalarWhereWithAggregatesInput[]
    NOT?: PromoCodeScalarWhereWithAggregatesInput | PromoCodeScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"PromoCode"> | string
    code?: StringWithAggregatesFilter<"PromoCode"> | string
    discountType?: EnumDiscountTypeWithAggregatesFilter<"PromoCode"> | $Enums.DiscountType
    discountValue?: FloatWithAggregatesFilter<"PromoCode"> | number
    expiresAt?: DateTimeWithAggregatesFilter<"PromoCode"> | Date | string
    maxUses?: IntNullableWithAggregatesFilter<"PromoCode"> | number | null
    timesUsed?: IntWithAggregatesFilter<"PromoCode"> | number
    isActive?: BoolWithAggregatesFilter<"PromoCode"> | boolean
  }

  export type UserCreateInput = {
    id?: string
    clerkId: string
    email: string
    firstName: string
    lastName?: string | null
    phone: string
    role?: UserCreateroleInput | $Enums.Role[]
    isPremium?: boolean
    isBanned?: boolean
    unsafeMetadata?: InputJsonValue | null
    createdAt?: Date | string
    updatedAt?: Date | string
    stripeCustomerId?: string | null
    vehicles?: VehicleCreateNestedManyWithoutUserInput
    garage?: GarageCreateNestedOneWithoutOwnerInput
    towTruck?: TowTruckCreateNestedOneWithoutOwnerInput
    bookings?: BookingCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateInput = {
    id?: string
    clerkId: string
    email: string
    firstName: string
    lastName?: string | null
    phone: string
    role?: UserCreateroleInput | $Enums.Role[]
    isPremium?: boolean
    isBanned?: boolean
    unsafeMetadata?: InputJsonValue | null
    createdAt?: Date | string
    updatedAt?: Date | string
    stripeCustomerId?: string | null
    vehicles?: VehicleUncheckedCreateNestedManyWithoutUserInput
    garage?: GarageUncheckedCreateNestedOneWithoutOwnerInput
    towTruck?: TowTruckUncheckedCreateNestedOneWithoutOwnerInput
    bookings?: BookingUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserUpdateInput = {
    clerkId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: StringFieldUpdateOperationsInput | string
    role?: UserUpdateroleInput | $Enums.Role[]
    isPremium?: BoolFieldUpdateOperationsInput | boolean
    isBanned?: BoolFieldUpdateOperationsInput | boolean
    unsafeMetadata?: InputJsonValue | InputJsonValue | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    stripeCustomerId?: NullableStringFieldUpdateOperationsInput | string | null
    vehicles?: VehicleUpdateManyWithoutUserNestedInput
    garage?: GarageUpdateOneWithoutOwnerNestedInput
    towTruck?: TowTruckUpdateOneWithoutOwnerNestedInput
    bookings?: BookingUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateInput = {
    clerkId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: StringFieldUpdateOperationsInput | string
    role?: UserUpdateroleInput | $Enums.Role[]
    isPremium?: BoolFieldUpdateOperationsInput | boolean
    isBanned?: BoolFieldUpdateOperationsInput | boolean
    unsafeMetadata?: InputJsonValue | InputJsonValue | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    stripeCustomerId?: NullableStringFieldUpdateOperationsInput | string | null
    vehicles?: VehicleUncheckedUpdateManyWithoutUserNestedInput
    garage?: GarageUncheckedUpdateOneWithoutOwnerNestedInput
    towTruck?: TowTruckUncheckedUpdateOneWithoutOwnerNestedInput
    bookings?: BookingUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateManyInput = {
    id?: string
    clerkId: string
    email: string
    firstName: string
    lastName?: string | null
    phone: string
    role?: UserCreateroleInput | $Enums.Role[]
    isPremium?: boolean
    isBanned?: boolean
    unsafeMetadata?: InputJsonValue | null
    createdAt?: Date | string
    updatedAt?: Date | string
    stripeCustomerId?: string | null
  }

  export type UserUpdateManyMutationInput = {
    clerkId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: StringFieldUpdateOperationsInput | string
    role?: UserUpdateroleInput | $Enums.Role[]
    isPremium?: BoolFieldUpdateOperationsInput | boolean
    isBanned?: BoolFieldUpdateOperationsInput | boolean
    unsafeMetadata?: InputJsonValue | InputJsonValue | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    stripeCustomerId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type UserUncheckedUpdateManyInput = {
    clerkId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: StringFieldUpdateOperationsInput | string
    role?: UserUpdateroleInput | $Enums.Role[]
    isPremium?: BoolFieldUpdateOperationsInput | boolean
    isBanned?: BoolFieldUpdateOperationsInput | boolean
    unsafeMetadata?: InputJsonValue | InputJsonValue | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    stripeCustomerId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type VehicleCreateInput = {
    id?: string
    brand: string
    name: string
    model: string
    year: number
    plateNumber: string
    color?: string | null
    type: $Enums.VehicleType
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutVehiclesInput
    bookings?: BookingCreateNestedManyWithoutVehicleInput
  }

  export type VehicleUncheckedCreateInput = {
    id?: string
    brand: string
    name: string
    model: string
    year: number
    plateNumber: string
    color?: string | null
    type: $Enums.VehicleType
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: string
    bookings?: BookingUncheckedCreateNestedManyWithoutVehicleInput
  }

  export type VehicleUpdateInput = {
    brand?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    model?: StringFieldUpdateOperationsInput | string
    year?: IntFieldUpdateOperationsInput | number
    plateNumber?: StringFieldUpdateOperationsInput | string
    color?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumVehicleTypeFieldUpdateOperationsInput | $Enums.VehicleType
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutVehiclesNestedInput
    bookings?: BookingUpdateManyWithoutVehicleNestedInput
  }

  export type VehicleUncheckedUpdateInput = {
    brand?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    model?: StringFieldUpdateOperationsInput | string
    year?: IntFieldUpdateOperationsInput | number
    plateNumber?: StringFieldUpdateOperationsInput | string
    color?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumVehicleTypeFieldUpdateOperationsInput | $Enums.VehicleType
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
    bookings?: BookingUncheckedUpdateManyWithoutVehicleNestedInput
  }

  export type VehicleCreateManyInput = {
    id?: string
    brand: string
    name: string
    model: string
    year: number
    plateNumber: string
    color?: string | null
    type: $Enums.VehicleType
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: string
  }

  export type VehicleUpdateManyMutationInput = {
    brand?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    model?: StringFieldUpdateOperationsInput | string
    year?: IntFieldUpdateOperationsInput | number
    plateNumber?: StringFieldUpdateOperationsInput | string
    color?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumVehicleTypeFieldUpdateOperationsInput | $Enums.VehicleType
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VehicleUncheckedUpdateManyInput = {
    brand?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    model?: StringFieldUpdateOperationsInput | string
    year?: IntFieldUpdateOperationsInput | number
    plateNumber?: StringFieldUpdateOperationsInput | string
    color?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumVehicleTypeFieldUpdateOperationsInput | $Enums.VehicleType
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
  }

  export type ServiceCreateInput = {
    id?: string
    name: string
    description: string
    icon?: string | null
    type: string
    offeredByGarages?: GarageServiceCreateNestedManyWithoutServiceInput
    bookings?: BookingCreateNestedManyWithoutServiceInput
  }

  export type ServiceUncheckedCreateInput = {
    id?: string
    name: string
    description: string
    icon?: string | null
    type: string
    offeredByGarages?: GarageServiceUncheckedCreateNestedManyWithoutServiceInput
    bookings?: BookingUncheckedCreateNestedManyWithoutServiceInput
  }

  export type ServiceUpdateInput = {
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    icon?: NullableStringFieldUpdateOperationsInput | string | null
    type?: StringFieldUpdateOperationsInput | string
    offeredByGarages?: GarageServiceUpdateManyWithoutServiceNestedInput
    bookings?: BookingUpdateManyWithoutServiceNestedInput
  }

  export type ServiceUncheckedUpdateInput = {
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    icon?: NullableStringFieldUpdateOperationsInput | string | null
    type?: StringFieldUpdateOperationsInput | string
    offeredByGarages?: GarageServiceUncheckedUpdateManyWithoutServiceNestedInput
    bookings?: BookingUncheckedUpdateManyWithoutServiceNestedInput
  }

  export type ServiceCreateManyInput = {
    id?: string
    name: string
    description: string
    icon?: string | null
    type: string
  }

  export type ServiceUpdateManyMutationInput = {
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    icon?: NullableStringFieldUpdateOperationsInput | string | null
    type?: StringFieldUpdateOperationsInput | string
  }

  export type ServiceUncheckedUpdateManyInput = {
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    icon?: NullableStringFieldUpdateOperationsInput | string | null
    type?: StringFieldUpdateOperationsInput | string
  }

  export type GarageCreateInput = {
    id?: string
    name: string
    licenseNumber: string
    address: string
    ownerName: string
    contactEmail?: string | null
    contactPhone?: string | null
    numberOfEmployees: number
    rating?: number | null
    reviewCount?: number | null
    isOpen?: boolean
    operatingHours?: InputJsonValue | null
    stripeAccountId?: string | null
    location: InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    status?: $Enums.VerificationStatus
    rejectionReason?: string | null
    owner: UserCreateNestedOneWithoutGarageInput
    services?: GarageServiceCreateNestedManyWithoutGarageInput
    spareParts?: SparePartCreateNestedManyWithoutGarageInput
    bookings?: BookingCreateNestedManyWithoutGarageInput
  }

  export type GarageUncheckedCreateInput = {
    id?: string
    name: string
    licenseNumber: string
    address: string
    ownerName: string
    contactEmail?: string | null
    contactPhone?: string | null
    numberOfEmployees: number
    rating?: number | null
    reviewCount?: number | null
    isOpen?: boolean
    operatingHours?: InputJsonValue | null
    stripeAccountId?: string | null
    location: InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    status?: $Enums.VerificationStatus
    rejectionReason?: string | null
    ownerId: string
    services?: GarageServiceUncheckedCreateNestedManyWithoutGarageInput
    spareParts?: SparePartUncheckedCreateNestedManyWithoutGarageInput
    bookings?: BookingUncheckedCreateNestedManyWithoutGarageInput
  }

  export type GarageUpdateInput = {
    name?: StringFieldUpdateOperationsInput | string
    licenseNumber?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    ownerName?: StringFieldUpdateOperationsInput | string
    contactEmail?: NullableStringFieldUpdateOperationsInput | string | null
    contactPhone?: NullableStringFieldUpdateOperationsInput | string | null
    numberOfEmployees?: IntFieldUpdateOperationsInput | number
    rating?: NullableFloatFieldUpdateOperationsInput | number | null
    reviewCount?: NullableIntFieldUpdateOperationsInput | number | null
    isOpen?: BoolFieldUpdateOperationsInput | boolean
    operatingHours?: InputJsonValue | InputJsonValue | null
    stripeAccountId?: NullableStringFieldUpdateOperationsInput | string | null
    location?: InputJsonValue | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumVerificationStatusFieldUpdateOperationsInput | $Enums.VerificationStatus
    rejectionReason?: NullableStringFieldUpdateOperationsInput | string | null
    owner?: UserUpdateOneRequiredWithoutGarageNestedInput
    services?: GarageServiceUpdateManyWithoutGarageNestedInput
    spareParts?: SparePartUpdateManyWithoutGarageNestedInput
    bookings?: BookingUpdateManyWithoutGarageNestedInput
  }

  export type GarageUncheckedUpdateInput = {
    name?: StringFieldUpdateOperationsInput | string
    licenseNumber?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    ownerName?: StringFieldUpdateOperationsInput | string
    contactEmail?: NullableStringFieldUpdateOperationsInput | string | null
    contactPhone?: NullableStringFieldUpdateOperationsInput | string | null
    numberOfEmployees?: IntFieldUpdateOperationsInput | number
    rating?: NullableFloatFieldUpdateOperationsInput | number | null
    reviewCount?: NullableIntFieldUpdateOperationsInput | number | null
    isOpen?: BoolFieldUpdateOperationsInput | boolean
    operatingHours?: InputJsonValue | InputJsonValue | null
    stripeAccountId?: NullableStringFieldUpdateOperationsInput | string | null
    location?: InputJsonValue | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumVerificationStatusFieldUpdateOperationsInput | $Enums.VerificationStatus
    rejectionReason?: NullableStringFieldUpdateOperationsInput | string | null
    ownerId?: StringFieldUpdateOperationsInput | string
    services?: GarageServiceUncheckedUpdateManyWithoutGarageNestedInput
    spareParts?: SparePartUncheckedUpdateManyWithoutGarageNestedInput
    bookings?: BookingUncheckedUpdateManyWithoutGarageNestedInput
  }

  export type GarageCreateManyInput = {
    id?: string
    name: string
    licenseNumber: string
    address: string
    ownerName: string
    contactEmail?: string | null
    contactPhone?: string | null
    numberOfEmployees: number
    rating?: number | null
    reviewCount?: number | null
    isOpen?: boolean
    operatingHours?: InputJsonValue | null
    stripeAccountId?: string | null
    location: InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    status?: $Enums.VerificationStatus
    rejectionReason?: string | null
    ownerId: string
  }

  export type GarageUpdateManyMutationInput = {
    name?: StringFieldUpdateOperationsInput | string
    licenseNumber?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    ownerName?: StringFieldUpdateOperationsInput | string
    contactEmail?: NullableStringFieldUpdateOperationsInput | string | null
    contactPhone?: NullableStringFieldUpdateOperationsInput | string | null
    numberOfEmployees?: IntFieldUpdateOperationsInput | number
    rating?: NullableFloatFieldUpdateOperationsInput | number | null
    reviewCount?: NullableIntFieldUpdateOperationsInput | number | null
    isOpen?: BoolFieldUpdateOperationsInput | boolean
    operatingHours?: InputJsonValue | InputJsonValue | null
    stripeAccountId?: NullableStringFieldUpdateOperationsInput | string | null
    location?: InputJsonValue | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumVerificationStatusFieldUpdateOperationsInput | $Enums.VerificationStatus
    rejectionReason?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type GarageUncheckedUpdateManyInput = {
    name?: StringFieldUpdateOperationsInput | string
    licenseNumber?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    ownerName?: StringFieldUpdateOperationsInput | string
    contactEmail?: NullableStringFieldUpdateOperationsInput | string | null
    contactPhone?: NullableStringFieldUpdateOperationsInput | string | null
    numberOfEmployees?: IntFieldUpdateOperationsInput | number
    rating?: NullableFloatFieldUpdateOperationsInput | number | null
    reviewCount?: NullableIntFieldUpdateOperationsInput | number | null
    isOpen?: BoolFieldUpdateOperationsInput | boolean
    operatingHours?: InputJsonValue | InputJsonValue | null
    stripeAccountId?: NullableStringFieldUpdateOperationsInput | string | null
    location?: InputJsonValue | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumVerificationStatusFieldUpdateOperationsInput | $Enums.VerificationStatus
    rejectionReason?: NullableStringFieldUpdateOperationsInput | string | null
    ownerId?: StringFieldUpdateOperationsInput | string
  }

  export type GarageServiceCreateInput = {
    id?: string
    price: number
    garage: GarageCreateNestedOneWithoutServicesInput
    service: ServiceCreateNestedOneWithoutOfferedByGaragesInput
    bookings?: BookingCreateNestedManyWithoutGarageServiceInput
  }

  export type GarageServiceUncheckedCreateInput = {
    id?: string
    price: number
    garageId: string
    serviceId: string
    bookings?: BookingUncheckedCreateNestedManyWithoutGarageServiceInput
  }

  export type GarageServiceUpdateInput = {
    price?: FloatFieldUpdateOperationsInput | number
    garage?: GarageUpdateOneRequiredWithoutServicesNestedInput
    service?: ServiceUpdateOneRequiredWithoutOfferedByGaragesNestedInput
    bookings?: BookingUpdateManyWithoutGarageServiceNestedInput
  }

  export type GarageServiceUncheckedUpdateInput = {
    price?: FloatFieldUpdateOperationsInput | number
    garageId?: StringFieldUpdateOperationsInput | string
    serviceId?: StringFieldUpdateOperationsInput | string
    bookings?: BookingUncheckedUpdateManyWithoutGarageServiceNestedInput
  }

  export type GarageServiceCreateManyInput = {
    id?: string
    price: number
    garageId: string
    serviceId: string
  }

  export type GarageServiceUpdateManyMutationInput = {
    price?: FloatFieldUpdateOperationsInput | number
  }

  export type GarageServiceUncheckedUpdateManyInput = {
    price?: FloatFieldUpdateOperationsInput | number
    garageId?: StringFieldUpdateOperationsInput | string
    serviceId?: StringFieldUpdateOperationsInput | string
  }

  export type TowTruckCreateInput = {
    id?: string
    name: string
    driverName: string
    model: string
    make: string
    year: number
    plateNumber: string
    licenseNumber: string
    status?: $Enums.VerificationStatus
    rejectionReason?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    stripeAccountId?: string | null
    owner: UserCreateNestedOneWithoutTowTruckInput
    services?: TowTruckServiceCreateNestedManyWithoutTowTruckInput
    bookings?: BookingCreateNestedManyWithoutTowTruckInput
    liveLocation?: LiveTruckLocationCreateNestedOneWithoutTowTruckInput
  }

  export type TowTruckUncheckedCreateInput = {
    id?: string
    name: string
    driverName: string
    model: string
    make: string
    year: number
    plateNumber: string
    licenseNumber: string
    status?: $Enums.VerificationStatus
    rejectionReason?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    ownerId: string
    stripeAccountId?: string | null
    services?: TowTruckServiceUncheckedCreateNestedManyWithoutTowTruckInput
    bookings?: BookingUncheckedCreateNestedManyWithoutTowTruckInput
    liveLocation?: LiveTruckLocationUncheckedCreateNestedOneWithoutTowTruckInput
  }

  export type TowTruckUpdateInput = {
    name?: StringFieldUpdateOperationsInput | string
    driverName?: StringFieldUpdateOperationsInput | string
    model?: StringFieldUpdateOperationsInput | string
    make?: StringFieldUpdateOperationsInput | string
    year?: IntFieldUpdateOperationsInput | number
    plateNumber?: StringFieldUpdateOperationsInput | string
    licenseNumber?: StringFieldUpdateOperationsInput | string
    status?: EnumVerificationStatusFieldUpdateOperationsInput | $Enums.VerificationStatus
    rejectionReason?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    stripeAccountId?: NullableStringFieldUpdateOperationsInput | string | null
    owner?: UserUpdateOneRequiredWithoutTowTruckNestedInput
    services?: TowTruckServiceUpdateManyWithoutTowTruckNestedInput
    bookings?: BookingUpdateManyWithoutTowTruckNestedInput
    liveLocation?: LiveTruckLocationUpdateOneWithoutTowTruckNestedInput
  }

  export type TowTruckUncheckedUpdateInput = {
    name?: StringFieldUpdateOperationsInput | string
    driverName?: StringFieldUpdateOperationsInput | string
    model?: StringFieldUpdateOperationsInput | string
    make?: StringFieldUpdateOperationsInput | string
    year?: IntFieldUpdateOperationsInput | number
    plateNumber?: StringFieldUpdateOperationsInput | string
    licenseNumber?: StringFieldUpdateOperationsInput | string
    status?: EnumVerificationStatusFieldUpdateOperationsInput | $Enums.VerificationStatus
    rejectionReason?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    ownerId?: StringFieldUpdateOperationsInput | string
    stripeAccountId?: NullableStringFieldUpdateOperationsInput | string | null
    services?: TowTruckServiceUncheckedUpdateManyWithoutTowTruckNestedInput
    bookings?: BookingUncheckedUpdateManyWithoutTowTruckNestedInput
    liveLocation?: LiveTruckLocationUncheckedUpdateOneWithoutTowTruckNestedInput
  }

  export type TowTruckCreateManyInput = {
    id?: string
    name: string
    driverName: string
    model: string
    make: string
    year: number
    plateNumber: string
    licenseNumber: string
    status?: $Enums.VerificationStatus
    rejectionReason?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    ownerId: string
    stripeAccountId?: string | null
  }

  export type TowTruckUpdateManyMutationInput = {
    name?: StringFieldUpdateOperationsInput | string
    driverName?: StringFieldUpdateOperationsInput | string
    model?: StringFieldUpdateOperationsInput | string
    make?: StringFieldUpdateOperationsInput | string
    year?: IntFieldUpdateOperationsInput | number
    plateNumber?: StringFieldUpdateOperationsInput | string
    licenseNumber?: StringFieldUpdateOperationsInput | string
    status?: EnumVerificationStatusFieldUpdateOperationsInput | $Enums.VerificationStatus
    rejectionReason?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    stripeAccountId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type TowTruckUncheckedUpdateManyInput = {
    name?: StringFieldUpdateOperationsInput | string
    driverName?: StringFieldUpdateOperationsInput | string
    model?: StringFieldUpdateOperationsInput | string
    make?: StringFieldUpdateOperationsInput | string
    year?: IntFieldUpdateOperationsInput | number
    plateNumber?: StringFieldUpdateOperationsInput | string
    licenseNumber?: StringFieldUpdateOperationsInput | string
    status?: EnumVerificationStatusFieldUpdateOperationsInput | $Enums.VerificationStatus
    rejectionReason?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    ownerId?: StringFieldUpdateOperationsInput | string
    stripeAccountId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type TowTruckServiceCreateInput = {
    id?: string
    price: number
    vehicleType: $Enums.VehicleType
    towTruck: TowTruckCreateNestedOneWithoutServicesInput
    bookings?: BookingCreateNestedManyWithoutTowTruckServiceInput
  }

  export type TowTruckServiceUncheckedCreateInput = {
    id?: string
    price: number
    vehicleType: $Enums.VehicleType
    towTruckId: string
    bookings?: BookingUncheckedCreateNestedManyWithoutTowTruckServiceInput
  }

  export type TowTruckServiceUpdateInput = {
    price?: FloatFieldUpdateOperationsInput | number
    vehicleType?: EnumVehicleTypeFieldUpdateOperationsInput | $Enums.VehicleType
    towTruck?: TowTruckUpdateOneRequiredWithoutServicesNestedInput
    bookings?: BookingUpdateManyWithoutTowTruckServiceNestedInput
  }

  export type TowTruckServiceUncheckedUpdateInput = {
    price?: FloatFieldUpdateOperationsInput | number
    vehicleType?: EnumVehicleTypeFieldUpdateOperationsInput | $Enums.VehicleType
    towTruckId?: StringFieldUpdateOperationsInput | string
    bookings?: BookingUncheckedUpdateManyWithoutTowTruckServiceNestedInput
  }

  export type TowTruckServiceCreateManyInput = {
    id?: string
    price: number
    vehicleType: $Enums.VehicleType
    towTruckId: string
  }

  export type TowTruckServiceUpdateManyMutationInput = {
    price?: FloatFieldUpdateOperationsInput | number
    vehicleType?: EnumVehicleTypeFieldUpdateOperationsInput | $Enums.VehicleType
  }

  export type TowTruckServiceUncheckedUpdateManyInput = {
    price?: FloatFieldUpdateOperationsInput | number
    vehicleType?: EnumVehicleTypeFieldUpdateOperationsInput | $Enums.VehicleType
    towTruckId?: StringFieldUpdateOperationsInput | string
  }

  export type LiveTruckLocationCreateInput = {
    id?: string
    location: InputJsonValue
    lastUpdated?: Date | string
    isAvailable?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    towTruck: TowTruckCreateNestedOneWithoutLiveLocationInput
  }

  export type LiveTruckLocationUncheckedCreateInput = {
    id?: string
    location: InputJsonValue
    lastUpdated?: Date | string
    isAvailable?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    towTruckId: string
  }

  export type LiveTruckLocationUpdateInput = {
    location?: InputJsonValue | InputJsonValue
    lastUpdated?: DateTimeFieldUpdateOperationsInput | Date | string
    isAvailable?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    towTruck?: TowTruckUpdateOneRequiredWithoutLiveLocationNestedInput
  }

  export type LiveTruckLocationUncheckedUpdateInput = {
    location?: InputJsonValue | InputJsonValue
    lastUpdated?: DateTimeFieldUpdateOperationsInput | Date | string
    isAvailable?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    towTruckId?: StringFieldUpdateOperationsInput | string
  }

  export type LiveTruckLocationCreateManyInput = {
    id?: string
    location: InputJsonValue
    lastUpdated?: Date | string
    isAvailable?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    towTruckId: string
  }

  export type LiveTruckLocationUpdateManyMutationInput = {
    location?: InputJsonValue | InputJsonValue
    lastUpdated?: DateTimeFieldUpdateOperationsInput | Date | string
    isAvailable?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LiveTruckLocationUncheckedUpdateManyInput = {
    location?: InputJsonValue | InputJsonValue
    lastUpdated?: DateTimeFieldUpdateOperationsInput | Date | string
    isAvailable?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    towTruckId?: StringFieldUpdateOperationsInput | string
  }

  export type SparePartCreateInput = {
    id?: string
    partName: string
    compatibleMake: string
    compatibleModel: string
    compatibleYear: number
    price: number
    quantityAvailable: number
    garage: GarageCreateNestedOneWithoutSparePartsInput
  }

  export type SparePartUncheckedCreateInput = {
    id?: string
    partName: string
    compatibleMake: string
    compatibleModel: string
    compatibleYear: number
    price: number
    quantityAvailable: number
    garageId: string
  }

  export type SparePartUpdateInput = {
    partName?: StringFieldUpdateOperationsInput | string
    compatibleMake?: StringFieldUpdateOperationsInput | string
    compatibleModel?: StringFieldUpdateOperationsInput | string
    compatibleYear?: IntFieldUpdateOperationsInput | number
    price?: FloatFieldUpdateOperationsInput | number
    quantityAvailable?: IntFieldUpdateOperationsInput | number
    garage?: GarageUpdateOneRequiredWithoutSparePartsNestedInput
  }

  export type SparePartUncheckedUpdateInput = {
    partName?: StringFieldUpdateOperationsInput | string
    compatibleMake?: StringFieldUpdateOperationsInput | string
    compatibleModel?: StringFieldUpdateOperationsInput | string
    compatibleYear?: IntFieldUpdateOperationsInput | number
    price?: FloatFieldUpdateOperationsInput | number
    quantityAvailable?: IntFieldUpdateOperationsInput | number
    garageId?: StringFieldUpdateOperationsInput | string
  }

  export type SparePartCreateManyInput = {
    id?: string
    partName: string
    compatibleMake: string
    compatibleModel: string
    compatibleYear: number
    price: number
    quantityAvailable: number
    garageId: string
  }

  export type SparePartUpdateManyMutationInput = {
    partName?: StringFieldUpdateOperationsInput | string
    compatibleMake?: StringFieldUpdateOperationsInput | string
    compatibleModel?: StringFieldUpdateOperationsInput | string
    compatibleYear?: IntFieldUpdateOperationsInput | number
    price?: FloatFieldUpdateOperationsInput | number
    quantityAvailable?: IntFieldUpdateOperationsInput | number
  }

  export type SparePartUncheckedUpdateManyInput = {
    partName?: StringFieldUpdateOperationsInput | string
    compatibleMake?: StringFieldUpdateOperationsInput | string
    compatibleModel?: StringFieldUpdateOperationsInput | string
    compatibleYear?: IntFieldUpdateOperationsInput | number
    price?: FloatFieldUpdateOperationsInput | number
    quantityAvailable?: IntFieldUpdateOperationsInput | number
    garageId?: StringFieldUpdateOperationsInput | string
  }

  export type BookingCreateInput = {
    id?: string
    status?: $Enums.BookingStatus
    bookedAt?: Date | string
    expiresAt?: Date | string | null
    paymentExpiresAt?: Date | string | null
    notes?: string | null
    otp?: string | null
    otpExpiresAt?: Date | string | null
    pickupLocation?: InputJsonValue | null
    destinationLocation?: InputJsonValue | null
    serviceStartedAt?: Date | string | null
    serviceEndedAt?: Date | string | null
    basePrice: number
    additionalFees?: number | null
    discountAmount?: number | null
    finalAmount: number
    paymentStatus?: string
    paymentIntentId?: string | null
    userRating?: number | null
    userReview?: string | null
    providerRating?: number | null
    providerReview?: string | null
    eligibleProviderIds?: BookingCreateeligibleProviderIdsInput | string[]
    user: UserCreateNestedOneWithoutBookingsInput
    vehicle: VehicleCreateNestedOneWithoutBookingsInput
    service?: ServiceCreateNestedOneWithoutBookingsInput
    garage?: GarageCreateNestedOneWithoutBookingsInput
    garageService?: GarageServiceCreateNestedOneWithoutBookingsInput
    towTruck?: TowTruckCreateNestedOneWithoutBookingsInput
    towTruckService?: TowTruckServiceCreateNestedOneWithoutBookingsInput
    promoCode?: PromoCodeCreateNestedOneWithoutBookingsInput
  }

  export type BookingUncheckedCreateInput = {
    id?: string
    status?: $Enums.BookingStatus
    bookedAt?: Date | string
    expiresAt?: Date | string | null
    paymentExpiresAt?: Date | string | null
    notes?: string | null
    otp?: string | null
    otpExpiresAt?: Date | string | null
    pickupLocation?: InputJsonValue | null
    destinationLocation?: InputJsonValue | null
    serviceStartedAt?: Date | string | null
    serviceEndedAt?: Date | string | null
    basePrice: number
    additionalFees?: number | null
    discountAmount?: number | null
    finalAmount: number
    paymentStatus?: string
    paymentIntentId?: string | null
    userRating?: number | null
    userReview?: string | null
    providerRating?: number | null
    providerReview?: string | null
    userId: string
    vehicleId: string
    eligibleProviderIds?: BookingCreateeligibleProviderIdsInput | string[]
    serviceId?: string | null
    garageId?: string | null
    garageServiceId?: string | null
    towTruckId?: string | null
    towTruckServiceId?: string | null
    promoCodeId?: string | null
  }

  export type BookingUpdateInput = {
    status?: EnumBookingStatusFieldUpdateOperationsInput | $Enums.BookingStatus
    bookedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    paymentExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    otp?: NullableStringFieldUpdateOperationsInput | string | null
    otpExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    pickupLocation?: InputJsonValue | InputJsonValue | null
    destinationLocation?: InputJsonValue | InputJsonValue | null
    serviceStartedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    serviceEndedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    basePrice?: FloatFieldUpdateOperationsInput | number
    additionalFees?: NullableFloatFieldUpdateOperationsInput | number | null
    discountAmount?: NullableFloatFieldUpdateOperationsInput | number | null
    finalAmount?: FloatFieldUpdateOperationsInput | number
    paymentStatus?: StringFieldUpdateOperationsInput | string
    paymentIntentId?: NullableStringFieldUpdateOperationsInput | string | null
    userRating?: NullableIntFieldUpdateOperationsInput | number | null
    userReview?: NullableStringFieldUpdateOperationsInput | string | null
    providerRating?: NullableIntFieldUpdateOperationsInput | number | null
    providerReview?: NullableStringFieldUpdateOperationsInput | string | null
    eligibleProviderIds?: BookingUpdateeligibleProviderIdsInput | string[]
    user?: UserUpdateOneRequiredWithoutBookingsNestedInput
    vehicle?: VehicleUpdateOneRequiredWithoutBookingsNestedInput
    service?: ServiceUpdateOneWithoutBookingsNestedInput
    garage?: GarageUpdateOneWithoutBookingsNestedInput
    garageService?: GarageServiceUpdateOneWithoutBookingsNestedInput
    towTruck?: TowTruckUpdateOneWithoutBookingsNestedInput
    towTruckService?: TowTruckServiceUpdateOneWithoutBookingsNestedInput
    promoCode?: PromoCodeUpdateOneWithoutBookingsNestedInput
  }

  export type BookingUncheckedUpdateInput = {
    status?: EnumBookingStatusFieldUpdateOperationsInput | $Enums.BookingStatus
    bookedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    paymentExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    otp?: NullableStringFieldUpdateOperationsInput | string | null
    otpExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    pickupLocation?: InputJsonValue | InputJsonValue | null
    destinationLocation?: InputJsonValue | InputJsonValue | null
    serviceStartedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    serviceEndedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    basePrice?: FloatFieldUpdateOperationsInput | number
    additionalFees?: NullableFloatFieldUpdateOperationsInput | number | null
    discountAmount?: NullableFloatFieldUpdateOperationsInput | number | null
    finalAmount?: FloatFieldUpdateOperationsInput | number
    paymentStatus?: StringFieldUpdateOperationsInput | string
    paymentIntentId?: NullableStringFieldUpdateOperationsInput | string | null
    userRating?: NullableIntFieldUpdateOperationsInput | number | null
    userReview?: NullableStringFieldUpdateOperationsInput | string | null
    providerRating?: NullableIntFieldUpdateOperationsInput | number | null
    providerReview?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: StringFieldUpdateOperationsInput | string
    vehicleId?: StringFieldUpdateOperationsInput | string
    eligibleProviderIds?: BookingUpdateeligibleProviderIdsInput | string[]
    serviceId?: NullableStringFieldUpdateOperationsInput | string | null
    garageId?: NullableStringFieldUpdateOperationsInput | string | null
    garageServiceId?: NullableStringFieldUpdateOperationsInput | string | null
    towTruckId?: NullableStringFieldUpdateOperationsInput | string | null
    towTruckServiceId?: NullableStringFieldUpdateOperationsInput | string | null
    promoCodeId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type BookingCreateManyInput = {
    id?: string
    status?: $Enums.BookingStatus
    bookedAt?: Date | string
    expiresAt?: Date | string | null
    paymentExpiresAt?: Date | string | null
    notes?: string | null
    otp?: string | null
    otpExpiresAt?: Date | string | null
    pickupLocation?: InputJsonValue | null
    destinationLocation?: InputJsonValue | null
    serviceStartedAt?: Date | string | null
    serviceEndedAt?: Date | string | null
    basePrice: number
    additionalFees?: number | null
    discountAmount?: number | null
    finalAmount: number
    paymentStatus?: string
    paymentIntentId?: string | null
    userRating?: number | null
    userReview?: string | null
    providerRating?: number | null
    providerReview?: string | null
    userId: string
    vehicleId: string
    eligibleProviderIds?: BookingCreateeligibleProviderIdsInput | string[]
    serviceId?: string | null
    garageId?: string | null
    garageServiceId?: string | null
    towTruckId?: string | null
    towTruckServiceId?: string | null
    promoCodeId?: string | null
  }

  export type BookingUpdateManyMutationInput = {
    status?: EnumBookingStatusFieldUpdateOperationsInput | $Enums.BookingStatus
    bookedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    paymentExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    otp?: NullableStringFieldUpdateOperationsInput | string | null
    otpExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    pickupLocation?: InputJsonValue | InputJsonValue | null
    destinationLocation?: InputJsonValue | InputJsonValue | null
    serviceStartedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    serviceEndedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    basePrice?: FloatFieldUpdateOperationsInput | number
    additionalFees?: NullableFloatFieldUpdateOperationsInput | number | null
    discountAmount?: NullableFloatFieldUpdateOperationsInput | number | null
    finalAmount?: FloatFieldUpdateOperationsInput | number
    paymentStatus?: StringFieldUpdateOperationsInput | string
    paymentIntentId?: NullableStringFieldUpdateOperationsInput | string | null
    userRating?: NullableIntFieldUpdateOperationsInput | number | null
    userReview?: NullableStringFieldUpdateOperationsInput | string | null
    providerRating?: NullableIntFieldUpdateOperationsInput | number | null
    providerReview?: NullableStringFieldUpdateOperationsInput | string | null
    eligibleProviderIds?: BookingUpdateeligibleProviderIdsInput | string[]
  }

  export type BookingUncheckedUpdateManyInput = {
    status?: EnumBookingStatusFieldUpdateOperationsInput | $Enums.BookingStatus
    bookedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    paymentExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    otp?: NullableStringFieldUpdateOperationsInput | string | null
    otpExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    pickupLocation?: InputJsonValue | InputJsonValue | null
    destinationLocation?: InputJsonValue | InputJsonValue | null
    serviceStartedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    serviceEndedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    basePrice?: FloatFieldUpdateOperationsInput | number
    additionalFees?: NullableFloatFieldUpdateOperationsInput | number | null
    discountAmount?: NullableFloatFieldUpdateOperationsInput | number | null
    finalAmount?: FloatFieldUpdateOperationsInput | number
    paymentStatus?: StringFieldUpdateOperationsInput | string
    paymentIntentId?: NullableStringFieldUpdateOperationsInput | string | null
    userRating?: NullableIntFieldUpdateOperationsInput | number | null
    userReview?: NullableStringFieldUpdateOperationsInput | string | null
    providerRating?: NullableIntFieldUpdateOperationsInput | number | null
    providerReview?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: StringFieldUpdateOperationsInput | string
    vehicleId?: StringFieldUpdateOperationsInput | string
    eligibleProviderIds?: BookingUpdateeligibleProviderIdsInput | string[]
    serviceId?: NullableStringFieldUpdateOperationsInput | string | null
    garageId?: NullableStringFieldUpdateOperationsInput | string | null
    garageServiceId?: NullableStringFieldUpdateOperationsInput | string | null
    towTruckId?: NullableStringFieldUpdateOperationsInput | string | null
    towTruckServiceId?: NullableStringFieldUpdateOperationsInput | string | null
    promoCodeId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type PromoCodeCreateInput = {
    id?: string
    code: string
    discountType: $Enums.DiscountType
    discountValue: number
    expiresAt: Date | string
    maxUses?: number | null
    timesUsed?: number
    isActive?: boolean
    bookings?: BookingCreateNestedManyWithoutPromoCodeInput
  }

  export type PromoCodeUncheckedCreateInput = {
    id?: string
    code: string
    discountType: $Enums.DiscountType
    discountValue: number
    expiresAt: Date | string
    maxUses?: number | null
    timesUsed?: number
    isActive?: boolean
    bookings?: BookingUncheckedCreateNestedManyWithoutPromoCodeInput
  }

  export type PromoCodeUpdateInput = {
    code?: StringFieldUpdateOperationsInput | string
    discountType?: EnumDiscountTypeFieldUpdateOperationsInput | $Enums.DiscountType
    discountValue?: FloatFieldUpdateOperationsInput | number
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    maxUses?: NullableIntFieldUpdateOperationsInput | number | null
    timesUsed?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    bookings?: BookingUpdateManyWithoutPromoCodeNestedInput
  }

  export type PromoCodeUncheckedUpdateInput = {
    code?: StringFieldUpdateOperationsInput | string
    discountType?: EnumDiscountTypeFieldUpdateOperationsInput | $Enums.DiscountType
    discountValue?: FloatFieldUpdateOperationsInput | number
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    maxUses?: NullableIntFieldUpdateOperationsInput | number | null
    timesUsed?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    bookings?: BookingUncheckedUpdateManyWithoutPromoCodeNestedInput
  }

  export type PromoCodeCreateManyInput = {
    id?: string
    code: string
    discountType: $Enums.DiscountType
    discountValue: number
    expiresAt: Date | string
    maxUses?: number | null
    timesUsed?: number
    isActive?: boolean
  }

  export type PromoCodeUpdateManyMutationInput = {
    code?: StringFieldUpdateOperationsInput | string
    discountType?: EnumDiscountTypeFieldUpdateOperationsInput | $Enums.DiscountType
    discountValue?: FloatFieldUpdateOperationsInput | number
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    maxUses?: NullableIntFieldUpdateOperationsInput | number | null
    timesUsed?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
  }

  export type PromoCodeUncheckedUpdateManyInput = {
    code?: StringFieldUpdateOperationsInput | string
    discountType?: EnumDiscountTypeFieldUpdateOperationsInput | $Enums.DiscountType
    discountValue?: FloatFieldUpdateOperationsInput | number
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    maxUses?: NullableIntFieldUpdateOperationsInput | number | null
    timesUsed?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
    isSet?: boolean
  }

  export type EnumRoleNullableListFilter<$PrismaModel = never> = {
    equals?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel> | null
    has?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel> | null
    hasEvery?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    hasSome?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    isEmpty?: boolean
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }
  export type JsonNullableFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    isSet?: boolean
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type VehicleListRelationFilter = {
    every?: VehicleWhereInput
    some?: VehicleWhereInput
    none?: VehicleWhereInput
  }

  export type GarageNullableRelationFilter = {
    is?: GarageWhereInput | null
    isNot?: GarageWhereInput | null
  }

  export type TowTruckNullableRelationFilter = {
    is?: TowTruckWhereInput | null
    isNot?: TowTruckWhereInput | null
  }

  export type BookingListRelationFilter = {
    every?: BookingWhereInput
    some?: BookingWhereInput
    none?: BookingWhereInput
  }

  export type VehicleOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type BookingOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    clerkId?: SortOrder
    email?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    phone?: SortOrder
    role?: SortOrder
    isPremium?: SortOrder
    isBanned?: SortOrder
    unsafeMetadata?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    stripeCustomerId?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    clerkId?: SortOrder
    email?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    phone?: SortOrder
    isPremium?: SortOrder
    isBanned?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    stripeCustomerId?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    clerkId?: SortOrder
    email?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    phone?: SortOrder
    isPremium?: SortOrder
    isBanned?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    stripeCustomerId?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
    isSet?: boolean
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedJsonNullableFilter<$PrismaModel>
    _max?: NestedJsonNullableFilter<$PrismaModel>
    isSet?: boolean
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type EnumVehicleTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.VehicleType | EnumVehicleTypeFieldRefInput<$PrismaModel>
    in?: $Enums.VehicleType[] | ListEnumVehicleTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.VehicleType[] | ListEnumVehicleTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumVehicleTypeFilter<$PrismaModel> | $Enums.VehicleType
  }

  export type UserRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type VehicleCountOrderByAggregateInput = {
    id?: SortOrder
    brand?: SortOrder
    name?: SortOrder
    model?: SortOrder
    year?: SortOrder
    plateNumber?: SortOrder
    color?: SortOrder
    type?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
  }

  export type VehicleAvgOrderByAggregateInput = {
    year?: SortOrder
  }

  export type VehicleMaxOrderByAggregateInput = {
    id?: SortOrder
    brand?: SortOrder
    name?: SortOrder
    model?: SortOrder
    year?: SortOrder
    plateNumber?: SortOrder
    color?: SortOrder
    type?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
  }

  export type VehicleMinOrderByAggregateInput = {
    id?: SortOrder
    brand?: SortOrder
    name?: SortOrder
    model?: SortOrder
    year?: SortOrder
    plateNumber?: SortOrder
    color?: SortOrder
    type?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
  }

  export type VehicleSumOrderByAggregateInput = {
    year?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type EnumVehicleTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.VehicleType | EnumVehicleTypeFieldRefInput<$PrismaModel>
    in?: $Enums.VehicleType[] | ListEnumVehicleTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.VehicleType[] | ListEnumVehicleTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumVehicleTypeWithAggregatesFilter<$PrismaModel> | $Enums.VehicleType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumVehicleTypeFilter<$PrismaModel>
    _max?: NestedEnumVehicleTypeFilter<$PrismaModel>
  }

  export type GarageServiceListRelationFilter = {
    every?: GarageServiceWhereInput
    some?: GarageServiceWhereInput
    none?: GarageServiceWhereInput
  }

  export type GarageServiceOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ServiceCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    icon?: SortOrder
    type?: SortOrder
  }

  export type ServiceMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    icon?: SortOrder
    type?: SortOrder
  }

  export type ServiceMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    icon?: SortOrder
    type?: SortOrder
  }

  export type FloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
    isSet?: boolean
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
    isSet?: boolean
  }
  export type JsonFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonFilterBase<$PrismaModel>>, 'path'>>

  export type JsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
  }

  export type EnumVerificationStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.VerificationStatus | EnumVerificationStatusFieldRefInput<$PrismaModel>
    in?: $Enums.VerificationStatus[] | ListEnumVerificationStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.VerificationStatus[] | ListEnumVerificationStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumVerificationStatusFilter<$PrismaModel> | $Enums.VerificationStatus
  }

  export type SparePartListRelationFilter = {
    every?: SparePartWhereInput
    some?: SparePartWhereInput
    none?: SparePartWhereInput
  }

  export type SparePartOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type GarageCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    licenseNumber?: SortOrder
    address?: SortOrder
    ownerName?: SortOrder
    contactEmail?: SortOrder
    contactPhone?: SortOrder
    numberOfEmployees?: SortOrder
    rating?: SortOrder
    reviewCount?: SortOrder
    isOpen?: SortOrder
    operatingHours?: SortOrder
    stripeAccountId?: SortOrder
    location?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    status?: SortOrder
    rejectionReason?: SortOrder
    ownerId?: SortOrder
  }

  export type GarageAvgOrderByAggregateInput = {
    numberOfEmployees?: SortOrder
    rating?: SortOrder
    reviewCount?: SortOrder
  }

  export type GarageMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    licenseNumber?: SortOrder
    address?: SortOrder
    ownerName?: SortOrder
    contactEmail?: SortOrder
    contactPhone?: SortOrder
    numberOfEmployees?: SortOrder
    rating?: SortOrder
    reviewCount?: SortOrder
    isOpen?: SortOrder
    stripeAccountId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    status?: SortOrder
    rejectionReason?: SortOrder
    ownerId?: SortOrder
  }

  export type GarageMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    licenseNumber?: SortOrder
    address?: SortOrder
    ownerName?: SortOrder
    contactEmail?: SortOrder
    contactPhone?: SortOrder
    numberOfEmployees?: SortOrder
    rating?: SortOrder
    reviewCount?: SortOrder
    isOpen?: SortOrder
    stripeAccountId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    status?: SortOrder
    rejectionReason?: SortOrder
    ownerId?: SortOrder
  }

  export type GarageSumOrderByAggregateInput = {
    numberOfEmployees?: SortOrder
    rating?: SortOrder
    reviewCount?: SortOrder
  }

  export type FloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
    isSet?: boolean
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
    isSet?: boolean
  }
  export type JsonWithAggregatesFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedJsonFilter<$PrismaModel>
    _max?: NestedJsonFilter<$PrismaModel>
  }

  export type EnumVerificationStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.VerificationStatus | EnumVerificationStatusFieldRefInput<$PrismaModel>
    in?: $Enums.VerificationStatus[] | ListEnumVerificationStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.VerificationStatus[] | ListEnumVerificationStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumVerificationStatusWithAggregatesFilter<$PrismaModel> | $Enums.VerificationStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumVerificationStatusFilter<$PrismaModel>
    _max?: NestedEnumVerificationStatusFilter<$PrismaModel>
  }

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type GarageRelationFilter = {
    is?: GarageWhereInput
    isNot?: GarageWhereInput
  }

  export type ServiceRelationFilter = {
    is?: ServiceWhereInput
    isNot?: ServiceWhereInput
  }

  export type GarageServiceGarageIdServiceIdCompoundUniqueInput = {
    garageId: string
    serviceId: string
  }

  export type GarageServiceCountOrderByAggregateInput = {
    id?: SortOrder
    price?: SortOrder
    garageId?: SortOrder
    serviceId?: SortOrder
  }

  export type GarageServiceAvgOrderByAggregateInput = {
    price?: SortOrder
  }

  export type GarageServiceMaxOrderByAggregateInput = {
    id?: SortOrder
    price?: SortOrder
    garageId?: SortOrder
    serviceId?: SortOrder
  }

  export type GarageServiceMinOrderByAggregateInput = {
    id?: SortOrder
    price?: SortOrder
    garageId?: SortOrder
    serviceId?: SortOrder
  }

  export type GarageServiceSumOrderByAggregateInput = {
    price?: SortOrder
  }

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type TowTruckServiceListRelationFilter = {
    every?: TowTruckServiceWhereInput
    some?: TowTruckServiceWhereInput
    none?: TowTruckServiceWhereInput
  }

  export type LiveTruckLocationNullableRelationFilter = {
    is?: LiveTruckLocationWhereInput | null
    isNot?: LiveTruckLocationWhereInput | null
  }

  export type TowTruckServiceOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type TowTruckCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    driverName?: SortOrder
    model?: SortOrder
    make?: SortOrder
    year?: SortOrder
    plateNumber?: SortOrder
    licenseNumber?: SortOrder
    status?: SortOrder
    rejectionReason?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    ownerId?: SortOrder
    stripeAccountId?: SortOrder
  }

  export type TowTruckAvgOrderByAggregateInput = {
    year?: SortOrder
  }

  export type TowTruckMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    driverName?: SortOrder
    model?: SortOrder
    make?: SortOrder
    year?: SortOrder
    plateNumber?: SortOrder
    licenseNumber?: SortOrder
    status?: SortOrder
    rejectionReason?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    ownerId?: SortOrder
    stripeAccountId?: SortOrder
  }

  export type TowTruckMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    driverName?: SortOrder
    model?: SortOrder
    make?: SortOrder
    year?: SortOrder
    plateNumber?: SortOrder
    licenseNumber?: SortOrder
    status?: SortOrder
    rejectionReason?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    ownerId?: SortOrder
    stripeAccountId?: SortOrder
  }

  export type TowTruckSumOrderByAggregateInput = {
    year?: SortOrder
  }

  export type TowTruckRelationFilter = {
    is?: TowTruckWhereInput
    isNot?: TowTruckWhereInput
  }

  export type TowTruckServiceTowTruckIdVehicleTypeCompoundUniqueInput = {
    towTruckId: string
    vehicleType: $Enums.VehicleType
  }

  export type TowTruckServiceCountOrderByAggregateInput = {
    id?: SortOrder
    price?: SortOrder
    vehicleType?: SortOrder
    towTruckId?: SortOrder
  }

  export type TowTruckServiceAvgOrderByAggregateInput = {
    price?: SortOrder
  }

  export type TowTruckServiceMaxOrderByAggregateInput = {
    id?: SortOrder
    price?: SortOrder
    vehicleType?: SortOrder
    towTruckId?: SortOrder
  }

  export type TowTruckServiceMinOrderByAggregateInput = {
    id?: SortOrder
    price?: SortOrder
    vehicleType?: SortOrder
    towTruckId?: SortOrder
  }

  export type TowTruckServiceSumOrderByAggregateInput = {
    price?: SortOrder
  }

  export type LiveTruckLocationCountOrderByAggregateInput = {
    id?: SortOrder
    location?: SortOrder
    lastUpdated?: SortOrder
    isAvailable?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    towTruckId?: SortOrder
  }

  export type LiveTruckLocationMaxOrderByAggregateInput = {
    id?: SortOrder
    lastUpdated?: SortOrder
    isAvailable?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    towTruckId?: SortOrder
  }

  export type LiveTruckLocationMinOrderByAggregateInput = {
    id?: SortOrder
    lastUpdated?: SortOrder
    isAvailable?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    towTruckId?: SortOrder
  }

  export type SparePartCountOrderByAggregateInput = {
    id?: SortOrder
    partName?: SortOrder
    compatibleMake?: SortOrder
    compatibleModel?: SortOrder
    compatibleYear?: SortOrder
    price?: SortOrder
    quantityAvailable?: SortOrder
    garageId?: SortOrder
  }

  export type SparePartAvgOrderByAggregateInput = {
    compatibleYear?: SortOrder
    price?: SortOrder
    quantityAvailable?: SortOrder
  }

  export type SparePartMaxOrderByAggregateInput = {
    id?: SortOrder
    partName?: SortOrder
    compatibleMake?: SortOrder
    compatibleModel?: SortOrder
    compatibleYear?: SortOrder
    price?: SortOrder
    quantityAvailable?: SortOrder
    garageId?: SortOrder
  }

  export type SparePartMinOrderByAggregateInput = {
    id?: SortOrder
    partName?: SortOrder
    compatibleMake?: SortOrder
    compatibleModel?: SortOrder
    compatibleYear?: SortOrder
    price?: SortOrder
    quantityAvailable?: SortOrder
    garageId?: SortOrder
  }

  export type SparePartSumOrderByAggregateInput = {
    compatibleYear?: SortOrder
    price?: SortOrder
    quantityAvailable?: SortOrder
  }

  export type EnumBookingStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.BookingStatus | EnumBookingStatusFieldRefInput<$PrismaModel>
    in?: $Enums.BookingStatus[] | ListEnumBookingStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.BookingStatus[] | ListEnumBookingStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumBookingStatusFilter<$PrismaModel> | $Enums.BookingStatus
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
    isSet?: boolean
  }

  export type StringNullableListFilter<$PrismaModel = never> = {
    equals?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    has?: string | StringFieldRefInput<$PrismaModel> | null
    hasEvery?: string[] | ListStringFieldRefInput<$PrismaModel>
    hasSome?: string[] | ListStringFieldRefInput<$PrismaModel>
    isEmpty?: boolean
  }

  export type VehicleRelationFilter = {
    is?: VehicleWhereInput
    isNot?: VehicleWhereInput
  }

  export type ServiceNullableRelationFilter = {
    is?: ServiceWhereInput | null
    isNot?: ServiceWhereInput | null
  }

  export type GarageServiceNullableRelationFilter = {
    is?: GarageServiceWhereInput | null
    isNot?: GarageServiceWhereInput | null
  }

  export type TowTruckServiceNullableRelationFilter = {
    is?: TowTruckServiceWhereInput | null
    isNot?: TowTruckServiceWhereInput | null
  }

  export type PromoCodeNullableRelationFilter = {
    is?: PromoCodeWhereInput | null
    isNot?: PromoCodeWhereInput | null
  }

  export type BookingCountOrderByAggregateInput = {
    id?: SortOrder
    status?: SortOrder
    bookedAt?: SortOrder
    expiresAt?: SortOrder
    paymentExpiresAt?: SortOrder
    notes?: SortOrder
    otp?: SortOrder
    otpExpiresAt?: SortOrder
    pickupLocation?: SortOrder
    destinationLocation?: SortOrder
    serviceStartedAt?: SortOrder
    serviceEndedAt?: SortOrder
    basePrice?: SortOrder
    additionalFees?: SortOrder
    discountAmount?: SortOrder
    finalAmount?: SortOrder
    paymentStatus?: SortOrder
    paymentIntentId?: SortOrder
    userRating?: SortOrder
    userReview?: SortOrder
    providerRating?: SortOrder
    providerReview?: SortOrder
    userId?: SortOrder
    vehicleId?: SortOrder
    eligibleProviderIds?: SortOrder
    serviceId?: SortOrder
    garageId?: SortOrder
    garageServiceId?: SortOrder
    towTruckId?: SortOrder
    towTruckServiceId?: SortOrder
    promoCodeId?: SortOrder
  }

  export type BookingAvgOrderByAggregateInput = {
    basePrice?: SortOrder
    additionalFees?: SortOrder
    discountAmount?: SortOrder
    finalAmount?: SortOrder
    userRating?: SortOrder
    providerRating?: SortOrder
  }

  export type BookingMaxOrderByAggregateInput = {
    id?: SortOrder
    status?: SortOrder
    bookedAt?: SortOrder
    expiresAt?: SortOrder
    paymentExpiresAt?: SortOrder
    notes?: SortOrder
    otp?: SortOrder
    otpExpiresAt?: SortOrder
    serviceStartedAt?: SortOrder
    serviceEndedAt?: SortOrder
    basePrice?: SortOrder
    additionalFees?: SortOrder
    discountAmount?: SortOrder
    finalAmount?: SortOrder
    paymentStatus?: SortOrder
    paymentIntentId?: SortOrder
    userRating?: SortOrder
    userReview?: SortOrder
    providerRating?: SortOrder
    providerReview?: SortOrder
    userId?: SortOrder
    vehicleId?: SortOrder
    serviceId?: SortOrder
    garageId?: SortOrder
    garageServiceId?: SortOrder
    towTruckId?: SortOrder
    towTruckServiceId?: SortOrder
    promoCodeId?: SortOrder
  }

  export type BookingMinOrderByAggregateInput = {
    id?: SortOrder
    status?: SortOrder
    bookedAt?: SortOrder
    expiresAt?: SortOrder
    paymentExpiresAt?: SortOrder
    notes?: SortOrder
    otp?: SortOrder
    otpExpiresAt?: SortOrder
    serviceStartedAt?: SortOrder
    serviceEndedAt?: SortOrder
    basePrice?: SortOrder
    additionalFees?: SortOrder
    discountAmount?: SortOrder
    finalAmount?: SortOrder
    paymentStatus?: SortOrder
    paymentIntentId?: SortOrder
    userRating?: SortOrder
    userReview?: SortOrder
    providerRating?: SortOrder
    providerReview?: SortOrder
    userId?: SortOrder
    vehicleId?: SortOrder
    serviceId?: SortOrder
    garageId?: SortOrder
    garageServiceId?: SortOrder
    towTruckId?: SortOrder
    towTruckServiceId?: SortOrder
    promoCodeId?: SortOrder
  }

  export type BookingSumOrderByAggregateInput = {
    basePrice?: SortOrder
    additionalFees?: SortOrder
    discountAmount?: SortOrder
    finalAmount?: SortOrder
    userRating?: SortOrder
    providerRating?: SortOrder
  }

  export type EnumBookingStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.BookingStatus | EnumBookingStatusFieldRefInput<$PrismaModel>
    in?: $Enums.BookingStatus[] | ListEnumBookingStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.BookingStatus[] | ListEnumBookingStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumBookingStatusWithAggregatesFilter<$PrismaModel> | $Enums.BookingStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumBookingStatusFilter<$PrismaModel>
    _max?: NestedEnumBookingStatusFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
    isSet?: boolean
  }

  export type EnumDiscountTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.DiscountType | EnumDiscountTypeFieldRefInput<$PrismaModel>
    in?: $Enums.DiscountType[] | ListEnumDiscountTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.DiscountType[] | ListEnumDiscountTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumDiscountTypeFilter<$PrismaModel> | $Enums.DiscountType
  }

  export type PromoCodeCountOrderByAggregateInput = {
    id?: SortOrder
    code?: SortOrder
    discountType?: SortOrder
    discountValue?: SortOrder
    expiresAt?: SortOrder
    maxUses?: SortOrder
    timesUsed?: SortOrder
    isActive?: SortOrder
  }

  export type PromoCodeAvgOrderByAggregateInput = {
    discountValue?: SortOrder
    maxUses?: SortOrder
    timesUsed?: SortOrder
  }

  export type PromoCodeMaxOrderByAggregateInput = {
    id?: SortOrder
    code?: SortOrder
    discountType?: SortOrder
    discountValue?: SortOrder
    expiresAt?: SortOrder
    maxUses?: SortOrder
    timesUsed?: SortOrder
    isActive?: SortOrder
  }

  export type PromoCodeMinOrderByAggregateInput = {
    id?: SortOrder
    code?: SortOrder
    discountType?: SortOrder
    discountValue?: SortOrder
    expiresAt?: SortOrder
    maxUses?: SortOrder
    timesUsed?: SortOrder
    isActive?: SortOrder
  }

  export type PromoCodeSumOrderByAggregateInput = {
    discountValue?: SortOrder
    maxUses?: SortOrder
    timesUsed?: SortOrder
  }

  export type EnumDiscountTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.DiscountType | EnumDiscountTypeFieldRefInput<$PrismaModel>
    in?: $Enums.DiscountType[] | ListEnumDiscountTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.DiscountType[] | ListEnumDiscountTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumDiscountTypeWithAggregatesFilter<$PrismaModel> | $Enums.DiscountType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumDiscountTypeFilter<$PrismaModel>
    _max?: NestedEnumDiscountTypeFilter<$PrismaModel>
  }

  export type UserCreateroleInput = {
    set: $Enums.Role[]
  }

  export type VehicleCreateNestedManyWithoutUserInput = {
    create?: XOR<VehicleCreateWithoutUserInput, VehicleUncheckedCreateWithoutUserInput> | VehicleCreateWithoutUserInput[] | VehicleUncheckedCreateWithoutUserInput[]
    connectOrCreate?: VehicleCreateOrConnectWithoutUserInput | VehicleCreateOrConnectWithoutUserInput[]
    createMany?: VehicleCreateManyUserInputEnvelope
    connect?: VehicleWhereUniqueInput | VehicleWhereUniqueInput[]
  }

  export type GarageCreateNestedOneWithoutOwnerInput = {
    create?: XOR<GarageCreateWithoutOwnerInput, GarageUncheckedCreateWithoutOwnerInput>
    connectOrCreate?: GarageCreateOrConnectWithoutOwnerInput
    connect?: GarageWhereUniqueInput
  }

  export type TowTruckCreateNestedOneWithoutOwnerInput = {
    create?: XOR<TowTruckCreateWithoutOwnerInput, TowTruckUncheckedCreateWithoutOwnerInput>
    connectOrCreate?: TowTruckCreateOrConnectWithoutOwnerInput
    connect?: TowTruckWhereUniqueInput
  }

  export type BookingCreateNestedManyWithoutUserInput = {
    create?: XOR<BookingCreateWithoutUserInput, BookingUncheckedCreateWithoutUserInput> | BookingCreateWithoutUserInput[] | BookingUncheckedCreateWithoutUserInput[]
    connectOrCreate?: BookingCreateOrConnectWithoutUserInput | BookingCreateOrConnectWithoutUserInput[]
    createMany?: BookingCreateManyUserInputEnvelope
    connect?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
  }

  export type VehicleUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<VehicleCreateWithoutUserInput, VehicleUncheckedCreateWithoutUserInput> | VehicleCreateWithoutUserInput[] | VehicleUncheckedCreateWithoutUserInput[]
    connectOrCreate?: VehicleCreateOrConnectWithoutUserInput | VehicleCreateOrConnectWithoutUserInput[]
    createMany?: VehicleCreateManyUserInputEnvelope
    connect?: VehicleWhereUniqueInput | VehicleWhereUniqueInput[]
  }

  export type GarageUncheckedCreateNestedOneWithoutOwnerInput = {
    create?: XOR<GarageCreateWithoutOwnerInput, GarageUncheckedCreateWithoutOwnerInput>
    connectOrCreate?: GarageCreateOrConnectWithoutOwnerInput
    connect?: GarageWhereUniqueInput
  }

  export type TowTruckUncheckedCreateNestedOneWithoutOwnerInput = {
    create?: XOR<TowTruckCreateWithoutOwnerInput, TowTruckUncheckedCreateWithoutOwnerInput>
    connectOrCreate?: TowTruckCreateOrConnectWithoutOwnerInput
    connect?: TowTruckWhereUniqueInput
  }

  export type BookingUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<BookingCreateWithoutUserInput, BookingUncheckedCreateWithoutUserInput> | BookingCreateWithoutUserInput[] | BookingUncheckedCreateWithoutUserInput[]
    connectOrCreate?: BookingCreateOrConnectWithoutUserInput | BookingCreateOrConnectWithoutUserInput[]
    createMany?: BookingCreateManyUserInputEnvelope
    connect?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
    unset?: boolean
  }

  export type UserUpdateroleInput = {
    set?: $Enums.Role[]
    push?: $Enums.Role | $Enums.Role[]
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type VehicleUpdateManyWithoutUserNestedInput = {
    create?: XOR<VehicleCreateWithoutUserInput, VehicleUncheckedCreateWithoutUserInput> | VehicleCreateWithoutUserInput[] | VehicleUncheckedCreateWithoutUserInput[]
    connectOrCreate?: VehicleCreateOrConnectWithoutUserInput | VehicleCreateOrConnectWithoutUserInput[]
    upsert?: VehicleUpsertWithWhereUniqueWithoutUserInput | VehicleUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: VehicleCreateManyUserInputEnvelope
    set?: VehicleWhereUniqueInput | VehicleWhereUniqueInput[]
    disconnect?: VehicleWhereUniqueInput | VehicleWhereUniqueInput[]
    delete?: VehicleWhereUniqueInput | VehicleWhereUniqueInput[]
    connect?: VehicleWhereUniqueInput | VehicleWhereUniqueInput[]
    update?: VehicleUpdateWithWhereUniqueWithoutUserInput | VehicleUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: VehicleUpdateManyWithWhereWithoutUserInput | VehicleUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: VehicleScalarWhereInput | VehicleScalarWhereInput[]
  }

  export type GarageUpdateOneWithoutOwnerNestedInput = {
    create?: XOR<GarageCreateWithoutOwnerInput, GarageUncheckedCreateWithoutOwnerInput>
    connectOrCreate?: GarageCreateOrConnectWithoutOwnerInput
    upsert?: GarageUpsertWithoutOwnerInput
    disconnect?: GarageWhereInput | boolean
    delete?: GarageWhereInput | boolean
    connect?: GarageWhereUniqueInput
    update?: XOR<XOR<GarageUpdateToOneWithWhereWithoutOwnerInput, GarageUpdateWithoutOwnerInput>, GarageUncheckedUpdateWithoutOwnerInput>
  }

  export type TowTruckUpdateOneWithoutOwnerNestedInput = {
    create?: XOR<TowTruckCreateWithoutOwnerInput, TowTruckUncheckedCreateWithoutOwnerInput>
    connectOrCreate?: TowTruckCreateOrConnectWithoutOwnerInput
    upsert?: TowTruckUpsertWithoutOwnerInput
    disconnect?: TowTruckWhereInput | boolean
    delete?: TowTruckWhereInput | boolean
    connect?: TowTruckWhereUniqueInput
    update?: XOR<XOR<TowTruckUpdateToOneWithWhereWithoutOwnerInput, TowTruckUpdateWithoutOwnerInput>, TowTruckUncheckedUpdateWithoutOwnerInput>
  }

  export type BookingUpdateManyWithoutUserNestedInput = {
    create?: XOR<BookingCreateWithoutUserInput, BookingUncheckedCreateWithoutUserInput> | BookingCreateWithoutUserInput[] | BookingUncheckedCreateWithoutUserInput[]
    connectOrCreate?: BookingCreateOrConnectWithoutUserInput | BookingCreateOrConnectWithoutUserInput[]
    upsert?: BookingUpsertWithWhereUniqueWithoutUserInput | BookingUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: BookingCreateManyUserInputEnvelope
    set?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    disconnect?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    delete?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    connect?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    update?: BookingUpdateWithWhereUniqueWithoutUserInput | BookingUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: BookingUpdateManyWithWhereWithoutUserInput | BookingUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: BookingScalarWhereInput | BookingScalarWhereInput[]
  }

  export type VehicleUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<VehicleCreateWithoutUserInput, VehicleUncheckedCreateWithoutUserInput> | VehicleCreateWithoutUserInput[] | VehicleUncheckedCreateWithoutUserInput[]
    connectOrCreate?: VehicleCreateOrConnectWithoutUserInput | VehicleCreateOrConnectWithoutUserInput[]
    upsert?: VehicleUpsertWithWhereUniqueWithoutUserInput | VehicleUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: VehicleCreateManyUserInputEnvelope
    set?: VehicleWhereUniqueInput | VehicleWhereUniqueInput[]
    disconnect?: VehicleWhereUniqueInput | VehicleWhereUniqueInput[]
    delete?: VehicleWhereUniqueInput | VehicleWhereUniqueInput[]
    connect?: VehicleWhereUniqueInput | VehicleWhereUniqueInput[]
    update?: VehicleUpdateWithWhereUniqueWithoutUserInput | VehicleUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: VehicleUpdateManyWithWhereWithoutUserInput | VehicleUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: VehicleScalarWhereInput | VehicleScalarWhereInput[]
  }

  export type GarageUncheckedUpdateOneWithoutOwnerNestedInput = {
    create?: XOR<GarageCreateWithoutOwnerInput, GarageUncheckedCreateWithoutOwnerInput>
    connectOrCreate?: GarageCreateOrConnectWithoutOwnerInput
    upsert?: GarageUpsertWithoutOwnerInput
    disconnect?: GarageWhereInput | boolean
    delete?: GarageWhereInput | boolean
    connect?: GarageWhereUniqueInput
    update?: XOR<XOR<GarageUpdateToOneWithWhereWithoutOwnerInput, GarageUpdateWithoutOwnerInput>, GarageUncheckedUpdateWithoutOwnerInput>
  }

  export type TowTruckUncheckedUpdateOneWithoutOwnerNestedInput = {
    create?: XOR<TowTruckCreateWithoutOwnerInput, TowTruckUncheckedCreateWithoutOwnerInput>
    connectOrCreate?: TowTruckCreateOrConnectWithoutOwnerInput
    upsert?: TowTruckUpsertWithoutOwnerInput
    disconnect?: TowTruckWhereInput | boolean
    delete?: TowTruckWhereInput | boolean
    connect?: TowTruckWhereUniqueInput
    update?: XOR<XOR<TowTruckUpdateToOneWithWhereWithoutOwnerInput, TowTruckUpdateWithoutOwnerInput>, TowTruckUncheckedUpdateWithoutOwnerInput>
  }

  export type BookingUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<BookingCreateWithoutUserInput, BookingUncheckedCreateWithoutUserInput> | BookingCreateWithoutUserInput[] | BookingUncheckedCreateWithoutUserInput[]
    connectOrCreate?: BookingCreateOrConnectWithoutUserInput | BookingCreateOrConnectWithoutUserInput[]
    upsert?: BookingUpsertWithWhereUniqueWithoutUserInput | BookingUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: BookingCreateManyUserInputEnvelope
    set?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    disconnect?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    delete?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    connect?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    update?: BookingUpdateWithWhereUniqueWithoutUserInput | BookingUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: BookingUpdateManyWithWhereWithoutUserInput | BookingUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: BookingScalarWhereInput | BookingScalarWhereInput[]
  }

  export type UserCreateNestedOneWithoutVehiclesInput = {
    create?: XOR<UserCreateWithoutVehiclesInput, UserUncheckedCreateWithoutVehiclesInput>
    connectOrCreate?: UserCreateOrConnectWithoutVehiclesInput
    connect?: UserWhereUniqueInput
  }

  export type BookingCreateNestedManyWithoutVehicleInput = {
    create?: XOR<BookingCreateWithoutVehicleInput, BookingUncheckedCreateWithoutVehicleInput> | BookingCreateWithoutVehicleInput[] | BookingUncheckedCreateWithoutVehicleInput[]
    connectOrCreate?: BookingCreateOrConnectWithoutVehicleInput | BookingCreateOrConnectWithoutVehicleInput[]
    createMany?: BookingCreateManyVehicleInputEnvelope
    connect?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
  }

  export type BookingUncheckedCreateNestedManyWithoutVehicleInput = {
    create?: XOR<BookingCreateWithoutVehicleInput, BookingUncheckedCreateWithoutVehicleInput> | BookingCreateWithoutVehicleInput[] | BookingUncheckedCreateWithoutVehicleInput[]
    connectOrCreate?: BookingCreateOrConnectWithoutVehicleInput | BookingCreateOrConnectWithoutVehicleInput[]
    createMany?: BookingCreateManyVehicleInputEnvelope
    connect?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type EnumVehicleTypeFieldUpdateOperationsInput = {
    set?: $Enums.VehicleType
  }

  export type UserUpdateOneRequiredWithoutVehiclesNestedInput = {
    create?: XOR<UserCreateWithoutVehiclesInput, UserUncheckedCreateWithoutVehiclesInput>
    connectOrCreate?: UserCreateOrConnectWithoutVehiclesInput
    upsert?: UserUpsertWithoutVehiclesInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutVehiclesInput, UserUpdateWithoutVehiclesInput>, UserUncheckedUpdateWithoutVehiclesInput>
  }

  export type BookingUpdateManyWithoutVehicleNestedInput = {
    create?: XOR<BookingCreateWithoutVehicleInput, BookingUncheckedCreateWithoutVehicleInput> | BookingCreateWithoutVehicleInput[] | BookingUncheckedCreateWithoutVehicleInput[]
    connectOrCreate?: BookingCreateOrConnectWithoutVehicleInput | BookingCreateOrConnectWithoutVehicleInput[]
    upsert?: BookingUpsertWithWhereUniqueWithoutVehicleInput | BookingUpsertWithWhereUniqueWithoutVehicleInput[]
    createMany?: BookingCreateManyVehicleInputEnvelope
    set?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    disconnect?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    delete?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    connect?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    update?: BookingUpdateWithWhereUniqueWithoutVehicleInput | BookingUpdateWithWhereUniqueWithoutVehicleInput[]
    updateMany?: BookingUpdateManyWithWhereWithoutVehicleInput | BookingUpdateManyWithWhereWithoutVehicleInput[]
    deleteMany?: BookingScalarWhereInput | BookingScalarWhereInput[]
  }

  export type BookingUncheckedUpdateManyWithoutVehicleNestedInput = {
    create?: XOR<BookingCreateWithoutVehicleInput, BookingUncheckedCreateWithoutVehicleInput> | BookingCreateWithoutVehicleInput[] | BookingUncheckedCreateWithoutVehicleInput[]
    connectOrCreate?: BookingCreateOrConnectWithoutVehicleInput | BookingCreateOrConnectWithoutVehicleInput[]
    upsert?: BookingUpsertWithWhereUniqueWithoutVehicleInput | BookingUpsertWithWhereUniqueWithoutVehicleInput[]
    createMany?: BookingCreateManyVehicleInputEnvelope
    set?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    disconnect?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    delete?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    connect?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    update?: BookingUpdateWithWhereUniqueWithoutVehicleInput | BookingUpdateWithWhereUniqueWithoutVehicleInput[]
    updateMany?: BookingUpdateManyWithWhereWithoutVehicleInput | BookingUpdateManyWithWhereWithoutVehicleInput[]
    deleteMany?: BookingScalarWhereInput | BookingScalarWhereInput[]
  }

  export type GarageServiceCreateNestedManyWithoutServiceInput = {
    create?: XOR<GarageServiceCreateWithoutServiceInput, GarageServiceUncheckedCreateWithoutServiceInput> | GarageServiceCreateWithoutServiceInput[] | GarageServiceUncheckedCreateWithoutServiceInput[]
    connectOrCreate?: GarageServiceCreateOrConnectWithoutServiceInput | GarageServiceCreateOrConnectWithoutServiceInput[]
    createMany?: GarageServiceCreateManyServiceInputEnvelope
    connect?: GarageServiceWhereUniqueInput | GarageServiceWhereUniqueInput[]
  }

  export type BookingCreateNestedManyWithoutServiceInput = {
    create?: XOR<BookingCreateWithoutServiceInput, BookingUncheckedCreateWithoutServiceInput> | BookingCreateWithoutServiceInput[] | BookingUncheckedCreateWithoutServiceInput[]
    connectOrCreate?: BookingCreateOrConnectWithoutServiceInput | BookingCreateOrConnectWithoutServiceInput[]
    createMany?: BookingCreateManyServiceInputEnvelope
    connect?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
  }

  export type GarageServiceUncheckedCreateNestedManyWithoutServiceInput = {
    create?: XOR<GarageServiceCreateWithoutServiceInput, GarageServiceUncheckedCreateWithoutServiceInput> | GarageServiceCreateWithoutServiceInput[] | GarageServiceUncheckedCreateWithoutServiceInput[]
    connectOrCreate?: GarageServiceCreateOrConnectWithoutServiceInput | GarageServiceCreateOrConnectWithoutServiceInput[]
    createMany?: GarageServiceCreateManyServiceInputEnvelope
    connect?: GarageServiceWhereUniqueInput | GarageServiceWhereUniqueInput[]
  }

  export type BookingUncheckedCreateNestedManyWithoutServiceInput = {
    create?: XOR<BookingCreateWithoutServiceInput, BookingUncheckedCreateWithoutServiceInput> | BookingCreateWithoutServiceInput[] | BookingUncheckedCreateWithoutServiceInput[]
    connectOrCreate?: BookingCreateOrConnectWithoutServiceInput | BookingCreateOrConnectWithoutServiceInput[]
    createMany?: BookingCreateManyServiceInputEnvelope
    connect?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
  }

  export type GarageServiceUpdateManyWithoutServiceNestedInput = {
    create?: XOR<GarageServiceCreateWithoutServiceInput, GarageServiceUncheckedCreateWithoutServiceInput> | GarageServiceCreateWithoutServiceInput[] | GarageServiceUncheckedCreateWithoutServiceInput[]
    connectOrCreate?: GarageServiceCreateOrConnectWithoutServiceInput | GarageServiceCreateOrConnectWithoutServiceInput[]
    upsert?: GarageServiceUpsertWithWhereUniqueWithoutServiceInput | GarageServiceUpsertWithWhereUniqueWithoutServiceInput[]
    createMany?: GarageServiceCreateManyServiceInputEnvelope
    set?: GarageServiceWhereUniqueInput | GarageServiceWhereUniqueInput[]
    disconnect?: GarageServiceWhereUniqueInput | GarageServiceWhereUniqueInput[]
    delete?: GarageServiceWhereUniqueInput | GarageServiceWhereUniqueInput[]
    connect?: GarageServiceWhereUniqueInput | GarageServiceWhereUniqueInput[]
    update?: GarageServiceUpdateWithWhereUniqueWithoutServiceInput | GarageServiceUpdateWithWhereUniqueWithoutServiceInput[]
    updateMany?: GarageServiceUpdateManyWithWhereWithoutServiceInput | GarageServiceUpdateManyWithWhereWithoutServiceInput[]
    deleteMany?: GarageServiceScalarWhereInput | GarageServiceScalarWhereInput[]
  }

  export type BookingUpdateManyWithoutServiceNestedInput = {
    create?: XOR<BookingCreateWithoutServiceInput, BookingUncheckedCreateWithoutServiceInput> | BookingCreateWithoutServiceInput[] | BookingUncheckedCreateWithoutServiceInput[]
    connectOrCreate?: BookingCreateOrConnectWithoutServiceInput | BookingCreateOrConnectWithoutServiceInput[]
    upsert?: BookingUpsertWithWhereUniqueWithoutServiceInput | BookingUpsertWithWhereUniqueWithoutServiceInput[]
    createMany?: BookingCreateManyServiceInputEnvelope
    set?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    disconnect?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    delete?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    connect?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    update?: BookingUpdateWithWhereUniqueWithoutServiceInput | BookingUpdateWithWhereUniqueWithoutServiceInput[]
    updateMany?: BookingUpdateManyWithWhereWithoutServiceInput | BookingUpdateManyWithWhereWithoutServiceInput[]
    deleteMany?: BookingScalarWhereInput | BookingScalarWhereInput[]
  }

  export type GarageServiceUncheckedUpdateManyWithoutServiceNestedInput = {
    create?: XOR<GarageServiceCreateWithoutServiceInput, GarageServiceUncheckedCreateWithoutServiceInput> | GarageServiceCreateWithoutServiceInput[] | GarageServiceUncheckedCreateWithoutServiceInput[]
    connectOrCreate?: GarageServiceCreateOrConnectWithoutServiceInput | GarageServiceCreateOrConnectWithoutServiceInput[]
    upsert?: GarageServiceUpsertWithWhereUniqueWithoutServiceInput | GarageServiceUpsertWithWhereUniqueWithoutServiceInput[]
    createMany?: GarageServiceCreateManyServiceInputEnvelope
    set?: GarageServiceWhereUniqueInput | GarageServiceWhereUniqueInput[]
    disconnect?: GarageServiceWhereUniqueInput | GarageServiceWhereUniqueInput[]
    delete?: GarageServiceWhereUniqueInput | GarageServiceWhereUniqueInput[]
    connect?: GarageServiceWhereUniqueInput | GarageServiceWhereUniqueInput[]
    update?: GarageServiceUpdateWithWhereUniqueWithoutServiceInput | GarageServiceUpdateWithWhereUniqueWithoutServiceInput[]
    updateMany?: GarageServiceUpdateManyWithWhereWithoutServiceInput | GarageServiceUpdateManyWithWhereWithoutServiceInput[]
    deleteMany?: GarageServiceScalarWhereInput | GarageServiceScalarWhereInput[]
  }

  export type BookingUncheckedUpdateManyWithoutServiceNestedInput = {
    create?: XOR<BookingCreateWithoutServiceInput, BookingUncheckedCreateWithoutServiceInput> | BookingCreateWithoutServiceInput[] | BookingUncheckedCreateWithoutServiceInput[]
    connectOrCreate?: BookingCreateOrConnectWithoutServiceInput | BookingCreateOrConnectWithoutServiceInput[]
    upsert?: BookingUpsertWithWhereUniqueWithoutServiceInput | BookingUpsertWithWhereUniqueWithoutServiceInput[]
    createMany?: BookingCreateManyServiceInputEnvelope
    set?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    disconnect?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    delete?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    connect?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    update?: BookingUpdateWithWhereUniqueWithoutServiceInput | BookingUpdateWithWhereUniqueWithoutServiceInput[]
    updateMany?: BookingUpdateManyWithWhereWithoutServiceInput | BookingUpdateManyWithWhereWithoutServiceInput[]
    deleteMany?: BookingScalarWhereInput | BookingScalarWhereInput[]
  }

  export type UserCreateNestedOneWithoutGarageInput = {
    create?: XOR<UserCreateWithoutGarageInput, UserUncheckedCreateWithoutGarageInput>
    connectOrCreate?: UserCreateOrConnectWithoutGarageInput
    connect?: UserWhereUniqueInput
  }

  export type GarageServiceCreateNestedManyWithoutGarageInput = {
    create?: XOR<GarageServiceCreateWithoutGarageInput, GarageServiceUncheckedCreateWithoutGarageInput> | GarageServiceCreateWithoutGarageInput[] | GarageServiceUncheckedCreateWithoutGarageInput[]
    connectOrCreate?: GarageServiceCreateOrConnectWithoutGarageInput | GarageServiceCreateOrConnectWithoutGarageInput[]
    createMany?: GarageServiceCreateManyGarageInputEnvelope
    connect?: GarageServiceWhereUniqueInput | GarageServiceWhereUniqueInput[]
  }

  export type SparePartCreateNestedManyWithoutGarageInput = {
    create?: XOR<SparePartCreateWithoutGarageInput, SparePartUncheckedCreateWithoutGarageInput> | SparePartCreateWithoutGarageInput[] | SparePartUncheckedCreateWithoutGarageInput[]
    connectOrCreate?: SparePartCreateOrConnectWithoutGarageInput | SparePartCreateOrConnectWithoutGarageInput[]
    createMany?: SparePartCreateManyGarageInputEnvelope
    connect?: SparePartWhereUniqueInput | SparePartWhereUniqueInput[]
  }

  export type BookingCreateNestedManyWithoutGarageInput = {
    create?: XOR<BookingCreateWithoutGarageInput, BookingUncheckedCreateWithoutGarageInput> | BookingCreateWithoutGarageInput[] | BookingUncheckedCreateWithoutGarageInput[]
    connectOrCreate?: BookingCreateOrConnectWithoutGarageInput | BookingCreateOrConnectWithoutGarageInput[]
    createMany?: BookingCreateManyGarageInputEnvelope
    connect?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
  }

  export type GarageServiceUncheckedCreateNestedManyWithoutGarageInput = {
    create?: XOR<GarageServiceCreateWithoutGarageInput, GarageServiceUncheckedCreateWithoutGarageInput> | GarageServiceCreateWithoutGarageInput[] | GarageServiceUncheckedCreateWithoutGarageInput[]
    connectOrCreate?: GarageServiceCreateOrConnectWithoutGarageInput | GarageServiceCreateOrConnectWithoutGarageInput[]
    createMany?: GarageServiceCreateManyGarageInputEnvelope
    connect?: GarageServiceWhereUniqueInput | GarageServiceWhereUniqueInput[]
  }

  export type SparePartUncheckedCreateNestedManyWithoutGarageInput = {
    create?: XOR<SparePartCreateWithoutGarageInput, SparePartUncheckedCreateWithoutGarageInput> | SparePartCreateWithoutGarageInput[] | SparePartUncheckedCreateWithoutGarageInput[]
    connectOrCreate?: SparePartCreateOrConnectWithoutGarageInput | SparePartCreateOrConnectWithoutGarageInput[]
    createMany?: SparePartCreateManyGarageInputEnvelope
    connect?: SparePartWhereUniqueInput | SparePartWhereUniqueInput[]
  }

  export type BookingUncheckedCreateNestedManyWithoutGarageInput = {
    create?: XOR<BookingCreateWithoutGarageInput, BookingUncheckedCreateWithoutGarageInput> | BookingCreateWithoutGarageInput[] | BookingUncheckedCreateWithoutGarageInput[]
    connectOrCreate?: BookingCreateOrConnectWithoutGarageInput | BookingCreateOrConnectWithoutGarageInput[]
    createMany?: BookingCreateManyGarageInputEnvelope
    connect?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
  }

  export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
    unset?: boolean
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
    unset?: boolean
  }

  export type EnumVerificationStatusFieldUpdateOperationsInput = {
    set?: $Enums.VerificationStatus
  }

  export type UserUpdateOneRequiredWithoutGarageNestedInput = {
    create?: XOR<UserCreateWithoutGarageInput, UserUncheckedCreateWithoutGarageInput>
    connectOrCreate?: UserCreateOrConnectWithoutGarageInput
    upsert?: UserUpsertWithoutGarageInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutGarageInput, UserUpdateWithoutGarageInput>, UserUncheckedUpdateWithoutGarageInput>
  }

  export type GarageServiceUpdateManyWithoutGarageNestedInput = {
    create?: XOR<GarageServiceCreateWithoutGarageInput, GarageServiceUncheckedCreateWithoutGarageInput> | GarageServiceCreateWithoutGarageInput[] | GarageServiceUncheckedCreateWithoutGarageInput[]
    connectOrCreate?: GarageServiceCreateOrConnectWithoutGarageInput | GarageServiceCreateOrConnectWithoutGarageInput[]
    upsert?: GarageServiceUpsertWithWhereUniqueWithoutGarageInput | GarageServiceUpsertWithWhereUniqueWithoutGarageInput[]
    createMany?: GarageServiceCreateManyGarageInputEnvelope
    set?: GarageServiceWhereUniqueInput | GarageServiceWhereUniqueInput[]
    disconnect?: GarageServiceWhereUniqueInput | GarageServiceWhereUniqueInput[]
    delete?: GarageServiceWhereUniqueInput | GarageServiceWhereUniqueInput[]
    connect?: GarageServiceWhereUniqueInput | GarageServiceWhereUniqueInput[]
    update?: GarageServiceUpdateWithWhereUniqueWithoutGarageInput | GarageServiceUpdateWithWhereUniqueWithoutGarageInput[]
    updateMany?: GarageServiceUpdateManyWithWhereWithoutGarageInput | GarageServiceUpdateManyWithWhereWithoutGarageInput[]
    deleteMany?: GarageServiceScalarWhereInput | GarageServiceScalarWhereInput[]
  }

  export type SparePartUpdateManyWithoutGarageNestedInput = {
    create?: XOR<SparePartCreateWithoutGarageInput, SparePartUncheckedCreateWithoutGarageInput> | SparePartCreateWithoutGarageInput[] | SparePartUncheckedCreateWithoutGarageInput[]
    connectOrCreate?: SparePartCreateOrConnectWithoutGarageInput | SparePartCreateOrConnectWithoutGarageInput[]
    upsert?: SparePartUpsertWithWhereUniqueWithoutGarageInput | SparePartUpsertWithWhereUniqueWithoutGarageInput[]
    createMany?: SparePartCreateManyGarageInputEnvelope
    set?: SparePartWhereUniqueInput | SparePartWhereUniqueInput[]
    disconnect?: SparePartWhereUniqueInput | SparePartWhereUniqueInput[]
    delete?: SparePartWhereUniqueInput | SparePartWhereUniqueInput[]
    connect?: SparePartWhereUniqueInput | SparePartWhereUniqueInput[]
    update?: SparePartUpdateWithWhereUniqueWithoutGarageInput | SparePartUpdateWithWhereUniqueWithoutGarageInput[]
    updateMany?: SparePartUpdateManyWithWhereWithoutGarageInput | SparePartUpdateManyWithWhereWithoutGarageInput[]
    deleteMany?: SparePartScalarWhereInput | SparePartScalarWhereInput[]
  }

  export type BookingUpdateManyWithoutGarageNestedInput = {
    create?: XOR<BookingCreateWithoutGarageInput, BookingUncheckedCreateWithoutGarageInput> | BookingCreateWithoutGarageInput[] | BookingUncheckedCreateWithoutGarageInput[]
    connectOrCreate?: BookingCreateOrConnectWithoutGarageInput | BookingCreateOrConnectWithoutGarageInput[]
    upsert?: BookingUpsertWithWhereUniqueWithoutGarageInput | BookingUpsertWithWhereUniqueWithoutGarageInput[]
    createMany?: BookingCreateManyGarageInputEnvelope
    set?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    disconnect?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    delete?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    connect?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    update?: BookingUpdateWithWhereUniqueWithoutGarageInput | BookingUpdateWithWhereUniqueWithoutGarageInput[]
    updateMany?: BookingUpdateManyWithWhereWithoutGarageInput | BookingUpdateManyWithWhereWithoutGarageInput[]
    deleteMany?: BookingScalarWhereInput | BookingScalarWhereInput[]
  }

  export type GarageServiceUncheckedUpdateManyWithoutGarageNestedInput = {
    create?: XOR<GarageServiceCreateWithoutGarageInput, GarageServiceUncheckedCreateWithoutGarageInput> | GarageServiceCreateWithoutGarageInput[] | GarageServiceUncheckedCreateWithoutGarageInput[]
    connectOrCreate?: GarageServiceCreateOrConnectWithoutGarageInput | GarageServiceCreateOrConnectWithoutGarageInput[]
    upsert?: GarageServiceUpsertWithWhereUniqueWithoutGarageInput | GarageServiceUpsertWithWhereUniqueWithoutGarageInput[]
    createMany?: GarageServiceCreateManyGarageInputEnvelope
    set?: GarageServiceWhereUniqueInput | GarageServiceWhereUniqueInput[]
    disconnect?: GarageServiceWhereUniqueInput | GarageServiceWhereUniqueInput[]
    delete?: GarageServiceWhereUniqueInput | GarageServiceWhereUniqueInput[]
    connect?: GarageServiceWhereUniqueInput | GarageServiceWhereUniqueInput[]
    update?: GarageServiceUpdateWithWhereUniqueWithoutGarageInput | GarageServiceUpdateWithWhereUniqueWithoutGarageInput[]
    updateMany?: GarageServiceUpdateManyWithWhereWithoutGarageInput | GarageServiceUpdateManyWithWhereWithoutGarageInput[]
    deleteMany?: GarageServiceScalarWhereInput | GarageServiceScalarWhereInput[]
  }

  export type SparePartUncheckedUpdateManyWithoutGarageNestedInput = {
    create?: XOR<SparePartCreateWithoutGarageInput, SparePartUncheckedCreateWithoutGarageInput> | SparePartCreateWithoutGarageInput[] | SparePartUncheckedCreateWithoutGarageInput[]
    connectOrCreate?: SparePartCreateOrConnectWithoutGarageInput | SparePartCreateOrConnectWithoutGarageInput[]
    upsert?: SparePartUpsertWithWhereUniqueWithoutGarageInput | SparePartUpsertWithWhereUniqueWithoutGarageInput[]
    createMany?: SparePartCreateManyGarageInputEnvelope
    set?: SparePartWhereUniqueInput | SparePartWhereUniqueInput[]
    disconnect?: SparePartWhereUniqueInput | SparePartWhereUniqueInput[]
    delete?: SparePartWhereUniqueInput | SparePartWhereUniqueInput[]
    connect?: SparePartWhereUniqueInput | SparePartWhereUniqueInput[]
    update?: SparePartUpdateWithWhereUniqueWithoutGarageInput | SparePartUpdateWithWhereUniqueWithoutGarageInput[]
    updateMany?: SparePartUpdateManyWithWhereWithoutGarageInput | SparePartUpdateManyWithWhereWithoutGarageInput[]
    deleteMany?: SparePartScalarWhereInput | SparePartScalarWhereInput[]
  }

  export type BookingUncheckedUpdateManyWithoutGarageNestedInput = {
    create?: XOR<BookingCreateWithoutGarageInput, BookingUncheckedCreateWithoutGarageInput> | BookingCreateWithoutGarageInput[] | BookingUncheckedCreateWithoutGarageInput[]
    connectOrCreate?: BookingCreateOrConnectWithoutGarageInput | BookingCreateOrConnectWithoutGarageInput[]
    upsert?: BookingUpsertWithWhereUniqueWithoutGarageInput | BookingUpsertWithWhereUniqueWithoutGarageInput[]
    createMany?: BookingCreateManyGarageInputEnvelope
    set?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    disconnect?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    delete?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    connect?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    update?: BookingUpdateWithWhereUniqueWithoutGarageInput | BookingUpdateWithWhereUniqueWithoutGarageInput[]
    updateMany?: BookingUpdateManyWithWhereWithoutGarageInput | BookingUpdateManyWithWhereWithoutGarageInput[]
    deleteMany?: BookingScalarWhereInput | BookingScalarWhereInput[]
  }

  export type GarageCreateNestedOneWithoutServicesInput = {
    create?: XOR<GarageCreateWithoutServicesInput, GarageUncheckedCreateWithoutServicesInput>
    connectOrCreate?: GarageCreateOrConnectWithoutServicesInput
    connect?: GarageWhereUniqueInput
  }

  export type ServiceCreateNestedOneWithoutOfferedByGaragesInput = {
    create?: XOR<ServiceCreateWithoutOfferedByGaragesInput, ServiceUncheckedCreateWithoutOfferedByGaragesInput>
    connectOrCreate?: ServiceCreateOrConnectWithoutOfferedByGaragesInput
    connect?: ServiceWhereUniqueInput
  }

  export type BookingCreateNestedManyWithoutGarageServiceInput = {
    create?: XOR<BookingCreateWithoutGarageServiceInput, BookingUncheckedCreateWithoutGarageServiceInput> | BookingCreateWithoutGarageServiceInput[] | BookingUncheckedCreateWithoutGarageServiceInput[]
    connectOrCreate?: BookingCreateOrConnectWithoutGarageServiceInput | BookingCreateOrConnectWithoutGarageServiceInput[]
    createMany?: BookingCreateManyGarageServiceInputEnvelope
    connect?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
  }

  export type BookingUncheckedCreateNestedManyWithoutGarageServiceInput = {
    create?: XOR<BookingCreateWithoutGarageServiceInput, BookingUncheckedCreateWithoutGarageServiceInput> | BookingCreateWithoutGarageServiceInput[] | BookingUncheckedCreateWithoutGarageServiceInput[]
    connectOrCreate?: BookingCreateOrConnectWithoutGarageServiceInput | BookingCreateOrConnectWithoutGarageServiceInput[]
    createMany?: BookingCreateManyGarageServiceInputEnvelope
    connect?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type GarageUpdateOneRequiredWithoutServicesNestedInput = {
    create?: XOR<GarageCreateWithoutServicesInput, GarageUncheckedCreateWithoutServicesInput>
    connectOrCreate?: GarageCreateOrConnectWithoutServicesInput
    upsert?: GarageUpsertWithoutServicesInput
    connect?: GarageWhereUniqueInput
    update?: XOR<XOR<GarageUpdateToOneWithWhereWithoutServicesInput, GarageUpdateWithoutServicesInput>, GarageUncheckedUpdateWithoutServicesInput>
  }

  export type ServiceUpdateOneRequiredWithoutOfferedByGaragesNestedInput = {
    create?: XOR<ServiceCreateWithoutOfferedByGaragesInput, ServiceUncheckedCreateWithoutOfferedByGaragesInput>
    connectOrCreate?: ServiceCreateOrConnectWithoutOfferedByGaragesInput
    upsert?: ServiceUpsertWithoutOfferedByGaragesInput
    connect?: ServiceWhereUniqueInput
    update?: XOR<XOR<ServiceUpdateToOneWithWhereWithoutOfferedByGaragesInput, ServiceUpdateWithoutOfferedByGaragesInput>, ServiceUncheckedUpdateWithoutOfferedByGaragesInput>
  }

  export type BookingUpdateManyWithoutGarageServiceNestedInput = {
    create?: XOR<BookingCreateWithoutGarageServiceInput, BookingUncheckedCreateWithoutGarageServiceInput> | BookingCreateWithoutGarageServiceInput[] | BookingUncheckedCreateWithoutGarageServiceInput[]
    connectOrCreate?: BookingCreateOrConnectWithoutGarageServiceInput | BookingCreateOrConnectWithoutGarageServiceInput[]
    upsert?: BookingUpsertWithWhereUniqueWithoutGarageServiceInput | BookingUpsertWithWhereUniqueWithoutGarageServiceInput[]
    createMany?: BookingCreateManyGarageServiceInputEnvelope
    set?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    disconnect?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    delete?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    connect?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    update?: BookingUpdateWithWhereUniqueWithoutGarageServiceInput | BookingUpdateWithWhereUniqueWithoutGarageServiceInput[]
    updateMany?: BookingUpdateManyWithWhereWithoutGarageServiceInput | BookingUpdateManyWithWhereWithoutGarageServiceInput[]
    deleteMany?: BookingScalarWhereInput | BookingScalarWhereInput[]
  }

  export type BookingUncheckedUpdateManyWithoutGarageServiceNestedInput = {
    create?: XOR<BookingCreateWithoutGarageServiceInput, BookingUncheckedCreateWithoutGarageServiceInput> | BookingCreateWithoutGarageServiceInput[] | BookingUncheckedCreateWithoutGarageServiceInput[]
    connectOrCreate?: BookingCreateOrConnectWithoutGarageServiceInput | BookingCreateOrConnectWithoutGarageServiceInput[]
    upsert?: BookingUpsertWithWhereUniqueWithoutGarageServiceInput | BookingUpsertWithWhereUniqueWithoutGarageServiceInput[]
    createMany?: BookingCreateManyGarageServiceInputEnvelope
    set?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    disconnect?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    delete?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    connect?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    update?: BookingUpdateWithWhereUniqueWithoutGarageServiceInput | BookingUpdateWithWhereUniqueWithoutGarageServiceInput[]
    updateMany?: BookingUpdateManyWithWhereWithoutGarageServiceInput | BookingUpdateManyWithWhereWithoutGarageServiceInput[]
    deleteMany?: BookingScalarWhereInput | BookingScalarWhereInput[]
  }

  export type UserCreateNestedOneWithoutTowTruckInput = {
    create?: XOR<UserCreateWithoutTowTruckInput, UserUncheckedCreateWithoutTowTruckInput>
    connectOrCreate?: UserCreateOrConnectWithoutTowTruckInput
    connect?: UserWhereUniqueInput
  }

  export type TowTruckServiceCreateNestedManyWithoutTowTruckInput = {
    create?: XOR<TowTruckServiceCreateWithoutTowTruckInput, TowTruckServiceUncheckedCreateWithoutTowTruckInput> | TowTruckServiceCreateWithoutTowTruckInput[] | TowTruckServiceUncheckedCreateWithoutTowTruckInput[]
    connectOrCreate?: TowTruckServiceCreateOrConnectWithoutTowTruckInput | TowTruckServiceCreateOrConnectWithoutTowTruckInput[]
    createMany?: TowTruckServiceCreateManyTowTruckInputEnvelope
    connect?: TowTruckServiceWhereUniqueInput | TowTruckServiceWhereUniqueInput[]
  }

  export type BookingCreateNestedManyWithoutTowTruckInput = {
    create?: XOR<BookingCreateWithoutTowTruckInput, BookingUncheckedCreateWithoutTowTruckInput> | BookingCreateWithoutTowTruckInput[] | BookingUncheckedCreateWithoutTowTruckInput[]
    connectOrCreate?: BookingCreateOrConnectWithoutTowTruckInput | BookingCreateOrConnectWithoutTowTruckInput[]
    createMany?: BookingCreateManyTowTruckInputEnvelope
    connect?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
  }

  export type LiveTruckLocationCreateNestedOneWithoutTowTruckInput = {
    create?: XOR<LiveTruckLocationCreateWithoutTowTruckInput, LiveTruckLocationUncheckedCreateWithoutTowTruckInput>
    connectOrCreate?: LiveTruckLocationCreateOrConnectWithoutTowTruckInput
    connect?: LiveTruckLocationWhereUniqueInput
  }

  export type TowTruckServiceUncheckedCreateNestedManyWithoutTowTruckInput = {
    create?: XOR<TowTruckServiceCreateWithoutTowTruckInput, TowTruckServiceUncheckedCreateWithoutTowTruckInput> | TowTruckServiceCreateWithoutTowTruckInput[] | TowTruckServiceUncheckedCreateWithoutTowTruckInput[]
    connectOrCreate?: TowTruckServiceCreateOrConnectWithoutTowTruckInput | TowTruckServiceCreateOrConnectWithoutTowTruckInput[]
    createMany?: TowTruckServiceCreateManyTowTruckInputEnvelope
    connect?: TowTruckServiceWhereUniqueInput | TowTruckServiceWhereUniqueInput[]
  }

  export type BookingUncheckedCreateNestedManyWithoutTowTruckInput = {
    create?: XOR<BookingCreateWithoutTowTruckInput, BookingUncheckedCreateWithoutTowTruckInput> | BookingCreateWithoutTowTruckInput[] | BookingUncheckedCreateWithoutTowTruckInput[]
    connectOrCreate?: BookingCreateOrConnectWithoutTowTruckInput | BookingCreateOrConnectWithoutTowTruckInput[]
    createMany?: BookingCreateManyTowTruckInputEnvelope
    connect?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
  }

  export type LiveTruckLocationUncheckedCreateNestedOneWithoutTowTruckInput = {
    create?: XOR<LiveTruckLocationCreateWithoutTowTruckInput, LiveTruckLocationUncheckedCreateWithoutTowTruckInput>
    connectOrCreate?: LiveTruckLocationCreateOrConnectWithoutTowTruckInput
    connect?: LiveTruckLocationWhereUniqueInput
  }

  export type UserUpdateOneRequiredWithoutTowTruckNestedInput = {
    create?: XOR<UserCreateWithoutTowTruckInput, UserUncheckedCreateWithoutTowTruckInput>
    connectOrCreate?: UserCreateOrConnectWithoutTowTruckInput
    upsert?: UserUpsertWithoutTowTruckInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutTowTruckInput, UserUpdateWithoutTowTruckInput>, UserUncheckedUpdateWithoutTowTruckInput>
  }

  export type TowTruckServiceUpdateManyWithoutTowTruckNestedInput = {
    create?: XOR<TowTruckServiceCreateWithoutTowTruckInput, TowTruckServiceUncheckedCreateWithoutTowTruckInput> | TowTruckServiceCreateWithoutTowTruckInput[] | TowTruckServiceUncheckedCreateWithoutTowTruckInput[]
    connectOrCreate?: TowTruckServiceCreateOrConnectWithoutTowTruckInput | TowTruckServiceCreateOrConnectWithoutTowTruckInput[]
    upsert?: TowTruckServiceUpsertWithWhereUniqueWithoutTowTruckInput | TowTruckServiceUpsertWithWhereUniqueWithoutTowTruckInput[]
    createMany?: TowTruckServiceCreateManyTowTruckInputEnvelope
    set?: TowTruckServiceWhereUniqueInput | TowTruckServiceWhereUniqueInput[]
    disconnect?: TowTruckServiceWhereUniqueInput | TowTruckServiceWhereUniqueInput[]
    delete?: TowTruckServiceWhereUniqueInput | TowTruckServiceWhereUniqueInput[]
    connect?: TowTruckServiceWhereUniqueInput | TowTruckServiceWhereUniqueInput[]
    update?: TowTruckServiceUpdateWithWhereUniqueWithoutTowTruckInput | TowTruckServiceUpdateWithWhereUniqueWithoutTowTruckInput[]
    updateMany?: TowTruckServiceUpdateManyWithWhereWithoutTowTruckInput | TowTruckServiceUpdateManyWithWhereWithoutTowTruckInput[]
    deleteMany?: TowTruckServiceScalarWhereInput | TowTruckServiceScalarWhereInput[]
  }

  export type BookingUpdateManyWithoutTowTruckNestedInput = {
    create?: XOR<BookingCreateWithoutTowTruckInput, BookingUncheckedCreateWithoutTowTruckInput> | BookingCreateWithoutTowTruckInput[] | BookingUncheckedCreateWithoutTowTruckInput[]
    connectOrCreate?: BookingCreateOrConnectWithoutTowTruckInput | BookingCreateOrConnectWithoutTowTruckInput[]
    upsert?: BookingUpsertWithWhereUniqueWithoutTowTruckInput | BookingUpsertWithWhereUniqueWithoutTowTruckInput[]
    createMany?: BookingCreateManyTowTruckInputEnvelope
    set?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    disconnect?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    delete?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    connect?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    update?: BookingUpdateWithWhereUniqueWithoutTowTruckInput | BookingUpdateWithWhereUniqueWithoutTowTruckInput[]
    updateMany?: BookingUpdateManyWithWhereWithoutTowTruckInput | BookingUpdateManyWithWhereWithoutTowTruckInput[]
    deleteMany?: BookingScalarWhereInput | BookingScalarWhereInput[]
  }

  export type LiveTruckLocationUpdateOneWithoutTowTruckNestedInput = {
    create?: XOR<LiveTruckLocationCreateWithoutTowTruckInput, LiveTruckLocationUncheckedCreateWithoutTowTruckInput>
    connectOrCreate?: LiveTruckLocationCreateOrConnectWithoutTowTruckInput
    upsert?: LiveTruckLocationUpsertWithoutTowTruckInput
    disconnect?: LiveTruckLocationWhereInput | boolean
    delete?: LiveTruckLocationWhereInput | boolean
    connect?: LiveTruckLocationWhereUniqueInput
    update?: XOR<XOR<LiveTruckLocationUpdateToOneWithWhereWithoutTowTruckInput, LiveTruckLocationUpdateWithoutTowTruckInput>, LiveTruckLocationUncheckedUpdateWithoutTowTruckInput>
  }

  export type TowTruckServiceUncheckedUpdateManyWithoutTowTruckNestedInput = {
    create?: XOR<TowTruckServiceCreateWithoutTowTruckInput, TowTruckServiceUncheckedCreateWithoutTowTruckInput> | TowTruckServiceCreateWithoutTowTruckInput[] | TowTruckServiceUncheckedCreateWithoutTowTruckInput[]
    connectOrCreate?: TowTruckServiceCreateOrConnectWithoutTowTruckInput | TowTruckServiceCreateOrConnectWithoutTowTruckInput[]
    upsert?: TowTruckServiceUpsertWithWhereUniqueWithoutTowTruckInput | TowTruckServiceUpsertWithWhereUniqueWithoutTowTruckInput[]
    createMany?: TowTruckServiceCreateManyTowTruckInputEnvelope
    set?: TowTruckServiceWhereUniqueInput | TowTruckServiceWhereUniqueInput[]
    disconnect?: TowTruckServiceWhereUniqueInput | TowTruckServiceWhereUniqueInput[]
    delete?: TowTruckServiceWhereUniqueInput | TowTruckServiceWhereUniqueInput[]
    connect?: TowTruckServiceWhereUniqueInput | TowTruckServiceWhereUniqueInput[]
    update?: TowTruckServiceUpdateWithWhereUniqueWithoutTowTruckInput | TowTruckServiceUpdateWithWhereUniqueWithoutTowTruckInput[]
    updateMany?: TowTruckServiceUpdateManyWithWhereWithoutTowTruckInput | TowTruckServiceUpdateManyWithWhereWithoutTowTruckInput[]
    deleteMany?: TowTruckServiceScalarWhereInput | TowTruckServiceScalarWhereInput[]
  }

  export type BookingUncheckedUpdateManyWithoutTowTruckNestedInput = {
    create?: XOR<BookingCreateWithoutTowTruckInput, BookingUncheckedCreateWithoutTowTruckInput> | BookingCreateWithoutTowTruckInput[] | BookingUncheckedCreateWithoutTowTruckInput[]
    connectOrCreate?: BookingCreateOrConnectWithoutTowTruckInput | BookingCreateOrConnectWithoutTowTruckInput[]
    upsert?: BookingUpsertWithWhereUniqueWithoutTowTruckInput | BookingUpsertWithWhereUniqueWithoutTowTruckInput[]
    createMany?: BookingCreateManyTowTruckInputEnvelope
    set?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    disconnect?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    delete?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    connect?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    update?: BookingUpdateWithWhereUniqueWithoutTowTruckInput | BookingUpdateWithWhereUniqueWithoutTowTruckInput[]
    updateMany?: BookingUpdateManyWithWhereWithoutTowTruckInput | BookingUpdateManyWithWhereWithoutTowTruckInput[]
    deleteMany?: BookingScalarWhereInput | BookingScalarWhereInput[]
  }

  export type LiveTruckLocationUncheckedUpdateOneWithoutTowTruckNestedInput = {
    create?: XOR<LiveTruckLocationCreateWithoutTowTruckInput, LiveTruckLocationUncheckedCreateWithoutTowTruckInput>
    connectOrCreate?: LiveTruckLocationCreateOrConnectWithoutTowTruckInput
    upsert?: LiveTruckLocationUpsertWithoutTowTruckInput
    disconnect?: LiveTruckLocationWhereInput | boolean
    delete?: LiveTruckLocationWhereInput | boolean
    connect?: LiveTruckLocationWhereUniqueInput
    update?: XOR<XOR<LiveTruckLocationUpdateToOneWithWhereWithoutTowTruckInput, LiveTruckLocationUpdateWithoutTowTruckInput>, LiveTruckLocationUncheckedUpdateWithoutTowTruckInput>
  }

  export type TowTruckCreateNestedOneWithoutServicesInput = {
    create?: XOR<TowTruckCreateWithoutServicesInput, TowTruckUncheckedCreateWithoutServicesInput>
    connectOrCreate?: TowTruckCreateOrConnectWithoutServicesInput
    connect?: TowTruckWhereUniqueInput
  }

  export type BookingCreateNestedManyWithoutTowTruckServiceInput = {
    create?: XOR<BookingCreateWithoutTowTruckServiceInput, BookingUncheckedCreateWithoutTowTruckServiceInput> | BookingCreateWithoutTowTruckServiceInput[] | BookingUncheckedCreateWithoutTowTruckServiceInput[]
    connectOrCreate?: BookingCreateOrConnectWithoutTowTruckServiceInput | BookingCreateOrConnectWithoutTowTruckServiceInput[]
    createMany?: BookingCreateManyTowTruckServiceInputEnvelope
    connect?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
  }

  export type BookingUncheckedCreateNestedManyWithoutTowTruckServiceInput = {
    create?: XOR<BookingCreateWithoutTowTruckServiceInput, BookingUncheckedCreateWithoutTowTruckServiceInput> | BookingCreateWithoutTowTruckServiceInput[] | BookingUncheckedCreateWithoutTowTruckServiceInput[]
    connectOrCreate?: BookingCreateOrConnectWithoutTowTruckServiceInput | BookingCreateOrConnectWithoutTowTruckServiceInput[]
    createMany?: BookingCreateManyTowTruckServiceInputEnvelope
    connect?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
  }

  export type TowTruckUpdateOneRequiredWithoutServicesNestedInput = {
    create?: XOR<TowTruckCreateWithoutServicesInput, TowTruckUncheckedCreateWithoutServicesInput>
    connectOrCreate?: TowTruckCreateOrConnectWithoutServicesInput
    upsert?: TowTruckUpsertWithoutServicesInput
    connect?: TowTruckWhereUniqueInput
    update?: XOR<XOR<TowTruckUpdateToOneWithWhereWithoutServicesInput, TowTruckUpdateWithoutServicesInput>, TowTruckUncheckedUpdateWithoutServicesInput>
  }

  export type BookingUpdateManyWithoutTowTruckServiceNestedInput = {
    create?: XOR<BookingCreateWithoutTowTruckServiceInput, BookingUncheckedCreateWithoutTowTruckServiceInput> | BookingCreateWithoutTowTruckServiceInput[] | BookingUncheckedCreateWithoutTowTruckServiceInput[]
    connectOrCreate?: BookingCreateOrConnectWithoutTowTruckServiceInput | BookingCreateOrConnectWithoutTowTruckServiceInput[]
    upsert?: BookingUpsertWithWhereUniqueWithoutTowTruckServiceInput | BookingUpsertWithWhereUniqueWithoutTowTruckServiceInput[]
    createMany?: BookingCreateManyTowTruckServiceInputEnvelope
    set?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    disconnect?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    delete?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    connect?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    update?: BookingUpdateWithWhereUniqueWithoutTowTruckServiceInput | BookingUpdateWithWhereUniqueWithoutTowTruckServiceInput[]
    updateMany?: BookingUpdateManyWithWhereWithoutTowTruckServiceInput | BookingUpdateManyWithWhereWithoutTowTruckServiceInput[]
    deleteMany?: BookingScalarWhereInput | BookingScalarWhereInput[]
  }

  export type BookingUncheckedUpdateManyWithoutTowTruckServiceNestedInput = {
    create?: XOR<BookingCreateWithoutTowTruckServiceInput, BookingUncheckedCreateWithoutTowTruckServiceInput> | BookingCreateWithoutTowTruckServiceInput[] | BookingUncheckedCreateWithoutTowTruckServiceInput[]
    connectOrCreate?: BookingCreateOrConnectWithoutTowTruckServiceInput | BookingCreateOrConnectWithoutTowTruckServiceInput[]
    upsert?: BookingUpsertWithWhereUniqueWithoutTowTruckServiceInput | BookingUpsertWithWhereUniqueWithoutTowTruckServiceInput[]
    createMany?: BookingCreateManyTowTruckServiceInputEnvelope
    set?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    disconnect?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    delete?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    connect?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    update?: BookingUpdateWithWhereUniqueWithoutTowTruckServiceInput | BookingUpdateWithWhereUniqueWithoutTowTruckServiceInput[]
    updateMany?: BookingUpdateManyWithWhereWithoutTowTruckServiceInput | BookingUpdateManyWithWhereWithoutTowTruckServiceInput[]
    deleteMany?: BookingScalarWhereInput | BookingScalarWhereInput[]
  }

  export type TowTruckCreateNestedOneWithoutLiveLocationInput = {
    create?: XOR<TowTruckCreateWithoutLiveLocationInput, TowTruckUncheckedCreateWithoutLiveLocationInput>
    connectOrCreate?: TowTruckCreateOrConnectWithoutLiveLocationInput
    connect?: TowTruckWhereUniqueInput
  }

  export type TowTruckUpdateOneRequiredWithoutLiveLocationNestedInput = {
    create?: XOR<TowTruckCreateWithoutLiveLocationInput, TowTruckUncheckedCreateWithoutLiveLocationInput>
    connectOrCreate?: TowTruckCreateOrConnectWithoutLiveLocationInput
    upsert?: TowTruckUpsertWithoutLiveLocationInput
    connect?: TowTruckWhereUniqueInput
    update?: XOR<XOR<TowTruckUpdateToOneWithWhereWithoutLiveLocationInput, TowTruckUpdateWithoutLiveLocationInput>, TowTruckUncheckedUpdateWithoutLiveLocationInput>
  }

  export type GarageCreateNestedOneWithoutSparePartsInput = {
    create?: XOR<GarageCreateWithoutSparePartsInput, GarageUncheckedCreateWithoutSparePartsInput>
    connectOrCreate?: GarageCreateOrConnectWithoutSparePartsInput
    connect?: GarageWhereUniqueInput
  }

  export type GarageUpdateOneRequiredWithoutSparePartsNestedInput = {
    create?: XOR<GarageCreateWithoutSparePartsInput, GarageUncheckedCreateWithoutSparePartsInput>
    connectOrCreate?: GarageCreateOrConnectWithoutSparePartsInput
    upsert?: GarageUpsertWithoutSparePartsInput
    connect?: GarageWhereUniqueInput
    update?: XOR<XOR<GarageUpdateToOneWithWhereWithoutSparePartsInput, GarageUpdateWithoutSparePartsInput>, GarageUncheckedUpdateWithoutSparePartsInput>
  }

  export type BookingCreateeligibleProviderIdsInput = {
    set: string[]
  }

  export type UserCreateNestedOneWithoutBookingsInput = {
    create?: XOR<UserCreateWithoutBookingsInput, UserUncheckedCreateWithoutBookingsInput>
    connectOrCreate?: UserCreateOrConnectWithoutBookingsInput
    connect?: UserWhereUniqueInput
  }

  export type VehicleCreateNestedOneWithoutBookingsInput = {
    create?: XOR<VehicleCreateWithoutBookingsInput, VehicleUncheckedCreateWithoutBookingsInput>
    connectOrCreate?: VehicleCreateOrConnectWithoutBookingsInput
    connect?: VehicleWhereUniqueInput
  }

  export type ServiceCreateNestedOneWithoutBookingsInput = {
    create?: XOR<ServiceCreateWithoutBookingsInput, ServiceUncheckedCreateWithoutBookingsInput>
    connectOrCreate?: ServiceCreateOrConnectWithoutBookingsInput
    connect?: ServiceWhereUniqueInput
  }

  export type GarageCreateNestedOneWithoutBookingsInput = {
    create?: XOR<GarageCreateWithoutBookingsInput, GarageUncheckedCreateWithoutBookingsInput>
    connectOrCreate?: GarageCreateOrConnectWithoutBookingsInput
    connect?: GarageWhereUniqueInput
  }

  export type GarageServiceCreateNestedOneWithoutBookingsInput = {
    create?: XOR<GarageServiceCreateWithoutBookingsInput, GarageServiceUncheckedCreateWithoutBookingsInput>
    connectOrCreate?: GarageServiceCreateOrConnectWithoutBookingsInput
    connect?: GarageServiceWhereUniqueInput
  }

  export type TowTruckCreateNestedOneWithoutBookingsInput = {
    create?: XOR<TowTruckCreateWithoutBookingsInput, TowTruckUncheckedCreateWithoutBookingsInput>
    connectOrCreate?: TowTruckCreateOrConnectWithoutBookingsInput
    connect?: TowTruckWhereUniqueInput
  }

  export type TowTruckServiceCreateNestedOneWithoutBookingsInput = {
    create?: XOR<TowTruckServiceCreateWithoutBookingsInput, TowTruckServiceUncheckedCreateWithoutBookingsInput>
    connectOrCreate?: TowTruckServiceCreateOrConnectWithoutBookingsInput
    connect?: TowTruckServiceWhereUniqueInput
  }

  export type PromoCodeCreateNestedOneWithoutBookingsInput = {
    create?: XOR<PromoCodeCreateWithoutBookingsInput, PromoCodeUncheckedCreateWithoutBookingsInput>
    connectOrCreate?: PromoCodeCreateOrConnectWithoutBookingsInput
    connect?: PromoCodeWhereUniqueInput
  }

  export type EnumBookingStatusFieldUpdateOperationsInput = {
    set?: $Enums.BookingStatus
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
    unset?: boolean
  }

  export type BookingUpdateeligibleProviderIdsInput = {
    set?: string[]
    push?: string | string[]
  }

  export type UserUpdateOneRequiredWithoutBookingsNestedInput = {
    create?: XOR<UserCreateWithoutBookingsInput, UserUncheckedCreateWithoutBookingsInput>
    connectOrCreate?: UserCreateOrConnectWithoutBookingsInput
    upsert?: UserUpsertWithoutBookingsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutBookingsInput, UserUpdateWithoutBookingsInput>, UserUncheckedUpdateWithoutBookingsInput>
  }

  export type VehicleUpdateOneRequiredWithoutBookingsNestedInput = {
    create?: XOR<VehicleCreateWithoutBookingsInput, VehicleUncheckedCreateWithoutBookingsInput>
    connectOrCreate?: VehicleCreateOrConnectWithoutBookingsInput
    upsert?: VehicleUpsertWithoutBookingsInput
    connect?: VehicleWhereUniqueInput
    update?: XOR<XOR<VehicleUpdateToOneWithWhereWithoutBookingsInput, VehicleUpdateWithoutBookingsInput>, VehicleUncheckedUpdateWithoutBookingsInput>
  }

  export type ServiceUpdateOneWithoutBookingsNestedInput = {
    create?: XOR<ServiceCreateWithoutBookingsInput, ServiceUncheckedCreateWithoutBookingsInput>
    connectOrCreate?: ServiceCreateOrConnectWithoutBookingsInput
    upsert?: ServiceUpsertWithoutBookingsInput
    disconnect?: boolean
    delete?: ServiceWhereInput | boolean
    connect?: ServiceWhereUniqueInput
    update?: XOR<XOR<ServiceUpdateToOneWithWhereWithoutBookingsInput, ServiceUpdateWithoutBookingsInput>, ServiceUncheckedUpdateWithoutBookingsInput>
  }

  export type GarageUpdateOneWithoutBookingsNestedInput = {
    create?: XOR<GarageCreateWithoutBookingsInput, GarageUncheckedCreateWithoutBookingsInput>
    connectOrCreate?: GarageCreateOrConnectWithoutBookingsInput
    upsert?: GarageUpsertWithoutBookingsInput
    disconnect?: boolean
    delete?: GarageWhereInput | boolean
    connect?: GarageWhereUniqueInput
    update?: XOR<XOR<GarageUpdateToOneWithWhereWithoutBookingsInput, GarageUpdateWithoutBookingsInput>, GarageUncheckedUpdateWithoutBookingsInput>
  }

  export type GarageServiceUpdateOneWithoutBookingsNestedInput = {
    create?: XOR<GarageServiceCreateWithoutBookingsInput, GarageServiceUncheckedCreateWithoutBookingsInput>
    connectOrCreate?: GarageServiceCreateOrConnectWithoutBookingsInput
    upsert?: GarageServiceUpsertWithoutBookingsInput
    disconnect?: boolean
    delete?: GarageServiceWhereInput | boolean
    connect?: GarageServiceWhereUniqueInput
    update?: XOR<XOR<GarageServiceUpdateToOneWithWhereWithoutBookingsInput, GarageServiceUpdateWithoutBookingsInput>, GarageServiceUncheckedUpdateWithoutBookingsInput>
  }

  export type TowTruckUpdateOneWithoutBookingsNestedInput = {
    create?: XOR<TowTruckCreateWithoutBookingsInput, TowTruckUncheckedCreateWithoutBookingsInput>
    connectOrCreate?: TowTruckCreateOrConnectWithoutBookingsInput
    upsert?: TowTruckUpsertWithoutBookingsInput
    disconnect?: boolean
    delete?: TowTruckWhereInput | boolean
    connect?: TowTruckWhereUniqueInput
    update?: XOR<XOR<TowTruckUpdateToOneWithWhereWithoutBookingsInput, TowTruckUpdateWithoutBookingsInput>, TowTruckUncheckedUpdateWithoutBookingsInput>
  }

  export type TowTruckServiceUpdateOneWithoutBookingsNestedInput = {
    create?: XOR<TowTruckServiceCreateWithoutBookingsInput, TowTruckServiceUncheckedCreateWithoutBookingsInput>
    connectOrCreate?: TowTruckServiceCreateOrConnectWithoutBookingsInput
    upsert?: TowTruckServiceUpsertWithoutBookingsInput
    disconnect?: boolean
    delete?: TowTruckServiceWhereInput | boolean
    connect?: TowTruckServiceWhereUniqueInput
    update?: XOR<XOR<TowTruckServiceUpdateToOneWithWhereWithoutBookingsInput, TowTruckServiceUpdateWithoutBookingsInput>, TowTruckServiceUncheckedUpdateWithoutBookingsInput>
  }

  export type PromoCodeUpdateOneWithoutBookingsNestedInput = {
    create?: XOR<PromoCodeCreateWithoutBookingsInput, PromoCodeUncheckedCreateWithoutBookingsInput>
    connectOrCreate?: PromoCodeCreateOrConnectWithoutBookingsInput
    upsert?: PromoCodeUpsertWithoutBookingsInput
    disconnect?: boolean
    delete?: PromoCodeWhereInput | boolean
    connect?: PromoCodeWhereUniqueInput
    update?: XOR<XOR<PromoCodeUpdateToOneWithWhereWithoutBookingsInput, PromoCodeUpdateWithoutBookingsInput>, PromoCodeUncheckedUpdateWithoutBookingsInput>
  }

  export type BookingCreateNestedManyWithoutPromoCodeInput = {
    create?: XOR<BookingCreateWithoutPromoCodeInput, BookingUncheckedCreateWithoutPromoCodeInput> | BookingCreateWithoutPromoCodeInput[] | BookingUncheckedCreateWithoutPromoCodeInput[]
    connectOrCreate?: BookingCreateOrConnectWithoutPromoCodeInput | BookingCreateOrConnectWithoutPromoCodeInput[]
    createMany?: BookingCreateManyPromoCodeInputEnvelope
    connect?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
  }

  export type BookingUncheckedCreateNestedManyWithoutPromoCodeInput = {
    create?: XOR<BookingCreateWithoutPromoCodeInput, BookingUncheckedCreateWithoutPromoCodeInput> | BookingCreateWithoutPromoCodeInput[] | BookingUncheckedCreateWithoutPromoCodeInput[]
    connectOrCreate?: BookingCreateOrConnectWithoutPromoCodeInput | BookingCreateOrConnectWithoutPromoCodeInput[]
    createMany?: BookingCreateManyPromoCodeInputEnvelope
    connect?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
  }

  export type EnumDiscountTypeFieldUpdateOperationsInput = {
    set?: $Enums.DiscountType
  }

  export type BookingUpdateManyWithoutPromoCodeNestedInput = {
    create?: XOR<BookingCreateWithoutPromoCodeInput, BookingUncheckedCreateWithoutPromoCodeInput> | BookingCreateWithoutPromoCodeInput[] | BookingUncheckedCreateWithoutPromoCodeInput[]
    connectOrCreate?: BookingCreateOrConnectWithoutPromoCodeInput | BookingCreateOrConnectWithoutPromoCodeInput[]
    upsert?: BookingUpsertWithWhereUniqueWithoutPromoCodeInput | BookingUpsertWithWhereUniqueWithoutPromoCodeInput[]
    createMany?: BookingCreateManyPromoCodeInputEnvelope
    set?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    disconnect?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    delete?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    connect?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    update?: BookingUpdateWithWhereUniqueWithoutPromoCodeInput | BookingUpdateWithWhereUniqueWithoutPromoCodeInput[]
    updateMany?: BookingUpdateManyWithWhereWithoutPromoCodeInput | BookingUpdateManyWithWhereWithoutPromoCodeInput[]
    deleteMany?: BookingScalarWhereInput | BookingScalarWhereInput[]
  }

  export type BookingUncheckedUpdateManyWithoutPromoCodeNestedInput = {
    create?: XOR<BookingCreateWithoutPromoCodeInput, BookingUncheckedCreateWithoutPromoCodeInput> | BookingCreateWithoutPromoCodeInput[] | BookingUncheckedCreateWithoutPromoCodeInput[]
    connectOrCreate?: BookingCreateOrConnectWithoutPromoCodeInput | BookingCreateOrConnectWithoutPromoCodeInput[]
    upsert?: BookingUpsertWithWhereUniqueWithoutPromoCodeInput | BookingUpsertWithWhereUniqueWithoutPromoCodeInput[]
    createMany?: BookingCreateManyPromoCodeInputEnvelope
    set?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    disconnect?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    delete?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    connect?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    update?: BookingUpdateWithWhereUniqueWithoutPromoCodeInput | BookingUpdateWithWhereUniqueWithoutPromoCodeInput[]
    updateMany?: BookingUpdateManyWithWhereWithoutPromoCodeInput | BookingUpdateManyWithWhereWithoutPromoCodeInput[]
    deleteMany?: BookingScalarWhereInput | BookingScalarWhereInput[]
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
    isSet?: boolean
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
    isSet?: boolean
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
    isSet?: boolean
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }
  export type NestedJsonNullableFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    isSet?: boolean
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedEnumVehicleTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.VehicleType | EnumVehicleTypeFieldRefInput<$PrismaModel>
    in?: $Enums.VehicleType[] | ListEnumVehicleTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.VehicleType[] | ListEnumVehicleTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumVehicleTypeFilter<$PrismaModel> | $Enums.VehicleType
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedEnumVehicleTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.VehicleType | EnumVehicleTypeFieldRefInput<$PrismaModel>
    in?: $Enums.VehicleType[] | ListEnumVehicleTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.VehicleType[] | ListEnumVehicleTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumVehicleTypeWithAggregatesFilter<$PrismaModel> | $Enums.VehicleType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumVehicleTypeFilter<$PrismaModel>
    _max?: NestedEnumVehicleTypeFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
    isSet?: boolean
  }

  export type NestedEnumVerificationStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.VerificationStatus | EnumVerificationStatusFieldRefInput<$PrismaModel>
    in?: $Enums.VerificationStatus[] | ListEnumVerificationStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.VerificationStatus[] | ListEnumVerificationStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumVerificationStatusFilter<$PrismaModel> | $Enums.VerificationStatus
  }

  export type NestedFloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
    isSet?: boolean
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
    isSet?: boolean
  }
  export type NestedJsonFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<NestedJsonFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
  }

  export type NestedEnumVerificationStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.VerificationStatus | EnumVerificationStatusFieldRefInput<$PrismaModel>
    in?: $Enums.VerificationStatus[] | ListEnumVerificationStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.VerificationStatus[] | ListEnumVerificationStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumVerificationStatusWithAggregatesFilter<$PrismaModel> | $Enums.VerificationStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumVerificationStatusFilter<$PrismaModel>
    _max?: NestedEnumVerificationStatusFilter<$PrismaModel>
  }

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type NestedEnumBookingStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.BookingStatus | EnumBookingStatusFieldRefInput<$PrismaModel>
    in?: $Enums.BookingStatus[] | ListEnumBookingStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.BookingStatus[] | ListEnumBookingStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumBookingStatusFilter<$PrismaModel> | $Enums.BookingStatus
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
    isSet?: boolean
  }

  export type NestedEnumBookingStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.BookingStatus | EnumBookingStatusFieldRefInput<$PrismaModel>
    in?: $Enums.BookingStatus[] | ListEnumBookingStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.BookingStatus[] | ListEnumBookingStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumBookingStatusWithAggregatesFilter<$PrismaModel> | $Enums.BookingStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumBookingStatusFilter<$PrismaModel>
    _max?: NestedEnumBookingStatusFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
    isSet?: boolean
  }

  export type NestedEnumDiscountTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.DiscountType | EnumDiscountTypeFieldRefInput<$PrismaModel>
    in?: $Enums.DiscountType[] | ListEnumDiscountTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.DiscountType[] | ListEnumDiscountTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumDiscountTypeFilter<$PrismaModel> | $Enums.DiscountType
  }

  export type NestedEnumDiscountTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.DiscountType | EnumDiscountTypeFieldRefInput<$PrismaModel>
    in?: $Enums.DiscountType[] | ListEnumDiscountTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.DiscountType[] | ListEnumDiscountTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumDiscountTypeWithAggregatesFilter<$PrismaModel> | $Enums.DiscountType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumDiscountTypeFilter<$PrismaModel>
    _max?: NestedEnumDiscountTypeFilter<$PrismaModel>
  }

  export type VehicleCreateWithoutUserInput = {
    id?: string
    brand: string
    name: string
    model: string
    year: number
    plateNumber: string
    color?: string | null
    type: $Enums.VehicleType
    createdAt?: Date | string
    updatedAt?: Date | string
    bookings?: BookingCreateNestedManyWithoutVehicleInput
  }

  export type VehicleUncheckedCreateWithoutUserInput = {
    id?: string
    brand: string
    name: string
    model: string
    year: number
    plateNumber: string
    color?: string | null
    type: $Enums.VehicleType
    createdAt?: Date | string
    updatedAt?: Date | string
    bookings?: BookingUncheckedCreateNestedManyWithoutVehicleInput
  }

  export type VehicleCreateOrConnectWithoutUserInput = {
    where: VehicleWhereUniqueInput
    create: XOR<VehicleCreateWithoutUserInput, VehicleUncheckedCreateWithoutUserInput>
  }

  export type VehicleCreateManyUserInputEnvelope = {
    data: VehicleCreateManyUserInput | VehicleCreateManyUserInput[]
  }

  export type GarageCreateWithoutOwnerInput = {
    id?: string
    name: string
    licenseNumber: string
    address: string
    ownerName: string
    contactEmail?: string | null
    contactPhone?: string | null
    numberOfEmployees: number
    rating?: number | null
    reviewCount?: number | null
    isOpen?: boolean
    operatingHours?: InputJsonValue | null
    stripeAccountId?: string | null
    location: InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    status?: $Enums.VerificationStatus
    rejectionReason?: string | null
    services?: GarageServiceCreateNestedManyWithoutGarageInput
    spareParts?: SparePartCreateNestedManyWithoutGarageInput
    bookings?: BookingCreateNestedManyWithoutGarageInput
  }

  export type GarageUncheckedCreateWithoutOwnerInput = {
    id?: string
    name: string
    licenseNumber: string
    address: string
    ownerName: string
    contactEmail?: string | null
    contactPhone?: string | null
    numberOfEmployees: number
    rating?: number | null
    reviewCount?: number | null
    isOpen?: boolean
    operatingHours?: InputJsonValue | null
    stripeAccountId?: string | null
    location: InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    status?: $Enums.VerificationStatus
    rejectionReason?: string | null
    services?: GarageServiceUncheckedCreateNestedManyWithoutGarageInput
    spareParts?: SparePartUncheckedCreateNestedManyWithoutGarageInput
    bookings?: BookingUncheckedCreateNestedManyWithoutGarageInput
  }

  export type GarageCreateOrConnectWithoutOwnerInput = {
    where: GarageWhereUniqueInput
    create: XOR<GarageCreateWithoutOwnerInput, GarageUncheckedCreateWithoutOwnerInput>
  }

  export type TowTruckCreateWithoutOwnerInput = {
    id?: string
    name: string
    driverName: string
    model: string
    make: string
    year: number
    plateNumber: string
    licenseNumber: string
    status?: $Enums.VerificationStatus
    rejectionReason?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    stripeAccountId?: string | null
    services?: TowTruckServiceCreateNestedManyWithoutTowTruckInput
    bookings?: BookingCreateNestedManyWithoutTowTruckInput
    liveLocation?: LiveTruckLocationCreateNestedOneWithoutTowTruckInput
  }

  export type TowTruckUncheckedCreateWithoutOwnerInput = {
    id?: string
    name: string
    driverName: string
    model: string
    make: string
    year: number
    plateNumber: string
    licenseNumber: string
    status?: $Enums.VerificationStatus
    rejectionReason?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    stripeAccountId?: string | null
    services?: TowTruckServiceUncheckedCreateNestedManyWithoutTowTruckInput
    bookings?: BookingUncheckedCreateNestedManyWithoutTowTruckInput
    liveLocation?: LiveTruckLocationUncheckedCreateNestedOneWithoutTowTruckInput
  }

  export type TowTruckCreateOrConnectWithoutOwnerInput = {
    where: TowTruckWhereUniqueInput
    create: XOR<TowTruckCreateWithoutOwnerInput, TowTruckUncheckedCreateWithoutOwnerInput>
  }

  export type BookingCreateWithoutUserInput = {
    id?: string
    status?: $Enums.BookingStatus
    bookedAt?: Date | string
    expiresAt?: Date | string | null
    paymentExpiresAt?: Date | string | null
    notes?: string | null
    otp?: string | null
    otpExpiresAt?: Date | string | null
    pickupLocation?: InputJsonValue | null
    destinationLocation?: InputJsonValue | null
    serviceStartedAt?: Date | string | null
    serviceEndedAt?: Date | string | null
    basePrice: number
    additionalFees?: number | null
    discountAmount?: number | null
    finalAmount: number
    paymentStatus?: string
    paymentIntentId?: string | null
    userRating?: number | null
    userReview?: string | null
    providerRating?: number | null
    providerReview?: string | null
    eligibleProviderIds?: BookingCreateeligibleProviderIdsInput | string[]
    vehicle: VehicleCreateNestedOneWithoutBookingsInput
    service?: ServiceCreateNestedOneWithoutBookingsInput
    garage?: GarageCreateNestedOneWithoutBookingsInput
    garageService?: GarageServiceCreateNestedOneWithoutBookingsInput
    towTruck?: TowTruckCreateNestedOneWithoutBookingsInput
    towTruckService?: TowTruckServiceCreateNestedOneWithoutBookingsInput
    promoCode?: PromoCodeCreateNestedOneWithoutBookingsInput
  }

  export type BookingUncheckedCreateWithoutUserInput = {
    id?: string
    status?: $Enums.BookingStatus
    bookedAt?: Date | string
    expiresAt?: Date | string | null
    paymentExpiresAt?: Date | string | null
    notes?: string | null
    otp?: string | null
    otpExpiresAt?: Date | string | null
    pickupLocation?: InputJsonValue | null
    destinationLocation?: InputJsonValue | null
    serviceStartedAt?: Date | string | null
    serviceEndedAt?: Date | string | null
    basePrice: number
    additionalFees?: number | null
    discountAmount?: number | null
    finalAmount: number
    paymentStatus?: string
    paymentIntentId?: string | null
    userRating?: number | null
    userReview?: string | null
    providerRating?: number | null
    providerReview?: string | null
    vehicleId: string
    eligibleProviderIds?: BookingCreateeligibleProviderIdsInput | string[]
    serviceId?: string | null
    garageId?: string | null
    garageServiceId?: string | null
    towTruckId?: string | null
    towTruckServiceId?: string | null
    promoCodeId?: string | null
  }

  export type BookingCreateOrConnectWithoutUserInput = {
    where: BookingWhereUniqueInput
    create: XOR<BookingCreateWithoutUserInput, BookingUncheckedCreateWithoutUserInput>
  }

  export type BookingCreateManyUserInputEnvelope = {
    data: BookingCreateManyUserInput | BookingCreateManyUserInput[]
  }

  export type VehicleUpsertWithWhereUniqueWithoutUserInput = {
    where: VehicleWhereUniqueInput
    update: XOR<VehicleUpdateWithoutUserInput, VehicleUncheckedUpdateWithoutUserInput>
    create: XOR<VehicleCreateWithoutUserInput, VehicleUncheckedCreateWithoutUserInput>
  }

  export type VehicleUpdateWithWhereUniqueWithoutUserInput = {
    where: VehicleWhereUniqueInput
    data: XOR<VehicleUpdateWithoutUserInput, VehicleUncheckedUpdateWithoutUserInput>
  }

  export type VehicleUpdateManyWithWhereWithoutUserInput = {
    where: VehicleScalarWhereInput
    data: XOR<VehicleUpdateManyMutationInput, VehicleUncheckedUpdateManyWithoutUserInput>
  }

  export type VehicleScalarWhereInput = {
    AND?: VehicleScalarWhereInput | VehicleScalarWhereInput[]
    OR?: VehicleScalarWhereInput[]
    NOT?: VehicleScalarWhereInput | VehicleScalarWhereInput[]
    id?: StringFilter<"Vehicle"> | string
    brand?: StringFilter<"Vehicle"> | string
    name?: StringFilter<"Vehicle"> | string
    model?: StringFilter<"Vehicle"> | string
    year?: IntFilter<"Vehicle"> | number
    plateNumber?: StringFilter<"Vehicle"> | string
    color?: StringNullableFilter<"Vehicle"> | string | null
    type?: EnumVehicleTypeFilter<"Vehicle"> | $Enums.VehicleType
    createdAt?: DateTimeFilter<"Vehicle"> | Date | string
    updatedAt?: DateTimeFilter<"Vehicle"> | Date | string
    userId?: StringFilter<"Vehicle"> | string
  }

  export type GarageUpsertWithoutOwnerInput = {
    update: XOR<GarageUpdateWithoutOwnerInput, GarageUncheckedUpdateWithoutOwnerInput>
    create: XOR<GarageCreateWithoutOwnerInput, GarageUncheckedCreateWithoutOwnerInput>
    where?: GarageWhereInput
  }

  export type GarageUpdateToOneWithWhereWithoutOwnerInput = {
    where?: GarageWhereInput
    data: XOR<GarageUpdateWithoutOwnerInput, GarageUncheckedUpdateWithoutOwnerInput>
  }

  export type GarageUpdateWithoutOwnerInput = {
    name?: StringFieldUpdateOperationsInput | string
    licenseNumber?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    ownerName?: StringFieldUpdateOperationsInput | string
    contactEmail?: NullableStringFieldUpdateOperationsInput | string | null
    contactPhone?: NullableStringFieldUpdateOperationsInput | string | null
    numberOfEmployees?: IntFieldUpdateOperationsInput | number
    rating?: NullableFloatFieldUpdateOperationsInput | number | null
    reviewCount?: NullableIntFieldUpdateOperationsInput | number | null
    isOpen?: BoolFieldUpdateOperationsInput | boolean
    operatingHours?: InputJsonValue | InputJsonValue | null
    stripeAccountId?: NullableStringFieldUpdateOperationsInput | string | null
    location?: InputJsonValue | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumVerificationStatusFieldUpdateOperationsInput | $Enums.VerificationStatus
    rejectionReason?: NullableStringFieldUpdateOperationsInput | string | null
    services?: GarageServiceUpdateManyWithoutGarageNestedInput
    spareParts?: SparePartUpdateManyWithoutGarageNestedInput
    bookings?: BookingUpdateManyWithoutGarageNestedInput
  }

  export type GarageUncheckedUpdateWithoutOwnerInput = {
    name?: StringFieldUpdateOperationsInput | string
    licenseNumber?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    ownerName?: StringFieldUpdateOperationsInput | string
    contactEmail?: NullableStringFieldUpdateOperationsInput | string | null
    contactPhone?: NullableStringFieldUpdateOperationsInput | string | null
    numberOfEmployees?: IntFieldUpdateOperationsInput | number
    rating?: NullableFloatFieldUpdateOperationsInput | number | null
    reviewCount?: NullableIntFieldUpdateOperationsInput | number | null
    isOpen?: BoolFieldUpdateOperationsInput | boolean
    operatingHours?: InputJsonValue | InputJsonValue | null
    stripeAccountId?: NullableStringFieldUpdateOperationsInput | string | null
    location?: InputJsonValue | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumVerificationStatusFieldUpdateOperationsInput | $Enums.VerificationStatus
    rejectionReason?: NullableStringFieldUpdateOperationsInput | string | null
    services?: GarageServiceUncheckedUpdateManyWithoutGarageNestedInput
    spareParts?: SparePartUncheckedUpdateManyWithoutGarageNestedInput
    bookings?: BookingUncheckedUpdateManyWithoutGarageNestedInput
  }

  export type TowTruckUpsertWithoutOwnerInput = {
    update: XOR<TowTruckUpdateWithoutOwnerInput, TowTruckUncheckedUpdateWithoutOwnerInput>
    create: XOR<TowTruckCreateWithoutOwnerInput, TowTruckUncheckedCreateWithoutOwnerInput>
    where?: TowTruckWhereInput
  }

  export type TowTruckUpdateToOneWithWhereWithoutOwnerInput = {
    where?: TowTruckWhereInput
    data: XOR<TowTruckUpdateWithoutOwnerInput, TowTruckUncheckedUpdateWithoutOwnerInput>
  }

  export type TowTruckUpdateWithoutOwnerInput = {
    name?: StringFieldUpdateOperationsInput | string
    driverName?: StringFieldUpdateOperationsInput | string
    model?: StringFieldUpdateOperationsInput | string
    make?: StringFieldUpdateOperationsInput | string
    year?: IntFieldUpdateOperationsInput | number
    plateNumber?: StringFieldUpdateOperationsInput | string
    licenseNumber?: StringFieldUpdateOperationsInput | string
    status?: EnumVerificationStatusFieldUpdateOperationsInput | $Enums.VerificationStatus
    rejectionReason?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    stripeAccountId?: NullableStringFieldUpdateOperationsInput | string | null
    services?: TowTruckServiceUpdateManyWithoutTowTruckNestedInput
    bookings?: BookingUpdateManyWithoutTowTruckNestedInput
    liveLocation?: LiveTruckLocationUpdateOneWithoutTowTruckNestedInput
  }

  export type TowTruckUncheckedUpdateWithoutOwnerInput = {
    name?: StringFieldUpdateOperationsInput | string
    driverName?: StringFieldUpdateOperationsInput | string
    model?: StringFieldUpdateOperationsInput | string
    make?: StringFieldUpdateOperationsInput | string
    year?: IntFieldUpdateOperationsInput | number
    plateNumber?: StringFieldUpdateOperationsInput | string
    licenseNumber?: StringFieldUpdateOperationsInput | string
    status?: EnumVerificationStatusFieldUpdateOperationsInput | $Enums.VerificationStatus
    rejectionReason?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    stripeAccountId?: NullableStringFieldUpdateOperationsInput | string | null
    services?: TowTruckServiceUncheckedUpdateManyWithoutTowTruckNestedInput
    bookings?: BookingUncheckedUpdateManyWithoutTowTruckNestedInput
    liveLocation?: LiveTruckLocationUncheckedUpdateOneWithoutTowTruckNestedInput
  }

  export type BookingUpsertWithWhereUniqueWithoutUserInput = {
    where: BookingWhereUniqueInput
    update: XOR<BookingUpdateWithoutUserInput, BookingUncheckedUpdateWithoutUserInput>
    create: XOR<BookingCreateWithoutUserInput, BookingUncheckedCreateWithoutUserInput>
  }

  export type BookingUpdateWithWhereUniqueWithoutUserInput = {
    where: BookingWhereUniqueInput
    data: XOR<BookingUpdateWithoutUserInput, BookingUncheckedUpdateWithoutUserInput>
  }

  export type BookingUpdateManyWithWhereWithoutUserInput = {
    where: BookingScalarWhereInput
    data: XOR<BookingUpdateManyMutationInput, BookingUncheckedUpdateManyWithoutUserInput>
  }

  export type BookingScalarWhereInput = {
    AND?: BookingScalarWhereInput | BookingScalarWhereInput[]
    OR?: BookingScalarWhereInput[]
    NOT?: BookingScalarWhereInput | BookingScalarWhereInput[]
    id?: StringFilter<"Booking"> | string
    status?: EnumBookingStatusFilter<"Booking"> | $Enums.BookingStatus
    bookedAt?: DateTimeFilter<"Booking"> | Date | string
    expiresAt?: DateTimeNullableFilter<"Booking"> | Date | string | null
    paymentExpiresAt?: DateTimeNullableFilter<"Booking"> | Date | string | null
    notes?: StringNullableFilter<"Booking"> | string | null
    otp?: StringNullableFilter<"Booking"> | string | null
    otpExpiresAt?: DateTimeNullableFilter<"Booking"> | Date | string | null
    pickupLocation?: JsonNullableFilter<"Booking">
    destinationLocation?: JsonNullableFilter<"Booking">
    serviceStartedAt?: DateTimeNullableFilter<"Booking"> | Date | string | null
    serviceEndedAt?: DateTimeNullableFilter<"Booking"> | Date | string | null
    basePrice?: FloatFilter<"Booking"> | number
    additionalFees?: FloatNullableFilter<"Booking"> | number | null
    discountAmount?: FloatNullableFilter<"Booking"> | number | null
    finalAmount?: FloatFilter<"Booking"> | number
    paymentStatus?: StringFilter<"Booking"> | string
    paymentIntentId?: StringNullableFilter<"Booking"> | string | null
    userRating?: IntNullableFilter<"Booking"> | number | null
    userReview?: StringNullableFilter<"Booking"> | string | null
    providerRating?: IntNullableFilter<"Booking"> | number | null
    providerReview?: StringNullableFilter<"Booking"> | string | null
    userId?: StringFilter<"Booking"> | string
    vehicleId?: StringFilter<"Booking"> | string
    eligibleProviderIds?: StringNullableListFilter<"Booking">
    serviceId?: StringNullableFilter<"Booking"> | string | null
    garageId?: StringNullableFilter<"Booking"> | string | null
    garageServiceId?: StringNullableFilter<"Booking"> | string | null
    towTruckId?: StringNullableFilter<"Booking"> | string | null
    towTruckServiceId?: StringNullableFilter<"Booking"> | string | null
    promoCodeId?: StringNullableFilter<"Booking"> | string | null
  }

  export type UserCreateWithoutVehiclesInput = {
    id?: string
    clerkId: string
    email: string
    firstName: string
    lastName?: string | null
    phone: string
    role?: UserCreateroleInput | $Enums.Role[]
    isPremium?: boolean
    isBanned?: boolean
    unsafeMetadata?: InputJsonValue | null
    createdAt?: Date | string
    updatedAt?: Date | string
    stripeCustomerId?: string | null
    garage?: GarageCreateNestedOneWithoutOwnerInput
    towTruck?: TowTruckCreateNestedOneWithoutOwnerInput
    bookings?: BookingCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutVehiclesInput = {
    id?: string
    clerkId: string
    email: string
    firstName: string
    lastName?: string | null
    phone: string
    role?: UserCreateroleInput | $Enums.Role[]
    isPremium?: boolean
    isBanned?: boolean
    unsafeMetadata?: InputJsonValue | null
    createdAt?: Date | string
    updatedAt?: Date | string
    stripeCustomerId?: string | null
    garage?: GarageUncheckedCreateNestedOneWithoutOwnerInput
    towTruck?: TowTruckUncheckedCreateNestedOneWithoutOwnerInput
    bookings?: BookingUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutVehiclesInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutVehiclesInput, UserUncheckedCreateWithoutVehiclesInput>
  }

  export type BookingCreateWithoutVehicleInput = {
    id?: string
    status?: $Enums.BookingStatus
    bookedAt?: Date | string
    expiresAt?: Date | string | null
    paymentExpiresAt?: Date | string | null
    notes?: string | null
    otp?: string | null
    otpExpiresAt?: Date | string | null
    pickupLocation?: InputJsonValue | null
    destinationLocation?: InputJsonValue | null
    serviceStartedAt?: Date | string | null
    serviceEndedAt?: Date | string | null
    basePrice: number
    additionalFees?: number | null
    discountAmount?: number | null
    finalAmount: number
    paymentStatus?: string
    paymentIntentId?: string | null
    userRating?: number | null
    userReview?: string | null
    providerRating?: number | null
    providerReview?: string | null
    eligibleProviderIds?: BookingCreateeligibleProviderIdsInput | string[]
    user: UserCreateNestedOneWithoutBookingsInput
    service?: ServiceCreateNestedOneWithoutBookingsInput
    garage?: GarageCreateNestedOneWithoutBookingsInput
    garageService?: GarageServiceCreateNestedOneWithoutBookingsInput
    towTruck?: TowTruckCreateNestedOneWithoutBookingsInput
    towTruckService?: TowTruckServiceCreateNestedOneWithoutBookingsInput
    promoCode?: PromoCodeCreateNestedOneWithoutBookingsInput
  }

  export type BookingUncheckedCreateWithoutVehicleInput = {
    id?: string
    status?: $Enums.BookingStatus
    bookedAt?: Date | string
    expiresAt?: Date | string | null
    paymentExpiresAt?: Date | string | null
    notes?: string | null
    otp?: string | null
    otpExpiresAt?: Date | string | null
    pickupLocation?: InputJsonValue | null
    destinationLocation?: InputJsonValue | null
    serviceStartedAt?: Date | string | null
    serviceEndedAt?: Date | string | null
    basePrice: number
    additionalFees?: number | null
    discountAmount?: number | null
    finalAmount: number
    paymentStatus?: string
    paymentIntentId?: string | null
    userRating?: number | null
    userReview?: string | null
    providerRating?: number | null
    providerReview?: string | null
    userId: string
    eligibleProviderIds?: BookingCreateeligibleProviderIdsInput | string[]
    serviceId?: string | null
    garageId?: string | null
    garageServiceId?: string | null
    towTruckId?: string | null
    towTruckServiceId?: string | null
    promoCodeId?: string | null
  }

  export type BookingCreateOrConnectWithoutVehicleInput = {
    where: BookingWhereUniqueInput
    create: XOR<BookingCreateWithoutVehicleInput, BookingUncheckedCreateWithoutVehicleInput>
  }

  export type BookingCreateManyVehicleInputEnvelope = {
    data: BookingCreateManyVehicleInput | BookingCreateManyVehicleInput[]
  }

  export type UserUpsertWithoutVehiclesInput = {
    update: XOR<UserUpdateWithoutVehiclesInput, UserUncheckedUpdateWithoutVehiclesInput>
    create: XOR<UserCreateWithoutVehiclesInput, UserUncheckedCreateWithoutVehiclesInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutVehiclesInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutVehiclesInput, UserUncheckedUpdateWithoutVehiclesInput>
  }

  export type UserUpdateWithoutVehiclesInput = {
    clerkId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: StringFieldUpdateOperationsInput | string
    role?: UserUpdateroleInput | $Enums.Role[]
    isPremium?: BoolFieldUpdateOperationsInput | boolean
    isBanned?: BoolFieldUpdateOperationsInput | boolean
    unsafeMetadata?: InputJsonValue | InputJsonValue | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    stripeCustomerId?: NullableStringFieldUpdateOperationsInput | string | null
    garage?: GarageUpdateOneWithoutOwnerNestedInput
    towTruck?: TowTruckUpdateOneWithoutOwnerNestedInput
    bookings?: BookingUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutVehiclesInput = {
    clerkId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: StringFieldUpdateOperationsInput | string
    role?: UserUpdateroleInput | $Enums.Role[]
    isPremium?: BoolFieldUpdateOperationsInput | boolean
    isBanned?: BoolFieldUpdateOperationsInput | boolean
    unsafeMetadata?: InputJsonValue | InputJsonValue | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    stripeCustomerId?: NullableStringFieldUpdateOperationsInput | string | null
    garage?: GarageUncheckedUpdateOneWithoutOwnerNestedInput
    towTruck?: TowTruckUncheckedUpdateOneWithoutOwnerNestedInput
    bookings?: BookingUncheckedUpdateManyWithoutUserNestedInput
  }

  export type BookingUpsertWithWhereUniqueWithoutVehicleInput = {
    where: BookingWhereUniqueInput
    update: XOR<BookingUpdateWithoutVehicleInput, BookingUncheckedUpdateWithoutVehicleInput>
    create: XOR<BookingCreateWithoutVehicleInput, BookingUncheckedCreateWithoutVehicleInput>
  }

  export type BookingUpdateWithWhereUniqueWithoutVehicleInput = {
    where: BookingWhereUniqueInput
    data: XOR<BookingUpdateWithoutVehicleInput, BookingUncheckedUpdateWithoutVehicleInput>
  }

  export type BookingUpdateManyWithWhereWithoutVehicleInput = {
    where: BookingScalarWhereInput
    data: XOR<BookingUpdateManyMutationInput, BookingUncheckedUpdateManyWithoutVehicleInput>
  }

  export type GarageServiceCreateWithoutServiceInput = {
    id?: string
    price: number
    garage: GarageCreateNestedOneWithoutServicesInput
    bookings?: BookingCreateNestedManyWithoutGarageServiceInput
  }

  export type GarageServiceUncheckedCreateWithoutServiceInput = {
    id?: string
    price: number
    garageId: string
    bookings?: BookingUncheckedCreateNestedManyWithoutGarageServiceInput
  }

  export type GarageServiceCreateOrConnectWithoutServiceInput = {
    where: GarageServiceWhereUniqueInput
    create: XOR<GarageServiceCreateWithoutServiceInput, GarageServiceUncheckedCreateWithoutServiceInput>
  }

  export type GarageServiceCreateManyServiceInputEnvelope = {
    data: GarageServiceCreateManyServiceInput | GarageServiceCreateManyServiceInput[]
  }

  export type BookingCreateWithoutServiceInput = {
    id?: string
    status?: $Enums.BookingStatus
    bookedAt?: Date | string
    expiresAt?: Date | string | null
    paymentExpiresAt?: Date | string | null
    notes?: string | null
    otp?: string | null
    otpExpiresAt?: Date | string | null
    pickupLocation?: InputJsonValue | null
    destinationLocation?: InputJsonValue | null
    serviceStartedAt?: Date | string | null
    serviceEndedAt?: Date | string | null
    basePrice: number
    additionalFees?: number | null
    discountAmount?: number | null
    finalAmount: number
    paymentStatus?: string
    paymentIntentId?: string | null
    userRating?: number | null
    userReview?: string | null
    providerRating?: number | null
    providerReview?: string | null
    eligibleProviderIds?: BookingCreateeligibleProviderIdsInput | string[]
    user: UserCreateNestedOneWithoutBookingsInput
    vehicle: VehicleCreateNestedOneWithoutBookingsInput
    garage?: GarageCreateNestedOneWithoutBookingsInput
    garageService?: GarageServiceCreateNestedOneWithoutBookingsInput
    towTruck?: TowTruckCreateNestedOneWithoutBookingsInput
    towTruckService?: TowTruckServiceCreateNestedOneWithoutBookingsInput
    promoCode?: PromoCodeCreateNestedOneWithoutBookingsInput
  }

  export type BookingUncheckedCreateWithoutServiceInput = {
    id?: string
    status?: $Enums.BookingStatus
    bookedAt?: Date | string
    expiresAt?: Date | string | null
    paymentExpiresAt?: Date | string | null
    notes?: string | null
    otp?: string | null
    otpExpiresAt?: Date | string | null
    pickupLocation?: InputJsonValue | null
    destinationLocation?: InputJsonValue | null
    serviceStartedAt?: Date | string | null
    serviceEndedAt?: Date | string | null
    basePrice: number
    additionalFees?: number | null
    discountAmount?: number | null
    finalAmount: number
    paymentStatus?: string
    paymentIntentId?: string | null
    userRating?: number | null
    userReview?: string | null
    providerRating?: number | null
    providerReview?: string | null
    userId: string
    vehicleId: string
    eligibleProviderIds?: BookingCreateeligibleProviderIdsInput | string[]
    garageId?: string | null
    garageServiceId?: string | null
    towTruckId?: string | null
    towTruckServiceId?: string | null
    promoCodeId?: string | null
  }

  export type BookingCreateOrConnectWithoutServiceInput = {
    where: BookingWhereUniqueInput
    create: XOR<BookingCreateWithoutServiceInput, BookingUncheckedCreateWithoutServiceInput>
  }

  export type BookingCreateManyServiceInputEnvelope = {
    data: BookingCreateManyServiceInput | BookingCreateManyServiceInput[]
  }

  export type GarageServiceUpsertWithWhereUniqueWithoutServiceInput = {
    where: GarageServiceWhereUniqueInput
    update: XOR<GarageServiceUpdateWithoutServiceInput, GarageServiceUncheckedUpdateWithoutServiceInput>
    create: XOR<GarageServiceCreateWithoutServiceInput, GarageServiceUncheckedCreateWithoutServiceInput>
  }

  export type GarageServiceUpdateWithWhereUniqueWithoutServiceInput = {
    where: GarageServiceWhereUniqueInput
    data: XOR<GarageServiceUpdateWithoutServiceInput, GarageServiceUncheckedUpdateWithoutServiceInput>
  }

  export type GarageServiceUpdateManyWithWhereWithoutServiceInput = {
    where: GarageServiceScalarWhereInput
    data: XOR<GarageServiceUpdateManyMutationInput, GarageServiceUncheckedUpdateManyWithoutServiceInput>
  }

  export type GarageServiceScalarWhereInput = {
    AND?: GarageServiceScalarWhereInput | GarageServiceScalarWhereInput[]
    OR?: GarageServiceScalarWhereInput[]
    NOT?: GarageServiceScalarWhereInput | GarageServiceScalarWhereInput[]
    id?: StringFilter<"GarageService"> | string
    price?: FloatFilter<"GarageService"> | number
    garageId?: StringFilter<"GarageService"> | string
    serviceId?: StringFilter<"GarageService"> | string
  }

  export type BookingUpsertWithWhereUniqueWithoutServiceInput = {
    where: BookingWhereUniqueInput
    update: XOR<BookingUpdateWithoutServiceInput, BookingUncheckedUpdateWithoutServiceInput>
    create: XOR<BookingCreateWithoutServiceInput, BookingUncheckedCreateWithoutServiceInput>
  }

  export type BookingUpdateWithWhereUniqueWithoutServiceInput = {
    where: BookingWhereUniqueInput
    data: XOR<BookingUpdateWithoutServiceInput, BookingUncheckedUpdateWithoutServiceInput>
  }

  export type BookingUpdateManyWithWhereWithoutServiceInput = {
    where: BookingScalarWhereInput
    data: XOR<BookingUpdateManyMutationInput, BookingUncheckedUpdateManyWithoutServiceInput>
  }

  export type UserCreateWithoutGarageInput = {
    id?: string
    clerkId: string
    email: string
    firstName: string
    lastName?: string | null
    phone: string
    role?: UserCreateroleInput | $Enums.Role[]
    isPremium?: boolean
    isBanned?: boolean
    unsafeMetadata?: InputJsonValue | null
    createdAt?: Date | string
    updatedAt?: Date | string
    stripeCustomerId?: string | null
    vehicles?: VehicleCreateNestedManyWithoutUserInput
    towTruck?: TowTruckCreateNestedOneWithoutOwnerInput
    bookings?: BookingCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutGarageInput = {
    id?: string
    clerkId: string
    email: string
    firstName: string
    lastName?: string | null
    phone: string
    role?: UserCreateroleInput | $Enums.Role[]
    isPremium?: boolean
    isBanned?: boolean
    unsafeMetadata?: InputJsonValue | null
    createdAt?: Date | string
    updatedAt?: Date | string
    stripeCustomerId?: string | null
    vehicles?: VehicleUncheckedCreateNestedManyWithoutUserInput
    towTruck?: TowTruckUncheckedCreateNestedOneWithoutOwnerInput
    bookings?: BookingUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutGarageInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutGarageInput, UserUncheckedCreateWithoutGarageInput>
  }

  export type GarageServiceCreateWithoutGarageInput = {
    id?: string
    price: number
    service: ServiceCreateNestedOneWithoutOfferedByGaragesInput
    bookings?: BookingCreateNestedManyWithoutGarageServiceInput
  }

  export type GarageServiceUncheckedCreateWithoutGarageInput = {
    id?: string
    price: number
    serviceId: string
    bookings?: BookingUncheckedCreateNestedManyWithoutGarageServiceInput
  }

  export type GarageServiceCreateOrConnectWithoutGarageInput = {
    where: GarageServiceWhereUniqueInput
    create: XOR<GarageServiceCreateWithoutGarageInput, GarageServiceUncheckedCreateWithoutGarageInput>
  }

  export type GarageServiceCreateManyGarageInputEnvelope = {
    data: GarageServiceCreateManyGarageInput | GarageServiceCreateManyGarageInput[]
  }

  export type SparePartCreateWithoutGarageInput = {
    id?: string
    partName: string
    compatibleMake: string
    compatibleModel: string
    compatibleYear: number
    price: number
    quantityAvailable: number
  }

  export type SparePartUncheckedCreateWithoutGarageInput = {
    id?: string
    partName: string
    compatibleMake: string
    compatibleModel: string
    compatibleYear: number
    price: number
    quantityAvailable: number
  }

  export type SparePartCreateOrConnectWithoutGarageInput = {
    where: SparePartWhereUniqueInput
    create: XOR<SparePartCreateWithoutGarageInput, SparePartUncheckedCreateWithoutGarageInput>
  }

  export type SparePartCreateManyGarageInputEnvelope = {
    data: SparePartCreateManyGarageInput | SparePartCreateManyGarageInput[]
  }

  export type BookingCreateWithoutGarageInput = {
    id?: string
    status?: $Enums.BookingStatus
    bookedAt?: Date | string
    expiresAt?: Date | string | null
    paymentExpiresAt?: Date | string | null
    notes?: string | null
    otp?: string | null
    otpExpiresAt?: Date | string | null
    pickupLocation?: InputJsonValue | null
    destinationLocation?: InputJsonValue | null
    serviceStartedAt?: Date | string | null
    serviceEndedAt?: Date | string | null
    basePrice: number
    additionalFees?: number | null
    discountAmount?: number | null
    finalAmount: number
    paymentStatus?: string
    paymentIntentId?: string | null
    userRating?: number | null
    userReview?: string | null
    providerRating?: number | null
    providerReview?: string | null
    eligibleProviderIds?: BookingCreateeligibleProviderIdsInput | string[]
    user: UserCreateNestedOneWithoutBookingsInput
    vehicle: VehicleCreateNestedOneWithoutBookingsInput
    service?: ServiceCreateNestedOneWithoutBookingsInput
    garageService?: GarageServiceCreateNestedOneWithoutBookingsInput
    towTruck?: TowTruckCreateNestedOneWithoutBookingsInput
    towTruckService?: TowTruckServiceCreateNestedOneWithoutBookingsInput
    promoCode?: PromoCodeCreateNestedOneWithoutBookingsInput
  }

  export type BookingUncheckedCreateWithoutGarageInput = {
    id?: string
    status?: $Enums.BookingStatus
    bookedAt?: Date | string
    expiresAt?: Date | string | null
    paymentExpiresAt?: Date | string | null
    notes?: string | null
    otp?: string | null
    otpExpiresAt?: Date | string | null
    pickupLocation?: InputJsonValue | null
    destinationLocation?: InputJsonValue | null
    serviceStartedAt?: Date | string | null
    serviceEndedAt?: Date | string | null
    basePrice: number
    additionalFees?: number | null
    discountAmount?: number | null
    finalAmount: number
    paymentStatus?: string
    paymentIntentId?: string | null
    userRating?: number | null
    userReview?: string | null
    providerRating?: number | null
    providerReview?: string | null
    userId: string
    vehicleId: string
    eligibleProviderIds?: BookingCreateeligibleProviderIdsInput | string[]
    serviceId?: string | null
    garageServiceId?: string | null
    towTruckId?: string | null
    towTruckServiceId?: string | null
    promoCodeId?: string | null
  }

  export type BookingCreateOrConnectWithoutGarageInput = {
    where: BookingWhereUniqueInput
    create: XOR<BookingCreateWithoutGarageInput, BookingUncheckedCreateWithoutGarageInput>
  }

  export type BookingCreateManyGarageInputEnvelope = {
    data: BookingCreateManyGarageInput | BookingCreateManyGarageInput[]
  }

  export type UserUpsertWithoutGarageInput = {
    update: XOR<UserUpdateWithoutGarageInput, UserUncheckedUpdateWithoutGarageInput>
    create: XOR<UserCreateWithoutGarageInput, UserUncheckedCreateWithoutGarageInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutGarageInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutGarageInput, UserUncheckedUpdateWithoutGarageInput>
  }

  export type UserUpdateWithoutGarageInput = {
    clerkId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: StringFieldUpdateOperationsInput | string
    role?: UserUpdateroleInput | $Enums.Role[]
    isPremium?: BoolFieldUpdateOperationsInput | boolean
    isBanned?: BoolFieldUpdateOperationsInput | boolean
    unsafeMetadata?: InputJsonValue | InputJsonValue | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    stripeCustomerId?: NullableStringFieldUpdateOperationsInput | string | null
    vehicles?: VehicleUpdateManyWithoutUserNestedInput
    towTruck?: TowTruckUpdateOneWithoutOwnerNestedInput
    bookings?: BookingUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutGarageInput = {
    clerkId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: StringFieldUpdateOperationsInput | string
    role?: UserUpdateroleInput | $Enums.Role[]
    isPremium?: BoolFieldUpdateOperationsInput | boolean
    isBanned?: BoolFieldUpdateOperationsInput | boolean
    unsafeMetadata?: InputJsonValue | InputJsonValue | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    stripeCustomerId?: NullableStringFieldUpdateOperationsInput | string | null
    vehicles?: VehicleUncheckedUpdateManyWithoutUserNestedInput
    towTruck?: TowTruckUncheckedUpdateOneWithoutOwnerNestedInput
    bookings?: BookingUncheckedUpdateManyWithoutUserNestedInput
  }

  export type GarageServiceUpsertWithWhereUniqueWithoutGarageInput = {
    where: GarageServiceWhereUniqueInput
    update: XOR<GarageServiceUpdateWithoutGarageInput, GarageServiceUncheckedUpdateWithoutGarageInput>
    create: XOR<GarageServiceCreateWithoutGarageInput, GarageServiceUncheckedCreateWithoutGarageInput>
  }

  export type GarageServiceUpdateWithWhereUniqueWithoutGarageInput = {
    where: GarageServiceWhereUniqueInput
    data: XOR<GarageServiceUpdateWithoutGarageInput, GarageServiceUncheckedUpdateWithoutGarageInput>
  }

  export type GarageServiceUpdateManyWithWhereWithoutGarageInput = {
    where: GarageServiceScalarWhereInput
    data: XOR<GarageServiceUpdateManyMutationInput, GarageServiceUncheckedUpdateManyWithoutGarageInput>
  }

  export type SparePartUpsertWithWhereUniqueWithoutGarageInput = {
    where: SparePartWhereUniqueInput
    update: XOR<SparePartUpdateWithoutGarageInput, SparePartUncheckedUpdateWithoutGarageInput>
    create: XOR<SparePartCreateWithoutGarageInput, SparePartUncheckedCreateWithoutGarageInput>
  }

  export type SparePartUpdateWithWhereUniqueWithoutGarageInput = {
    where: SparePartWhereUniqueInput
    data: XOR<SparePartUpdateWithoutGarageInput, SparePartUncheckedUpdateWithoutGarageInput>
  }

  export type SparePartUpdateManyWithWhereWithoutGarageInput = {
    where: SparePartScalarWhereInput
    data: XOR<SparePartUpdateManyMutationInput, SparePartUncheckedUpdateManyWithoutGarageInput>
  }

  export type SparePartScalarWhereInput = {
    AND?: SparePartScalarWhereInput | SparePartScalarWhereInput[]
    OR?: SparePartScalarWhereInput[]
    NOT?: SparePartScalarWhereInput | SparePartScalarWhereInput[]
    id?: StringFilter<"SparePart"> | string
    partName?: StringFilter<"SparePart"> | string
    compatibleMake?: StringFilter<"SparePart"> | string
    compatibleModel?: StringFilter<"SparePart"> | string
    compatibleYear?: IntFilter<"SparePart"> | number
    price?: FloatFilter<"SparePart"> | number
    quantityAvailable?: IntFilter<"SparePart"> | number
    garageId?: StringFilter<"SparePart"> | string
  }

  export type BookingUpsertWithWhereUniqueWithoutGarageInput = {
    where: BookingWhereUniqueInput
    update: XOR<BookingUpdateWithoutGarageInput, BookingUncheckedUpdateWithoutGarageInput>
    create: XOR<BookingCreateWithoutGarageInput, BookingUncheckedCreateWithoutGarageInput>
  }

  export type BookingUpdateWithWhereUniqueWithoutGarageInput = {
    where: BookingWhereUniqueInput
    data: XOR<BookingUpdateWithoutGarageInput, BookingUncheckedUpdateWithoutGarageInput>
  }

  export type BookingUpdateManyWithWhereWithoutGarageInput = {
    where: BookingScalarWhereInput
    data: XOR<BookingUpdateManyMutationInput, BookingUncheckedUpdateManyWithoutGarageInput>
  }

  export type GarageCreateWithoutServicesInput = {
    id?: string
    name: string
    licenseNumber: string
    address: string
    ownerName: string
    contactEmail?: string | null
    contactPhone?: string | null
    numberOfEmployees: number
    rating?: number | null
    reviewCount?: number | null
    isOpen?: boolean
    operatingHours?: InputJsonValue | null
    stripeAccountId?: string | null
    location: InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    status?: $Enums.VerificationStatus
    rejectionReason?: string | null
    owner: UserCreateNestedOneWithoutGarageInput
    spareParts?: SparePartCreateNestedManyWithoutGarageInput
    bookings?: BookingCreateNestedManyWithoutGarageInput
  }

  export type GarageUncheckedCreateWithoutServicesInput = {
    id?: string
    name: string
    licenseNumber: string
    address: string
    ownerName: string
    contactEmail?: string | null
    contactPhone?: string | null
    numberOfEmployees: number
    rating?: number | null
    reviewCount?: number | null
    isOpen?: boolean
    operatingHours?: InputJsonValue | null
    stripeAccountId?: string | null
    location: InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    status?: $Enums.VerificationStatus
    rejectionReason?: string | null
    ownerId: string
    spareParts?: SparePartUncheckedCreateNestedManyWithoutGarageInput
    bookings?: BookingUncheckedCreateNestedManyWithoutGarageInput
  }

  export type GarageCreateOrConnectWithoutServicesInput = {
    where: GarageWhereUniqueInput
    create: XOR<GarageCreateWithoutServicesInput, GarageUncheckedCreateWithoutServicesInput>
  }

  export type ServiceCreateWithoutOfferedByGaragesInput = {
    id?: string
    name: string
    description: string
    icon?: string | null
    type: string
    bookings?: BookingCreateNestedManyWithoutServiceInput
  }

  export type ServiceUncheckedCreateWithoutOfferedByGaragesInput = {
    id?: string
    name: string
    description: string
    icon?: string | null
    type: string
    bookings?: BookingUncheckedCreateNestedManyWithoutServiceInput
  }

  export type ServiceCreateOrConnectWithoutOfferedByGaragesInput = {
    where: ServiceWhereUniqueInput
    create: XOR<ServiceCreateWithoutOfferedByGaragesInput, ServiceUncheckedCreateWithoutOfferedByGaragesInput>
  }

  export type BookingCreateWithoutGarageServiceInput = {
    id?: string
    status?: $Enums.BookingStatus
    bookedAt?: Date | string
    expiresAt?: Date | string | null
    paymentExpiresAt?: Date | string | null
    notes?: string | null
    otp?: string | null
    otpExpiresAt?: Date | string | null
    pickupLocation?: InputJsonValue | null
    destinationLocation?: InputJsonValue | null
    serviceStartedAt?: Date | string | null
    serviceEndedAt?: Date | string | null
    basePrice: number
    additionalFees?: number | null
    discountAmount?: number | null
    finalAmount: number
    paymentStatus?: string
    paymentIntentId?: string | null
    userRating?: number | null
    userReview?: string | null
    providerRating?: number | null
    providerReview?: string | null
    eligibleProviderIds?: BookingCreateeligibleProviderIdsInput | string[]
    user: UserCreateNestedOneWithoutBookingsInput
    vehicle: VehicleCreateNestedOneWithoutBookingsInput
    service?: ServiceCreateNestedOneWithoutBookingsInput
    garage?: GarageCreateNestedOneWithoutBookingsInput
    towTruck?: TowTruckCreateNestedOneWithoutBookingsInput
    towTruckService?: TowTruckServiceCreateNestedOneWithoutBookingsInput
    promoCode?: PromoCodeCreateNestedOneWithoutBookingsInput
  }

  export type BookingUncheckedCreateWithoutGarageServiceInput = {
    id?: string
    status?: $Enums.BookingStatus
    bookedAt?: Date | string
    expiresAt?: Date | string | null
    paymentExpiresAt?: Date | string | null
    notes?: string | null
    otp?: string | null
    otpExpiresAt?: Date | string | null
    pickupLocation?: InputJsonValue | null
    destinationLocation?: InputJsonValue | null
    serviceStartedAt?: Date | string | null
    serviceEndedAt?: Date | string | null
    basePrice: number
    additionalFees?: number | null
    discountAmount?: number | null
    finalAmount: number
    paymentStatus?: string
    paymentIntentId?: string | null
    userRating?: number | null
    userReview?: string | null
    providerRating?: number | null
    providerReview?: string | null
    userId: string
    vehicleId: string
    eligibleProviderIds?: BookingCreateeligibleProviderIdsInput | string[]
    serviceId?: string | null
    garageId?: string | null
    towTruckId?: string | null
    towTruckServiceId?: string | null
    promoCodeId?: string | null
  }

  export type BookingCreateOrConnectWithoutGarageServiceInput = {
    where: BookingWhereUniqueInput
    create: XOR<BookingCreateWithoutGarageServiceInput, BookingUncheckedCreateWithoutGarageServiceInput>
  }

  export type BookingCreateManyGarageServiceInputEnvelope = {
    data: BookingCreateManyGarageServiceInput | BookingCreateManyGarageServiceInput[]
  }

  export type GarageUpsertWithoutServicesInput = {
    update: XOR<GarageUpdateWithoutServicesInput, GarageUncheckedUpdateWithoutServicesInput>
    create: XOR<GarageCreateWithoutServicesInput, GarageUncheckedCreateWithoutServicesInput>
    where?: GarageWhereInput
  }

  export type GarageUpdateToOneWithWhereWithoutServicesInput = {
    where?: GarageWhereInput
    data: XOR<GarageUpdateWithoutServicesInput, GarageUncheckedUpdateWithoutServicesInput>
  }

  export type GarageUpdateWithoutServicesInput = {
    name?: StringFieldUpdateOperationsInput | string
    licenseNumber?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    ownerName?: StringFieldUpdateOperationsInput | string
    contactEmail?: NullableStringFieldUpdateOperationsInput | string | null
    contactPhone?: NullableStringFieldUpdateOperationsInput | string | null
    numberOfEmployees?: IntFieldUpdateOperationsInput | number
    rating?: NullableFloatFieldUpdateOperationsInput | number | null
    reviewCount?: NullableIntFieldUpdateOperationsInput | number | null
    isOpen?: BoolFieldUpdateOperationsInput | boolean
    operatingHours?: InputJsonValue | InputJsonValue | null
    stripeAccountId?: NullableStringFieldUpdateOperationsInput | string | null
    location?: InputJsonValue | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumVerificationStatusFieldUpdateOperationsInput | $Enums.VerificationStatus
    rejectionReason?: NullableStringFieldUpdateOperationsInput | string | null
    owner?: UserUpdateOneRequiredWithoutGarageNestedInput
    spareParts?: SparePartUpdateManyWithoutGarageNestedInput
    bookings?: BookingUpdateManyWithoutGarageNestedInput
  }

  export type GarageUncheckedUpdateWithoutServicesInput = {
    name?: StringFieldUpdateOperationsInput | string
    licenseNumber?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    ownerName?: StringFieldUpdateOperationsInput | string
    contactEmail?: NullableStringFieldUpdateOperationsInput | string | null
    contactPhone?: NullableStringFieldUpdateOperationsInput | string | null
    numberOfEmployees?: IntFieldUpdateOperationsInput | number
    rating?: NullableFloatFieldUpdateOperationsInput | number | null
    reviewCount?: NullableIntFieldUpdateOperationsInput | number | null
    isOpen?: BoolFieldUpdateOperationsInput | boolean
    operatingHours?: InputJsonValue | InputJsonValue | null
    stripeAccountId?: NullableStringFieldUpdateOperationsInput | string | null
    location?: InputJsonValue | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumVerificationStatusFieldUpdateOperationsInput | $Enums.VerificationStatus
    rejectionReason?: NullableStringFieldUpdateOperationsInput | string | null
    ownerId?: StringFieldUpdateOperationsInput | string
    spareParts?: SparePartUncheckedUpdateManyWithoutGarageNestedInput
    bookings?: BookingUncheckedUpdateManyWithoutGarageNestedInput
  }

  export type ServiceUpsertWithoutOfferedByGaragesInput = {
    update: XOR<ServiceUpdateWithoutOfferedByGaragesInput, ServiceUncheckedUpdateWithoutOfferedByGaragesInput>
    create: XOR<ServiceCreateWithoutOfferedByGaragesInput, ServiceUncheckedCreateWithoutOfferedByGaragesInput>
    where?: ServiceWhereInput
  }

  export type ServiceUpdateToOneWithWhereWithoutOfferedByGaragesInput = {
    where?: ServiceWhereInput
    data: XOR<ServiceUpdateWithoutOfferedByGaragesInput, ServiceUncheckedUpdateWithoutOfferedByGaragesInput>
  }

  export type ServiceUpdateWithoutOfferedByGaragesInput = {
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    icon?: NullableStringFieldUpdateOperationsInput | string | null
    type?: StringFieldUpdateOperationsInput | string
    bookings?: BookingUpdateManyWithoutServiceNestedInput
  }

  export type ServiceUncheckedUpdateWithoutOfferedByGaragesInput = {
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    icon?: NullableStringFieldUpdateOperationsInput | string | null
    type?: StringFieldUpdateOperationsInput | string
    bookings?: BookingUncheckedUpdateManyWithoutServiceNestedInput
  }

  export type BookingUpsertWithWhereUniqueWithoutGarageServiceInput = {
    where: BookingWhereUniqueInput
    update: XOR<BookingUpdateWithoutGarageServiceInput, BookingUncheckedUpdateWithoutGarageServiceInput>
    create: XOR<BookingCreateWithoutGarageServiceInput, BookingUncheckedCreateWithoutGarageServiceInput>
  }

  export type BookingUpdateWithWhereUniqueWithoutGarageServiceInput = {
    where: BookingWhereUniqueInput
    data: XOR<BookingUpdateWithoutGarageServiceInput, BookingUncheckedUpdateWithoutGarageServiceInput>
  }

  export type BookingUpdateManyWithWhereWithoutGarageServiceInput = {
    where: BookingScalarWhereInput
    data: XOR<BookingUpdateManyMutationInput, BookingUncheckedUpdateManyWithoutGarageServiceInput>
  }

  export type UserCreateWithoutTowTruckInput = {
    id?: string
    clerkId: string
    email: string
    firstName: string
    lastName?: string | null
    phone: string
    role?: UserCreateroleInput | $Enums.Role[]
    isPremium?: boolean
    isBanned?: boolean
    unsafeMetadata?: InputJsonValue | null
    createdAt?: Date | string
    updatedAt?: Date | string
    stripeCustomerId?: string | null
    vehicles?: VehicleCreateNestedManyWithoutUserInput
    garage?: GarageCreateNestedOneWithoutOwnerInput
    bookings?: BookingCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutTowTruckInput = {
    id?: string
    clerkId: string
    email: string
    firstName: string
    lastName?: string | null
    phone: string
    role?: UserCreateroleInput | $Enums.Role[]
    isPremium?: boolean
    isBanned?: boolean
    unsafeMetadata?: InputJsonValue | null
    createdAt?: Date | string
    updatedAt?: Date | string
    stripeCustomerId?: string | null
    vehicles?: VehicleUncheckedCreateNestedManyWithoutUserInput
    garage?: GarageUncheckedCreateNestedOneWithoutOwnerInput
    bookings?: BookingUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutTowTruckInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutTowTruckInput, UserUncheckedCreateWithoutTowTruckInput>
  }

  export type TowTruckServiceCreateWithoutTowTruckInput = {
    id?: string
    price: number
    vehicleType: $Enums.VehicleType
    bookings?: BookingCreateNestedManyWithoutTowTruckServiceInput
  }

  export type TowTruckServiceUncheckedCreateWithoutTowTruckInput = {
    id?: string
    price: number
    vehicleType: $Enums.VehicleType
    bookings?: BookingUncheckedCreateNestedManyWithoutTowTruckServiceInput
  }

  export type TowTruckServiceCreateOrConnectWithoutTowTruckInput = {
    where: TowTruckServiceWhereUniqueInput
    create: XOR<TowTruckServiceCreateWithoutTowTruckInput, TowTruckServiceUncheckedCreateWithoutTowTruckInput>
  }

  export type TowTruckServiceCreateManyTowTruckInputEnvelope = {
    data: TowTruckServiceCreateManyTowTruckInput | TowTruckServiceCreateManyTowTruckInput[]
  }

  export type BookingCreateWithoutTowTruckInput = {
    id?: string
    status?: $Enums.BookingStatus
    bookedAt?: Date | string
    expiresAt?: Date | string | null
    paymentExpiresAt?: Date | string | null
    notes?: string | null
    otp?: string | null
    otpExpiresAt?: Date | string | null
    pickupLocation?: InputJsonValue | null
    destinationLocation?: InputJsonValue | null
    serviceStartedAt?: Date | string | null
    serviceEndedAt?: Date | string | null
    basePrice: number
    additionalFees?: number | null
    discountAmount?: number | null
    finalAmount: number
    paymentStatus?: string
    paymentIntentId?: string | null
    userRating?: number | null
    userReview?: string | null
    providerRating?: number | null
    providerReview?: string | null
    eligibleProviderIds?: BookingCreateeligibleProviderIdsInput | string[]
    user: UserCreateNestedOneWithoutBookingsInput
    vehicle: VehicleCreateNestedOneWithoutBookingsInput
    service?: ServiceCreateNestedOneWithoutBookingsInput
    garage?: GarageCreateNestedOneWithoutBookingsInput
    garageService?: GarageServiceCreateNestedOneWithoutBookingsInput
    towTruckService?: TowTruckServiceCreateNestedOneWithoutBookingsInput
    promoCode?: PromoCodeCreateNestedOneWithoutBookingsInput
  }

  export type BookingUncheckedCreateWithoutTowTruckInput = {
    id?: string
    status?: $Enums.BookingStatus
    bookedAt?: Date | string
    expiresAt?: Date | string | null
    paymentExpiresAt?: Date | string | null
    notes?: string | null
    otp?: string | null
    otpExpiresAt?: Date | string | null
    pickupLocation?: InputJsonValue | null
    destinationLocation?: InputJsonValue | null
    serviceStartedAt?: Date | string | null
    serviceEndedAt?: Date | string | null
    basePrice: number
    additionalFees?: number | null
    discountAmount?: number | null
    finalAmount: number
    paymentStatus?: string
    paymentIntentId?: string | null
    userRating?: number | null
    userReview?: string | null
    providerRating?: number | null
    providerReview?: string | null
    userId: string
    vehicleId: string
    eligibleProviderIds?: BookingCreateeligibleProviderIdsInput | string[]
    serviceId?: string | null
    garageId?: string | null
    garageServiceId?: string | null
    towTruckServiceId?: string | null
    promoCodeId?: string | null
  }

  export type BookingCreateOrConnectWithoutTowTruckInput = {
    where: BookingWhereUniqueInput
    create: XOR<BookingCreateWithoutTowTruckInput, BookingUncheckedCreateWithoutTowTruckInput>
  }

  export type BookingCreateManyTowTruckInputEnvelope = {
    data: BookingCreateManyTowTruckInput | BookingCreateManyTowTruckInput[]
  }

  export type LiveTruckLocationCreateWithoutTowTruckInput = {
    id?: string
    location: InputJsonValue
    lastUpdated?: Date | string
    isAvailable?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type LiveTruckLocationUncheckedCreateWithoutTowTruckInput = {
    id?: string
    location: InputJsonValue
    lastUpdated?: Date | string
    isAvailable?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type LiveTruckLocationCreateOrConnectWithoutTowTruckInput = {
    where: LiveTruckLocationWhereUniqueInput
    create: XOR<LiveTruckLocationCreateWithoutTowTruckInput, LiveTruckLocationUncheckedCreateWithoutTowTruckInput>
  }

  export type UserUpsertWithoutTowTruckInput = {
    update: XOR<UserUpdateWithoutTowTruckInput, UserUncheckedUpdateWithoutTowTruckInput>
    create: XOR<UserCreateWithoutTowTruckInput, UserUncheckedCreateWithoutTowTruckInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutTowTruckInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutTowTruckInput, UserUncheckedUpdateWithoutTowTruckInput>
  }

  export type UserUpdateWithoutTowTruckInput = {
    clerkId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: StringFieldUpdateOperationsInput | string
    role?: UserUpdateroleInput | $Enums.Role[]
    isPremium?: BoolFieldUpdateOperationsInput | boolean
    isBanned?: BoolFieldUpdateOperationsInput | boolean
    unsafeMetadata?: InputJsonValue | InputJsonValue | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    stripeCustomerId?: NullableStringFieldUpdateOperationsInput | string | null
    vehicles?: VehicleUpdateManyWithoutUserNestedInput
    garage?: GarageUpdateOneWithoutOwnerNestedInput
    bookings?: BookingUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutTowTruckInput = {
    clerkId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: StringFieldUpdateOperationsInput | string
    role?: UserUpdateroleInput | $Enums.Role[]
    isPremium?: BoolFieldUpdateOperationsInput | boolean
    isBanned?: BoolFieldUpdateOperationsInput | boolean
    unsafeMetadata?: InputJsonValue | InputJsonValue | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    stripeCustomerId?: NullableStringFieldUpdateOperationsInput | string | null
    vehicles?: VehicleUncheckedUpdateManyWithoutUserNestedInput
    garage?: GarageUncheckedUpdateOneWithoutOwnerNestedInput
    bookings?: BookingUncheckedUpdateManyWithoutUserNestedInput
  }

  export type TowTruckServiceUpsertWithWhereUniqueWithoutTowTruckInput = {
    where: TowTruckServiceWhereUniqueInput
    update: XOR<TowTruckServiceUpdateWithoutTowTruckInput, TowTruckServiceUncheckedUpdateWithoutTowTruckInput>
    create: XOR<TowTruckServiceCreateWithoutTowTruckInput, TowTruckServiceUncheckedCreateWithoutTowTruckInput>
  }

  export type TowTruckServiceUpdateWithWhereUniqueWithoutTowTruckInput = {
    where: TowTruckServiceWhereUniqueInput
    data: XOR<TowTruckServiceUpdateWithoutTowTruckInput, TowTruckServiceUncheckedUpdateWithoutTowTruckInput>
  }

  export type TowTruckServiceUpdateManyWithWhereWithoutTowTruckInput = {
    where: TowTruckServiceScalarWhereInput
    data: XOR<TowTruckServiceUpdateManyMutationInput, TowTruckServiceUncheckedUpdateManyWithoutTowTruckInput>
  }

  export type TowTruckServiceScalarWhereInput = {
    AND?: TowTruckServiceScalarWhereInput | TowTruckServiceScalarWhereInput[]
    OR?: TowTruckServiceScalarWhereInput[]
    NOT?: TowTruckServiceScalarWhereInput | TowTruckServiceScalarWhereInput[]
    id?: StringFilter<"TowTruckService"> | string
    price?: FloatFilter<"TowTruckService"> | number
    vehicleType?: EnumVehicleTypeFilter<"TowTruckService"> | $Enums.VehicleType
    towTruckId?: StringFilter<"TowTruckService"> | string
  }

  export type BookingUpsertWithWhereUniqueWithoutTowTruckInput = {
    where: BookingWhereUniqueInput
    update: XOR<BookingUpdateWithoutTowTruckInput, BookingUncheckedUpdateWithoutTowTruckInput>
    create: XOR<BookingCreateWithoutTowTruckInput, BookingUncheckedCreateWithoutTowTruckInput>
  }

  export type BookingUpdateWithWhereUniqueWithoutTowTruckInput = {
    where: BookingWhereUniqueInput
    data: XOR<BookingUpdateWithoutTowTruckInput, BookingUncheckedUpdateWithoutTowTruckInput>
  }

  export type BookingUpdateManyWithWhereWithoutTowTruckInput = {
    where: BookingScalarWhereInput
    data: XOR<BookingUpdateManyMutationInput, BookingUncheckedUpdateManyWithoutTowTruckInput>
  }

  export type LiveTruckLocationUpsertWithoutTowTruckInput = {
    update: XOR<LiveTruckLocationUpdateWithoutTowTruckInput, LiveTruckLocationUncheckedUpdateWithoutTowTruckInput>
    create: XOR<LiveTruckLocationCreateWithoutTowTruckInput, LiveTruckLocationUncheckedCreateWithoutTowTruckInput>
    where?: LiveTruckLocationWhereInput
  }

  export type LiveTruckLocationUpdateToOneWithWhereWithoutTowTruckInput = {
    where?: LiveTruckLocationWhereInput
    data: XOR<LiveTruckLocationUpdateWithoutTowTruckInput, LiveTruckLocationUncheckedUpdateWithoutTowTruckInput>
  }

  export type LiveTruckLocationUpdateWithoutTowTruckInput = {
    location?: InputJsonValue | InputJsonValue
    lastUpdated?: DateTimeFieldUpdateOperationsInput | Date | string
    isAvailable?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LiveTruckLocationUncheckedUpdateWithoutTowTruckInput = {
    location?: InputJsonValue | InputJsonValue
    lastUpdated?: DateTimeFieldUpdateOperationsInput | Date | string
    isAvailable?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TowTruckCreateWithoutServicesInput = {
    id?: string
    name: string
    driverName: string
    model: string
    make: string
    year: number
    plateNumber: string
    licenseNumber: string
    status?: $Enums.VerificationStatus
    rejectionReason?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    stripeAccountId?: string | null
    owner: UserCreateNestedOneWithoutTowTruckInput
    bookings?: BookingCreateNestedManyWithoutTowTruckInput
    liveLocation?: LiveTruckLocationCreateNestedOneWithoutTowTruckInput
  }

  export type TowTruckUncheckedCreateWithoutServicesInput = {
    id?: string
    name: string
    driverName: string
    model: string
    make: string
    year: number
    plateNumber: string
    licenseNumber: string
    status?: $Enums.VerificationStatus
    rejectionReason?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    ownerId: string
    stripeAccountId?: string | null
    bookings?: BookingUncheckedCreateNestedManyWithoutTowTruckInput
    liveLocation?: LiveTruckLocationUncheckedCreateNestedOneWithoutTowTruckInput
  }

  export type TowTruckCreateOrConnectWithoutServicesInput = {
    where: TowTruckWhereUniqueInput
    create: XOR<TowTruckCreateWithoutServicesInput, TowTruckUncheckedCreateWithoutServicesInput>
  }

  export type BookingCreateWithoutTowTruckServiceInput = {
    id?: string
    status?: $Enums.BookingStatus
    bookedAt?: Date | string
    expiresAt?: Date | string | null
    paymentExpiresAt?: Date | string | null
    notes?: string | null
    otp?: string | null
    otpExpiresAt?: Date | string | null
    pickupLocation?: InputJsonValue | null
    destinationLocation?: InputJsonValue | null
    serviceStartedAt?: Date | string | null
    serviceEndedAt?: Date | string | null
    basePrice: number
    additionalFees?: number | null
    discountAmount?: number | null
    finalAmount: number
    paymentStatus?: string
    paymentIntentId?: string | null
    userRating?: number | null
    userReview?: string | null
    providerRating?: number | null
    providerReview?: string | null
    eligibleProviderIds?: BookingCreateeligibleProviderIdsInput | string[]
    user: UserCreateNestedOneWithoutBookingsInput
    vehicle: VehicleCreateNestedOneWithoutBookingsInput
    service?: ServiceCreateNestedOneWithoutBookingsInput
    garage?: GarageCreateNestedOneWithoutBookingsInput
    garageService?: GarageServiceCreateNestedOneWithoutBookingsInput
    towTruck?: TowTruckCreateNestedOneWithoutBookingsInput
    promoCode?: PromoCodeCreateNestedOneWithoutBookingsInput
  }

  export type BookingUncheckedCreateWithoutTowTruckServiceInput = {
    id?: string
    status?: $Enums.BookingStatus
    bookedAt?: Date | string
    expiresAt?: Date | string | null
    paymentExpiresAt?: Date | string | null
    notes?: string | null
    otp?: string | null
    otpExpiresAt?: Date | string | null
    pickupLocation?: InputJsonValue | null
    destinationLocation?: InputJsonValue | null
    serviceStartedAt?: Date | string | null
    serviceEndedAt?: Date | string | null
    basePrice: number
    additionalFees?: number | null
    discountAmount?: number | null
    finalAmount: number
    paymentStatus?: string
    paymentIntentId?: string | null
    userRating?: number | null
    userReview?: string | null
    providerRating?: number | null
    providerReview?: string | null
    userId: string
    vehicleId: string
    eligibleProviderIds?: BookingCreateeligibleProviderIdsInput | string[]
    serviceId?: string | null
    garageId?: string | null
    garageServiceId?: string | null
    towTruckId?: string | null
    promoCodeId?: string | null
  }

  export type BookingCreateOrConnectWithoutTowTruckServiceInput = {
    where: BookingWhereUniqueInput
    create: XOR<BookingCreateWithoutTowTruckServiceInput, BookingUncheckedCreateWithoutTowTruckServiceInput>
  }

  export type BookingCreateManyTowTruckServiceInputEnvelope = {
    data: BookingCreateManyTowTruckServiceInput | BookingCreateManyTowTruckServiceInput[]
  }

  export type TowTruckUpsertWithoutServicesInput = {
    update: XOR<TowTruckUpdateWithoutServicesInput, TowTruckUncheckedUpdateWithoutServicesInput>
    create: XOR<TowTruckCreateWithoutServicesInput, TowTruckUncheckedCreateWithoutServicesInput>
    where?: TowTruckWhereInput
  }

  export type TowTruckUpdateToOneWithWhereWithoutServicesInput = {
    where?: TowTruckWhereInput
    data: XOR<TowTruckUpdateWithoutServicesInput, TowTruckUncheckedUpdateWithoutServicesInput>
  }

  export type TowTruckUpdateWithoutServicesInput = {
    name?: StringFieldUpdateOperationsInput | string
    driverName?: StringFieldUpdateOperationsInput | string
    model?: StringFieldUpdateOperationsInput | string
    make?: StringFieldUpdateOperationsInput | string
    year?: IntFieldUpdateOperationsInput | number
    plateNumber?: StringFieldUpdateOperationsInput | string
    licenseNumber?: StringFieldUpdateOperationsInput | string
    status?: EnumVerificationStatusFieldUpdateOperationsInput | $Enums.VerificationStatus
    rejectionReason?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    stripeAccountId?: NullableStringFieldUpdateOperationsInput | string | null
    owner?: UserUpdateOneRequiredWithoutTowTruckNestedInput
    bookings?: BookingUpdateManyWithoutTowTruckNestedInput
    liveLocation?: LiveTruckLocationUpdateOneWithoutTowTruckNestedInput
  }

  export type TowTruckUncheckedUpdateWithoutServicesInput = {
    name?: StringFieldUpdateOperationsInput | string
    driverName?: StringFieldUpdateOperationsInput | string
    model?: StringFieldUpdateOperationsInput | string
    make?: StringFieldUpdateOperationsInput | string
    year?: IntFieldUpdateOperationsInput | number
    plateNumber?: StringFieldUpdateOperationsInput | string
    licenseNumber?: StringFieldUpdateOperationsInput | string
    status?: EnumVerificationStatusFieldUpdateOperationsInput | $Enums.VerificationStatus
    rejectionReason?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    ownerId?: StringFieldUpdateOperationsInput | string
    stripeAccountId?: NullableStringFieldUpdateOperationsInput | string | null
    bookings?: BookingUncheckedUpdateManyWithoutTowTruckNestedInput
    liveLocation?: LiveTruckLocationUncheckedUpdateOneWithoutTowTruckNestedInput
  }

  export type BookingUpsertWithWhereUniqueWithoutTowTruckServiceInput = {
    where: BookingWhereUniqueInput
    update: XOR<BookingUpdateWithoutTowTruckServiceInput, BookingUncheckedUpdateWithoutTowTruckServiceInput>
    create: XOR<BookingCreateWithoutTowTruckServiceInput, BookingUncheckedCreateWithoutTowTruckServiceInput>
  }

  export type BookingUpdateWithWhereUniqueWithoutTowTruckServiceInput = {
    where: BookingWhereUniqueInput
    data: XOR<BookingUpdateWithoutTowTruckServiceInput, BookingUncheckedUpdateWithoutTowTruckServiceInput>
  }

  export type BookingUpdateManyWithWhereWithoutTowTruckServiceInput = {
    where: BookingScalarWhereInput
    data: XOR<BookingUpdateManyMutationInput, BookingUncheckedUpdateManyWithoutTowTruckServiceInput>
  }

  export type TowTruckCreateWithoutLiveLocationInput = {
    id?: string
    name: string
    driverName: string
    model: string
    make: string
    year: number
    plateNumber: string
    licenseNumber: string
    status?: $Enums.VerificationStatus
    rejectionReason?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    stripeAccountId?: string | null
    owner: UserCreateNestedOneWithoutTowTruckInput
    services?: TowTruckServiceCreateNestedManyWithoutTowTruckInput
    bookings?: BookingCreateNestedManyWithoutTowTruckInput
  }

  export type TowTruckUncheckedCreateWithoutLiveLocationInput = {
    id?: string
    name: string
    driverName: string
    model: string
    make: string
    year: number
    plateNumber: string
    licenseNumber: string
    status?: $Enums.VerificationStatus
    rejectionReason?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    ownerId: string
    stripeAccountId?: string | null
    services?: TowTruckServiceUncheckedCreateNestedManyWithoutTowTruckInput
    bookings?: BookingUncheckedCreateNestedManyWithoutTowTruckInput
  }

  export type TowTruckCreateOrConnectWithoutLiveLocationInput = {
    where: TowTruckWhereUniqueInput
    create: XOR<TowTruckCreateWithoutLiveLocationInput, TowTruckUncheckedCreateWithoutLiveLocationInput>
  }

  export type TowTruckUpsertWithoutLiveLocationInput = {
    update: XOR<TowTruckUpdateWithoutLiveLocationInput, TowTruckUncheckedUpdateWithoutLiveLocationInput>
    create: XOR<TowTruckCreateWithoutLiveLocationInput, TowTruckUncheckedCreateWithoutLiveLocationInput>
    where?: TowTruckWhereInput
  }

  export type TowTruckUpdateToOneWithWhereWithoutLiveLocationInput = {
    where?: TowTruckWhereInput
    data: XOR<TowTruckUpdateWithoutLiveLocationInput, TowTruckUncheckedUpdateWithoutLiveLocationInput>
  }

  export type TowTruckUpdateWithoutLiveLocationInput = {
    name?: StringFieldUpdateOperationsInput | string
    driverName?: StringFieldUpdateOperationsInput | string
    model?: StringFieldUpdateOperationsInput | string
    make?: StringFieldUpdateOperationsInput | string
    year?: IntFieldUpdateOperationsInput | number
    plateNumber?: StringFieldUpdateOperationsInput | string
    licenseNumber?: StringFieldUpdateOperationsInput | string
    status?: EnumVerificationStatusFieldUpdateOperationsInput | $Enums.VerificationStatus
    rejectionReason?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    stripeAccountId?: NullableStringFieldUpdateOperationsInput | string | null
    owner?: UserUpdateOneRequiredWithoutTowTruckNestedInput
    services?: TowTruckServiceUpdateManyWithoutTowTruckNestedInput
    bookings?: BookingUpdateManyWithoutTowTruckNestedInput
  }

  export type TowTruckUncheckedUpdateWithoutLiveLocationInput = {
    name?: StringFieldUpdateOperationsInput | string
    driverName?: StringFieldUpdateOperationsInput | string
    model?: StringFieldUpdateOperationsInput | string
    make?: StringFieldUpdateOperationsInput | string
    year?: IntFieldUpdateOperationsInput | number
    plateNumber?: StringFieldUpdateOperationsInput | string
    licenseNumber?: StringFieldUpdateOperationsInput | string
    status?: EnumVerificationStatusFieldUpdateOperationsInput | $Enums.VerificationStatus
    rejectionReason?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    ownerId?: StringFieldUpdateOperationsInput | string
    stripeAccountId?: NullableStringFieldUpdateOperationsInput | string | null
    services?: TowTruckServiceUncheckedUpdateManyWithoutTowTruckNestedInput
    bookings?: BookingUncheckedUpdateManyWithoutTowTruckNestedInput
  }

  export type GarageCreateWithoutSparePartsInput = {
    id?: string
    name: string
    licenseNumber: string
    address: string
    ownerName: string
    contactEmail?: string | null
    contactPhone?: string | null
    numberOfEmployees: number
    rating?: number | null
    reviewCount?: number | null
    isOpen?: boolean
    operatingHours?: InputJsonValue | null
    stripeAccountId?: string | null
    location: InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    status?: $Enums.VerificationStatus
    rejectionReason?: string | null
    owner: UserCreateNestedOneWithoutGarageInput
    services?: GarageServiceCreateNestedManyWithoutGarageInput
    bookings?: BookingCreateNestedManyWithoutGarageInput
  }

  export type GarageUncheckedCreateWithoutSparePartsInput = {
    id?: string
    name: string
    licenseNumber: string
    address: string
    ownerName: string
    contactEmail?: string | null
    contactPhone?: string | null
    numberOfEmployees: number
    rating?: number | null
    reviewCount?: number | null
    isOpen?: boolean
    operatingHours?: InputJsonValue | null
    stripeAccountId?: string | null
    location: InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    status?: $Enums.VerificationStatus
    rejectionReason?: string | null
    ownerId: string
    services?: GarageServiceUncheckedCreateNestedManyWithoutGarageInput
    bookings?: BookingUncheckedCreateNestedManyWithoutGarageInput
  }

  export type GarageCreateOrConnectWithoutSparePartsInput = {
    where: GarageWhereUniqueInput
    create: XOR<GarageCreateWithoutSparePartsInput, GarageUncheckedCreateWithoutSparePartsInput>
  }

  export type GarageUpsertWithoutSparePartsInput = {
    update: XOR<GarageUpdateWithoutSparePartsInput, GarageUncheckedUpdateWithoutSparePartsInput>
    create: XOR<GarageCreateWithoutSparePartsInput, GarageUncheckedCreateWithoutSparePartsInput>
    where?: GarageWhereInput
  }

  export type GarageUpdateToOneWithWhereWithoutSparePartsInput = {
    where?: GarageWhereInput
    data: XOR<GarageUpdateWithoutSparePartsInput, GarageUncheckedUpdateWithoutSparePartsInput>
  }

  export type GarageUpdateWithoutSparePartsInput = {
    name?: StringFieldUpdateOperationsInput | string
    licenseNumber?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    ownerName?: StringFieldUpdateOperationsInput | string
    contactEmail?: NullableStringFieldUpdateOperationsInput | string | null
    contactPhone?: NullableStringFieldUpdateOperationsInput | string | null
    numberOfEmployees?: IntFieldUpdateOperationsInput | number
    rating?: NullableFloatFieldUpdateOperationsInput | number | null
    reviewCount?: NullableIntFieldUpdateOperationsInput | number | null
    isOpen?: BoolFieldUpdateOperationsInput | boolean
    operatingHours?: InputJsonValue | InputJsonValue | null
    stripeAccountId?: NullableStringFieldUpdateOperationsInput | string | null
    location?: InputJsonValue | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumVerificationStatusFieldUpdateOperationsInput | $Enums.VerificationStatus
    rejectionReason?: NullableStringFieldUpdateOperationsInput | string | null
    owner?: UserUpdateOneRequiredWithoutGarageNestedInput
    services?: GarageServiceUpdateManyWithoutGarageNestedInput
    bookings?: BookingUpdateManyWithoutGarageNestedInput
  }

  export type GarageUncheckedUpdateWithoutSparePartsInput = {
    name?: StringFieldUpdateOperationsInput | string
    licenseNumber?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    ownerName?: StringFieldUpdateOperationsInput | string
    contactEmail?: NullableStringFieldUpdateOperationsInput | string | null
    contactPhone?: NullableStringFieldUpdateOperationsInput | string | null
    numberOfEmployees?: IntFieldUpdateOperationsInput | number
    rating?: NullableFloatFieldUpdateOperationsInput | number | null
    reviewCount?: NullableIntFieldUpdateOperationsInput | number | null
    isOpen?: BoolFieldUpdateOperationsInput | boolean
    operatingHours?: InputJsonValue | InputJsonValue | null
    stripeAccountId?: NullableStringFieldUpdateOperationsInput | string | null
    location?: InputJsonValue | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumVerificationStatusFieldUpdateOperationsInput | $Enums.VerificationStatus
    rejectionReason?: NullableStringFieldUpdateOperationsInput | string | null
    ownerId?: StringFieldUpdateOperationsInput | string
    services?: GarageServiceUncheckedUpdateManyWithoutGarageNestedInput
    bookings?: BookingUncheckedUpdateManyWithoutGarageNestedInput
  }

  export type UserCreateWithoutBookingsInput = {
    id?: string
    clerkId: string
    email: string
    firstName: string
    lastName?: string | null
    phone: string
    role?: UserCreateroleInput | $Enums.Role[]
    isPremium?: boolean
    isBanned?: boolean
    unsafeMetadata?: InputJsonValue | null
    createdAt?: Date | string
    updatedAt?: Date | string
    stripeCustomerId?: string | null
    vehicles?: VehicleCreateNestedManyWithoutUserInput
    garage?: GarageCreateNestedOneWithoutOwnerInput
    towTruck?: TowTruckCreateNestedOneWithoutOwnerInput
  }

  export type UserUncheckedCreateWithoutBookingsInput = {
    id?: string
    clerkId: string
    email: string
    firstName: string
    lastName?: string | null
    phone: string
    role?: UserCreateroleInput | $Enums.Role[]
    isPremium?: boolean
    isBanned?: boolean
    unsafeMetadata?: InputJsonValue | null
    createdAt?: Date | string
    updatedAt?: Date | string
    stripeCustomerId?: string | null
    vehicles?: VehicleUncheckedCreateNestedManyWithoutUserInput
    garage?: GarageUncheckedCreateNestedOneWithoutOwnerInput
    towTruck?: TowTruckUncheckedCreateNestedOneWithoutOwnerInput
  }

  export type UserCreateOrConnectWithoutBookingsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutBookingsInput, UserUncheckedCreateWithoutBookingsInput>
  }

  export type VehicleCreateWithoutBookingsInput = {
    id?: string
    brand: string
    name: string
    model: string
    year: number
    plateNumber: string
    color?: string | null
    type: $Enums.VehicleType
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutVehiclesInput
  }

  export type VehicleUncheckedCreateWithoutBookingsInput = {
    id?: string
    brand: string
    name: string
    model: string
    year: number
    plateNumber: string
    color?: string | null
    type: $Enums.VehicleType
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: string
  }

  export type VehicleCreateOrConnectWithoutBookingsInput = {
    where: VehicleWhereUniqueInput
    create: XOR<VehicleCreateWithoutBookingsInput, VehicleUncheckedCreateWithoutBookingsInput>
  }

  export type ServiceCreateWithoutBookingsInput = {
    id?: string
    name: string
    description: string
    icon?: string | null
    type: string
    offeredByGarages?: GarageServiceCreateNestedManyWithoutServiceInput
  }

  export type ServiceUncheckedCreateWithoutBookingsInput = {
    id?: string
    name: string
    description: string
    icon?: string | null
    type: string
    offeredByGarages?: GarageServiceUncheckedCreateNestedManyWithoutServiceInput
  }

  export type ServiceCreateOrConnectWithoutBookingsInput = {
    where: ServiceWhereUniqueInput
    create: XOR<ServiceCreateWithoutBookingsInput, ServiceUncheckedCreateWithoutBookingsInput>
  }

  export type GarageCreateWithoutBookingsInput = {
    id?: string
    name: string
    licenseNumber: string
    address: string
    ownerName: string
    contactEmail?: string | null
    contactPhone?: string | null
    numberOfEmployees: number
    rating?: number | null
    reviewCount?: number | null
    isOpen?: boolean
    operatingHours?: InputJsonValue | null
    stripeAccountId?: string | null
    location: InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    status?: $Enums.VerificationStatus
    rejectionReason?: string | null
    owner: UserCreateNestedOneWithoutGarageInput
    services?: GarageServiceCreateNestedManyWithoutGarageInput
    spareParts?: SparePartCreateNestedManyWithoutGarageInput
  }

  export type GarageUncheckedCreateWithoutBookingsInput = {
    id?: string
    name: string
    licenseNumber: string
    address: string
    ownerName: string
    contactEmail?: string | null
    contactPhone?: string | null
    numberOfEmployees: number
    rating?: number | null
    reviewCount?: number | null
    isOpen?: boolean
    operatingHours?: InputJsonValue | null
    stripeAccountId?: string | null
    location: InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    status?: $Enums.VerificationStatus
    rejectionReason?: string | null
    ownerId: string
    services?: GarageServiceUncheckedCreateNestedManyWithoutGarageInput
    spareParts?: SparePartUncheckedCreateNestedManyWithoutGarageInput
  }

  export type GarageCreateOrConnectWithoutBookingsInput = {
    where: GarageWhereUniqueInput
    create: XOR<GarageCreateWithoutBookingsInput, GarageUncheckedCreateWithoutBookingsInput>
  }

  export type GarageServiceCreateWithoutBookingsInput = {
    id?: string
    price: number
    garage: GarageCreateNestedOneWithoutServicesInput
    service: ServiceCreateNestedOneWithoutOfferedByGaragesInput
  }

  export type GarageServiceUncheckedCreateWithoutBookingsInput = {
    id?: string
    price: number
    garageId: string
    serviceId: string
  }

  export type GarageServiceCreateOrConnectWithoutBookingsInput = {
    where: GarageServiceWhereUniqueInput
    create: XOR<GarageServiceCreateWithoutBookingsInput, GarageServiceUncheckedCreateWithoutBookingsInput>
  }

  export type TowTruckCreateWithoutBookingsInput = {
    id?: string
    name: string
    driverName: string
    model: string
    make: string
    year: number
    plateNumber: string
    licenseNumber: string
    status?: $Enums.VerificationStatus
    rejectionReason?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    stripeAccountId?: string | null
    owner: UserCreateNestedOneWithoutTowTruckInput
    services?: TowTruckServiceCreateNestedManyWithoutTowTruckInput
    liveLocation?: LiveTruckLocationCreateNestedOneWithoutTowTruckInput
  }

  export type TowTruckUncheckedCreateWithoutBookingsInput = {
    id?: string
    name: string
    driverName: string
    model: string
    make: string
    year: number
    plateNumber: string
    licenseNumber: string
    status?: $Enums.VerificationStatus
    rejectionReason?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    ownerId: string
    stripeAccountId?: string | null
    services?: TowTruckServiceUncheckedCreateNestedManyWithoutTowTruckInput
    liveLocation?: LiveTruckLocationUncheckedCreateNestedOneWithoutTowTruckInput
  }

  export type TowTruckCreateOrConnectWithoutBookingsInput = {
    where: TowTruckWhereUniqueInput
    create: XOR<TowTruckCreateWithoutBookingsInput, TowTruckUncheckedCreateWithoutBookingsInput>
  }

  export type TowTruckServiceCreateWithoutBookingsInput = {
    id?: string
    price: number
    vehicleType: $Enums.VehicleType
    towTruck: TowTruckCreateNestedOneWithoutServicesInput
  }

  export type TowTruckServiceUncheckedCreateWithoutBookingsInput = {
    id?: string
    price: number
    vehicleType: $Enums.VehicleType
    towTruckId: string
  }

  export type TowTruckServiceCreateOrConnectWithoutBookingsInput = {
    where: TowTruckServiceWhereUniqueInput
    create: XOR<TowTruckServiceCreateWithoutBookingsInput, TowTruckServiceUncheckedCreateWithoutBookingsInput>
  }

  export type PromoCodeCreateWithoutBookingsInput = {
    id?: string
    code: string
    discountType: $Enums.DiscountType
    discountValue: number
    expiresAt: Date | string
    maxUses?: number | null
    timesUsed?: number
    isActive?: boolean
  }

  export type PromoCodeUncheckedCreateWithoutBookingsInput = {
    id?: string
    code: string
    discountType: $Enums.DiscountType
    discountValue: number
    expiresAt: Date | string
    maxUses?: number | null
    timesUsed?: number
    isActive?: boolean
  }

  export type PromoCodeCreateOrConnectWithoutBookingsInput = {
    where: PromoCodeWhereUniqueInput
    create: XOR<PromoCodeCreateWithoutBookingsInput, PromoCodeUncheckedCreateWithoutBookingsInput>
  }

  export type UserUpsertWithoutBookingsInput = {
    update: XOR<UserUpdateWithoutBookingsInput, UserUncheckedUpdateWithoutBookingsInput>
    create: XOR<UserCreateWithoutBookingsInput, UserUncheckedCreateWithoutBookingsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutBookingsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutBookingsInput, UserUncheckedUpdateWithoutBookingsInput>
  }

  export type UserUpdateWithoutBookingsInput = {
    clerkId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: StringFieldUpdateOperationsInput | string
    role?: UserUpdateroleInput | $Enums.Role[]
    isPremium?: BoolFieldUpdateOperationsInput | boolean
    isBanned?: BoolFieldUpdateOperationsInput | boolean
    unsafeMetadata?: InputJsonValue | InputJsonValue | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    stripeCustomerId?: NullableStringFieldUpdateOperationsInput | string | null
    vehicles?: VehicleUpdateManyWithoutUserNestedInput
    garage?: GarageUpdateOneWithoutOwnerNestedInput
    towTruck?: TowTruckUpdateOneWithoutOwnerNestedInput
  }

  export type UserUncheckedUpdateWithoutBookingsInput = {
    clerkId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: StringFieldUpdateOperationsInput | string
    role?: UserUpdateroleInput | $Enums.Role[]
    isPremium?: BoolFieldUpdateOperationsInput | boolean
    isBanned?: BoolFieldUpdateOperationsInput | boolean
    unsafeMetadata?: InputJsonValue | InputJsonValue | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    stripeCustomerId?: NullableStringFieldUpdateOperationsInput | string | null
    vehicles?: VehicleUncheckedUpdateManyWithoutUserNestedInput
    garage?: GarageUncheckedUpdateOneWithoutOwnerNestedInput
    towTruck?: TowTruckUncheckedUpdateOneWithoutOwnerNestedInput
  }

  export type VehicleUpsertWithoutBookingsInput = {
    update: XOR<VehicleUpdateWithoutBookingsInput, VehicleUncheckedUpdateWithoutBookingsInput>
    create: XOR<VehicleCreateWithoutBookingsInput, VehicleUncheckedCreateWithoutBookingsInput>
    where?: VehicleWhereInput
  }

  export type VehicleUpdateToOneWithWhereWithoutBookingsInput = {
    where?: VehicleWhereInput
    data: XOR<VehicleUpdateWithoutBookingsInput, VehicleUncheckedUpdateWithoutBookingsInput>
  }

  export type VehicleUpdateWithoutBookingsInput = {
    brand?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    model?: StringFieldUpdateOperationsInput | string
    year?: IntFieldUpdateOperationsInput | number
    plateNumber?: StringFieldUpdateOperationsInput | string
    color?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumVehicleTypeFieldUpdateOperationsInput | $Enums.VehicleType
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutVehiclesNestedInput
  }

  export type VehicleUncheckedUpdateWithoutBookingsInput = {
    brand?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    model?: StringFieldUpdateOperationsInput | string
    year?: IntFieldUpdateOperationsInput | number
    plateNumber?: StringFieldUpdateOperationsInput | string
    color?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumVehicleTypeFieldUpdateOperationsInput | $Enums.VehicleType
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
  }

  export type ServiceUpsertWithoutBookingsInput = {
    update: XOR<ServiceUpdateWithoutBookingsInput, ServiceUncheckedUpdateWithoutBookingsInput>
    create: XOR<ServiceCreateWithoutBookingsInput, ServiceUncheckedCreateWithoutBookingsInput>
    where?: ServiceWhereInput
  }

  export type ServiceUpdateToOneWithWhereWithoutBookingsInput = {
    where?: ServiceWhereInput
    data: XOR<ServiceUpdateWithoutBookingsInput, ServiceUncheckedUpdateWithoutBookingsInput>
  }

  export type ServiceUpdateWithoutBookingsInput = {
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    icon?: NullableStringFieldUpdateOperationsInput | string | null
    type?: StringFieldUpdateOperationsInput | string
    offeredByGarages?: GarageServiceUpdateManyWithoutServiceNestedInput
  }

  export type ServiceUncheckedUpdateWithoutBookingsInput = {
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    icon?: NullableStringFieldUpdateOperationsInput | string | null
    type?: StringFieldUpdateOperationsInput | string
    offeredByGarages?: GarageServiceUncheckedUpdateManyWithoutServiceNestedInput
  }

  export type GarageUpsertWithoutBookingsInput = {
    update: XOR<GarageUpdateWithoutBookingsInput, GarageUncheckedUpdateWithoutBookingsInput>
    create: XOR<GarageCreateWithoutBookingsInput, GarageUncheckedCreateWithoutBookingsInput>
    where?: GarageWhereInput
  }

  export type GarageUpdateToOneWithWhereWithoutBookingsInput = {
    where?: GarageWhereInput
    data: XOR<GarageUpdateWithoutBookingsInput, GarageUncheckedUpdateWithoutBookingsInput>
  }

  export type GarageUpdateWithoutBookingsInput = {
    name?: StringFieldUpdateOperationsInput | string
    licenseNumber?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    ownerName?: StringFieldUpdateOperationsInput | string
    contactEmail?: NullableStringFieldUpdateOperationsInput | string | null
    contactPhone?: NullableStringFieldUpdateOperationsInput | string | null
    numberOfEmployees?: IntFieldUpdateOperationsInput | number
    rating?: NullableFloatFieldUpdateOperationsInput | number | null
    reviewCount?: NullableIntFieldUpdateOperationsInput | number | null
    isOpen?: BoolFieldUpdateOperationsInput | boolean
    operatingHours?: InputJsonValue | InputJsonValue | null
    stripeAccountId?: NullableStringFieldUpdateOperationsInput | string | null
    location?: InputJsonValue | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumVerificationStatusFieldUpdateOperationsInput | $Enums.VerificationStatus
    rejectionReason?: NullableStringFieldUpdateOperationsInput | string | null
    owner?: UserUpdateOneRequiredWithoutGarageNestedInput
    services?: GarageServiceUpdateManyWithoutGarageNestedInput
    spareParts?: SparePartUpdateManyWithoutGarageNestedInput
  }

  export type GarageUncheckedUpdateWithoutBookingsInput = {
    name?: StringFieldUpdateOperationsInput | string
    licenseNumber?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    ownerName?: StringFieldUpdateOperationsInput | string
    contactEmail?: NullableStringFieldUpdateOperationsInput | string | null
    contactPhone?: NullableStringFieldUpdateOperationsInput | string | null
    numberOfEmployees?: IntFieldUpdateOperationsInput | number
    rating?: NullableFloatFieldUpdateOperationsInput | number | null
    reviewCount?: NullableIntFieldUpdateOperationsInput | number | null
    isOpen?: BoolFieldUpdateOperationsInput | boolean
    operatingHours?: InputJsonValue | InputJsonValue | null
    stripeAccountId?: NullableStringFieldUpdateOperationsInput | string | null
    location?: InputJsonValue | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumVerificationStatusFieldUpdateOperationsInput | $Enums.VerificationStatus
    rejectionReason?: NullableStringFieldUpdateOperationsInput | string | null
    ownerId?: StringFieldUpdateOperationsInput | string
    services?: GarageServiceUncheckedUpdateManyWithoutGarageNestedInput
    spareParts?: SparePartUncheckedUpdateManyWithoutGarageNestedInput
  }

  export type GarageServiceUpsertWithoutBookingsInput = {
    update: XOR<GarageServiceUpdateWithoutBookingsInput, GarageServiceUncheckedUpdateWithoutBookingsInput>
    create: XOR<GarageServiceCreateWithoutBookingsInput, GarageServiceUncheckedCreateWithoutBookingsInput>
    where?: GarageServiceWhereInput
  }

  export type GarageServiceUpdateToOneWithWhereWithoutBookingsInput = {
    where?: GarageServiceWhereInput
    data: XOR<GarageServiceUpdateWithoutBookingsInput, GarageServiceUncheckedUpdateWithoutBookingsInput>
  }

  export type GarageServiceUpdateWithoutBookingsInput = {
    price?: FloatFieldUpdateOperationsInput | number
    garage?: GarageUpdateOneRequiredWithoutServicesNestedInput
    service?: ServiceUpdateOneRequiredWithoutOfferedByGaragesNestedInput
  }

  export type GarageServiceUncheckedUpdateWithoutBookingsInput = {
    price?: FloatFieldUpdateOperationsInput | number
    garageId?: StringFieldUpdateOperationsInput | string
    serviceId?: StringFieldUpdateOperationsInput | string
  }

  export type TowTruckUpsertWithoutBookingsInput = {
    update: XOR<TowTruckUpdateWithoutBookingsInput, TowTruckUncheckedUpdateWithoutBookingsInput>
    create: XOR<TowTruckCreateWithoutBookingsInput, TowTruckUncheckedCreateWithoutBookingsInput>
    where?: TowTruckWhereInput
  }

  export type TowTruckUpdateToOneWithWhereWithoutBookingsInput = {
    where?: TowTruckWhereInput
    data: XOR<TowTruckUpdateWithoutBookingsInput, TowTruckUncheckedUpdateWithoutBookingsInput>
  }

  export type TowTruckUpdateWithoutBookingsInput = {
    name?: StringFieldUpdateOperationsInput | string
    driverName?: StringFieldUpdateOperationsInput | string
    model?: StringFieldUpdateOperationsInput | string
    make?: StringFieldUpdateOperationsInput | string
    year?: IntFieldUpdateOperationsInput | number
    plateNumber?: StringFieldUpdateOperationsInput | string
    licenseNumber?: StringFieldUpdateOperationsInput | string
    status?: EnumVerificationStatusFieldUpdateOperationsInput | $Enums.VerificationStatus
    rejectionReason?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    stripeAccountId?: NullableStringFieldUpdateOperationsInput | string | null
    owner?: UserUpdateOneRequiredWithoutTowTruckNestedInput
    services?: TowTruckServiceUpdateManyWithoutTowTruckNestedInput
    liveLocation?: LiveTruckLocationUpdateOneWithoutTowTruckNestedInput
  }

  export type TowTruckUncheckedUpdateWithoutBookingsInput = {
    name?: StringFieldUpdateOperationsInput | string
    driverName?: StringFieldUpdateOperationsInput | string
    model?: StringFieldUpdateOperationsInput | string
    make?: StringFieldUpdateOperationsInput | string
    year?: IntFieldUpdateOperationsInput | number
    plateNumber?: StringFieldUpdateOperationsInput | string
    licenseNumber?: StringFieldUpdateOperationsInput | string
    status?: EnumVerificationStatusFieldUpdateOperationsInput | $Enums.VerificationStatus
    rejectionReason?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    ownerId?: StringFieldUpdateOperationsInput | string
    stripeAccountId?: NullableStringFieldUpdateOperationsInput | string | null
    services?: TowTruckServiceUncheckedUpdateManyWithoutTowTruckNestedInput
    liveLocation?: LiveTruckLocationUncheckedUpdateOneWithoutTowTruckNestedInput
  }

  export type TowTruckServiceUpsertWithoutBookingsInput = {
    update: XOR<TowTruckServiceUpdateWithoutBookingsInput, TowTruckServiceUncheckedUpdateWithoutBookingsInput>
    create: XOR<TowTruckServiceCreateWithoutBookingsInput, TowTruckServiceUncheckedCreateWithoutBookingsInput>
    where?: TowTruckServiceWhereInput
  }

  export type TowTruckServiceUpdateToOneWithWhereWithoutBookingsInput = {
    where?: TowTruckServiceWhereInput
    data: XOR<TowTruckServiceUpdateWithoutBookingsInput, TowTruckServiceUncheckedUpdateWithoutBookingsInput>
  }

  export type TowTruckServiceUpdateWithoutBookingsInput = {
    price?: FloatFieldUpdateOperationsInput | number
    vehicleType?: EnumVehicleTypeFieldUpdateOperationsInput | $Enums.VehicleType
    towTruck?: TowTruckUpdateOneRequiredWithoutServicesNestedInput
  }

  export type TowTruckServiceUncheckedUpdateWithoutBookingsInput = {
    price?: FloatFieldUpdateOperationsInput | number
    vehicleType?: EnumVehicleTypeFieldUpdateOperationsInput | $Enums.VehicleType
    towTruckId?: StringFieldUpdateOperationsInput | string
  }

  export type PromoCodeUpsertWithoutBookingsInput = {
    update: XOR<PromoCodeUpdateWithoutBookingsInput, PromoCodeUncheckedUpdateWithoutBookingsInput>
    create: XOR<PromoCodeCreateWithoutBookingsInput, PromoCodeUncheckedCreateWithoutBookingsInput>
    where?: PromoCodeWhereInput
  }

  export type PromoCodeUpdateToOneWithWhereWithoutBookingsInput = {
    where?: PromoCodeWhereInput
    data: XOR<PromoCodeUpdateWithoutBookingsInput, PromoCodeUncheckedUpdateWithoutBookingsInput>
  }

  export type PromoCodeUpdateWithoutBookingsInput = {
    code?: StringFieldUpdateOperationsInput | string
    discountType?: EnumDiscountTypeFieldUpdateOperationsInput | $Enums.DiscountType
    discountValue?: FloatFieldUpdateOperationsInput | number
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    maxUses?: NullableIntFieldUpdateOperationsInput | number | null
    timesUsed?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
  }

  export type PromoCodeUncheckedUpdateWithoutBookingsInput = {
    code?: StringFieldUpdateOperationsInput | string
    discountType?: EnumDiscountTypeFieldUpdateOperationsInput | $Enums.DiscountType
    discountValue?: FloatFieldUpdateOperationsInput | number
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    maxUses?: NullableIntFieldUpdateOperationsInput | number | null
    timesUsed?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
  }

  export type BookingCreateWithoutPromoCodeInput = {
    id?: string
    status?: $Enums.BookingStatus
    bookedAt?: Date | string
    expiresAt?: Date | string | null
    paymentExpiresAt?: Date | string | null
    notes?: string | null
    otp?: string | null
    otpExpiresAt?: Date | string | null
    pickupLocation?: InputJsonValue | null
    destinationLocation?: InputJsonValue | null
    serviceStartedAt?: Date | string | null
    serviceEndedAt?: Date | string | null
    basePrice: number
    additionalFees?: number | null
    discountAmount?: number | null
    finalAmount: number
    paymentStatus?: string
    paymentIntentId?: string | null
    userRating?: number | null
    userReview?: string | null
    providerRating?: number | null
    providerReview?: string | null
    eligibleProviderIds?: BookingCreateeligibleProviderIdsInput | string[]
    user: UserCreateNestedOneWithoutBookingsInput
    vehicle: VehicleCreateNestedOneWithoutBookingsInput
    service?: ServiceCreateNestedOneWithoutBookingsInput
    garage?: GarageCreateNestedOneWithoutBookingsInput
    garageService?: GarageServiceCreateNestedOneWithoutBookingsInput
    towTruck?: TowTruckCreateNestedOneWithoutBookingsInput
    towTruckService?: TowTruckServiceCreateNestedOneWithoutBookingsInput
  }

  export type BookingUncheckedCreateWithoutPromoCodeInput = {
    id?: string
    status?: $Enums.BookingStatus
    bookedAt?: Date | string
    expiresAt?: Date | string | null
    paymentExpiresAt?: Date | string | null
    notes?: string | null
    otp?: string | null
    otpExpiresAt?: Date | string | null
    pickupLocation?: InputJsonValue | null
    destinationLocation?: InputJsonValue | null
    serviceStartedAt?: Date | string | null
    serviceEndedAt?: Date | string | null
    basePrice: number
    additionalFees?: number | null
    discountAmount?: number | null
    finalAmount: number
    paymentStatus?: string
    paymentIntentId?: string | null
    userRating?: number | null
    userReview?: string | null
    providerRating?: number | null
    providerReview?: string | null
    userId: string
    vehicleId: string
    eligibleProviderIds?: BookingCreateeligibleProviderIdsInput | string[]
    serviceId?: string | null
    garageId?: string | null
    garageServiceId?: string | null
    towTruckId?: string | null
    towTruckServiceId?: string | null
  }

  export type BookingCreateOrConnectWithoutPromoCodeInput = {
    where: BookingWhereUniqueInput
    create: XOR<BookingCreateWithoutPromoCodeInput, BookingUncheckedCreateWithoutPromoCodeInput>
  }

  export type BookingCreateManyPromoCodeInputEnvelope = {
    data: BookingCreateManyPromoCodeInput | BookingCreateManyPromoCodeInput[]
  }

  export type BookingUpsertWithWhereUniqueWithoutPromoCodeInput = {
    where: BookingWhereUniqueInput
    update: XOR<BookingUpdateWithoutPromoCodeInput, BookingUncheckedUpdateWithoutPromoCodeInput>
    create: XOR<BookingCreateWithoutPromoCodeInput, BookingUncheckedCreateWithoutPromoCodeInput>
  }

  export type BookingUpdateWithWhereUniqueWithoutPromoCodeInput = {
    where: BookingWhereUniqueInput
    data: XOR<BookingUpdateWithoutPromoCodeInput, BookingUncheckedUpdateWithoutPromoCodeInput>
  }

  export type BookingUpdateManyWithWhereWithoutPromoCodeInput = {
    where: BookingScalarWhereInput
    data: XOR<BookingUpdateManyMutationInput, BookingUncheckedUpdateManyWithoutPromoCodeInput>
  }

  export type VehicleCreateManyUserInput = {
    id?: string
    brand: string
    name: string
    model: string
    year: number
    plateNumber: string
    color?: string | null
    type: $Enums.VehicleType
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BookingCreateManyUserInput = {
    id?: string
    status?: $Enums.BookingStatus
    bookedAt?: Date | string
    expiresAt?: Date | string | null
    paymentExpiresAt?: Date | string | null
    notes?: string | null
    otp?: string | null
    otpExpiresAt?: Date | string | null
    pickupLocation?: InputJsonValue | null
    destinationLocation?: InputJsonValue | null
    serviceStartedAt?: Date | string | null
    serviceEndedAt?: Date | string | null
    basePrice: number
    additionalFees?: number | null
    discountAmount?: number | null
    finalAmount: number
    paymentStatus?: string
    paymentIntentId?: string | null
    userRating?: number | null
    userReview?: string | null
    providerRating?: number | null
    providerReview?: string | null
    vehicleId: string
    eligibleProviderIds?: BookingCreateeligibleProviderIdsInput | string[]
    serviceId?: string | null
    garageId?: string | null
    garageServiceId?: string | null
    towTruckId?: string | null
    towTruckServiceId?: string | null
    promoCodeId?: string | null
  }

  export type VehicleUpdateWithoutUserInput = {
    brand?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    model?: StringFieldUpdateOperationsInput | string
    year?: IntFieldUpdateOperationsInput | number
    plateNumber?: StringFieldUpdateOperationsInput | string
    color?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumVehicleTypeFieldUpdateOperationsInput | $Enums.VehicleType
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    bookings?: BookingUpdateManyWithoutVehicleNestedInput
  }

  export type VehicleUncheckedUpdateWithoutUserInput = {
    brand?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    model?: StringFieldUpdateOperationsInput | string
    year?: IntFieldUpdateOperationsInput | number
    plateNumber?: StringFieldUpdateOperationsInput | string
    color?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumVehicleTypeFieldUpdateOperationsInput | $Enums.VehicleType
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    bookings?: BookingUncheckedUpdateManyWithoutVehicleNestedInput
  }

  export type VehicleUncheckedUpdateManyWithoutUserInput = {
    brand?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    model?: StringFieldUpdateOperationsInput | string
    year?: IntFieldUpdateOperationsInput | number
    plateNumber?: StringFieldUpdateOperationsInput | string
    color?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumVehicleTypeFieldUpdateOperationsInput | $Enums.VehicleType
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BookingUpdateWithoutUserInput = {
    status?: EnumBookingStatusFieldUpdateOperationsInput | $Enums.BookingStatus
    bookedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    paymentExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    otp?: NullableStringFieldUpdateOperationsInput | string | null
    otpExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    pickupLocation?: InputJsonValue | InputJsonValue | null
    destinationLocation?: InputJsonValue | InputJsonValue | null
    serviceStartedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    serviceEndedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    basePrice?: FloatFieldUpdateOperationsInput | number
    additionalFees?: NullableFloatFieldUpdateOperationsInput | number | null
    discountAmount?: NullableFloatFieldUpdateOperationsInput | number | null
    finalAmount?: FloatFieldUpdateOperationsInput | number
    paymentStatus?: StringFieldUpdateOperationsInput | string
    paymentIntentId?: NullableStringFieldUpdateOperationsInput | string | null
    userRating?: NullableIntFieldUpdateOperationsInput | number | null
    userReview?: NullableStringFieldUpdateOperationsInput | string | null
    providerRating?: NullableIntFieldUpdateOperationsInput | number | null
    providerReview?: NullableStringFieldUpdateOperationsInput | string | null
    eligibleProviderIds?: BookingUpdateeligibleProviderIdsInput | string[]
    vehicle?: VehicleUpdateOneRequiredWithoutBookingsNestedInput
    service?: ServiceUpdateOneWithoutBookingsNestedInput
    garage?: GarageUpdateOneWithoutBookingsNestedInput
    garageService?: GarageServiceUpdateOneWithoutBookingsNestedInput
    towTruck?: TowTruckUpdateOneWithoutBookingsNestedInput
    towTruckService?: TowTruckServiceUpdateOneWithoutBookingsNestedInput
    promoCode?: PromoCodeUpdateOneWithoutBookingsNestedInput
  }

  export type BookingUncheckedUpdateWithoutUserInput = {
    status?: EnumBookingStatusFieldUpdateOperationsInput | $Enums.BookingStatus
    bookedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    paymentExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    otp?: NullableStringFieldUpdateOperationsInput | string | null
    otpExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    pickupLocation?: InputJsonValue | InputJsonValue | null
    destinationLocation?: InputJsonValue | InputJsonValue | null
    serviceStartedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    serviceEndedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    basePrice?: FloatFieldUpdateOperationsInput | number
    additionalFees?: NullableFloatFieldUpdateOperationsInput | number | null
    discountAmount?: NullableFloatFieldUpdateOperationsInput | number | null
    finalAmount?: FloatFieldUpdateOperationsInput | number
    paymentStatus?: StringFieldUpdateOperationsInput | string
    paymentIntentId?: NullableStringFieldUpdateOperationsInput | string | null
    userRating?: NullableIntFieldUpdateOperationsInput | number | null
    userReview?: NullableStringFieldUpdateOperationsInput | string | null
    providerRating?: NullableIntFieldUpdateOperationsInput | number | null
    providerReview?: NullableStringFieldUpdateOperationsInput | string | null
    vehicleId?: StringFieldUpdateOperationsInput | string
    eligibleProviderIds?: BookingUpdateeligibleProviderIdsInput | string[]
    serviceId?: NullableStringFieldUpdateOperationsInput | string | null
    garageId?: NullableStringFieldUpdateOperationsInput | string | null
    garageServiceId?: NullableStringFieldUpdateOperationsInput | string | null
    towTruckId?: NullableStringFieldUpdateOperationsInput | string | null
    towTruckServiceId?: NullableStringFieldUpdateOperationsInput | string | null
    promoCodeId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type BookingUncheckedUpdateManyWithoutUserInput = {
    status?: EnumBookingStatusFieldUpdateOperationsInput | $Enums.BookingStatus
    bookedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    paymentExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    otp?: NullableStringFieldUpdateOperationsInput | string | null
    otpExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    pickupLocation?: InputJsonValue | InputJsonValue | null
    destinationLocation?: InputJsonValue | InputJsonValue | null
    serviceStartedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    serviceEndedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    basePrice?: FloatFieldUpdateOperationsInput | number
    additionalFees?: NullableFloatFieldUpdateOperationsInput | number | null
    discountAmount?: NullableFloatFieldUpdateOperationsInput | number | null
    finalAmount?: FloatFieldUpdateOperationsInput | number
    paymentStatus?: StringFieldUpdateOperationsInput | string
    paymentIntentId?: NullableStringFieldUpdateOperationsInput | string | null
    userRating?: NullableIntFieldUpdateOperationsInput | number | null
    userReview?: NullableStringFieldUpdateOperationsInput | string | null
    providerRating?: NullableIntFieldUpdateOperationsInput | number | null
    providerReview?: NullableStringFieldUpdateOperationsInput | string | null
    vehicleId?: StringFieldUpdateOperationsInput | string
    eligibleProviderIds?: BookingUpdateeligibleProviderIdsInput | string[]
    serviceId?: NullableStringFieldUpdateOperationsInput | string | null
    garageId?: NullableStringFieldUpdateOperationsInput | string | null
    garageServiceId?: NullableStringFieldUpdateOperationsInput | string | null
    towTruckId?: NullableStringFieldUpdateOperationsInput | string | null
    towTruckServiceId?: NullableStringFieldUpdateOperationsInput | string | null
    promoCodeId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type BookingCreateManyVehicleInput = {
    id?: string
    status?: $Enums.BookingStatus
    bookedAt?: Date | string
    expiresAt?: Date | string | null
    paymentExpiresAt?: Date | string | null
    notes?: string | null
    otp?: string | null
    otpExpiresAt?: Date | string | null
    pickupLocation?: InputJsonValue | null
    destinationLocation?: InputJsonValue | null
    serviceStartedAt?: Date | string | null
    serviceEndedAt?: Date | string | null
    basePrice: number
    additionalFees?: number | null
    discountAmount?: number | null
    finalAmount: number
    paymentStatus?: string
    paymentIntentId?: string | null
    userRating?: number | null
    userReview?: string | null
    providerRating?: number | null
    providerReview?: string | null
    userId: string
    eligibleProviderIds?: BookingCreateeligibleProviderIdsInput | string[]
    serviceId?: string | null
    garageId?: string | null
    garageServiceId?: string | null
    towTruckId?: string | null
    towTruckServiceId?: string | null
    promoCodeId?: string | null
  }

  export type BookingUpdateWithoutVehicleInput = {
    status?: EnumBookingStatusFieldUpdateOperationsInput | $Enums.BookingStatus
    bookedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    paymentExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    otp?: NullableStringFieldUpdateOperationsInput | string | null
    otpExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    pickupLocation?: InputJsonValue | InputJsonValue | null
    destinationLocation?: InputJsonValue | InputJsonValue | null
    serviceStartedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    serviceEndedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    basePrice?: FloatFieldUpdateOperationsInput | number
    additionalFees?: NullableFloatFieldUpdateOperationsInput | number | null
    discountAmount?: NullableFloatFieldUpdateOperationsInput | number | null
    finalAmount?: FloatFieldUpdateOperationsInput | number
    paymentStatus?: StringFieldUpdateOperationsInput | string
    paymentIntentId?: NullableStringFieldUpdateOperationsInput | string | null
    userRating?: NullableIntFieldUpdateOperationsInput | number | null
    userReview?: NullableStringFieldUpdateOperationsInput | string | null
    providerRating?: NullableIntFieldUpdateOperationsInput | number | null
    providerReview?: NullableStringFieldUpdateOperationsInput | string | null
    eligibleProviderIds?: BookingUpdateeligibleProviderIdsInput | string[]
    user?: UserUpdateOneRequiredWithoutBookingsNestedInput
    service?: ServiceUpdateOneWithoutBookingsNestedInput
    garage?: GarageUpdateOneWithoutBookingsNestedInput
    garageService?: GarageServiceUpdateOneWithoutBookingsNestedInput
    towTruck?: TowTruckUpdateOneWithoutBookingsNestedInput
    towTruckService?: TowTruckServiceUpdateOneWithoutBookingsNestedInput
    promoCode?: PromoCodeUpdateOneWithoutBookingsNestedInput
  }

  export type BookingUncheckedUpdateWithoutVehicleInput = {
    status?: EnumBookingStatusFieldUpdateOperationsInput | $Enums.BookingStatus
    bookedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    paymentExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    otp?: NullableStringFieldUpdateOperationsInput | string | null
    otpExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    pickupLocation?: InputJsonValue | InputJsonValue | null
    destinationLocation?: InputJsonValue | InputJsonValue | null
    serviceStartedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    serviceEndedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    basePrice?: FloatFieldUpdateOperationsInput | number
    additionalFees?: NullableFloatFieldUpdateOperationsInput | number | null
    discountAmount?: NullableFloatFieldUpdateOperationsInput | number | null
    finalAmount?: FloatFieldUpdateOperationsInput | number
    paymentStatus?: StringFieldUpdateOperationsInput | string
    paymentIntentId?: NullableStringFieldUpdateOperationsInput | string | null
    userRating?: NullableIntFieldUpdateOperationsInput | number | null
    userReview?: NullableStringFieldUpdateOperationsInput | string | null
    providerRating?: NullableIntFieldUpdateOperationsInput | number | null
    providerReview?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: StringFieldUpdateOperationsInput | string
    eligibleProviderIds?: BookingUpdateeligibleProviderIdsInput | string[]
    serviceId?: NullableStringFieldUpdateOperationsInput | string | null
    garageId?: NullableStringFieldUpdateOperationsInput | string | null
    garageServiceId?: NullableStringFieldUpdateOperationsInput | string | null
    towTruckId?: NullableStringFieldUpdateOperationsInput | string | null
    towTruckServiceId?: NullableStringFieldUpdateOperationsInput | string | null
    promoCodeId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type BookingUncheckedUpdateManyWithoutVehicleInput = {
    status?: EnumBookingStatusFieldUpdateOperationsInput | $Enums.BookingStatus
    bookedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    paymentExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    otp?: NullableStringFieldUpdateOperationsInput | string | null
    otpExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    pickupLocation?: InputJsonValue | InputJsonValue | null
    destinationLocation?: InputJsonValue | InputJsonValue | null
    serviceStartedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    serviceEndedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    basePrice?: FloatFieldUpdateOperationsInput | number
    additionalFees?: NullableFloatFieldUpdateOperationsInput | number | null
    discountAmount?: NullableFloatFieldUpdateOperationsInput | number | null
    finalAmount?: FloatFieldUpdateOperationsInput | number
    paymentStatus?: StringFieldUpdateOperationsInput | string
    paymentIntentId?: NullableStringFieldUpdateOperationsInput | string | null
    userRating?: NullableIntFieldUpdateOperationsInput | number | null
    userReview?: NullableStringFieldUpdateOperationsInput | string | null
    providerRating?: NullableIntFieldUpdateOperationsInput | number | null
    providerReview?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: StringFieldUpdateOperationsInput | string
    eligibleProviderIds?: BookingUpdateeligibleProviderIdsInput | string[]
    serviceId?: NullableStringFieldUpdateOperationsInput | string | null
    garageId?: NullableStringFieldUpdateOperationsInput | string | null
    garageServiceId?: NullableStringFieldUpdateOperationsInput | string | null
    towTruckId?: NullableStringFieldUpdateOperationsInput | string | null
    towTruckServiceId?: NullableStringFieldUpdateOperationsInput | string | null
    promoCodeId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type GarageServiceCreateManyServiceInput = {
    id?: string
    price: number
    garageId: string
  }

  export type BookingCreateManyServiceInput = {
    id?: string
    status?: $Enums.BookingStatus
    bookedAt?: Date | string
    expiresAt?: Date | string | null
    paymentExpiresAt?: Date | string | null
    notes?: string | null
    otp?: string | null
    otpExpiresAt?: Date | string | null
    pickupLocation?: InputJsonValue | null
    destinationLocation?: InputJsonValue | null
    serviceStartedAt?: Date | string | null
    serviceEndedAt?: Date | string | null
    basePrice: number
    additionalFees?: number | null
    discountAmount?: number | null
    finalAmount: number
    paymentStatus?: string
    paymentIntentId?: string | null
    userRating?: number | null
    userReview?: string | null
    providerRating?: number | null
    providerReview?: string | null
    userId: string
    vehicleId: string
    eligibleProviderIds?: BookingCreateeligibleProviderIdsInput | string[]
    garageId?: string | null
    garageServiceId?: string | null
    towTruckId?: string | null
    towTruckServiceId?: string | null
    promoCodeId?: string | null
  }

  export type GarageServiceUpdateWithoutServiceInput = {
    price?: FloatFieldUpdateOperationsInput | number
    garage?: GarageUpdateOneRequiredWithoutServicesNestedInput
    bookings?: BookingUpdateManyWithoutGarageServiceNestedInput
  }

  export type GarageServiceUncheckedUpdateWithoutServiceInput = {
    price?: FloatFieldUpdateOperationsInput | number
    garageId?: StringFieldUpdateOperationsInput | string
    bookings?: BookingUncheckedUpdateManyWithoutGarageServiceNestedInput
  }

  export type GarageServiceUncheckedUpdateManyWithoutServiceInput = {
    price?: FloatFieldUpdateOperationsInput | number
    garageId?: StringFieldUpdateOperationsInput | string
  }

  export type BookingUpdateWithoutServiceInput = {
    status?: EnumBookingStatusFieldUpdateOperationsInput | $Enums.BookingStatus
    bookedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    paymentExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    otp?: NullableStringFieldUpdateOperationsInput | string | null
    otpExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    pickupLocation?: InputJsonValue | InputJsonValue | null
    destinationLocation?: InputJsonValue | InputJsonValue | null
    serviceStartedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    serviceEndedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    basePrice?: FloatFieldUpdateOperationsInput | number
    additionalFees?: NullableFloatFieldUpdateOperationsInput | number | null
    discountAmount?: NullableFloatFieldUpdateOperationsInput | number | null
    finalAmount?: FloatFieldUpdateOperationsInput | number
    paymentStatus?: StringFieldUpdateOperationsInput | string
    paymentIntentId?: NullableStringFieldUpdateOperationsInput | string | null
    userRating?: NullableIntFieldUpdateOperationsInput | number | null
    userReview?: NullableStringFieldUpdateOperationsInput | string | null
    providerRating?: NullableIntFieldUpdateOperationsInput | number | null
    providerReview?: NullableStringFieldUpdateOperationsInput | string | null
    eligibleProviderIds?: BookingUpdateeligibleProviderIdsInput | string[]
    user?: UserUpdateOneRequiredWithoutBookingsNestedInput
    vehicle?: VehicleUpdateOneRequiredWithoutBookingsNestedInput
    garage?: GarageUpdateOneWithoutBookingsNestedInput
    garageService?: GarageServiceUpdateOneWithoutBookingsNestedInput
    towTruck?: TowTruckUpdateOneWithoutBookingsNestedInput
    towTruckService?: TowTruckServiceUpdateOneWithoutBookingsNestedInput
    promoCode?: PromoCodeUpdateOneWithoutBookingsNestedInput
  }

  export type BookingUncheckedUpdateWithoutServiceInput = {
    status?: EnumBookingStatusFieldUpdateOperationsInput | $Enums.BookingStatus
    bookedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    paymentExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    otp?: NullableStringFieldUpdateOperationsInput | string | null
    otpExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    pickupLocation?: InputJsonValue | InputJsonValue | null
    destinationLocation?: InputJsonValue | InputJsonValue | null
    serviceStartedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    serviceEndedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    basePrice?: FloatFieldUpdateOperationsInput | number
    additionalFees?: NullableFloatFieldUpdateOperationsInput | number | null
    discountAmount?: NullableFloatFieldUpdateOperationsInput | number | null
    finalAmount?: FloatFieldUpdateOperationsInput | number
    paymentStatus?: StringFieldUpdateOperationsInput | string
    paymentIntentId?: NullableStringFieldUpdateOperationsInput | string | null
    userRating?: NullableIntFieldUpdateOperationsInput | number | null
    userReview?: NullableStringFieldUpdateOperationsInput | string | null
    providerRating?: NullableIntFieldUpdateOperationsInput | number | null
    providerReview?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: StringFieldUpdateOperationsInput | string
    vehicleId?: StringFieldUpdateOperationsInput | string
    eligibleProviderIds?: BookingUpdateeligibleProviderIdsInput | string[]
    garageId?: NullableStringFieldUpdateOperationsInput | string | null
    garageServiceId?: NullableStringFieldUpdateOperationsInput | string | null
    towTruckId?: NullableStringFieldUpdateOperationsInput | string | null
    towTruckServiceId?: NullableStringFieldUpdateOperationsInput | string | null
    promoCodeId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type BookingUncheckedUpdateManyWithoutServiceInput = {
    status?: EnumBookingStatusFieldUpdateOperationsInput | $Enums.BookingStatus
    bookedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    paymentExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    otp?: NullableStringFieldUpdateOperationsInput | string | null
    otpExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    pickupLocation?: InputJsonValue | InputJsonValue | null
    destinationLocation?: InputJsonValue | InputJsonValue | null
    serviceStartedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    serviceEndedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    basePrice?: FloatFieldUpdateOperationsInput | number
    additionalFees?: NullableFloatFieldUpdateOperationsInput | number | null
    discountAmount?: NullableFloatFieldUpdateOperationsInput | number | null
    finalAmount?: FloatFieldUpdateOperationsInput | number
    paymentStatus?: StringFieldUpdateOperationsInput | string
    paymentIntentId?: NullableStringFieldUpdateOperationsInput | string | null
    userRating?: NullableIntFieldUpdateOperationsInput | number | null
    userReview?: NullableStringFieldUpdateOperationsInput | string | null
    providerRating?: NullableIntFieldUpdateOperationsInput | number | null
    providerReview?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: StringFieldUpdateOperationsInput | string
    vehicleId?: StringFieldUpdateOperationsInput | string
    eligibleProviderIds?: BookingUpdateeligibleProviderIdsInput | string[]
    garageId?: NullableStringFieldUpdateOperationsInput | string | null
    garageServiceId?: NullableStringFieldUpdateOperationsInput | string | null
    towTruckId?: NullableStringFieldUpdateOperationsInput | string | null
    towTruckServiceId?: NullableStringFieldUpdateOperationsInput | string | null
    promoCodeId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type GarageServiceCreateManyGarageInput = {
    id?: string
    price: number
    serviceId: string
  }

  export type SparePartCreateManyGarageInput = {
    id?: string
    partName: string
    compatibleMake: string
    compatibleModel: string
    compatibleYear: number
    price: number
    quantityAvailable: number
  }

  export type BookingCreateManyGarageInput = {
    id?: string
    status?: $Enums.BookingStatus
    bookedAt?: Date | string
    expiresAt?: Date | string | null
    paymentExpiresAt?: Date | string | null
    notes?: string | null
    otp?: string | null
    otpExpiresAt?: Date | string | null
    pickupLocation?: InputJsonValue | null
    destinationLocation?: InputJsonValue | null
    serviceStartedAt?: Date | string | null
    serviceEndedAt?: Date | string | null
    basePrice: number
    additionalFees?: number | null
    discountAmount?: number | null
    finalAmount: number
    paymentStatus?: string
    paymentIntentId?: string | null
    userRating?: number | null
    userReview?: string | null
    providerRating?: number | null
    providerReview?: string | null
    userId: string
    vehicleId: string
    eligibleProviderIds?: BookingCreateeligibleProviderIdsInput | string[]
    serviceId?: string | null
    garageServiceId?: string | null
    towTruckId?: string | null
    towTruckServiceId?: string | null
    promoCodeId?: string | null
  }

  export type GarageServiceUpdateWithoutGarageInput = {
    price?: FloatFieldUpdateOperationsInput | number
    service?: ServiceUpdateOneRequiredWithoutOfferedByGaragesNestedInput
    bookings?: BookingUpdateManyWithoutGarageServiceNestedInput
  }

  export type GarageServiceUncheckedUpdateWithoutGarageInput = {
    price?: FloatFieldUpdateOperationsInput | number
    serviceId?: StringFieldUpdateOperationsInput | string
    bookings?: BookingUncheckedUpdateManyWithoutGarageServiceNestedInput
  }

  export type GarageServiceUncheckedUpdateManyWithoutGarageInput = {
    price?: FloatFieldUpdateOperationsInput | number
    serviceId?: StringFieldUpdateOperationsInput | string
  }

  export type SparePartUpdateWithoutGarageInput = {
    partName?: StringFieldUpdateOperationsInput | string
    compatibleMake?: StringFieldUpdateOperationsInput | string
    compatibleModel?: StringFieldUpdateOperationsInput | string
    compatibleYear?: IntFieldUpdateOperationsInput | number
    price?: FloatFieldUpdateOperationsInput | number
    quantityAvailable?: IntFieldUpdateOperationsInput | number
  }

  export type SparePartUncheckedUpdateWithoutGarageInput = {
    partName?: StringFieldUpdateOperationsInput | string
    compatibleMake?: StringFieldUpdateOperationsInput | string
    compatibleModel?: StringFieldUpdateOperationsInput | string
    compatibleYear?: IntFieldUpdateOperationsInput | number
    price?: FloatFieldUpdateOperationsInput | number
    quantityAvailable?: IntFieldUpdateOperationsInput | number
  }

  export type SparePartUncheckedUpdateManyWithoutGarageInput = {
    partName?: StringFieldUpdateOperationsInput | string
    compatibleMake?: StringFieldUpdateOperationsInput | string
    compatibleModel?: StringFieldUpdateOperationsInput | string
    compatibleYear?: IntFieldUpdateOperationsInput | number
    price?: FloatFieldUpdateOperationsInput | number
    quantityAvailable?: IntFieldUpdateOperationsInput | number
  }

  export type BookingUpdateWithoutGarageInput = {
    status?: EnumBookingStatusFieldUpdateOperationsInput | $Enums.BookingStatus
    bookedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    paymentExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    otp?: NullableStringFieldUpdateOperationsInput | string | null
    otpExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    pickupLocation?: InputJsonValue | InputJsonValue | null
    destinationLocation?: InputJsonValue | InputJsonValue | null
    serviceStartedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    serviceEndedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    basePrice?: FloatFieldUpdateOperationsInput | number
    additionalFees?: NullableFloatFieldUpdateOperationsInput | number | null
    discountAmount?: NullableFloatFieldUpdateOperationsInput | number | null
    finalAmount?: FloatFieldUpdateOperationsInput | number
    paymentStatus?: StringFieldUpdateOperationsInput | string
    paymentIntentId?: NullableStringFieldUpdateOperationsInput | string | null
    userRating?: NullableIntFieldUpdateOperationsInput | number | null
    userReview?: NullableStringFieldUpdateOperationsInput | string | null
    providerRating?: NullableIntFieldUpdateOperationsInput | number | null
    providerReview?: NullableStringFieldUpdateOperationsInput | string | null
    eligibleProviderIds?: BookingUpdateeligibleProviderIdsInput | string[]
    user?: UserUpdateOneRequiredWithoutBookingsNestedInput
    vehicle?: VehicleUpdateOneRequiredWithoutBookingsNestedInput
    service?: ServiceUpdateOneWithoutBookingsNestedInput
    garageService?: GarageServiceUpdateOneWithoutBookingsNestedInput
    towTruck?: TowTruckUpdateOneWithoutBookingsNestedInput
    towTruckService?: TowTruckServiceUpdateOneWithoutBookingsNestedInput
    promoCode?: PromoCodeUpdateOneWithoutBookingsNestedInput
  }

  export type BookingUncheckedUpdateWithoutGarageInput = {
    status?: EnumBookingStatusFieldUpdateOperationsInput | $Enums.BookingStatus
    bookedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    paymentExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    otp?: NullableStringFieldUpdateOperationsInput | string | null
    otpExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    pickupLocation?: InputJsonValue | InputJsonValue | null
    destinationLocation?: InputJsonValue | InputJsonValue | null
    serviceStartedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    serviceEndedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    basePrice?: FloatFieldUpdateOperationsInput | number
    additionalFees?: NullableFloatFieldUpdateOperationsInput | number | null
    discountAmount?: NullableFloatFieldUpdateOperationsInput | number | null
    finalAmount?: FloatFieldUpdateOperationsInput | number
    paymentStatus?: StringFieldUpdateOperationsInput | string
    paymentIntentId?: NullableStringFieldUpdateOperationsInput | string | null
    userRating?: NullableIntFieldUpdateOperationsInput | number | null
    userReview?: NullableStringFieldUpdateOperationsInput | string | null
    providerRating?: NullableIntFieldUpdateOperationsInput | number | null
    providerReview?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: StringFieldUpdateOperationsInput | string
    vehicleId?: StringFieldUpdateOperationsInput | string
    eligibleProviderIds?: BookingUpdateeligibleProviderIdsInput | string[]
    serviceId?: NullableStringFieldUpdateOperationsInput | string | null
    garageServiceId?: NullableStringFieldUpdateOperationsInput | string | null
    towTruckId?: NullableStringFieldUpdateOperationsInput | string | null
    towTruckServiceId?: NullableStringFieldUpdateOperationsInput | string | null
    promoCodeId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type BookingUncheckedUpdateManyWithoutGarageInput = {
    status?: EnumBookingStatusFieldUpdateOperationsInput | $Enums.BookingStatus
    bookedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    paymentExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    otp?: NullableStringFieldUpdateOperationsInput | string | null
    otpExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    pickupLocation?: InputJsonValue | InputJsonValue | null
    destinationLocation?: InputJsonValue | InputJsonValue | null
    serviceStartedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    serviceEndedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    basePrice?: FloatFieldUpdateOperationsInput | number
    additionalFees?: NullableFloatFieldUpdateOperationsInput | number | null
    discountAmount?: NullableFloatFieldUpdateOperationsInput | number | null
    finalAmount?: FloatFieldUpdateOperationsInput | number
    paymentStatus?: StringFieldUpdateOperationsInput | string
    paymentIntentId?: NullableStringFieldUpdateOperationsInput | string | null
    userRating?: NullableIntFieldUpdateOperationsInput | number | null
    userReview?: NullableStringFieldUpdateOperationsInput | string | null
    providerRating?: NullableIntFieldUpdateOperationsInput | number | null
    providerReview?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: StringFieldUpdateOperationsInput | string
    vehicleId?: StringFieldUpdateOperationsInput | string
    eligibleProviderIds?: BookingUpdateeligibleProviderIdsInput | string[]
    serviceId?: NullableStringFieldUpdateOperationsInput | string | null
    garageServiceId?: NullableStringFieldUpdateOperationsInput | string | null
    towTruckId?: NullableStringFieldUpdateOperationsInput | string | null
    towTruckServiceId?: NullableStringFieldUpdateOperationsInput | string | null
    promoCodeId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type BookingCreateManyGarageServiceInput = {
    id?: string
    status?: $Enums.BookingStatus
    bookedAt?: Date | string
    expiresAt?: Date | string | null
    paymentExpiresAt?: Date | string | null
    notes?: string | null
    otp?: string | null
    otpExpiresAt?: Date | string | null
    pickupLocation?: InputJsonValue | null
    destinationLocation?: InputJsonValue | null
    serviceStartedAt?: Date | string | null
    serviceEndedAt?: Date | string | null
    basePrice: number
    additionalFees?: number | null
    discountAmount?: number | null
    finalAmount: number
    paymentStatus?: string
    paymentIntentId?: string | null
    userRating?: number | null
    userReview?: string | null
    providerRating?: number | null
    providerReview?: string | null
    userId: string
    vehicleId: string
    eligibleProviderIds?: BookingCreateeligibleProviderIdsInput | string[]
    serviceId?: string | null
    garageId?: string | null
    towTruckId?: string | null
    towTruckServiceId?: string | null
    promoCodeId?: string | null
  }

  export type BookingUpdateWithoutGarageServiceInput = {
    status?: EnumBookingStatusFieldUpdateOperationsInput | $Enums.BookingStatus
    bookedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    paymentExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    otp?: NullableStringFieldUpdateOperationsInput | string | null
    otpExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    pickupLocation?: InputJsonValue | InputJsonValue | null
    destinationLocation?: InputJsonValue | InputJsonValue | null
    serviceStartedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    serviceEndedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    basePrice?: FloatFieldUpdateOperationsInput | number
    additionalFees?: NullableFloatFieldUpdateOperationsInput | number | null
    discountAmount?: NullableFloatFieldUpdateOperationsInput | number | null
    finalAmount?: FloatFieldUpdateOperationsInput | number
    paymentStatus?: StringFieldUpdateOperationsInput | string
    paymentIntentId?: NullableStringFieldUpdateOperationsInput | string | null
    userRating?: NullableIntFieldUpdateOperationsInput | number | null
    userReview?: NullableStringFieldUpdateOperationsInput | string | null
    providerRating?: NullableIntFieldUpdateOperationsInput | number | null
    providerReview?: NullableStringFieldUpdateOperationsInput | string | null
    eligibleProviderIds?: BookingUpdateeligibleProviderIdsInput | string[]
    user?: UserUpdateOneRequiredWithoutBookingsNestedInput
    vehicle?: VehicleUpdateOneRequiredWithoutBookingsNestedInput
    service?: ServiceUpdateOneWithoutBookingsNestedInput
    garage?: GarageUpdateOneWithoutBookingsNestedInput
    towTruck?: TowTruckUpdateOneWithoutBookingsNestedInput
    towTruckService?: TowTruckServiceUpdateOneWithoutBookingsNestedInput
    promoCode?: PromoCodeUpdateOneWithoutBookingsNestedInput
  }

  export type BookingUncheckedUpdateWithoutGarageServiceInput = {
    status?: EnumBookingStatusFieldUpdateOperationsInput | $Enums.BookingStatus
    bookedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    paymentExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    otp?: NullableStringFieldUpdateOperationsInput | string | null
    otpExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    pickupLocation?: InputJsonValue | InputJsonValue | null
    destinationLocation?: InputJsonValue | InputJsonValue | null
    serviceStartedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    serviceEndedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    basePrice?: FloatFieldUpdateOperationsInput | number
    additionalFees?: NullableFloatFieldUpdateOperationsInput | number | null
    discountAmount?: NullableFloatFieldUpdateOperationsInput | number | null
    finalAmount?: FloatFieldUpdateOperationsInput | number
    paymentStatus?: StringFieldUpdateOperationsInput | string
    paymentIntentId?: NullableStringFieldUpdateOperationsInput | string | null
    userRating?: NullableIntFieldUpdateOperationsInput | number | null
    userReview?: NullableStringFieldUpdateOperationsInput | string | null
    providerRating?: NullableIntFieldUpdateOperationsInput | number | null
    providerReview?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: StringFieldUpdateOperationsInput | string
    vehicleId?: StringFieldUpdateOperationsInput | string
    eligibleProviderIds?: BookingUpdateeligibleProviderIdsInput | string[]
    serviceId?: NullableStringFieldUpdateOperationsInput | string | null
    garageId?: NullableStringFieldUpdateOperationsInput | string | null
    towTruckId?: NullableStringFieldUpdateOperationsInput | string | null
    towTruckServiceId?: NullableStringFieldUpdateOperationsInput | string | null
    promoCodeId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type BookingUncheckedUpdateManyWithoutGarageServiceInput = {
    status?: EnumBookingStatusFieldUpdateOperationsInput | $Enums.BookingStatus
    bookedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    paymentExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    otp?: NullableStringFieldUpdateOperationsInput | string | null
    otpExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    pickupLocation?: InputJsonValue | InputJsonValue | null
    destinationLocation?: InputJsonValue | InputJsonValue | null
    serviceStartedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    serviceEndedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    basePrice?: FloatFieldUpdateOperationsInput | number
    additionalFees?: NullableFloatFieldUpdateOperationsInput | number | null
    discountAmount?: NullableFloatFieldUpdateOperationsInput | number | null
    finalAmount?: FloatFieldUpdateOperationsInput | number
    paymentStatus?: StringFieldUpdateOperationsInput | string
    paymentIntentId?: NullableStringFieldUpdateOperationsInput | string | null
    userRating?: NullableIntFieldUpdateOperationsInput | number | null
    userReview?: NullableStringFieldUpdateOperationsInput | string | null
    providerRating?: NullableIntFieldUpdateOperationsInput | number | null
    providerReview?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: StringFieldUpdateOperationsInput | string
    vehicleId?: StringFieldUpdateOperationsInput | string
    eligibleProviderIds?: BookingUpdateeligibleProviderIdsInput | string[]
    serviceId?: NullableStringFieldUpdateOperationsInput | string | null
    garageId?: NullableStringFieldUpdateOperationsInput | string | null
    towTruckId?: NullableStringFieldUpdateOperationsInput | string | null
    towTruckServiceId?: NullableStringFieldUpdateOperationsInput | string | null
    promoCodeId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type TowTruckServiceCreateManyTowTruckInput = {
    id?: string
    price: number
    vehicleType: $Enums.VehicleType
  }

  export type BookingCreateManyTowTruckInput = {
    id?: string
    status?: $Enums.BookingStatus
    bookedAt?: Date | string
    expiresAt?: Date | string | null
    paymentExpiresAt?: Date | string | null
    notes?: string | null
    otp?: string | null
    otpExpiresAt?: Date | string | null
    pickupLocation?: InputJsonValue | null
    destinationLocation?: InputJsonValue | null
    serviceStartedAt?: Date | string | null
    serviceEndedAt?: Date | string | null
    basePrice: number
    additionalFees?: number | null
    discountAmount?: number | null
    finalAmount: number
    paymentStatus?: string
    paymentIntentId?: string | null
    userRating?: number | null
    userReview?: string | null
    providerRating?: number | null
    providerReview?: string | null
    userId: string
    vehicleId: string
    eligibleProviderIds?: BookingCreateeligibleProviderIdsInput | string[]
    serviceId?: string | null
    garageId?: string | null
    garageServiceId?: string | null
    towTruckServiceId?: string | null
    promoCodeId?: string | null
  }

  export type TowTruckServiceUpdateWithoutTowTruckInput = {
    price?: FloatFieldUpdateOperationsInput | number
    vehicleType?: EnumVehicleTypeFieldUpdateOperationsInput | $Enums.VehicleType
    bookings?: BookingUpdateManyWithoutTowTruckServiceNestedInput
  }

  export type TowTruckServiceUncheckedUpdateWithoutTowTruckInput = {
    price?: FloatFieldUpdateOperationsInput | number
    vehicleType?: EnumVehicleTypeFieldUpdateOperationsInput | $Enums.VehicleType
    bookings?: BookingUncheckedUpdateManyWithoutTowTruckServiceNestedInput
  }

  export type TowTruckServiceUncheckedUpdateManyWithoutTowTruckInput = {
    price?: FloatFieldUpdateOperationsInput | number
    vehicleType?: EnumVehicleTypeFieldUpdateOperationsInput | $Enums.VehicleType
  }

  export type BookingUpdateWithoutTowTruckInput = {
    status?: EnumBookingStatusFieldUpdateOperationsInput | $Enums.BookingStatus
    bookedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    paymentExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    otp?: NullableStringFieldUpdateOperationsInput | string | null
    otpExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    pickupLocation?: InputJsonValue | InputJsonValue | null
    destinationLocation?: InputJsonValue | InputJsonValue | null
    serviceStartedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    serviceEndedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    basePrice?: FloatFieldUpdateOperationsInput | number
    additionalFees?: NullableFloatFieldUpdateOperationsInput | number | null
    discountAmount?: NullableFloatFieldUpdateOperationsInput | number | null
    finalAmount?: FloatFieldUpdateOperationsInput | number
    paymentStatus?: StringFieldUpdateOperationsInput | string
    paymentIntentId?: NullableStringFieldUpdateOperationsInput | string | null
    userRating?: NullableIntFieldUpdateOperationsInput | number | null
    userReview?: NullableStringFieldUpdateOperationsInput | string | null
    providerRating?: NullableIntFieldUpdateOperationsInput | number | null
    providerReview?: NullableStringFieldUpdateOperationsInput | string | null
    eligibleProviderIds?: BookingUpdateeligibleProviderIdsInput | string[]
    user?: UserUpdateOneRequiredWithoutBookingsNestedInput
    vehicle?: VehicleUpdateOneRequiredWithoutBookingsNestedInput
    service?: ServiceUpdateOneWithoutBookingsNestedInput
    garage?: GarageUpdateOneWithoutBookingsNestedInput
    garageService?: GarageServiceUpdateOneWithoutBookingsNestedInput
    towTruckService?: TowTruckServiceUpdateOneWithoutBookingsNestedInput
    promoCode?: PromoCodeUpdateOneWithoutBookingsNestedInput
  }

  export type BookingUncheckedUpdateWithoutTowTruckInput = {
    status?: EnumBookingStatusFieldUpdateOperationsInput | $Enums.BookingStatus
    bookedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    paymentExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    otp?: NullableStringFieldUpdateOperationsInput | string | null
    otpExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    pickupLocation?: InputJsonValue | InputJsonValue | null
    destinationLocation?: InputJsonValue | InputJsonValue | null
    serviceStartedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    serviceEndedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    basePrice?: FloatFieldUpdateOperationsInput | number
    additionalFees?: NullableFloatFieldUpdateOperationsInput | number | null
    discountAmount?: NullableFloatFieldUpdateOperationsInput | number | null
    finalAmount?: FloatFieldUpdateOperationsInput | number
    paymentStatus?: StringFieldUpdateOperationsInput | string
    paymentIntentId?: NullableStringFieldUpdateOperationsInput | string | null
    userRating?: NullableIntFieldUpdateOperationsInput | number | null
    userReview?: NullableStringFieldUpdateOperationsInput | string | null
    providerRating?: NullableIntFieldUpdateOperationsInput | number | null
    providerReview?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: StringFieldUpdateOperationsInput | string
    vehicleId?: StringFieldUpdateOperationsInput | string
    eligibleProviderIds?: BookingUpdateeligibleProviderIdsInput | string[]
    serviceId?: NullableStringFieldUpdateOperationsInput | string | null
    garageId?: NullableStringFieldUpdateOperationsInput | string | null
    garageServiceId?: NullableStringFieldUpdateOperationsInput | string | null
    towTruckServiceId?: NullableStringFieldUpdateOperationsInput | string | null
    promoCodeId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type BookingUncheckedUpdateManyWithoutTowTruckInput = {
    status?: EnumBookingStatusFieldUpdateOperationsInput | $Enums.BookingStatus
    bookedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    paymentExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    otp?: NullableStringFieldUpdateOperationsInput | string | null
    otpExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    pickupLocation?: InputJsonValue | InputJsonValue | null
    destinationLocation?: InputJsonValue | InputJsonValue | null
    serviceStartedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    serviceEndedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    basePrice?: FloatFieldUpdateOperationsInput | number
    additionalFees?: NullableFloatFieldUpdateOperationsInput | number | null
    discountAmount?: NullableFloatFieldUpdateOperationsInput | number | null
    finalAmount?: FloatFieldUpdateOperationsInput | number
    paymentStatus?: StringFieldUpdateOperationsInput | string
    paymentIntentId?: NullableStringFieldUpdateOperationsInput | string | null
    userRating?: NullableIntFieldUpdateOperationsInput | number | null
    userReview?: NullableStringFieldUpdateOperationsInput | string | null
    providerRating?: NullableIntFieldUpdateOperationsInput | number | null
    providerReview?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: StringFieldUpdateOperationsInput | string
    vehicleId?: StringFieldUpdateOperationsInput | string
    eligibleProviderIds?: BookingUpdateeligibleProviderIdsInput | string[]
    serviceId?: NullableStringFieldUpdateOperationsInput | string | null
    garageId?: NullableStringFieldUpdateOperationsInput | string | null
    garageServiceId?: NullableStringFieldUpdateOperationsInput | string | null
    towTruckServiceId?: NullableStringFieldUpdateOperationsInput | string | null
    promoCodeId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type BookingCreateManyTowTruckServiceInput = {
    id?: string
    status?: $Enums.BookingStatus
    bookedAt?: Date | string
    expiresAt?: Date | string | null
    paymentExpiresAt?: Date | string | null
    notes?: string | null
    otp?: string | null
    otpExpiresAt?: Date | string | null
    pickupLocation?: InputJsonValue | null
    destinationLocation?: InputJsonValue | null
    serviceStartedAt?: Date | string | null
    serviceEndedAt?: Date | string | null
    basePrice: number
    additionalFees?: number | null
    discountAmount?: number | null
    finalAmount: number
    paymentStatus?: string
    paymentIntentId?: string | null
    userRating?: number | null
    userReview?: string | null
    providerRating?: number | null
    providerReview?: string | null
    userId: string
    vehicleId: string
    eligibleProviderIds?: BookingCreateeligibleProviderIdsInput | string[]
    serviceId?: string | null
    garageId?: string | null
    garageServiceId?: string | null
    towTruckId?: string | null
    promoCodeId?: string | null
  }

  export type BookingUpdateWithoutTowTruckServiceInput = {
    status?: EnumBookingStatusFieldUpdateOperationsInput | $Enums.BookingStatus
    bookedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    paymentExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    otp?: NullableStringFieldUpdateOperationsInput | string | null
    otpExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    pickupLocation?: InputJsonValue | InputJsonValue | null
    destinationLocation?: InputJsonValue | InputJsonValue | null
    serviceStartedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    serviceEndedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    basePrice?: FloatFieldUpdateOperationsInput | number
    additionalFees?: NullableFloatFieldUpdateOperationsInput | number | null
    discountAmount?: NullableFloatFieldUpdateOperationsInput | number | null
    finalAmount?: FloatFieldUpdateOperationsInput | number
    paymentStatus?: StringFieldUpdateOperationsInput | string
    paymentIntentId?: NullableStringFieldUpdateOperationsInput | string | null
    userRating?: NullableIntFieldUpdateOperationsInput | number | null
    userReview?: NullableStringFieldUpdateOperationsInput | string | null
    providerRating?: NullableIntFieldUpdateOperationsInput | number | null
    providerReview?: NullableStringFieldUpdateOperationsInput | string | null
    eligibleProviderIds?: BookingUpdateeligibleProviderIdsInput | string[]
    user?: UserUpdateOneRequiredWithoutBookingsNestedInput
    vehicle?: VehicleUpdateOneRequiredWithoutBookingsNestedInput
    service?: ServiceUpdateOneWithoutBookingsNestedInput
    garage?: GarageUpdateOneWithoutBookingsNestedInput
    garageService?: GarageServiceUpdateOneWithoutBookingsNestedInput
    towTruck?: TowTruckUpdateOneWithoutBookingsNestedInput
    promoCode?: PromoCodeUpdateOneWithoutBookingsNestedInput
  }

  export type BookingUncheckedUpdateWithoutTowTruckServiceInput = {
    status?: EnumBookingStatusFieldUpdateOperationsInput | $Enums.BookingStatus
    bookedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    paymentExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    otp?: NullableStringFieldUpdateOperationsInput | string | null
    otpExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    pickupLocation?: InputJsonValue | InputJsonValue | null
    destinationLocation?: InputJsonValue | InputJsonValue | null
    serviceStartedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    serviceEndedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    basePrice?: FloatFieldUpdateOperationsInput | number
    additionalFees?: NullableFloatFieldUpdateOperationsInput | number | null
    discountAmount?: NullableFloatFieldUpdateOperationsInput | number | null
    finalAmount?: FloatFieldUpdateOperationsInput | number
    paymentStatus?: StringFieldUpdateOperationsInput | string
    paymentIntentId?: NullableStringFieldUpdateOperationsInput | string | null
    userRating?: NullableIntFieldUpdateOperationsInput | number | null
    userReview?: NullableStringFieldUpdateOperationsInput | string | null
    providerRating?: NullableIntFieldUpdateOperationsInput | number | null
    providerReview?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: StringFieldUpdateOperationsInput | string
    vehicleId?: StringFieldUpdateOperationsInput | string
    eligibleProviderIds?: BookingUpdateeligibleProviderIdsInput | string[]
    serviceId?: NullableStringFieldUpdateOperationsInput | string | null
    garageId?: NullableStringFieldUpdateOperationsInput | string | null
    garageServiceId?: NullableStringFieldUpdateOperationsInput | string | null
    towTruckId?: NullableStringFieldUpdateOperationsInput | string | null
    promoCodeId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type BookingUncheckedUpdateManyWithoutTowTruckServiceInput = {
    status?: EnumBookingStatusFieldUpdateOperationsInput | $Enums.BookingStatus
    bookedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    paymentExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    otp?: NullableStringFieldUpdateOperationsInput | string | null
    otpExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    pickupLocation?: InputJsonValue | InputJsonValue | null
    destinationLocation?: InputJsonValue | InputJsonValue | null
    serviceStartedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    serviceEndedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    basePrice?: FloatFieldUpdateOperationsInput | number
    additionalFees?: NullableFloatFieldUpdateOperationsInput | number | null
    discountAmount?: NullableFloatFieldUpdateOperationsInput | number | null
    finalAmount?: FloatFieldUpdateOperationsInput | number
    paymentStatus?: StringFieldUpdateOperationsInput | string
    paymentIntentId?: NullableStringFieldUpdateOperationsInput | string | null
    userRating?: NullableIntFieldUpdateOperationsInput | number | null
    userReview?: NullableStringFieldUpdateOperationsInput | string | null
    providerRating?: NullableIntFieldUpdateOperationsInput | number | null
    providerReview?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: StringFieldUpdateOperationsInput | string
    vehicleId?: StringFieldUpdateOperationsInput | string
    eligibleProviderIds?: BookingUpdateeligibleProviderIdsInput | string[]
    serviceId?: NullableStringFieldUpdateOperationsInput | string | null
    garageId?: NullableStringFieldUpdateOperationsInput | string | null
    garageServiceId?: NullableStringFieldUpdateOperationsInput | string | null
    towTruckId?: NullableStringFieldUpdateOperationsInput | string | null
    promoCodeId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type BookingCreateManyPromoCodeInput = {
    id?: string
    status?: $Enums.BookingStatus
    bookedAt?: Date | string
    expiresAt?: Date | string | null
    paymentExpiresAt?: Date | string | null
    notes?: string | null
    otp?: string | null
    otpExpiresAt?: Date | string | null
    pickupLocation?: InputJsonValue | null
    destinationLocation?: InputJsonValue | null
    serviceStartedAt?: Date | string | null
    serviceEndedAt?: Date | string | null
    basePrice: number
    additionalFees?: number | null
    discountAmount?: number | null
    finalAmount: number
    paymentStatus?: string
    paymentIntentId?: string | null
    userRating?: number | null
    userReview?: string | null
    providerRating?: number | null
    providerReview?: string | null
    userId: string
    vehicleId: string
    eligibleProviderIds?: BookingCreateeligibleProviderIdsInput | string[]
    serviceId?: string | null
    garageId?: string | null
    garageServiceId?: string | null
    towTruckId?: string | null
    towTruckServiceId?: string | null
  }

  export type BookingUpdateWithoutPromoCodeInput = {
    status?: EnumBookingStatusFieldUpdateOperationsInput | $Enums.BookingStatus
    bookedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    paymentExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    otp?: NullableStringFieldUpdateOperationsInput | string | null
    otpExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    pickupLocation?: InputJsonValue | InputJsonValue | null
    destinationLocation?: InputJsonValue | InputJsonValue | null
    serviceStartedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    serviceEndedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    basePrice?: FloatFieldUpdateOperationsInput | number
    additionalFees?: NullableFloatFieldUpdateOperationsInput | number | null
    discountAmount?: NullableFloatFieldUpdateOperationsInput | number | null
    finalAmount?: FloatFieldUpdateOperationsInput | number
    paymentStatus?: StringFieldUpdateOperationsInput | string
    paymentIntentId?: NullableStringFieldUpdateOperationsInput | string | null
    userRating?: NullableIntFieldUpdateOperationsInput | number | null
    userReview?: NullableStringFieldUpdateOperationsInput | string | null
    providerRating?: NullableIntFieldUpdateOperationsInput | number | null
    providerReview?: NullableStringFieldUpdateOperationsInput | string | null
    eligibleProviderIds?: BookingUpdateeligibleProviderIdsInput | string[]
    user?: UserUpdateOneRequiredWithoutBookingsNestedInput
    vehicle?: VehicleUpdateOneRequiredWithoutBookingsNestedInput
    service?: ServiceUpdateOneWithoutBookingsNestedInput
    garage?: GarageUpdateOneWithoutBookingsNestedInput
    garageService?: GarageServiceUpdateOneWithoutBookingsNestedInput
    towTruck?: TowTruckUpdateOneWithoutBookingsNestedInput
    towTruckService?: TowTruckServiceUpdateOneWithoutBookingsNestedInput
  }

  export type BookingUncheckedUpdateWithoutPromoCodeInput = {
    status?: EnumBookingStatusFieldUpdateOperationsInput | $Enums.BookingStatus
    bookedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    paymentExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    otp?: NullableStringFieldUpdateOperationsInput | string | null
    otpExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    pickupLocation?: InputJsonValue | InputJsonValue | null
    destinationLocation?: InputJsonValue | InputJsonValue | null
    serviceStartedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    serviceEndedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    basePrice?: FloatFieldUpdateOperationsInput | number
    additionalFees?: NullableFloatFieldUpdateOperationsInput | number | null
    discountAmount?: NullableFloatFieldUpdateOperationsInput | number | null
    finalAmount?: FloatFieldUpdateOperationsInput | number
    paymentStatus?: StringFieldUpdateOperationsInput | string
    paymentIntentId?: NullableStringFieldUpdateOperationsInput | string | null
    userRating?: NullableIntFieldUpdateOperationsInput | number | null
    userReview?: NullableStringFieldUpdateOperationsInput | string | null
    providerRating?: NullableIntFieldUpdateOperationsInput | number | null
    providerReview?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: StringFieldUpdateOperationsInput | string
    vehicleId?: StringFieldUpdateOperationsInput | string
    eligibleProviderIds?: BookingUpdateeligibleProviderIdsInput | string[]
    serviceId?: NullableStringFieldUpdateOperationsInput | string | null
    garageId?: NullableStringFieldUpdateOperationsInput | string | null
    garageServiceId?: NullableStringFieldUpdateOperationsInput | string | null
    towTruckId?: NullableStringFieldUpdateOperationsInput | string | null
    towTruckServiceId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type BookingUncheckedUpdateManyWithoutPromoCodeInput = {
    status?: EnumBookingStatusFieldUpdateOperationsInput | $Enums.BookingStatus
    bookedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    paymentExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    otp?: NullableStringFieldUpdateOperationsInput | string | null
    otpExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    pickupLocation?: InputJsonValue | InputJsonValue | null
    destinationLocation?: InputJsonValue | InputJsonValue | null
    serviceStartedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    serviceEndedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    basePrice?: FloatFieldUpdateOperationsInput | number
    additionalFees?: NullableFloatFieldUpdateOperationsInput | number | null
    discountAmount?: NullableFloatFieldUpdateOperationsInput | number | null
    finalAmount?: FloatFieldUpdateOperationsInput | number
    paymentStatus?: StringFieldUpdateOperationsInput | string
    paymentIntentId?: NullableStringFieldUpdateOperationsInput | string | null
    userRating?: NullableIntFieldUpdateOperationsInput | number | null
    userReview?: NullableStringFieldUpdateOperationsInput | string | null
    providerRating?: NullableIntFieldUpdateOperationsInput | number | null
    providerReview?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: StringFieldUpdateOperationsInput | string
    vehicleId?: StringFieldUpdateOperationsInput | string
    eligibleProviderIds?: BookingUpdateeligibleProviderIdsInput | string[]
    serviceId?: NullableStringFieldUpdateOperationsInput | string | null
    garageId?: NullableStringFieldUpdateOperationsInput | string | null
    garageServiceId?: NullableStringFieldUpdateOperationsInput | string | null
    towTruckId?: NullableStringFieldUpdateOperationsInput | string | null
    towTruckServiceId?: NullableStringFieldUpdateOperationsInput | string | null
  }



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use UserCountOutputTypeDefaultArgs instead
     */
    export type UserCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = UserCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use VehicleCountOutputTypeDefaultArgs instead
     */
    export type VehicleCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = VehicleCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ServiceCountOutputTypeDefaultArgs instead
     */
    export type ServiceCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ServiceCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use GarageCountOutputTypeDefaultArgs instead
     */
    export type GarageCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = GarageCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use GarageServiceCountOutputTypeDefaultArgs instead
     */
    export type GarageServiceCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = GarageServiceCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use TowTruckCountOutputTypeDefaultArgs instead
     */
    export type TowTruckCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = TowTruckCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use TowTruckServiceCountOutputTypeDefaultArgs instead
     */
    export type TowTruckServiceCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = TowTruckServiceCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use PromoCodeCountOutputTypeDefaultArgs instead
     */
    export type PromoCodeCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = PromoCodeCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use UserDefaultArgs instead
     */
    export type UserArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = UserDefaultArgs<ExtArgs>
    /**
     * @deprecated Use VehicleDefaultArgs instead
     */
    export type VehicleArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = VehicleDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ServiceDefaultArgs instead
     */
    export type ServiceArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ServiceDefaultArgs<ExtArgs>
    /**
     * @deprecated Use GarageDefaultArgs instead
     */
    export type GarageArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = GarageDefaultArgs<ExtArgs>
    /**
     * @deprecated Use GarageServiceDefaultArgs instead
     */
    export type GarageServiceArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = GarageServiceDefaultArgs<ExtArgs>
    /**
     * @deprecated Use TowTruckDefaultArgs instead
     */
    export type TowTruckArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = TowTruckDefaultArgs<ExtArgs>
    /**
     * @deprecated Use TowTruckServiceDefaultArgs instead
     */
    export type TowTruckServiceArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = TowTruckServiceDefaultArgs<ExtArgs>
    /**
     * @deprecated Use LiveTruckLocationDefaultArgs instead
     */
    export type LiveTruckLocationArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = LiveTruckLocationDefaultArgs<ExtArgs>
    /**
     * @deprecated Use SparePartDefaultArgs instead
     */
    export type SparePartArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = SparePartDefaultArgs<ExtArgs>
    /**
     * @deprecated Use BookingDefaultArgs instead
     */
    export type BookingArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = BookingDefaultArgs<ExtArgs>
    /**
     * @deprecated Use PromoCodeDefaultArgs instead
     */
    export type PromoCodeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = PromoCodeDefaultArgs<ExtArgs>

  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}