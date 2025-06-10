
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
 * Model BoardColumn
 * 
 */
export type BoardColumn = $Result.DefaultSelection<Prisma.$BoardColumnPayload>
/**
 * Model Task
 * 
 */
export type Task = $Result.DefaultSelection<Prisma.$TaskPayload>
/**
 * Model Tag
 * 
 */
export type Tag = $Result.DefaultSelection<Prisma.$TagPayload>
/**
 * Model MCPSession
 * 
 */
export type MCPSession = $Result.DefaultSelection<Prisma.$MCPSessionPayload>
/**
 * Model MCPMessage
 * 
 */
export type MCPMessage = $Result.DefaultSelection<Prisma.$MCPMessagePayload>

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more BoardColumns
 * const boardColumns = await prisma.boardColumn.findMany()
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
   * // Fetch zero or more BoardColumns
   * const boardColumns = await prisma.boardColumn.findMany()
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
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


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
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb, ExtArgs>

      /**
   * `prisma.boardColumn`: Exposes CRUD operations for the **BoardColumn** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more BoardColumns
    * const boardColumns = await prisma.boardColumn.findMany()
    * ```
    */
  get boardColumn(): Prisma.BoardColumnDelegate<ExtArgs>;

  /**
   * `prisma.task`: Exposes CRUD operations for the **Task** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Tasks
    * const tasks = await prisma.task.findMany()
    * ```
    */
  get task(): Prisma.TaskDelegate<ExtArgs>;

  /**
   * `prisma.tag`: Exposes CRUD operations for the **Tag** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Tags
    * const tags = await prisma.tag.findMany()
    * ```
    */
  get tag(): Prisma.TagDelegate<ExtArgs>;

  /**
   * `prisma.mCPSession`: Exposes CRUD operations for the **MCPSession** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more MCPSessions
    * const mCPSessions = await prisma.mCPSession.findMany()
    * ```
    */
  get mCPSession(): Prisma.MCPSessionDelegate<ExtArgs>;

  /**
   * `prisma.mCPMessage`: Exposes CRUD operations for the **MCPMessage** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more MCPMessages
    * const mCPMessages = await prisma.mCPMessage.findMany()
    * ```
    */
  get mCPMessage(): Prisma.MCPMessageDelegate<ExtArgs>;
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
    BoardColumn: 'BoardColumn',
    Task: 'Task',
    Tag: 'Tag',
    MCPSession: 'MCPSession',
    MCPMessage: 'MCPMessage'
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
      modelProps: "boardColumn" | "task" | "tag" | "mCPSession" | "mCPMessage"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      BoardColumn: {
        payload: Prisma.$BoardColumnPayload<ExtArgs>
        fields: Prisma.BoardColumnFieldRefs
        operations: {
          findUnique: {
            args: Prisma.BoardColumnFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BoardColumnPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.BoardColumnFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BoardColumnPayload>
          }
          findFirst: {
            args: Prisma.BoardColumnFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BoardColumnPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.BoardColumnFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BoardColumnPayload>
          }
          findMany: {
            args: Prisma.BoardColumnFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BoardColumnPayload>[]
          }
          create: {
            args: Prisma.BoardColumnCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BoardColumnPayload>
          }
          createMany: {
            args: Prisma.BoardColumnCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.BoardColumnCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BoardColumnPayload>[]
          }
          delete: {
            args: Prisma.BoardColumnDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BoardColumnPayload>
          }
          update: {
            args: Prisma.BoardColumnUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BoardColumnPayload>
          }
          deleteMany: {
            args: Prisma.BoardColumnDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.BoardColumnUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.BoardColumnUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BoardColumnPayload>
          }
          aggregate: {
            args: Prisma.BoardColumnAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateBoardColumn>
          }
          groupBy: {
            args: Prisma.BoardColumnGroupByArgs<ExtArgs>
            result: $Utils.Optional<BoardColumnGroupByOutputType>[]
          }
          count: {
            args: Prisma.BoardColumnCountArgs<ExtArgs>
            result: $Utils.Optional<BoardColumnCountAggregateOutputType> | number
          }
        }
      }
      Task: {
        payload: Prisma.$TaskPayload<ExtArgs>
        fields: Prisma.TaskFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TaskFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TaskPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TaskFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TaskPayload>
          }
          findFirst: {
            args: Prisma.TaskFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TaskPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TaskFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TaskPayload>
          }
          findMany: {
            args: Prisma.TaskFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TaskPayload>[]
          }
          create: {
            args: Prisma.TaskCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TaskPayload>
          }
          createMany: {
            args: Prisma.TaskCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TaskCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TaskPayload>[]
          }
          delete: {
            args: Prisma.TaskDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TaskPayload>
          }
          update: {
            args: Prisma.TaskUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TaskPayload>
          }
          deleteMany: {
            args: Prisma.TaskDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TaskUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.TaskUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TaskPayload>
          }
          aggregate: {
            args: Prisma.TaskAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTask>
          }
          groupBy: {
            args: Prisma.TaskGroupByArgs<ExtArgs>
            result: $Utils.Optional<TaskGroupByOutputType>[]
          }
          count: {
            args: Prisma.TaskCountArgs<ExtArgs>
            result: $Utils.Optional<TaskCountAggregateOutputType> | number
          }
        }
      }
      Tag: {
        payload: Prisma.$TagPayload<ExtArgs>
        fields: Prisma.TagFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TagFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TagPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TagFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TagPayload>
          }
          findFirst: {
            args: Prisma.TagFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TagPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TagFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TagPayload>
          }
          findMany: {
            args: Prisma.TagFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TagPayload>[]
          }
          create: {
            args: Prisma.TagCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TagPayload>
          }
          createMany: {
            args: Prisma.TagCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TagCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TagPayload>[]
          }
          delete: {
            args: Prisma.TagDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TagPayload>
          }
          update: {
            args: Prisma.TagUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TagPayload>
          }
          deleteMany: {
            args: Prisma.TagDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TagUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.TagUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TagPayload>
          }
          aggregate: {
            args: Prisma.TagAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTag>
          }
          groupBy: {
            args: Prisma.TagGroupByArgs<ExtArgs>
            result: $Utils.Optional<TagGroupByOutputType>[]
          }
          count: {
            args: Prisma.TagCountArgs<ExtArgs>
            result: $Utils.Optional<TagCountAggregateOutputType> | number
          }
        }
      }
      MCPSession: {
        payload: Prisma.$MCPSessionPayload<ExtArgs>
        fields: Prisma.MCPSessionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.MCPSessionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MCPSessionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.MCPSessionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MCPSessionPayload>
          }
          findFirst: {
            args: Prisma.MCPSessionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MCPSessionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.MCPSessionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MCPSessionPayload>
          }
          findMany: {
            args: Prisma.MCPSessionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MCPSessionPayload>[]
          }
          create: {
            args: Prisma.MCPSessionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MCPSessionPayload>
          }
          createMany: {
            args: Prisma.MCPSessionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.MCPSessionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MCPSessionPayload>[]
          }
          delete: {
            args: Prisma.MCPSessionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MCPSessionPayload>
          }
          update: {
            args: Prisma.MCPSessionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MCPSessionPayload>
          }
          deleteMany: {
            args: Prisma.MCPSessionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.MCPSessionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.MCPSessionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MCPSessionPayload>
          }
          aggregate: {
            args: Prisma.MCPSessionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMCPSession>
          }
          groupBy: {
            args: Prisma.MCPSessionGroupByArgs<ExtArgs>
            result: $Utils.Optional<MCPSessionGroupByOutputType>[]
          }
          count: {
            args: Prisma.MCPSessionCountArgs<ExtArgs>
            result: $Utils.Optional<MCPSessionCountAggregateOutputType> | number
          }
        }
      }
      MCPMessage: {
        payload: Prisma.$MCPMessagePayload<ExtArgs>
        fields: Prisma.MCPMessageFieldRefs
        operations: {
          findUnique: {
            args: Prisma.MCPMessageFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MCPMessagePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.MCPMessageFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MCPMessagePayload>
          }
          findFirst: {
            args: Prisma.MCPMessageFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MCPMessagePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.MCPMessageFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MCPMessagePayload>
          }
          findMany: {
            args: Prisma.MCPMessageFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MCPMessagePayload>[]
          }
          create: {
            args: Prisma.MCPMessageCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MCPMessagePayload>
          }
          createMany: {
            args: Prisma.MCPMessageCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.MCPMessageCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MCPMessagePayload>[]
          }
          delete: {
            args: Prisma.MCPMessageDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MCPMessagePayload>
          }
          update: {
            args: Prisma.MCPMessageUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MCPMessagePayload>
          }
          deleteMany: {
            args: Prisma.MCPMessageDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.MCPMessageUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.MCPMessageUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MCPMessagePayload>
          }
          aggregate: {
            args: Prisma.MCPMessageAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMCPMessage>
          }
          groupBy: {
            args: Prisma.MCPMessageGroupByArgs<ExtArgs>
            result: $Utils.Optional<MCPMessageGroupByOutputType>[]
          }
          count: {
            args: Prisma.MCPMessageCountArgs<ExtArgs>
            result: $Utils.Optional<MCPMessageCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
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
      isolationLevel?: Prisma.TransactionIsolationLevel
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
   * Count Type TaskCountOutputType
   */

  export type TaskCountOutputType = {
    tags: number
    subTasks: number
  }

  export type TaskCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tags?: boolean | TaskCountOutputTypeCountTagsArgs
    subTasks?: boolean | TaskCountOutputTypeCountSubTasksArgs
  }

  // Custom InputTypes
  /**
   * TaskCountOutputType without action
   */
  export type TaskCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TaskCountOutputType
     */
    select?: TaskCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * TaskCountOutputType without action
   */
  export type TaskCountOutputTypeCountTagsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TagWhereInput
  }

  /**
   * TaskCountOutputType without action
   */
  export type TaskCountOutputTypeCountSubTasksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TaskWhereInput
  }


  /**
   * Count Type TagCountOutputType
   */

  export type TagCountOutputType = {
    tasks: number
  }

  export type TagCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tasks?: boolean | TagCountOutputTypeCountTasksArgs
  }

  // Custom InputTypes
  /**
   * TagCountOutputType without action
   */
  export type TagCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TagCountOutputType
     */
    select?: TagCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * TagCountOutputType without action
   */
  export type TagCountOutputTypeCountTasksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TaskWhereInput
  }


  /**
   * Count Type MCPSessionCountOutputType
   */

  export type MCPSessionCountOutputType = {
    messages: number
  }

  export type MCPSessionCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    messages?: boolean | MCPSessionCountOutputTypeCountMessagesArgs
  }

  // Custom InputTypes
  /**
   * MCPSessionCountOutputType without action
   */
  export type MCPSessionCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MCPSessionCountOutputType
     */
    select?: MCPSessionCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * MCPSessionCountOutputType without action
   */
  export type MCPSessionCountOutputTypeCountMessagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MCPMessageWhereInput
  }


  /**
   * Models
   */

  /**
   * Model BoardColumn
   */

  export type AggregateBoardColumn = {
    _count: BoardColumnCountAggregateOutputType | null
    _avg: BoardColumnAvgAggregateOutputType | null
    _sum: BoardColumnSumAggregateOutputType | null
    _min: BoardColumnMinAggregateOutputType | null
    _max: BoardColumnMaxAggregateOutputType | null
  }

  export type BoardColumnAvgAggregateOutputType = {
    order: number | null
  }

  export type BoardColumnSumAggregateOutputType = {
    order: number | null
  }

  export type BoardColumnMinAggregateOutputType = {
    id: string | null
    name: string | null
    order: number | null
    color: string | null
    sortOption: string | null
    isDefault: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type BoardColumnMaxAggregateOutputType = {
    id: string | null
    name: string | null
    order: number | null
    color: string | null
    sortOption: string | null
    isDefault: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type BoardColumnCountAggregateOutputType = {
    id: number
    name: number
    order: number
    color: number
    sortOption: number
    isDefault: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type BoardColumnAvgAggregateInputType = {
    order?: true
  }

  export type BoardColumnSumAggregateInputType = {
    order?: true
  }

  export type BoardColumnMinAggregateInputType = {
    id?: true
    name?: true
    order?: true
    color?: true
    sortOption?: true
    isDefault?: true
    createdAt?: true
    updatedAt?: true
  }

  export type BoardColumnMaxAggregateInputType = {
    id?: true
    name?: true
    order?: true
    color?: true
    sortOption?: true
    isDefault?: true
    createdAt?: true
    updatedAt?: true
  }

  export type BoardColumnCountAggregateInputType = {
    id?: true
    name?: true
    order?: true
    color?: true
    sortOption?: true
    isDefault?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type BoardColumnAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which BoardColumn to aggregate.
     */
    where?: BoardColumnWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BoardColumns to fetch.
     */
    orderBy?: BoardColumnOrderByWithRelationInput | BoardColumnOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: BoardColumnWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BoardColumns from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BoardColumns.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned BoardColumns
    **/
    _count?: true | BoardColumnCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: BoardColumnAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: BoardColumnSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: BoardColumnMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: BoardColumnMaxAggregateInputType
  }

  export type GetBoardColumnAggregateType<T extends BoardColumnAggregateArgs> = {
        [P in keyof T & keyof AggregateBoardColumn]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateBoardColumn[P]>
      : GetScalarType<T[P], AggregateBoardColumn[P]>
  }




  export type BoardColumnGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BoardColumnWhereInput
    orderBy?: BoardColumnOrderByWithAggregationInput | BoardColumnOrderByWithAggregationInput[]
    by: BoardColumnScalarFieldEnum[] | BoardColumnScalarFieldEnum
    having?: BoardColumnScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: BoardColumnCountAggregateInputType | true
    _avg?: BoardColumnAvgAggregateInputType
    _sum?: BoardColumnSumAggregateInputType
    _min?: BoardColumnMinAggregateInputType
    _max?: BoardColumnMaxAggregateInputType
  }

  export type BoardColumnGroupByOutputType = {
    id: string
    name: string
    order: number
    color: string | null
    sortOption: string | null
    isDefault: boolean
    createdAt: Date
    updatedAt: Date
    _count: BoardColumnCountAggregateOutputType | null
    _avg: BoardColumnAvgAggregateOutputType | null
    _sum: BoardColumnSumAggregateOutputType | null
    _min: BoardColumnMinAggregateOutputType | null
    _max: BoardColumnMaxAggregateOutputType | null
  }

  type GetBoardColumnGroupByPayload<T extends BoardColumnGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<BoardColumnGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof BoardColumnGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], BoardColumnGroupByOutputType[P]>
            : GetScalarType<T[P], BoardColumnGroupByOutputType[P]>
        }
      >
    >


  export type BoardColumnSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    order?: boolean
    color?: boolean
    sortOption?: boolean
    isDefault?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["boardColumn"]>

  export type BoardColumnSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    order?: boolean
    color?: boolean
    sortOption?: boolean
    isDefault?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["boardColumn"]>

  export type BoardColumnSelectScalar = {
    id?: boolean
    name?: boolean
    order?: boolean
    color?: boolean
    sortOption?: boolean
    isDefault?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }


  export type $BoardColumnPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "BoardColumn"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      order: number
      color: string | null
      sortOption: string | null
      isDefault: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["boardColumn"]>
    composites: {}
  }

  type BoardColumnGetPayload<S extends boolean | null | undefined | BoardColumnDefaultArgs> = $Result.GetResult<Prisma.$BoardColumnPayload, S>

  type BoardColumnCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<BoardColumnFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: BoardColumnCountAggregateInputType | true
    }

  export interface BoardColumnDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['BoardColumn'], meta: { name: 'BoardColumn' } }
    /**
     * Find zero or one BoardColumn that matches the filter.
     * @param {BoardColumnFindUniqueArgs} args - Arguments to find a BoardColumn
     * @example
     * // Get one BoardColumn
     * const boardColumn = await prisma.boardColumn.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends BoardColumnFindUniqueArgs>(args: SelectSubset<T, BoardColumnFindUniqueArgs<ExtArgs>>): Prisma__BoardColumnClient<$Result.GetResult<Prisma.$BoardColumnPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one BoardColumn that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {BoardColumnFindUniqueOrThrowArgs} args - Arguments to find a BoardColumn
     * @example
     * // Get one BoardColumn
     * const boardColumn = await prisma.boardColumn.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends BoardColumnFindUniqueOrThrowArgs>(args: SelectSubset<T, BoardColumnFindUniqueOrThrowArgs<ExtArgs>>): Prisma__BoardColumnClient<$Result.GetResult<Prisma.$BoardColumnPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first BoardColumn that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BoardColumnFindFirstArgs} args - Arguments to find a BoardColumn
     * @example
     * // Get one BoardColumn
     * const boardColumn = await prisma.boardColumn.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends BoardColumnFindFirstArgs>(args?: SelectSubset<T, BoardColumnFindFirstArgs<ExtArgs>>): Prisma__BoardColumnClient<$Result.GetResult<Prisma.$BoardColumnPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first BoardColumn that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BoardColumnFindFirstOrThrowArgs} args - Arguments to find a BoardColumn
     * @example
     * // Get one BoardColumn
     * const boardColumn = await prisma.boardColumn.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends BoardColumnFindFirstOrThrowArgs>(args?: SelectSubset<T, BoardColumnFindFirstOrThrowArgs<ExtArgs>>): Prisma__BoardColumnClient<$Result.GetResult<Prisma.$BoardColumnPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more BoardColumns that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BoardColumnFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all BoardColumns
     * const boardColumns = await prisma.boardColumn.findMany()
     * 
     * // Get first 10 BoardColumns
     * const boardColumns = await prisma.boardColumn.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const boardColumnWithIdOnly = await prisma.boardColumn.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends BoardColumnFindManyArgs>(args?: SelectSubset<T, BoardColumnFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BoardColumnPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a BoardColumn.
     * @param {BoardColumnCreateArgs} args - Arguments to create a BoardColumn.
     * @example
     * // Create one BoardColumn
     * const BoardColumn = await prisma.boardColumn.create({
     *   data: {
     *     // ... data to create a BoardColumn
     *   }
     * })
     * 
     */
    create<T extends BoardColumnCreateArgs>(args: SelectSubset<T, BoardColumnCreateArgs<ExtArgs>>): Prisma__BoardColumnClient<$Result.GetResult<Prisma.$BoardColumnPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many BoardColumns.
     * @param {BoardColumnCreateManyArgs} args - Arguments to create many BoardColumns.
     * @example
     * // Create many BoardColumns
     * const boardColumn = await prisma.boardColumn.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends BoardColumnCreateManyArgs>(args?: SelectSubset<T, BoardColumnCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many BoardColumns and returns the data saved in the database.
     * @param {BoardColumnCreateManyAndReturnArgs} args - Arguments to create many BoardColumns.
     * @example
     * // Create many BoardColumns
     * const boardColumn = await prisma.boardColumn.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many BoardColumns and only return the `id`
     * const boardColumnWithIdOnly = await prisma.boardColumn.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends BoardColumnCreateManyAndReturnArgs>(args?: SelectSubset<T, BoardColumnCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BoardColumnPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a BoardColumn.
     * @param {BoardColumnDeleteArgs} args - Arguments to delete one BoardColumn.
     * @example
     * // Delete one BoardColumn
     * const BoardColumn = await prisma.boardColumn.delete({
     *   where: {
     *     // ... filter to delete one BoardColumn
     *   }
     * })
     * 
     */
    delete<T extends BoardColumnDeleteArgs>(args: SelectSubset<T, BoardColumnDeleteArgs<ExtArgs>>): Prisma__BoardColumnClient<$Result.GetResult<Prisma.$BoardColumnPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one BoardColumn.
     * @param {BoardColumnUpdateArgs} args - Arguments to update one BoardColumn.
     * @example
     * // Update one BoardColumn
     * const boardColumn = await prisma.boardColumn.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends BoardColumnUpdateArgs>(args: SelectSubset<T, BoardColumnUpdateArgs<ExtArgs>>): Prisma__BoardColumnClient<$Result.GetResult<Prisma.$BoardColumnPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more BoardColumns.
     * @param {BoardColumnDeleteManyArgs} args - Arguments to filter BoardColumns to delete.
     * @example
     * // Delete a few BoardColumns
     * const { count } = await prisma.boardColumn.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends BoardColumnDeleteManyArgs>(args?: SelectSubset<T, BoardColumnDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more BoardColumns.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BoardColumnUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many BoardColumns
     * const boardColumn = await prisma.boardColumn.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends BoardColumnUpdateManyArgs>(args: SelectSubset<T, BoardColumnUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one BoardColumn.
     * @param {BoardColumnUpsertArgs} args - Arguments to update or create a BoardColumn.
     * @example
     * // Update or create a BoardColumn
     * const boardColumn = await prisma.boardColumn.upsert({
     *   create: {
     *     // ... data to create a BoardColumn
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the BoardColumn we want to update
     *   }
     * })
     */
    upsert<T extends BoardColumnUpsertArgs>(args: SelectSubset<T, BoardColumnUpsertArgs<ExtArgs>>): Prisma__BoardColumnClient<$Result.GetResult<Prisma.$BoardColumnPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of BoardColumns.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BoardColumnCountArgs} args - Arguments to filter BoardColumns to count.
     * @example
     * // Count the number of BoardColumns
     * const count = await prisma.boardColumn.count({
     *   where: {
     *     // ... the filter for the BoardColumns we want to count
     *   }
     * })
    **/
    count<T extends BoardColumnCountArgs>(
      args?: Subset<T, BoardColumnCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], BoardColumnCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a BoardColumn.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BoardColumnAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends BoardColumnAggregateArgs>(args: Subset<T, BoardColumnAggregateArgs>): Prisma.PrismaPromise<GetBoardColumnAggregateType<T>>

    /**
     * Group by BoardColumn.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BoardColumnGroupByArgs} args - Group by arguments.
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
      T extends BoardColumnGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: BoardColumnGroupByArgs['orderBy'] }
        : { orderBy?: BoardColumnGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, BoardColumnGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetBoardColumnGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the BoardColumn model
   */
  readonly fields: BoardColumnFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for BoardColumn.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__BoardColumnClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
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
   * Fields of the BoardColumn model
   */ 
  interface BoardColumnFieldRefs {
    readonly id: FieldRef<"BoardColumn", 'String'>
    readonly name: FieldRef<"BoardColumn", 'String'>
    readonly order: FieldRef<"BoardColumn", 'Int'>
    readonly color: FieldRef<"BoardColumn", 'String'>
    readonly sortOption: FieldRef<"BoardColumn", 'String'>
    readonly isDefault: FieldRef<"BoardColumn", 'Boolean'>
    readonly createdAt: FieldRef<"BoardColumn", 'DateTime'>
    readonly updatedAt: FieldRef<"BoardColumn", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * BoardColumn findUnique
   */
  export type BoardColumnFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BoardColumn
     */
    select?: BoardColumnSelect<ExtArgs> | null
    /**
     * Filter, which BoardColumn to fetch.
     */
    where: BoardColumnWhereUniqueInput
  }

  /**
   * BoardColumn findUniqueOrThrow
   */
  export type BoardColumnFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BoardColumn
     */
    select?: BoardColumnSelect<ExtArgs> | null
    /**
     * Filter, which BoardColumn to fetch.
     */
    where: BoardColumnWhereUniqueInput
  }

  /**
   * BoardColumn findFirst
   */
  export type BoardColumnFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BoardColumn
     */
    select?: BoardColumnSelect<ExtArgs> | null
    /**
     * Filter, which BoardColumn to fetch.
     */
    where?: BoardColumnWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BoardColumns to fetch.
     */
    orderBy?: BoardColumnOrderByWithRelationInput | BoardColumnOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for BoardColumns.
     */
    cursor?: BoardColumnWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BoardColumns from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BoardColumns.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of BoardColumns.
     */
    distinct?: BoardColumnScalarFieldEnum | BoardColumnScalarFieldEnum[]
  }

  /**
   * BoardColumn findFirstOrThrow
   */
  export type BoardColumnFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BoardColumn
     */
    select?: BoardColumnSelect<ExtArgs> | null
    /**
     * Filter, which BoardColumn to fetch.
     */
    where?: BoardColumnWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BoardColumns to fetch.
     */
    orderBy?: BoardColumnOrderByWithRelationInput | BoardColumnOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for BoardColumns.
     */
    cursor?: BoardColumnWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BoardColumns from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BoardColumns.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of BoardColumns.
     */
    distinct?: BoardColumnScalarFieldEnum | BoardColumnScalarFieldEnum[]
  }

  /**
   * BoardColumn findMany
   */
  export type BoardColumnFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BoardColumn
     */
    select?: BoardColumnSelect<ExtArgs> | null
    /**
     * Filter, which BoardColumns to fetch.
     */
    where?: BoardColumnWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BoardColumns to fetch.
     */
    orderBy?: BoardColumnOrderByWithRelationInput | BoardColumnOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing BoardColumns.
     */
    cursor?: BoardColumnWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BoardColumns from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BoardColumns.
     */
    skip?: number
    distinct?: BoardColumnScalarFieldEnum | BoardColumnScalarFieldEnum[]
  }

  /**
   * BoardColumn create
   */
  export type BoardColumnCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BoardColumn
     */
    select?: BoardColumnSelect<ExtArgs> | null
    /**
     * The data needed to create a BoardColumn.
     */
    data: XOR<BoardColumnCreateInput, BoardColumnUncheckedCreateInput>
  }

  /**
   * BoardColumn createMany
   */
  export type BoardColumnCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many BoardColumns.
     */
    data: BoardColumnCreateManyInput | BoardColumnCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * BoardColumn createManyAndReturn
   */
  export type BoardColumnCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BoardColumn
     */
    select?: BoardColumnSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many BoardColumns.
     */
    data: BoardColumnCreateManyInput | BoardColumnCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * BoardColumn update
   */
  export type BoardColumnUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BoardColumn
     */
    select?: BoardColumnSelect<ExtArgs> | null
    /**
     * The data needed to update a BoardColumn.
     */
    data: XOR<BoardColumnUpdateInput, BoardColumnUncheckedUpdateInput>
    /**
     * Choose, which BoardColumn to update.
     */
    where: BoardColumnWhereUniqueInput
  }

  /**
   * BoardColumn updateMany
   */
  export type BoardColumnUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update BoardColumns.
     */
    data: XOR<BoardColumnUpdateManyMutationInput, BoardColumnUncheckedUpdateManyInput>
    /**
     * Filter which BoardColumns to update
     */
    where?: BoardColumnWhereInput
  }

  /**
   * BoardColumn upsert
   */
  export type BoardColumnUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BoardColumn
     */
    select?: BoardColumnSelect<ExtArgs> | null
    /**
     * The filter to search for the BoardColumn to update in case it exists.
     */
    where: BoardColumnWhereUniqueInput
    /**
     * In case the BoardColumn found by the `where` argument doesn't exist, create a new BoardColumn with this data.
     */
    create: XOR<BoardColumnCreateInput, BoardColumnUncheckedCreateInput>
    /**
     * In case the BoardColumn was found with the provided `where` argument, update it with this data.
     */
    update: XOR<BoardColumnUpdateInput, BoardColumnUncheckedUpdateInput>
  }

  /**
   * BoardColumn delete
   */
  export type BoardColumnDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BoardColumn
     */
    select?: BoardColumnSelect<ExtArgs> | null
    /**
     * Filter which BoardColumn to delete.
     */
    where: BoardColumnWhereUniqueInput
  }

  /**
   * BoardColumn deleteMany
   */
  export type BoardColumnDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which BoardColumns to delete
     */
    where?: BoardColumnWhereInput
  }

  /**
   * BoardColumn without action
   */
  export type BoardColumnDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BoardColumn
     */
    select?: BoardColumnSelect<ExtArgs> | null
  }


  /**
   * Model Task
   */

  export type AggregateTask = {
    _count: TaskCountAggregateOutputType | null
    _avg: TaskAvgAggregateOutputType | null
    _sum: TaskSumAggregateOutputType | null
    _min: TaskMinAggregateOutputType | null
    _max: TaskMaxAggregateOutputType | null
  }

  export type TaskAvgAggregateOutputType = {
    estimatedEffort: number | null
    loggedTime: number | null
    sortOrder: number | null
  }

  export type TaskSumAggregateOutputType = {
    estimatedEffort: number | null
    loggedTime: number | null
    sortOrder: number | null
  }

  export type TaskMinAggregateOutputType = {
    id: string | null
    title: string | null
    description: string | null
    status: string | null
    priority: string | null
    dueDate: Date | null
    assignee: string | null
    color: string | null
    parentId: string | null
    acceptanceCriteria: string | null
    estimatedEffort: number | null
    loggedTime: number | null
    sortOrder: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TaskMaxAggregateOutputType = {
    id: string | null
    title: string | null
    description: string | null
    status: string | null
    priority: string | null
    dueDate: Date | null
    assignee: string | null
    color: string | null
    parentId: string | null
    acceptanceCriteria: string | null
    estimatedEffort: number | null
    loggedTime: number | null
    sortOrder: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TaskCountAggregateOutputType = {
    id: number
    title: number
    description: number
    status: number
    priority: number
    dueDate: number
    assignee: number
    color: number
    parentId: number
    acceptanceCriteria: number
    estimatedEffort: number
    loggedTime: number
    sortOrder: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type TaskAvgAggregateInputType = {
    estimatedEffort?: true
    loggedTime?: true
    sortOrder?: true
  }

  export type TaskSumAggregateInputType = {
    estimatedEffort?: true
    loggedTime?: true
    sortOrder?: true
  }

  export type TaskMinAggregateInputType = {
    id?: true
    title?: true
    description?: true
    status?: true
    priority?: true
    dueDate?: true
    assignee?: true
    color?: true
    parentId?: true
    acceptanceCriteria?: true
    estimatedEffort?: true
    loggedTime?: true
    sortOrder?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TaskMaxAggregateInputType = {
    id?: true
    title?: true
    description?: true
    status?: true
    priority?: true
    dueDate?: true
    assignee?: true
    color?: true
    parentId?: true
    acceptanceCriteria?: true
    estimatedEffort?: true
    loggedTime?: true
    sortOrder?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TaskCountAggregateInputType = {
    id?: true
    title?: true
    description?: true
    status?: true
    priority?: true
    dueDate?: true
    assignee?: true
    color?: true
    parentId?: true
    acceptanceCriteria?: true
    estimatedEffort?: true
    loggedTime?: true
    sortOrder?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type TaskAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Task to aggregate.
     */
    where?: TaskWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tasks to fetch.
     */
    orderBy?: TaskOrderByWithRelationInput | TaskOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TaskWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tasks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tasks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Tasks
    **/
    _count?: true | TaskCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: TaskAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: TaskSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TaskMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TaskMaxAggregateInputType
  }

  export type GetTaskAggregateType<T extends TaskAggregateArgs> = {
        [P in keyof T & keyof AggregateTask]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTask[P]>
      : GetScalarType<T[P], AggregateTask[P]>
  }




  export type TaskGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TaskWhereInput
    orderBy?: TaskOrderByWithAggregationInput | TaskOrderByWithAggregationInput[]
    by: TaskScalarFieldEnum[] | TaskScalarFieldEnum
    having?: TaskScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TaskCountAggregateInputType | true
    _avg?: TaskAvgAggregateInputType
    _sum?: TaskSumAggregateInputType
    _min?: TaskMinAggregateInputType
    _max?: TaskMaxAggregateInputType
  }

  export type TaskGroupByOutputType = {
    id: string
    title: string
    description: string
    status: string
    priority: string | null
    dueDate: Date | null
    assignee: string | null
    color: string | null
    parentId: string | null
    acceptanceCriteria: string
    estimatedEffort: number | null
    loggedTime: number | null
    sortOrder: number
    createdAt: Date
    updatedAt: Date
    _count: TaskCountAggregateOutputType | null
    _avg: TaskAvgAggregateOutputType | null
    _sum: TaskSumAggregateOutputType | null
    _min: TaskMinAggregateOutputType | null
    _max: TaskMaxAggregateOutputType | null
  }

  type GetTaskGroupByPayload<T extends TaskGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TaskGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TaskGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TaskGroupByOutputType[P]>
            : GetScalarType<T[P], TaskGroupByOutputType[P]>
        }
      >
    >


  export type TaskSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    description?: boolean
    status?: boolean
    priority?: boolean
    dueDate?: boolean
    assignee?: boolean
    color?: boolean
    parentId?: boolean
    acceptanceCriteria?: boolean
    estimatedEffort?: boolean
    loggedTime?: boolean
    sortOrder?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tags?: boolean | Task$tagsArgs<ExtArgs>
    parent?: boolean | Task$parentArgs<ExtArgs>
    subTasks?: boolean | Task$subTasksArgs<ExtArgs>
    _count?: boolean | TaskCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["task"]>

  export type TaskSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    description?: boolean
    status?: boolean
    priority?: boolean
    dueDate?: boolean
    assignee?: boolean
    color?: boolean
    parentId?: boolean
    acceptanceCriteria?: boolean
    estimatedEffort?: boolean
    loggedTime?: boolean
    sortOrder?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    parent?: boolean | Task$parentArgs<ExtArgs>
  }, ExtArgs["result"]["task"]>

  export type TaskSelectScalar = {
    id?: boolean
    title?: boolean
    description?: boolean
    status?: boolean
    priority?: boolean
    dueDate?: boolean
    assignee?: boolean
    color?: boolean
    parentId?: boolean
    acceptanceCriteria?: boolean
    estimatedEffort?: boolean
    loggedTime?: boolean
    sortOrder?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type TaskInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tags?: boolean | Task$tagsArgs<ExtArgs>
    parent?: boolean | Task$parentArgs<ExtArgs>
    subTasks?: boolean | Task$subTasksArgs<ExtArgs>
    _count?: boolean | TaskCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type TaskIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    parent?: boolean | Task$parentArgs<ExtArgs>
  }

  export type $TaskPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Task"
    objects: {
      tags: Prisma.$TagPayload<ExtArgs>[]
      parent: Prisma.$TaskPayload<ExtArgs> | null
      subTasks: Prisma.$TaskPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      title: string
      description: string
      status: string
      priority: string | null
      dueDate: Date | null
      assignee: string | null
      color: string | null
      parentId: string | null
      acceptanceCriteria: string
      estimatedEffort: number | null
      loggedTime: number | null
      sortOrder: number
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["task"]>
    composites: {}
  }

  type TaskGetPayload<S extends boolean | null | undefined | TaskDefaultArgs> = $Result.GetResult<Prisma.$TaskPayload, S>

  type TaskCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<TaskFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: TaskCountAggregateInputType | true
    }

  export interface TaskDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Task'], meta: { name: 'Task' } }
    /**
     * Find zero or one Task that matches the filter.
     * @param {TaskFindUniqueArgs} args - Arguments to find a Task
     * @example
     * // Get one Task
     * const task = await prisma.task.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TaskFindUniqueArgs>(args: SelectSubset<T, TaskFindUniqueArgs<ExtArgs>>): Prisma__TaskClient<$Result.GetResult<Prisma.$TaskPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Task that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {TaskFindUniqueOrThrowArgs} args - Arguments to find a Task
     * @example
     * // Get one Task
     * const task = await prisma.task.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TaskFindUniqueOrThrowArgs>(args: SelectSubset<T, TaskFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TaskClient<$Result.GetResult<Prisma.$TaskPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Task that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TaskFindFirstArgs} args - Arguments to find a Task
     * @example
     * // Get one Task
     * const task = await prisma.task.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TaskFindFirstArgs>(args?: SelectSubset<T, TaskFindFirstArgs<ExtArgs>>): Prisma__TaskClient<$Result.GetResult<Prisma.$TaskPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Task that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TaskFindFirstOrThrowArgs} args - Arguments to find a Task
     * @example
     * // Get one Task
     * const task = await prisma.task.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TaskFindFirstOrThrowArgs>(args?: SelectSubset<T, TaskFindFirstOrThrowArgs<ExtArgs>>): Prisma__TaskClient<$Result.GetResult<Prisma.$TaskPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Tasks that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TaskFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Tasks
     * const tasks = await prisma.task.findMany()
     * 
     * // Get first 10 Tasks
     * const tasks = await prisma.task.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const taskWithIdOnly = await prisma.task.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TaskFindManyArgs>(args?: SelectSubset<T, TaskFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TaskPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Task.
     * @param {TaskCreateArgs} args - Arguments to create a Task.
     * @example
     * // Create one Task
     * const Task = await prisma.task.create({
     *   data: {
     *     // ... data to create a Task
     *   }
     * })
     * 
     */
    create<T extends TaskCreateArgs>(args: SelectSubset<T, TaskCreateArgs<ExtArgs>>): Prisma__TaskClient<$Result.GetResult<Prisma.$TaskPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Tasks.
     * @param {TaskCreateManyArgs} args - Arguments to create many Tasks.
     * @example
     * // Create many Tasks
     * const task = await prisma.task.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TaskCreateManyArgs>(args?: SelectSubset<T, TaskCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Tasks and returns the data saved in the database.
     * @param {TaskCreateManyAndReturnArgs} args - Arguments to create many Tasks.
     * @example
     * // Create many Tasks
     * const task = await prisma.task.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Tasks and only return the `id`
     * const taskWithIdOnly = await prisma.task.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TaskCreateManyAndReturnArgs>(args?: SelectSubset<T, TaskCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TaskPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Task.
     * @param {TaskDeleteArgs} args - Arguments to delete one Task.
     * @example
     * // Delete one Task
     * const Task = await prisma.task.delete({
     *   where: {
     *     // ... filter to delete one Task
     *   }
     * })
     * 
     */
    delete<T extends TaskDeleteArgs>(args: SelectSubset<T, TaskDeleteArgs<ExtArgs>>): Prisma__TaskClient<$Result.GetResult<Prisma.$TaskPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Task.
     * @param {TaskUpdateArgs} args - Arguments to update one Task.
     * @example
     * // Update one Task
     * const task = await prisma.task.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TaskUpdateArgs>(args: SelectSubset<T, TaskUpdateArgs<ExtArgs>>): Prisma__TaskClient<$Result.GetResult<Prisma.$TaskPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Tasks.
     * @param {TaskDeleteManyArgs} args - Arguments to filter Tasks to delete.
     * @example
     * // Delete a few Tasks
     * const { count } = await prisma.task.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TaskDeleteManyArgs>(args?: SelectSubset<T, TaskDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tasks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TaskUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Tasks
     * const task = await prisma.task.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TaskUpdateManyArgs>(args: SelectSubset<T, TaskUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Task.
     * @param {TaskUpsertArgs} args - Arguments to update or create a Task.
     * @example
     * // Update or create a Task
     * const task = await prisma.task.upsert({
     *   create: {
     *     // ... data to create a Task
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Task we want to update
     *   }
     * })
     */
    upsert<T extends TaskUpsertArgs>(args: SelectSubset<T, TaskUpsertArgs<ExtArgs>>): Prisma__TaskClient<$Result.GetResult<Prisma.$TaskPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Tasks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TaskCountArgs} args - Arguments to filter Tasks to count.
     * @example
     * // Count the number of Tasks
     * const count = await prisma.task.count({
     *   where: {
     *     // ... the filter for the Tasks we want to count
     *   }
     * })
    **/
    count<T extends TaskCountArgs>(
      args?: Subset<T, TaskCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TaskCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Task.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TaskAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends TaskAggregateArgs>(args: Subset<T, TaskAggregateArgs>): Prisma.PrismaPromise<GetTaskAggregateType<T>>

    /**
     * Group by Task.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TaskGroupByArgs} args - Group by arguments.
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
      T extends TaskGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TaskGroupByArgs['orderBy'] }
        : { orderBy?: TaskGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, TaskGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTaskGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Task model
   */
  readonly fields: TaskFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Task.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TaskClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    tags<T extends Task$tagsArgs<ExtArgs> = {}>(args?: Subset<T, Task$tagsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TagPayload<ExtArgs>, T, "findMany"> | Null>
    parent<T extends Task$parentArgs<ExtArgs> = {}>(args?: Subset<T, Task$parentArgs<ExtArgs>>): Prisma__TaskClient<$Result.GetResult<Prisma.$TaskPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    subTasks<T extends Task$subTasksArgs<ExtArgs> = {}>(args?: Subset<T, Task$subTasksArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TaskPayload<ExtArgs>, T, "findMany"> | Null>
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
   * Fields of the Task model
   */ 
  interface TaskFieldRefs {
    readonly id: FieldRef<"Task", 'String'>
    readonly title: FieldRef<"Task", 'String'>
    readonly description: FieldRef<"Task", 'String'>
    readonly status: FieldRef<"Task", 'String'>
    readonly priority: FieldRef<"Task", 'String'>
    readonly dueDate: FieldRef<"Task", 'DateTime'>
    readonly assignee: FieldRef<"Task", 'String'>
    readonly color: FieldRef<"Task", 'String'>
    readonly parentId: FieldRef<"Task", 'String'>
    readonly acceptanceCriteria: FieldRef<"Task", 'String'>
    readonly estimatedEffort: FieldRef<"Task", 'Float'>
    readonly loggedTime: FieldRef<"Task", 'Float'>
    readonly sortOrder: FieldRef<"Task", 'Int'>
    readonly createdAt: FieldRef<"Task", 'DateTime'>
    readonly updatedAt: FieldRef<"Task", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Task findUnique
   */
  export type TaskFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Task
     */
    select?: TaskSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TaskInclude<ExtArgs> | null
    /**
     * Filter, which Task to fetch.
     */
    where: TaskWhereUniqueInput
  }

  /**
   * Task findUniqueOrThrow
   */
  export type TaskFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Task
     */
    select?: TaskSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TaskInclude<ExtArgs> | null
    /**
     * Filter, which Task to fetch.
     */
    where: TaskWhereUniqueInput
  }

  /**
   * Task findFirst
   */
  export type TaskFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Task
     */
    select?: TaskSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TaskInclude<ExtArgs> | null
    /**
     * Filter, which Task to fetch.
     */
    where?: TaskWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tasks to fetch.
     */
    orderBy?: TaskOrderByWithRelationInput | TaskOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Tasks.
     */
    cursor?: TaskWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tasks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tasks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Tasks.
     */
    distinct?: TaskScalarFieldEnum | TaskScalarFieldEnum[]
  }

  /**
   * Task findFirstOrThrow
   */
  export type TaskFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Task
     */
    select?: TaskSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TaskInclude<ExtArgs> | null
    /**
     * Filter, which Task to fetch.
     */
    where?: TaskWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tasks to fetch.
     */
    orderBy?: TaskOrderByWithRelationInput | TaskOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Tasks.
     */
    cursor?: TaskWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tasks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tasks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Tasks.
     */
    distinct?: TaskScalarFieldEnum | TaskScalarFieldEnum[]
  }

  /**
   * Task findMany
   */
  export type TaskFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Task
     */
    select?: TaskSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TaskInclude<ExtArgs> | null
    /**
     * Filter, which Tasks to fetch.
     */
    where?: TaskWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tasks to fetch.
     */
    orderBy?: TaskOrderByWithRelationInput | TaskOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Tasks.
     */
    cursor?: TaskWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tasks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tasks.
     */
    skip?: number
    distinct?: TaskScalarFieldEnum | TaskScalarFieldEnum[]
  }

  /**
   * Task create
   */
  export type TaskCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Task
     */
    select?: TaskSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TaskInclude<ExtArgs> | null
    /**
     * The data needed to create a Task.
     */
    data: XOR<TaskCreateInput, TaskUncheckedCreateInput>
  }

  /**
   * Task createMany
   */
  export type TaskCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Tasks.
     */
    data: TaskCreateManyInput | TaskCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Task createManyAndReturn
   */
  export type TaskCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Task
     */
    select?: TaskSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Tasks.
     */
    data: TaskCreateManyInput | TaskCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TaskIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Task update
   */
  export type TaskUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Task
     */
    select?: TaskSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TaskInclude<ExtArgs> | null
    /**
     * The data needed to update a Task.
     */
    data: XOR<TaskUpdateInput, TaskUncheckedUpdateInput>
    /**
     * Choose, which Task to update.
     */
    where: TaskWhereUniqueInput
  }

  /**
   * Task updateMany
   */
  export type TaskUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Tasks.
     */
    data: XOR<TaskUpdateManyMutationInput, TaskUncheckedUpdateManyInput>
    /**
     * Filter which Tasks to update
     */
    where?: TaskWhereInput
  }

  /**
   * Task upsert
   */
  export type TaskUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Task
     */
    select?: TaskSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TaskInclude<ExtArgs> | null
    /**
     * The filter to search for the Task to update in case it exists.
     */
    where: TaskWhereUniqueInput
    /**
     * In case the Task found by the `where` argument doesn't exist, create a new Task with this data.
     */
    create: XOR<TaskCreateInput, TaskUncheckedCreateInput>
    /**
     * In case the Task was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TaskUpdateInput, TaskUncheckedUpdateInput>
  }

  /**
   * Task delete
   */
  export type TaskDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Task
     */
    select?: TaskSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TaskInclude<ExtArgs> | null
    /**
     * Filter which Task to delete.
     */
    where: TaskWhereUniqueInput
  }

  /**
   * Task deleteMany
   */
  export type TaskDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Tasks to delete
     */
    where?: TaskWhereInput
  }

  /**
   * Task.tags
   */
  export type Task$tagsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tag
     */
    select?: TagSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TagInclude<ExtArgs> | null
    where?: TagWhereInput
    orderBy?: TagOrderByWithRelationInput | TagOrderByWithRelationInput[]
    cursor?: TagWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TagScalarFieldEnum | TagScalarFieldEnum[]
  }

  /**
   * Task.parent
   */
  export type Task$parentArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Task
     */
    select?: TaskSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TaskInclude<ExtArgs> | null
    where?: TaskWhereInput
  }

  /**
   * Task.subTasks
   */
  export type Task$subTasksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Task
     */
    select?: TaskSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TaskInclude<ExtArgs> | null
    where?: TaskWhereInput
    orderBy?: TaskOrderByWithRelationInput | TaskOrderByWithRelationInput[]
    cursor?: TaskWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TaskScalarFieldEnum | TaskScalarFieldEnum[]
  }

  /**
   * Task without action
   */
  export type TaskDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Task
     */
    select?: TaskSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TaskInclude<ExtArgs> | null
  }


  /**
   * Model Tag
   */

  export type AggregateTag = {
    _count: TagCountAggregateOutputType | null
    _min: TagMinAggregateOutputType | null
    _max: TagMaxAggregateOutputType | null
  }

  export type TagMinAggregateOutputType = {
    id: string | null
    name: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TagMaxAggregateOutputType = {
    id: string | null
    name: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TagCountAggregateOutputType = {
    id: number
    name: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type TagMinAggregateInputType = {
    id?: true
    name?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TagMaxAggregateInputType = {
    id?: true
    name?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TagCountAggregateInputType = {
    id?: true
    name?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type TagAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Tag to aggregate.
     */
    where?: TagWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tags to fetch.
     */
    orderBy?: TagOrderByWithRelationInput | TagOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TagWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tags from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tags.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Tags
    **/
    _count?: true | TagCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TagMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TagMaxAggregateInputType
  }

  export type GetTagAggregateType<T extends TagAggregateArgs> = {
        [P in keyof T & keyof AggregateTag]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTag[P]>
      : GetScalarType<T[P], AggregateTag[P]>
  }




  export type TagGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TagWhereInput
    orderBy?: TagOrderByWithAggregationInput | TagOrderByWithAggregationInput[]
    by: TagScalarFieldEnum[] | TagScalarFieldEnum
    having?: TagScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TagCountAggregateInputType | true
    _min?: TagMinAggregateInputType
    _max?: TagMaxAggregateInputType
  }

  export type TagGroupByOutputType = {
    id: string
    name: string
    createdAt: Date
    updatedAt: Date
    _count: TagCountAggregateOutputType | null
    _min: TagMinAggregateOutputType | null
    _max: TagMaxAggregateOutputType | null
  }

  type GetTagGroupByPayload<T extends TagGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TagGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TagGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TagGroupByOutputType[P]>
            : GetScalarType<T[P], TagGroupByOutputType[P]>
        }
      >
    >


  export type TagSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tasks?: boolean | Tag$tasksArgs<ExtArgs>
    _count?: boolean | TagCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tag"]>

  export type TagSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["tag"]>

  export type TagSelectScalar = {
    id?: boolean
    name?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type TagInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tasks?: boolean | Tag$tasksArgs<ExtArgs>
    _count?: boolean | TagCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type TagIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $TagPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Tag"
    objects: {
      tasks: Prisma.$TaskPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["tag"]>
    composites: {}
  }

  type TagGetPayload<S extends boolean | null | undefined | TagDefaultArgs> = $Result.GetResult<Prisma.$TagPayload, S>

  type TagCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<TagFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: TagCountAggregateInputType | true
    }

  export interface TagDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Tag'], meta: { name: 'Tag' } }
    /**
     * Find zero or one Tag that matches the filter.
     * @param {TagFindUniqueArgs} args - Arguments to find a Tag
     * @example
     * // Get one Tag
     * const tag = await prisma.tag.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TagFindUniqueArgs>(args: SelectSubset<T, TagFindUniqueArgs<ExtArgs>>): Prisma__TagClient<$Result.GetResult<Prisma.$TagPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Tag that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {TagFindUniqueOrThrowArgs} args - Arguments to find a Tag
     * @example
     * // Get one Tag
     * const tag = await prisma.tag.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TagFindUniqueOrThrowArgs>(args: SelectSubset<T, TagFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TagClient<$Result.GetResult<Prisma.$TagPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Tag that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TagFindFirstArgs} args - Arguments to find a Tag
     * @example
     * // Get one Tag
     * const tag = await prisma.tag.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TagFindFirstArgs>(args?: SelectSubset<T, TagFindFirstArgs<ExtArgs>>): Prisma__TagClient<$Result.GetResult<Prisma.$TagPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Tag that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TagFindFirstOrThrowArgs} args - Arguments to find a Tag
     * @example
     * // Get one Tag
     * const tag = await prisma.tag.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TagFindFirstOrThrowArgs>(args?: SelectSubset<T, TagFindFirstOrThrowArgs<ExtArgs>>): Prisma__TagClient<$Result.GetResult<Prisma.$TagPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Tags that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TagFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Tags
     * const tags = await prisma.tag.findMany()
     * 
     * // Get first 10 Tags
     * const tags = await prisma.tag.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const tagWithIdOnly = await prisma.tag.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TagFindManyArgs>(args?: SelectSubset<T, TagFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TagPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Tag.
     * @param {TagCreateArgs} args - Arguments to create a Tag.
     * @example
     * // Create one Tag
     * const Tag = await prisma.tag.create({
     *   data: {
     *     // ... data to create a Tag
     *   }
     * })
     * 
     */
    create<T extends TagCreateArgs>(args: SelectSubset<T, TagCreateArgs<ExtArgs>>): Prisma__TagClient<$Result.GetResult<Prisma.$TagPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Tags.
     * @param {TagCreateManyArgs} args - Arguments to create many Tags.
     * @example
     * // Create many Tags
     * const tag = await prisma.tag.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TagCreateManyArgs>(args?: SelectSubset<T, TagCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Tags and returns the data saved in the database.
     * @param {TagCreateManyAndReturnArgs} args - Arguments to create many Tags.
     * @example
     * // Create many Tags
     * const tag = await prisma.tag.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Tags and only return the `id`
     * const tagWithIdOnly = await prisma.tag.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TagCreateManyAndReturnArgs>(args?: SelectSubset<T, TagCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TagPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Tag.
     * @param {TagDeleteArgs} args - Arguments to delete one Tag.
     * @example
     * // Delete one Tag
     * const Tag = await prisma.tag.delete({
     *   where: {
     *     // ... filter to delete one Tag
     *   }
     * })
     * 
     */
    delete<T extends TagDeleteArgs>(args: SelectSubset<T, TagDeleteArgs<ExtArgs>>): Prisma__TagClient<$Result.GetResult<Prisma.$TagPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Tag.
     * @param {TagUpdateArgs} args - Arguments to update one Tag.
     * @example
     * // Update one Tag
     * const tag = await prisma.tag.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TagUpdateArgs>(args: SelectSubset<T, TagUpdateArgs<ExtArgs>>): Prisma__TagClient<$Result.GetResult<Prisma.$TagPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Tags.
     * @param {TagDeleteManyArgs} args - Arguments to filter Tags to delete.
     * @example
     * // Delete a few Tags
     * const { count } = await prisma.tag.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TagDeleteManyArgs>(args?: SelectSubset<T, TagDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tags.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TagUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Tags
     * const tag = await prisma.tag.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TagUpdateManyArgs>(args: SelectSubset<T, TagUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Tag.
     * @param {TagUpsertArgs} args - Arguments to update or create a Tag.
     * @example
     * // Update or create a Tag
     * const tag = await prisma.tag.upsert({
     *   create: {
     *     // ... data to create a Tag
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Tag we want to update
     *   }
     * })
     */
    upsert<T extends TagUpsertArgs>(args: SelectSubset<T, TagUpsertArgs<ExtArgs>>): Prisma__TagClient<$Result.GetResult<Prisma.$TagPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Tags.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TagCountArgs} args - Arguments to filter Tags to count.
     * @example
     * // Count the number of Tags
     * const count = await prisma.tag.count({
     *   where: {
     *     // ... the filter for the Tags we want to count
     *   }
     * })
    **/
    count<T extends TagCountArgs>(
      args?: Subset<T, TagCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TagCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Tag.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TagAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends TagAggregateArgs>(args: Subset<T, TagAggregateArgs>): Prisma.PrismaPromise<GetTagAggregateType<T>>

    /**
     * Group by Tag.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TagGroupByArgs} args - Group by arguments.
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
      T extends TagGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TagGroupByArgs['orderBy'] }
        : { orderBy?: TagGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, TagGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTagGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Tag model
   */
  readonly fields: TagFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Tag.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TagClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    tasks<T extends Tag$tasksArgs<ExtArgs> = {}>(args?: Subset<T, Tag$tasksArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TaskPayload<ExtArgs>, T, "findMany"> | Null>
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
   * Fields of the Tag model
   */ 
  interface TagFieldRefs {
    readonly id: FieldRef<"Tag", 'String'>
    readonly name: FieldRef<"Tag", 'String'>
    readonly createdAt: FieldRef<"Tag", 'DateTime'>
    readonly updatedAt: FieldRef<"Tag", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Tag findUnique
   */
  export type TagFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tag
     */
    select?: TagSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TagInclude<ExtArgs> | null
    /**
     * Filter, which Tag to fetch.
     */
    where: TagWhereUniqueInput
  }

  /**
   * Tag findUniqueOrThrow
   */
  export type TagFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tag
     */
    select?: TagSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TagInclude<ExtArgs> | null
    /**
     * Filter, which Tag to fetch.
     */
    where: TagWhereUniqueInput
  }

  /**
   * Tag findFirst
   */
  export type TagFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tag
     */
    select?: TagSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TagInclude<ExtArgs> | null
    /**
     * Filter, which Tag to fetch.
     */
    where?: TagWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tags to fetch.
     */
    orderBy?: TagOrderByWithRelationInput | TagOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Tags.
     */
    cursor?: TagWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tags from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tags.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Tags.
     */
    distinct?: TagScalarFieldEnum | TagScalarFieldEnum[]
  }

  /**
   * Tag findFirstOrThrow
   */
  export type TagFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tag
     */
    select?: TagSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TagInclude<ExtArgs> | null
    /**
     * Filter, which Tag to fetch.
     */
    where?: TagWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tags to fetch.
     */
    orderBy?: TagOrderByWithRelationInput | TagOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Tags.
     */
    cursor?: TagWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tags from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tags.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Tags.
     */
    distinct?: TagScalarFieldEnum | TagScalarFieldEnum[]
  }

  /**
   * Tag findMany
   */
  export type TagFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tag
     */
    select?: TagSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TagInclude<ExtArgs> | null
    /**
     * Filter, which Tags to fetch.
     */
    where?: TagWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tags to fetch.
     */
    orderBy?: TagOrderByWithRelationInput | TagOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Tags.
     */
    cursor?: TagWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tags from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tags.
     */
    skip?: number
    distinct?: TagScalarFieldEnum | TagScalarFieldEnum[]
  }

  /**
   * Tag create
   */
  export type TagCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tag
     */
    select?: TagSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TagInclude<ExtArgs> | null
    /**
     * The data needed to create a Tag.
     */
    data: XOR<TagCreateInput, TagUncheckedCreateInput>
  }

  /**
   * Tag createMany
   */
  export type TagCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Tags.
     */
    data: TagCreateManyInput | TagCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Tag createManyAndReturn
   */
  export type TagCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tag
     */
    select?: TagSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Tags.
     */
    data: TagCreateManyInput | TagCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Tag update
   */
  export type TagUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tag
     */
    select?: TagSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TagInclude<ExtArgs> | null
    /**
     * The data needed to update a Tag.
     */
    data: XOR<TagUpdateInput, TagUncheckedUpdateInput>
    /**
     * Choose, which Tag to update.
     */
    where: TagWhereUniqueInput
  }

  /**
   * Tag updateMany
   */
  export type TagUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Tags.
     */
    data: XOR<TagUpdateManyMutationInput, TagUncheckedUpdateManyInput>
    /**
     * Filter which Tags to update
     */
    where?: TagWhereInput
  }

  /**
   * Tag upsert
   */
  export type TagUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tag
     */
    select?: TagSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TagInclude<ExtArgs> | null
    /**
     * The filter to search for the Tag to update in case it exists.
     */
    where: TagWhereUniqueInput
    /**
     * In case the Tag found by the `where` argument doesn't exist, create a new Tag with this data.
     */
    create: XOR<TagCreateInput, TagUncheckedCreateInput>
    /**
     * In case the Tag was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TagUpdateInput, TagUncheckedUpdateInput>
  }

  /**
   * Tag delete
   */
  export type TagDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tag
     */
    select?: TagSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TagInclude<ExtArgs> | null
    /**
     * Filter which Tag to delete.
     */
    where: TagWhereUniqueInput
  }

  /**
   * Tag deleteMany
   */
  export type TagDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Tags to delete
     */
    where?: TagWhereInput
  }

  /**
   * Tag.tasks
   */
  export type Tag$tasksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Task
     */
    select?: TaskSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TaskInclude<ExtArgs> | null
    where?: TaskWhereInput
    orderBy?: TaskOrderByWithRelationInput | TaskOrderByWithRelationInput[]
    cursor?: TaskWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TaskScalarFieldEnum | TaskScalarFieldEnum[]
  }

  /**
   * Tag without action
   */
  export type TagDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tag
     */
    select?: TagSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TagInclude<ExtArgs> | null
  }


  /**
   * Model MCPSession
   */

  export type AggregateMCPSession = {
    _count: MCPSessionCountAggregateOutputType | null
    _min: MCPSessionMinAggregateOutputType | null
    _max: MCPSessionMaxAggregateOutputType | null
  }

  export type MCPSessionMinAggregateOutputType = {
    id: string | null
    sessionId: string | null
    modelId: string | null
    status: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type MCPSessionMaxAggregateOutputType = {
    id: string | null
    sessionId: string | null
    modelId: string | null
    status: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type MCPSessionCountAggregateOutputType = {
    id: number
    sessionId: number
    modelId: number
    status: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type MCPSessionMinAggregateInputType = {
    id?: true
    sessionId?: true
    modelId?: true
    status?: true
    createdAt?: true
    updatedAt?: true
  }

  export type MCPSessionMaxAggregateInputType = {
    id?: true
    sessionId?: true
    modelId?: true
    status?: true
    createdAt?: true
    updatedAt?: true
  }

  export type MCPSessionCountAggregateInputType = {
    id?: true
    sessionId?: true
    modelId?: true
    status?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type MCPSessionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MCPSession to aggregate.
     */
    where?: MCPSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MCPSessions to fetch.
     */
    orderBy?: MCPSessionOrderByWithRelationInput | MCPSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: MCPSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MCPSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MCPSessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned MCPSessions
    **/
    _count?: true | MCPSessionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MCPSessionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MCPSessionMaxAggregateInputType
  }

  export type GetMCPSessionAggregateType<T extends MCPSessionAggregateArgs> = {
        [P in keyof T & keyof AggregateMCPSession]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMCPSession[P]>
      : GetScalarType<T[P], AggregateMCPSession[P]>
  }




  export type MCPSessionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MCPSessionWhereInput
    orderBy?: MCPSessionOrderByWithAggregationInput | MCPSessionOrderByWithAggregationInput[]
    by: MCPSessionScalarFieldEnum[] | MCPSessionScalarFieldEnum
    having?: MCPSessionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MCPSessionCountAggregateInputType | true
    _min?: MCPSessionMinAggregateInputType
    _max?: MCPSessionMaxAggregateInputType
  }

  export type MCPSessionGroupByOutputType = {
    id: string
    sessionId: string
    modelId: string
    status: string
    createdAt: Date
    updatedAt: Date
    _count: MCPSessionCountAggregateOutputType | null
    _min: MCPSessionMinAggregateOutputType | null
    _max: MCPSessionMaxAggregateOutputType | null
  }

  type GetMCPSessionGroupByPayload<T extends MCPSessionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MCPSessionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MCPSessionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MCPSessionGroupByOutputType[P]>
            : GetScalarType<T[P], MCPSessionGroupByOutputType[P]>
        }
      >
    >


  export type MCPSessionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sessionId?: boolean
    modelId?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    messages?: boolean | MCPSession$messagesArgs<ExtArgs>
    _count?: boolean | MCPSessionCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["mCPSession"]>

  export type MCPSessionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sessionId?: boolean
    modelId?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["mCPSession"]>

  export type MCPSessionSelectScalar = {
    id?: boolean
    sessionId?: boolean
    modelId?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type MCPSessionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    messages?: boolean | MCPSession$messagesArgs<ExtArgs>
    _count?: boolean | MCPSessionCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type MCPSessionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $MCPSessionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "MCPSession"
    objects: {
      messages: Prisma.$MCPMessagePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      sessionId: string
      modelId: string
      status: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["mCPSession"]>
    composites: {}
  }

  type MCPSessionGetPayload<S extends boolean | null | undefined | MCPSessionDefaultArgs> = $Result.GetResult<Prisma.$MCPSessionPayload, S>

  type MCPSessionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<MCPSessionFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: MCPSessionCountAggregateInputType | true
    }

  export interface MCPSessionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['MCPSession'], meta: { name: 'MCPSession' } }
    /**
     * Find zero or one MCPSession that matches the filter.
     * @param {MCPSessionFindUniqueArgs} args - Arguments to find a MCPSession
     * @example
     * // Get one MCPSession
     * const mCPSession = await prisma.mCPSession.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MCPSessionFindUniqueArgs>(args: SelectSubset<T, MCPSessionFindUniqueArgs<ExtArgs>>): Prisma__MCPSessionClient<$Result.GetResult<Prisma.$MCPSessionPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one MCPSession that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {MCPSessionFindUniqueOrThrowArgs} args - Arguments to find a MCPSession
     * @example
     * // Get one MCPSession
     * const mCPSession = await prisma.mCPSession.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MCPSessionFindUniqueOrThrowArgs>(args: SelectSubset<T, MCPSessionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__MCPSessionClient<$Result.GetResult<Prisma.$MCPSessionPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first MCPSession that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MCPSessionFindFirstArgs} args - Arguments to find a MCPSession
     * @example
     * // Get one MCPSession
     * const mCPSession = await prisma.mCPSession.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MCPSessionFindFirstArgs>(args?: SelectSubset<T, MCPSessionFindFirstArgs<ExtArgs>>): Prisma__MCPSessionClient<$Result.GetResult<Prisma.$MCPSessionPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first MCPSession that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MCPSessionFindFirstOrThrowArgs} args - Arguments to find a MCPSession
     * @example
     * // Get one MCPSession
     * const mCPSession = await prisma.mCPSession.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MCPSessionFindFirstOrThrowArgs>(args?: SelectSubset<T, MCPSessionFindFirstOrThrowArgs<ExtArgs>>): Prisma__MCPSessionClient<$Result.GetResult<Prisma.$MCPSessionPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more MCPSessions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MCPSessionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all MCPSessions
     * const mCPSessions = await prisma.mCPSession.findMany()
     * 
     * // Get first 10 MCPSessions
     * const mCPSessions = await prisma.mCPSession.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const mCPSessionWithIdOnly = await prisma.mCPSession.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends MCPSessionFindManyArgs>(args?: SelectSubset<T, MCPSessionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MCPSessionPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a MCPSession.
     * @param {MCPSessionCreateArgs} args - Arguments to create a MCPSession.
     * @example
     * // Create one MCPSession
     * const MCPSession = await prisma.mCPSession.create({
     *   data: {
     *     // ... data to create a MCPSession
     *   }
     * })
     * 
     */
    create<T extends MCPSessionCreateArgs>(args: SelectSubset<T, MCPSessionCreateArgs<ExtArgs>>): Prisma__MCPSessionClient<$Result.GetResult<Prisma.$MCPSessionPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many MCPSessions.
     * @param {MCPSessionCreateManyArgs} args - Arguments to create many MCPSessions.
     * @example
     * // Create many MCPSessions
     * const mCPSession = await prisma.mCPSession.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends MCPSessionCreateManyArgs>(args?: SelectSubset<T, MCPSessionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many MCPSessions and returns the data saved in the database.
     * @param {MCPSessionCreateManyAndReturnArgs} args - Arguments to create many MCPSessions.
     * @example
     * // Create many MCPSessions
     * const mCPSession = await prisma.mCPSession.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many MCPSessions and only return the `id`
     * const mCPSessionWithIdOnly = await prisma.mCPSession.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends MCPSessionCreateManyAndReturnArgs>(args?: SelectSubset<T, MCPSessionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MCPSessionPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a MCPSession.
     * @param {MCPSessionDeleteArgs} args - Arguments to delete one MCPSession.
     * @example
     * // Delete one MCPSession
     * const MCPSession = await prisma.mCPSession.delete({
     *   where: {
     *     // ... filter to delete one MCPSession
     *   }
     * })
     * 
     */
    delete<T extends MCPSessionDeleteArgs>(args: SelectSubset<T, MCPSessionDeleteArgs<ExtArgs>>): Prisma__MCPSessionClient<$Result.GetResult<Prisma.$MCPSessionPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one MCPSession.
     * @param {MCPSessionUpdateArgs} args - Arguments to update one MCPSession.
     * @example
     * // Update one MCPSession
     * const mCPSession = await prisma.mCPSession.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends MCPSessionUpdateArgs>(args: SelectSubset<T, MCPSessionUpdateArgs<ExtArgs>>): Prisma__MCPSessionClient<$Result.GetResult<Prisma.$MCPSessionPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more MCPSessions.
     * @param {MCPSessionDeleteManyArgs} args - Arguments to filter MCPSessions to delete.
     * @example
     * // Delete a few MCPSessions
     * const { count } = await prisma.mCPSession.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends MCPSessionDeleteManyArgs>(args?: SelectSubset<T, MCPSessionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MCPSessions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MCPSessionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many MCPSessions
     * const mCPSession = await prisma.mCPSession.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends MCPSessionUpdateManyArgs>(args: SelectSubset<T, MCPSessionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one MCPSession.
     * @param {MCPSessionUpsertArgs} args - Arguments to update or create a MCPSession.
     * @example
     * // Update or create a MCPSession
     * const mCPSession = await prisma.mCPSession.upsert({
     *   create: {
     *     // ... data to create a MCPSession
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the MCPSession we want to update
     *   }
     * })
     */
    upsert<T extends MCPSessionUpsertArgs>(args: SelectSubset<T, MCPSessionUpsertArgs<ExtArgs>>): Prisma__MCPSessionClient<$Result.GetResult<Prisma.$MCPSessionPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of MCPSessions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MCPSessionCountArgs} args - Arguments to filter MCPSessions to count.
     * @example
     * // Count the number of MCPSessions
     * const count = await prisma.mCPSession.count({
     *   where: {
     *     // ... the filter for the MCPSessions we want to count
     *   }
     * })
    **/
    count<T extends MCPSessionCountArgs>(
      args?: Subset<T, MCPSessionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MCPSessionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a MCPSession.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MCPSessionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends MCPSessionAggregateArgs>(args: Subset<T, MCPSessionAggregateArgs>): Prisma.PrismaPromise<GetMCPSessionAggregateType<T>>

    /**
     * Group by MCPSession.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MCPSessionGroupByArgs} args - Group by arguments.
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
      T extends MCPSessionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: MCPSessionGroupByArgs['orderBy'] }
        : { orderBy?: MCPSessionGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, MCPSessionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMCPSessionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the MCPSession model
   */
  readonly fields: MCPSessionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for MCPSession.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__MCPSessionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    messages<T extends MCPSession$messagesArgs<ExtArgs> = {}>(args?: Subset<T, MCPSession$messagesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MCPMessagePayload<ExtArgs>, T, "findMany"> | Null>
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
   * Fields of the MCPSession model
   */ 
  interface MCPSessionFieldRefs {
    readonly id: FieldRef<"MCPSession", 'String'>
    readonly sessionId: FieldRef<"MCPSession", 'String'>
    readonly modelId: FieldRef<"MCPSession", 'String'>
    readonly status: FieldRef<"MCPSession", 'String'>
    readonly createdAt: FieldRef<"MCPSession", 'DateTime'>
    readonly updatedAt: FieldRef<"MCPSession", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * MCPSession findUnique
   */
  export type MCPSessionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MCPSession
     */
    select?: MCPSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MCPSessionInclude<ExtArgs> | null
    /**
     * Filter, which MCPSession to fetch.
     */
    where: MCPSessionWhereUniqueInput
  }

  /**
   * MCPSession findUniqueOrThrow
   */
  export type MCPSessionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MCPSession
     */
    select?: MCPSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MCPSessionInclude<ExtArgs> | null
    /**
     * Filter, which MCPSession to fetch.
     */
    where: MCPSessionWhereUniqueInput
  }

  /**
   * MCPSession findFirst
   */
  export type MCPSessionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MCPSession
     */
    select?: MCPSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MCPSessionInclude<ExtArgs> | null
    /**
     * Filter, which MCPSession to fetch.
     */
    where?: MCPSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MCPSessions to fetch.
     */
    orderBy?: MCPSessionOrderByWithRelationInput | MCPSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MCPSessions.
     */
    cursor?: MCPSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MCPSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MCPSessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MCPSessions.
     */
    distinct?: MCPSessionScalarFieldEnum | MCPSessionScalarFieldEnum[]
  }

  /**
   * MCPSession findFirstOrThrow
   */
  export type MCPSessionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MCPSession
     */
    select?: MCPSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MCPSessionInclude<ExtArgs> | null
    /**
     * Filter, which MCPSession to fetch.
     */
    where?: MCPSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MCPSessions to fetch.
     */
    orderBy?: MCPSessionOrderByWithRelationInput | MCPSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MCPSessions.
     */
    cursor?: MCPSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MCPSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MCPSessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MCPSessions.
     */
    distinct?: MCPSessionScalarFieldEnum | MCPSessionScalarFieldEnum[]
  }

  /**
   * MCPSession findMany
   */
  export type MCPSessionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MCPSession
     */
    select?: MCPSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MCPSessionInclude<ExtArgs> | null
    /**
     * Filter, which MCPSessions to fetch.
     */
    where?: MCPSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MCPSessions to fetch.
     */
    orderBy?: MCPSessionOrderByWithRelationInput | MCPSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing MCPSessions.
     */
    cursor?: MCPSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MCPSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MCPSessions.
     */
    skip?: number
    distinct?: MCPSessionScalarFieldEnum | MCPSessionScalarFieldEnum[]
  }

  /**
   * MCPSession create
   */
  export type MCPSessionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MCPSession
     */
    select?: MCPSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MCPSessionInclude<ExtArgs> | null
    /**
     * The data needed to create a MCPSession.
     */
    data: XOR<MCPSessionCreateInput, MCPSessionUncheckedCreateInput>
  }

  /**
   * MCPSession createMany
   */
  export type MCPSessionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many MCPSessions.
     */
    data: MCPSessionCreateManyInput | MCPSessionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * MCPSession createManyAndReturn
   */
  export type MCPSessionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MCPSession
     */
    select?: MCPSessionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many MCPSessions.
     */
    data: MCPSessionCreateManyInput | MCPSessionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * MCPSession update
   */
  export type MCPSessionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MCPSession
     */
    select?: MCPSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MCPSessionInclude<ExtArgs> | null
    /**
     * The data needed to update a MCPSession.
     */
    data: XOR<MCPSessionUpdateInput, MCPSessionUncheckedUpdateInput>
    /**
     * Choose, which MCPSession to update.
     */
    where: MCPSessionWhereUniqueInput
  }

  /**
   * MCPSession updateMany
   */
  export type MCPSessionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update MCPSessions.
     */
    data: XOR<MCPSessionUpdateManyMutationInput, MCPSessionUncheckedUpdateManyInput>
    /**
     * Filter which MCPSessions to update
     */
    where?: MCPSessionWhereInput
  }

  /**
   * MCPSession upsert
   */
  export type MCPSessionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MCPSession
     */
    select?: MCPSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MCPSessionInclude<ExtArgs> | null
    /**
     * The filter to search for the MCPSession to update in case it exists.
     */
    where: MCPSessionWhereUniqueInput
    /**
     * In case the MCPSession found by the `where` argument doesn't exist, create a new MCPSession with this data.
     */
    create: XOR<MCPSessionCreateInput, MCPSessionUncheckedCreateInput>
    /**
     * In case the MCPSession was found with the provided `where` argument, update it with this data.
     */
    update: XOR<MCPSessionUpdateInput, MCPSessionUncheckedUpdateInput>
  }

  /**
   * MCPSession delete
   */
  export type MCPSessionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MCPSession
     */
    select?: MCPSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MCPSessionInclude<ExtArgs> | null
    /**
     * Filter which MCPSession to delete.
     */
    where: MCPSessionWhereUniqueInput
  }

  /**
   * MCPSession deleteMany
   */
  export type MCPSessionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MCPSessions to delete
     */
    where?: MCPSessionWhereInput
  }

  /**
   * MCPSession.messages
   */
  export type MCPSession$messagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MCPMessage
     */
    select?: MCPMessageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MCPMessageInclude<ExtArgs> | null
    where?: MCPMessageWhereInput
    orderBy?: MCPMessageOrderByWithRelationInput | MCPMessageOrderByWithRelationInput[]
    cursor?: MCPMessageWhereUniqueInput
    take?: number
    skip?: number
    distinct?: MCPMessageScalarFieldEnum | MCPMessageScalarFieldEnum[]
  }

  /**
   * MCPSession without action
   */
  export type MCPSessionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MCPSession
     */
    select?: MCPSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MCPSessionInclude<ExtArgs> | null
  }


  /**
   * Model MCPMessage
   */

  export type AggregateMCPMessage = {
    _count: MCPMessageCountAggregateOutputType | null
    _min: MCPMessageMinAggregateOutputType | null
    _max: MCPMessageMaxAggregateOutputType | null
  }

  export type MCPMessageMinAggregateOutputType = {
    id: string | null
    sessionId: string | null
    role: string | null
    content: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type MCPMessageMaxAggregateOutputType = {
    id: string | null
    sessionId: string | null
    role: string | null
    content: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type MCPMessageCountAggregateOutputType = {
    id: number
    sessionId: number
    role: number
    content: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type MCPMessageMinAggregateInputType = {
    id?: true
    sessionId?: true
    role?: true
    content?: true
    createdAt?: true
    updatedAt?: true
  }

  export type MCPMessageMaxAggregateInputType = {
    id?: true
    sessionId?: true
    role?: true
    content?: true
    createdAt?: true
    updatedAt?: true
  }

  export type MCPMessageCountAggregateInputType = {
    id?: true
    sessionId?: true
    role?: true
    content?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type MCPMessageAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MCPMessage to aggregate.
     */
    where?: MCPMessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MCPMessages to fetch.
     */
    orderBy?: MCPMessageOrderByWithRelationInput | MCPMessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: MCPMessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MCPMessages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MCPMessages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned MCPMessages
    **/
    _count?: true | MCPMessageCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MCPMessageMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MCPMessageMaxAggregateInputType
  }

  export type GetMCPMessageAggregateType<T extends MCPMessageAggregateArgs> = {
        [P in keyof T & keyof AggregateMCPMessage]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMCPMessage[P]>
      : GetScalarType<T[P], AggregateMCPMessage[P]>
  }




  export type MCPMessageGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MCPMessageWhereInput
    orderBy?: MCPMessageOrderByWithAggregationInput | MCPMessageOrderByWithAggregationInput[]
    by: MCPMessageScalarFieldEnum[] | MCPMessageScalarFieldEnum
    having?: MCPMessageScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MCPMessageCountAggregateInputType | true
    _min?: MCPMessageMinAggregateInputType
    _max?: MCPMessageMaxAggregateInputType
  }

  export type MCPMessageGroupByOutputType = {
    id: string
    sessionId: string
    role: string
    content: string
    createdAt: Date
    updatedAt: Date
    _count: MCPMessageCountAggregateOutputType | null
    _min: MCPMessageMinAggregateOutputType | null
    _max: MCPMessageMaxAggregateOutputType | null
  }

  type GetMCPMessageGroupByPayload<T extends MCPMessageGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MCPMessageGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MCPMessageGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MCPMessageGroupByOutputType[P]>
            : GetScalarType<T[P], MCPMessageGroupByOutputType[P]>
        }
      >
    >


  export type MCPMessageSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sessionId?: boolean
    role?: boolean
    content?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    session?: boolean | MCPSessionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["mCPMessage"]>

  export type MCPMessageSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sessionId?: boolean
    role?: boolean
    content?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    session?: boolean | MCPSessionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["mCPMessage"]>

  export type MCPMessageSelectScalar = {
    id?: boolean
    sessionId?: boolean
    role?: boolean
    content?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type MCPMessageInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    session?: boolean | MCPSessionDefaultArgs<ExtArgs>
  }
  export type MCPMessageIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    session?: boolean | MCPSessionDefaultArgs<ExtArgs>
  }

  export type $MCPMessagePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "MCPMessage"
    objects: {
      session: Prisma.$MCPSessionPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      sessionId: string
      role: string
      content: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["mCPMessage"]>
    composites: {}
  }

  type MCPMessageGetPayload<S extends boolean | null | undefined | MCPMessageDefaultArgs> = $Result.GetResult<Prisma.$MCPMessagePayload, S>

  type MCPMessageCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<MCPMessageFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: MCPMessageCountAggregateInputType | true
    }

  export interface MCPMessageDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['MCPMessage'], meta: { name: 'MCPMessage' } }
    /**
     * Find zero or one MCPMessage that matches the filter.
     * @param {MCPMessageFindUniqueArgs} args - Arguments to find a MCPMessage
     * @example
     * // Get one MCPMessage
     * const mCPMessage = await prisma.mCPMessage.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MCPMessageFindUniqueArgs>(args: SelectSubset<T, MCPMessageFindUniqueArgs<ExtArgs>>): Prisma__MCPMessageClient<$Result.GetResult<Prisma.$MCPMessagePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one MCPMessage that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {MCPMessageFindUniqueOrThrowArgs} args - Arguments to find a MCPMessage
     * @example
     * // Get one MCPMessage
     * const mCPMessage = await prisma.mCPMessage.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MCPMessageFindUniqueOrThrowArgs>(args: SelectSubset<T, MCPMessageFindUniqueOrThrowArgs<ExtArgs>>): Prisma__MCPMessageClient<$Result.GetResult<Prisma.$MCPMessagePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first MCPMessage that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MCPMessageFindFirstArgs} args - Arguments to find a MCPMessage
     * @example
     * // Get one MCPMessage
     * const mCPMessage = await prisma.mCPMessage.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MCPMessageFindFirstArgs>(args?: SelectSubset<T, MCPMessageFindFirstArgs<ExtArgs>>): Prisma__MCPMessageClient<$Result.GetResult<Prisma.$MCPMessagePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first MCPMessage that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MCPMessageFindFirstOrThrowArgs} args - Arguments to find a MCPMessage
     * @example
     * // Get one MCPMessage
     * const mCPMessage = await prisma.mCPMessage.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MCPMessageFindFirstOrThrowArgs>(args?: SelectSubset<T, MCPMessageFindFirstOrThrowArgs<ExtArgs>>): Prisma__MCPMessageClient<$Result.GetResult<Prisma.$MCPMessagePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more MCPMessages that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MCPMessageFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all MCPMessages
     * const mCPMessages = await prisma.mCPMessage.findMany()
     * 
     * // Get first 10 MCPMessages
     * const mCPMessages = await prisma.mCPMessage.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const mCPMessageWithIdOnly = await prisma.mCPMessage.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends MCPMessageFindManyArgs>(args?: SelectSubset<T, MCPMessageFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MCPMessagePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a MCPMessage.
     * @param {MCPMessageCreateArgs} args - Arguments to create a MCPMessage.
     * @example
     * // Create one MCPMessage
     * const MCPMessage = await prisma.mCPMessage.create({
     *   data: {
     *     // ... data to create a MCPMessage
     *   }
     * })
     * 
     */
    create<T extends MCPMessageCreateArgs>(args: SelectSubset<T, MCPMessageCreateArgs<ExtArgs>>): Prisma__MCPMessageClient<$Result.GetResult<Prisma.$MCPMessagePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many MCPMessages.
     * @param {MCPMessageCreateManyArgs} args - Arguments to create many MCPMessages.
     * @example
     * // Create many MCPMessages
     * const mCPMessage = await prisma.mCPMessage.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends MCPMessageCreateManyArgs>(args?: SelectSubset<T, MCPMessageCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many MCPMessages and returns the data saved in the database.
     * @param {MCPMessageCreateManyAndReturnArgs} args - Arguments to create many MCPMessages.
     * @example
     * // Create many MCPMessages
     * const mCPMessage = await prisma.mCPMessage.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many MCPMessages and only return the `id`
     * const mCPMessageWithIdOnly = await prisma.mCPMessage.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends MCPMessageCreateManyAndReturnArgs>(args?: SelectSubset<T, MCPMessageCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MCPMessagePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a MCPMessage.
     * @param {MCPMessageDeleteArgs} args - Arguments to delete one MCPMessage.
     * @example
     * // Delete one MCPMessage
     * const MCPMessage = await prisma.mCPMessage.delete({
     *   where: {
     *     // ... filter to delete one MCPMessage
     *   }
     * })
     * 
     */
    delete<T extends MCPMessageDeleteArgs>(args: SelectSubset<T, MCPMessageDeleteArgs<ExtArgs>>): Prisma__MCPMessageClient<$Result.GetResult<Prisma.$MCPMessagePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one MCPMessage.
     * @param {MCPMessageUpdateArgs} args - Arguments to update one MCPMessage.
     * @example
     * // Update one MCPMessage
     * const mCPMessage = await prisma.mCPMessage.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends MCPMessageUpdateArgs>(args: SelectSubset<T, MCPMessageUpdateArgs<ExtArgs>>): Prisma__MCPMessageClient<$Result.GetResult<Prisma.$MCPMessagePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more MCPMessages.
     * @param {MCPMessageDeleteManyArgs} args - Arguments to filter MCPMessages to delete.
     * @example
     * // Delete a few MCPMessages
     * const { count } = await prisma.mCPMessage.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends MCPMessageDeleteManyArgs>(args?: SelectSubset<T, MCPMessageDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MCPMessages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MCPMessageUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many MCPMessages
     * const mCPMessage = await prisma.mCPMessage.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends MCPMessageUpdateManyArgs>(args: SelectSubset<T, MCPMessageUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one MCPMessage.
     * @param {MCPMessageUpsertArgs} args - Arguments to update or create a MCPMessage.
     * @example
     * // Update or create a MCPMessage
     * const mCPMessage = await prisma.mCPMessage.upsert({
     *   create: {
     *     // ... data to create a MCPMessage
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the MCPMessage we want to update
     *   }
     * })
     */
    upsert<T extends MCPMessageUpsertArgs>(args: SelectSubset<T, MCPMessageUpsertArgs<ExtArgs>>): Prisma__MCPMessageClient<$Result.GetResult<Prisma.$MCPMessagePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of MCPMessages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MCPMessageCountArgs} args - Arguments to filter MCPMessages to count.
     * @example
     * // Count the number of MCPMessages
     * const count = await prisma.mCPMessage.count({
     *   where: {
     *     // ... the filter for the MCPMessages we want to count
     *   }
     * })
    **/
    count<T extends MCPMessageCountArgs>(
      args?: Subset<T, MCPMessageCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MCPMessageCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a MCPMessage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MCPMessageAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends MCPMessageAggregateArgs>(args: Subset<T, MCPMessageAggregateArgs>): Prisma.PrismaPromise<GetMCPMessageAggregateType<T>>

    /**
     * Group by MCPMessage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MCPMessageGroupByArgs} args - Group by arguments.
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
      T extends MCPMessageGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: MCPMessageGroupByArgs['orderBy'] }
        : { orderBy?: MCPMessageGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, MCPMessageGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMCPMessageGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the MCPMessage model
   */
  readonly fields: MCPMessageFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for MCPMessage.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__MCPMessageClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    session<T extends MCPSessionDefaultArgs<ExtArgs> = {}>(args?: Subset<T, MCPSessionDefaultArgs<ExtArgs>>): Prisma__MCPSessionClient<$Result.GetResult<Prisma.$MCPSessionPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
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
   * Fields of the MCPMessage model
   */ 
  interface MCPMessageFieldRefs {
    readonly id: FieldRef<"MCPMessage", 'String'>
    readonly sessionId: FieldRef<"MCPMessage", 'String'>
    readonly role: FieldRef<"MCPMessage", 'String'>
    readonly content: FieldRef<"MCPMessage", 'String'>
    readonly createdAt: FieldRef<"MCPMessage", 'DateTime'>
    readonly updatedAt: FieldRef<"MCPMessage", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * MCPMessage findUnique
   */
  export type MCPMessageFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MCPMessage
     */
    select?: MCPMessageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MCPMessageInclude<ExtArgs> | null
    /**
     * Filter, which MCPMessage to fetch.
     */
    where: MCPMessageWhereUniqueInput
  }

  /**
   * MCPMessage findUniqueOrThrow
   */
  export type MCPMessageFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MCPMessage
     */
    select?: MCPMessageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MCPMessageInclude<ExtArgs> | null
    /**
     * Filter, which MCPMessage to fetch.
     */
    where: MCPMessageWhereUniqueInput
  }

  /**
   * MCPMessage findFirst
   */
  export type MCPMessageFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MCPMessage
     */
    select?: MCPMessageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MCPMessageInclude<ExtArgs> | null
    /**
     * Filter, which MCPMessage to fetch.
     */
    where?: MCPMessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MCPMessages to fetch.
     */
    orderBy?: MCPMessageOrderByWithRelationInput | MCPMessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MCPMessages.
     */
    cursor?: MCPMessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MCPMessages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MCPMessages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MCPMessages.
     */
    distinct?: MCPMessageScalarFieldEnum | MCPMessageScalarFieldEnum[]
  }

  /**
   * MCPMessage findFirstOrThrow
   */
  export type MCPMessageFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MCPMessage
     */
    select?: MCPMessageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MCPMessageInclude<ExtArgs> | null
    /**
     * Filter, which MCPMessage to fetch.
     */
    where?: MCPMessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MCPMessages to fetch.
     */
    orderBy?: MCPMessageOrderByWithRelationInput | MCPMessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MCPMessages.
     */
    cursor?: MCPMessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MCPMessages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MCPMessages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MCPMessages.
     */
    distinct?: MCPMessageScalarFieldEnum | MCPMessageScalarFieldEnum[]
  }

  /**
   * MCPMessage findMany
   */
  export type MCPMessageFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MCPMessage
     */
    select?: MCPMessageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MCPMessageInclude<ExtArgs> | null
    /**
     * Filter, which MCPMessages to fetch.
     */
    where?: MCPMessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MCPMessages to fetch.
     */
    orderBy?: MCPMessageOrderByWithRelationInput | MCPMessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing MCPMessages.
     */
    cursor?: MCPMessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MCPMessages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MCPMessages.
     */
    skip?: number
    distinct?: MCPMessageScalarFieldEnum | MCPMessageScalarFieldEnum[]
  }

  /**
   * MCPMessage create
   */
  export type MCPMessageCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MCPMessage
     */
    select?: MCPMessageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MCPMessageInclude<ExtArgs> | null
    /**
     * The data needed to create a MCPMessage.
     */
    data: XOR<MCPMessageCreateInput, MCPMessageUncheckedCreateInput>
  }

  /**
   * MCPMessage createMany
   */
  export type MCPMessageCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many MCPMessages.
     */
    data: MCPMessageCreateManyInput | MCPMessageCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * MCPMessage createManyAndReturn
   */
  export type MCPMessageCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MCPMessage
     */
    select?: MCPMessageSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many MCPMessages.
     */
    data: MCPMessageCreateManyInput | MCPMessageCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MCPMessageIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * MCPMessage update
   */
  export type MCPMessageUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MCPMessage
     */
    select?: MCPMessageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MCPMessageInclude<ExtArgs> | null
    /**
     * The data needed to update a MCPMessage.
     */
    data: XOR<MCPMessageUpdateInput, MCPMessageUncheckedUpdateInput>
    /**
     * Choose, which MCPMessage to update.
     */
    where: MCPMessageWhereUniqueInput
  }

  /**
   * MCPMessage updateMany
   */
  export type MCPMessageUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update MCPMessages.
     */
    data: XOR<MCPMessageUpdateManyMutationInput, MCPMessageUncheckedUpdateManyInput>
    /**
     * Filter which MCPMessages to update
     */
    where?: MCPMessageWhereInput
  }

  /**
   * MCPMessage upsert
   */
  export type MCPMessageUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MCPMessage
     */
    select?: MCPMessageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MCPMessageInclude<ExtArgs> | null
    /**
     * The filter to search for the MCPMessage to update in case it exists.
     */
    where: MCPMessageWhereUniqueInput
    /**
     * In case the MCPMessage found by the `where` argument doesn't exist, create a new MCPMessage with this data.
     */
    create: XOR<MCPMessageCreateInput, MCPMessageUncheckedCreateInput>
    /**
     * In case the MCPMessage was found with the provided `where` argument, update it with this data.
     */
    update: XOR<MCPMessageUpdateInput, MCPMessageUncheckedUpdateInput>
  }

  /**
   * MCPMessage delete
   */
  export type MCPMessageDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MCPMessage
     */
    select?: MCPMessageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MCPMessageInclude<ExtArgs> | null
    /**
     * Filter which MCPMessage to delete.
     */
    where: MCPMessageWhereUniqueInput
  }

  /**
   * MCPMessage deleteMany
   */
  export type MCPMessageDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MCPMessages to delete
     */
    where?: MCPMessageWhereInput
  }

  /**
   * MCPMessage without action
   */
  export type MCPMessageDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MCPMessage
     */
    select?: MCPMessageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MCPMessageInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const BoardColumnScalarFieldEnum: {
    id: 'id',
    name: 'name',
    order: 'order',
    color: 'color',
    sortOption: 'sortOption',
    isDefault: 'isDefault',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type BoardColumnScalarFieldEnum = (typeof BoardColumnScalarFieldEnum)[keyof typeof BoardColumnScalarFieldEnum]


  export const TaskScalarFieldEnum: {
    id: 'id',
    title: 'title',
    description: 'description',
    status: 'status',
    priority: 'priority',
    dueDate: 'dueDate',
    assignee: 'assignee',
    color: 'color',
    parentId: 'parentId',
    acceptanceCriteria: 'acceptanceCriteria',
    estimatedEffort: 'estimatedEffort',
    loggedTime: 'loggedTime',
    sortOrder: 'sortOrder',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type TaskScalarFieldEnum = (typeof TaskScalarFieldEnum)[keyof typeof TaskScalarFieldEnum]


  export const TagScalarFieldEnum: {
    id: 'id',
    name: 'name',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type TagScalarFieldEnum = (typeof TagScalarFieldEnum)[keyof typeof TagScalarFieldEnum]


  export const MCPSessionScalarFieldEnum: {
    id: 'id',
    sessionId: 'sessionId',
    modelId: 'modelId',
    status: 'status',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type MCPSessionScalarFieldEnum = (typeof MCPSessionScalarFieldEnum)[keyof typeof MCPSessionScalarFieldEnum]


  export const MCPMessageScalarFieldEnum: {
    id: 'id',
    sessionId: 'sessionId',
    role: 'role',
    content: 'content',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type MCPMessageScalarFieldEnum = (typeof MCPMessageScalarFieldEnum)[keyof typeof MCPMessageScalarFieldEnum]


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


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


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
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type BoardColumnWhereInput = {
    AND?: BoardColumnWhereInput | BoardColumnWhereInput[]
    OR?: BoardColumnWhereInput[]
    NOT?: BoardColumnWhereInput | BoardColumnWhereInput[]
    id?: StringFilter<"BoardColumn"> | string
    name?: StringFilter<"BoardColumn"> | string
    order?: IntFilter<"BoardColumn"> | number
    color?: StringNullableFilter<"BoardColumn"> | string | null
    sortOption?: StringNullableFilter<"BoardColumn"> | string | null
    isDefault?: BoolFilter<"BoardColumn"> | boolean
    createdAt?: DateTimeFilter<"BoardColumn"> | Date | string
    updatedAt?: DateTimeFilter<"BoardColumn"> | Date | string
  }

  export type BoardColumnOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    order?: SortOrder
    color?: SortOrderInput | SortOrder
    sortOption?: SortOrderInput | SortOrder
    isDefault?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BoardColumnWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    order?: number
    AND?: BoardColumnWhereInput | BoardColumnWhereInput[]
    OR?: BoardColumnWhereInput[]
    NOT?: BoardColumnWhereInput | BoardColumnWhereInput[]
    name?: StringFilter<"BoardColumn"> | string
    color?: StringNullableFilter<"BoardColumn"> | string | null
    sortOption?: StringNullableFilter<"BoardColumn"> | string | null
    isDefault?: BoolFilter<"BoardColumn"> | boolean
    createdAt?: DateTimeFilter<"BoardColumn"> | Date | string
    updatedAt?: DateTimeFilter<"BoardColumn"> | Date | string
  }, "id" | "order">

  export type BoardColumnOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    order?: SortOrder
    color?: SortOrderInput | SortOrder
    sortOption?: SortOrderInput | SortOrder
    isDefault?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: BoardColumnCountOrderByAggregateInput
    _avg?: BoardColumnAvgOrderByAggregateInput
    _max?: BoardColumnMaxOrderByAggregateInput
    _min?: BoardColumnMinOrderByAggregateInput
    _sum?: BoardColumnSumOrderByAggregateInput
  }

  export type BoardColumnScalarWhereWithAggregatesInput = {
    AND?: BoardColumnScalarWhereWithAggregatesInput | BoardColumnScalarWhereWithAggregatesInput[]
    OR?: BoardColumnScalarWhereWithAggregatesInput[]
    NOT?: BoardColumnScalarWhereWithAggregatesInput | BoardColumnScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"BoardColumn"> | string
    name?: StringWithAggregatesFilter<"BoardColumn"> | string
    order?: IntWithAggregatesFilter<"BoardColumn"> | number
    color?: StringNullableWithAggregatesFilter<"BoardColumn"> | string | null
    sortOption?: StringNullableWithAggregatesFilter<"BoardColumn"> | string | null
    isDefault?: BoolWithAggregatesFilter<"BoardColumn"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"BoardColumn"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"BoardColumn"> | Date | string
  }

  export type TaskWhereInput = {
    AND?: TaskWhereInput | TaskWhereInput[]
    OR?: TaskWhereInput[]
    NOT?: TaskWhereInput | TaskWhereInput[]
    id?: StringFilter<"Task"> | string
    title?: StringFilter<"Task"> | string
    description?: StringFilter<"Task"> | string
    status?: StringFilter<"Task"> | string
    priority?: StringNullableFilter<"Task"> | string | null
    dueDate?: DateTimeNullableFilter<"Task"> | Date | string | null
    assignee?: StringNullableFilter<"Task"> | string | null
    color?: StringNullableFilter<"Task"> | string | null
    parentId?: StringNullableFilter<"Task"> | string | null
    acceptanceCriteria?: StringFilter<"Task"> | string
    estimatedEffort?: FloatNullableFilter<"Task"> | number | null
    loggedTime?: FloatNullableFilter<"Task"> | number | null
    sortOrder?: IntFilter<"Task"> | number
    createdAt?: DateTimeFilter<"Task"> | Date | string
    updatedAt?: DateTimeFilter<"Task"> | Date | string
    tags?: TagListRelationFilter
    parent?: XOR<TaskNullableRelationFilter, TaskWhereInput> | null
    subTasks?: TaskListRelationFilter
  }

  export type TaskOrderByWithRelationInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    status?: SortOrder
    priority?: SortOrderInput | SortOrder
    dueDate?: SortOrderInput | SortOrder
    assignee?: SortOrderInput | SortOrder
    color?: SortOrderInput | SortOrder
    parentId?: SortOrderInput | SortOrder
    acceptanceCriteria?: SortOrder
    estimatedEffort?: SortOrderInput | SortOrder
    loggedTime?: SortOrderInput | SortOrder
    sortOrder?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    tags?: TagOrderByRelationAggregateInput
    parent?: TaskOrderByWithRelationInput
    subTasks?: TaskOrderByRelationAggregateInput
  }

  export type TaskWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: TaskWhereInput | TaskWhereInput[]
    OR?: TaskWhereInput[]
    NOT?: TaskWhereInput | TaskWhereInput[]
    title?: StringFilter<"Task"> | string
    description?: StringFilter<"Task"> | string
    status?: StringFilter<"Task"> | string
    priority?: StringNullableFilter<"Task"> | string | null
    dueDate?: DateTimeNullableFilter<"Task"> | Date | string | null
    assignee?: StringNullableFilter<"Task"> | string | null
    color?: StringNullableFilter<"Task"> | string | null
    parentId?: StringNullableFilter<"Task"> | string | null
    acceptanceCriteria?: StringFilter<"Task"> | string
    estimatedEffort?: FloatNullableFilter<"Task"> | number | null
    loggedTime?: FloatNullableFilter<"Task"> | number | null
    sortOrder?: IntFilter<"Task"> | number
    createdAt?: DateTimeFilter<"Task"> | Date | string
    updatedAt?: DateTimeFilter<"Task"> | Date | string
    tags?: TagListRelationFilter
    parent?: XOR<TaskNullableRelationFilter, TaskWhereInput> | null
    subTasks?: TaskListRelationFilter
  }, "id">

  export type TaskOrderByWithAggregationInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    status?: SortOrder
    priority?: SortOrderInput | SortOrder
    dueDate?: SortOrderInput | SortOrder
    assignee?: SortOrderInput | SortOrder
    color?: SortOrderInput | SortOrder
    parentId?: SortOrderInput | SortOrder
    acceptanceCriteria?: SortOrder
    estimatedEffort?: SortOrderInput | SortOrder
    loggedTime?: SortOrderInput | SortOrder
    sortOrder?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: TaskCountOrderByAggregateInput
    _avg?: TaskAvgOrderByAggregateInput
    _max?: TaskMaxOrderByAggregateInput
    _min?: TaskMinOrderByAggregateInput
    _sum?: TaskSumOrderByAggregateInput
  }

  export type TaskScalarWhereWithAggregatesInput = {
    AND?: TaskScalarWhereWithAggregatesInput | TaskScalarWhereWithAggregatesInput[]
    OR?: TaskScalarWhereWithAggregatesInput[]
    NOT?: TaskScalarWhereWithAggregatesInput | TaskScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Task"> | string
    title?: StringWithAggregatesFilter<"Task"> | string
    description?: StringWithAggregatesFilter<"Task"> | string
    status?: StringWithAggregatesFilter<"Task"> | string
    priority?: StringNullableWithAggregatesFilter<"Task"> | string | null
    dueDate?: DateTimeNullableWithAggregatesFilter<"Task"> | Date | string | null
    assignee?: StringNullableWithAggregatesFilter<"Task"> | string | null
    color?: StringNullableWithAggregatesFilter<"Task"> | string | null
    parentId?: StringNullableWithAggregatesFilter<"Task"> | string | null
    acceptanceCriteria?: StringWithAggregatesFilter<"Task"> | string
    estimatedEffort?: FloatNullableWithAggregatesFilter<"Task"> | number | null
    loggedTime?: FloatNullableWithAggregatesFilter<"Task"> | number | null
    sortOrder?: IntWithAggregatesFilter<"Task"> | number
    createdAt?: DateTimeWithAggregatesFilter<"Task"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Task"> | Date | string
  }

  export type TagWhereInput = {
    AND?: TagWhereInput | TagWhereInput[]
    OR?: TagWhereInput[]
    NOT?: TagWhereInput | TagWhereInput[]
    id?: StringFilter<"Tag"> | string
    name?: StringFilter<"Tag"> | string
    createdAt?: DateTimeFilter<"Tag"> | Date | string
    updatedAt?: DateTimeFilter<"Tag"> | Date | string
    tasks?: TaskListRelationFilter
  }

  export type TagOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    tasks?: TaskOrderByRelationAggregateInput
  }

  export type TagWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    name?: string
    AND?: TagWhereInput | TagWhereInput[]
    OR?: TagWhereInput[]
    NOT?: TagWhereInput | TagWhereInput[]
    createdAt?: DateTimeFilter<"Tag"> | Date | string
    updatedAt?: DateTimeFilter<"Tag"> | Date | string
    tasks?: TaskListRelationFilter
  }, "id" | "name">

  export type TagOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: TagCountOrderByAggregateInput
    _max?: TagMaxOrderByAggregateInput
    _min?: TagMinOrderByAggregateInput
  }

  export type TagScalarWhereWithAggregatesInput = {
    AND?: TagScalarWhereWithAggregatesInput | TagScalarWhereWithAggregatesInput[]
    OR?: TagScalarWhereWithAggregatesInput[]
    NOT?: TagScalarWhereWithAggregatesInput | TagScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Tag"> | string
    name?: StringWithAggregatesFilter<"Tag"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Tag"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Tag"> | Date | string
  }

  export type MCPSessionWhereInput = {
    AND?: MCPSessionWhereInput | MCPSessionWhereInput[]
    OR?: MCPSessionWhereInput[]
    NOT?: MCPSessionWhereInput | MCPSessionWhereInput[]
    id?: StringFilter<"MCPSession"> | string
    sessionId?: StringFilter<"MCPSession"> | string
    modelId?: StringFilter<"MCPSession"> | string
    status?: StringFilter<"MCPSession"> | string
    createdAt?: DateTimeFilter<"MCPSession"> | Date | string
    updatedAt?: DateTimeFilter<"MCPSession"> | Date | string
    messages?: MCPMessageListRelationFilter
  }

  export type MCPSessionOrderByWithRelationInput = {
    id?: SortOrder
    sessionId?: SortOrder
    modelId?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    messages?: MCPMessageOrderByRelationAggregateInput
  }

  export type MCPSessionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    sessionId?: string
    AND?: MCPSessionWhereInput | MCPSessionWhereInput[]
    OR?: MCPSessionWhereInput[]
    NOT?: MCPSessionWhereInput | MCPSessionWhereInput[]
    modelId?: StringFilter<"MCPSession"> | string
    status?: StringFilter<"MCPSession"> | string
    createdAt?: DateTimeFilter<"MCPSession"> | Date | string
    updatedAt?: DateTimeFilter<"MCPSession"> | Date | string
    messages?: MCPMessageListRelationFilter
  }, "id" | "sessionId">

  export type MCPSessionOrderByWithAggregationInput = {
    id?: SortOrder
    sessionId?: SortOrder
    modelId?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: MCPSessionCountOrderByAggregateInput
    _max?: MCPSessionMaxOrderByAggregateInput
    _min?: MCPSessionMinOrderByAggregateInput
  }

  export type MCPSessionScalarWhereWithAggregatesInput = {
    AND?: MCPSessionScalarWhereWithAggregatesInput | MCPSessionScalarWhereWithAggregatesInput[]
    OR?: MCPSessionScalarWhereWithAggregatesInput[]
    NOT?: MCPSessionScalarWhereWithAggregatesInput | MCPSessionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"MCPSession"> | string
    sessionId?: StringWithAggregatesFilter<"MCPSession"> | string
    modelId?: StringWithAggregatesFilter<"MCPSession"> | string
    status?: StringWithAggregatesFilter<"MCPSession"> | string
    createdAt?: DateTimeWithAggregatesFilter<"MCPSession"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"MCPSession"> | Date | string
  }

  export type MCPMessageWhereInput = {
    AND?: MCPMessageWhereInput | MCPMessageWhereInput[]
    OR?: MCPMessageWhereInput[]
    NOT?: MCPMessageWhereInput | MCPMessageWhereInput[]
    id?: StringFilter<"MCPMessage"> | string
    sessionId?: StringFilter<"MCPMessage"> | string
    role?: StringFilter<"MCPMessage"> | string
    content?: StringFilter<"MCPMessage"> | string
    createdAt?: DateTimeFilter<"MCPMessage"> | Date | string
    updatedAt?: DateTimeFilter<"MCPMessage"> | Date | string
    session?: XOR<MCPSessionRelationFilter, MCPSessionWhereInput>
  }

  export type MCPMessageOrderByWithRelationInput = {
    id?: SortOrder
    sessionId?: SortOrder
    role?: SortOrder
    content?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    session?: MCPSessionOrderByWithRelationInput
  }

  export type MCPMessageWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: MCPMessageWhereInput | MCPMessageWhereInput[]
    OR?: MCPMessageWhereInput[]
    NOT?: MCPMessageWhereInput | MCPMessageWhereInput[]
    sessionId?: StringFilter<"MCPMessage"> | string
    role?: StringFilter<"MCPMessage"> | string
    content?: StringFilter<"MCPMessage"> | string
    createdAt?: DateTimeFilter<"MCPMessage"> | Date | string
    updatedAt?: DateTimeFilter<"MCPMessage"> | Date | string
    session?: XOR<MCPSessionRelationFilter, MCPSessionWhereInput>
  }, "id">

  export type MCPMessageOrderByWithAggregationInput = {
    id?: SortOrder
    sessionId?: SortOrder
    role?: SortOrder
    content?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: MCPMessageCountOrderByAggregateInput
    _max?: MCPMessageMaxOrderByAggregateInput
    _min?: MCPMessageMinOrderByAggregateInput
  }

  export type MCPMessageScalarWhereWithAggregatesInput = {
    AND?: MCPMessageScalarWhereWithAggregatesInput | MCPMessageScalarWhereWithAggregatesInput[]
    OR?: MCPMessageScalarWhereWithAggregatesInput[]
    NOT?: MCPMessageScalarWhereWithAggregatesInput | MCPMessageScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"MCPMessage"> | string
    sessionId?: StringWithAggregatesFilter<"MCPMessage"> | string
    role?: StringWithAggregatesFilter<"MCPMessage"> | string
    content?: StringWithAggregatesFilter<"MCPMessage"> | string
    createdAt?: DateTimeWithAggregatesFilter<"MCPMessage"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"MCPMessage"> | Date | string
  }

  export type BoardColumnCreateInput = {
    id?: string
    name: string
    order: number
    color?: string | null
    sortOption?: string | null
    isDefault?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BoardColumnUncheckedCreateInput = {
    id?: string
    name: string
    order: number
    color?: string | null
    sortOption?: string | null
    isDefault?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BoardColumnUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    color?: NullableStringFieldUpdateOperationsInput | string | null
    sortOption?: NullableStringFieldUpdateOperationsInput | string | null
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BoardColumnUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    color?: NullableStringFieldUpdateOperationsInput | string | null
    sortOption?: NullableStringFieldUpdateOperationsInput | string | null
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BoardColumnCreateManyInput = {
    id?: string
    name: string
    order: number
    color?: string | null
    sortOption?: string | null
    isDefault?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BoardColumnUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    color?: NullableStringFieldUpdateOperationsInput | string | null
    sortOption?: NullableStringFieldUpdateOperationsInput | string | null
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BoardColumnUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    color?: NullableStringFieldUpdateOperationsInput | string | null
    sortOption?: NullableStringFieldUpdateOperationsInput | string | null
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TaskCreateInput = {
    id?: string
    title: string
    description?: string
    status: string
    priority?: string | null
    dueDate?: Date | string | null
    assignee?: string | null
    color?: string | null
    acceptanceCriteria?: string
    estimatedEffort?: number | null
    loggedTime?: number | null
    sortOrder?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    tags?: TagCreateNestedManyWithoutTasksInput
    parent?: TaskCreateNestedOneWithoutSubTasksInput
    subTasks?: TaskCreateNestedManyWithoutParentInput
  }

  export type TaskUncheckedCreateInput = {
    id?: string
    title: string
    description?: string
    status: string
    priority?: string | null
    dueDate?: Date | string | null
    assignee?: string | null
    color?: string | null
    parentId?: string | null
    acceptanceCriteria?: string
    estimatedEffort?: number | null
    loggedTime?: number | null
    sortOrder?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    tags?: TagUncheckedCreateNestedManyWithoutTasksInput
    subTasks?: TaskUncheckedCreateNestedManyWithoutParentInput
  }

  export type TaskUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    priority?: NullableStringFieldUpdateOperationsInput | string | null
    dueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    assignee?: NullableStringFieldUpdateOperationsInput | string | null
    color?: NullableStringFieldUpdateOperationsInput | string | null
    acceptanceCriteria?: StringFieldUpdateOperationsInput | string
    estimatedEffort?: NullableFloatFieldUpdateOperationsInput | number | null
    loggedTime?: NullableFloatFieldUpdateOperationsInput | number | null
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tags?: TagUpdateManyWithoutTasksNestedInput
    parent?: TaskUpdateOneWithoutSubTasksNestedInput
    subTasks?: TaskUpdateManyWithoutParentNestedInput
  }

  export type TaskUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    priority?: NullableStringFieldUpdateOperationsInput | string | null
    dueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    assignee?: NullableStringFieldUpdateOperationsInput | string | null
    color?: NullableStringFieldUpdateOperationsInput | string | null
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    acceptanceCriteria?: StringFieldUpdateOperationsInput | string
    estimatedEffort?: NullableFloatFieldUpdateOperationsInput | number | null
    loggedTime?: NullableFloatFieldUpdateOperationsInput | number | null
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tags?: TagUncheckedUpdateManyWithoutTasksNestedInput
    subTasks?: TaskUncheckedUpdateManyWithoutParentNestedInput
  }

  export type TaskCreateManyInput = {
    id?: string
    title: string
    description?: string
    status: string
    priority?: string | null
    dueDate?: Date | string | null
    assignee?: string | null
    color?: string | null
    parentId?: string | null
    acceptanceCriteria?: string
    estimatedEffort?: number | null
    loggedTime?: number | null
    sortOrder?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TaskUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    priority?: NullableStringFieldUpdateOperationsInput | string | null
    dueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    assignee?: NullableStringFieldUpdateOperationsInput | string | null
    color?: NullableStringFieldUpdateOperationsInput | string | null
    acceptanceCriteria?: StringFieldUpdateOperationsInput | string
    estimatedEffort?: NullableFloatFieldUpdateOperationsInput | number | null
    loggedTime?: NullableFloatFieldUpdateOperationsInput | number | null
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TaskUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    priority?: NullableStringFieldUpdateOperationsInput | string | null
    dueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    assignee?: NullableStringFieldUpdateOperationsInput | string | null
    color?: NullableStringFieldUpdateOperationsInput | string | null
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    acceptanceCriteria?: StringFieldUpdateOperationsInput | string
    estimatedEffort?: NullableFloatFieldUpdateOperationsInput | number | null
    loggedTime?: NullableFloatFieldUpdateOperationsInput | number | null
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TagCreateInput = {
    id?: string
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
    tasks?: TaskCreateNestedManyWithoutTagsInput
  }

  export type TagUncheckedCreateInput = {
    id?: string
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
    tasks?: TaskUncheckedCreateNestedManyWithoutTagsInput
  }

  export type TagUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tasks?: TaskUpdateManyWithoutTagsNestedInput
  }

  export type TagUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tasks?: TaskUncheckedUpdateManyWithoutTagsNestedInput
  }

  export type TagCreateManyInput = {
    id?: string
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TagUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TagUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MCPSessionCreateInput = {
    id?: string
    sessionId: string
    modelId: string
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    messages?: MCPMessageCreateNestedManyWithoutSessionInput
  }

  export type MCPSessionUncheckedCreateInput = {
    id?: string
    sessionId: string
    modelId: string
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    messages?: MCPMessageUncheckedCreateNestedManyWithoutSessionInput
  }

  export type MCPSessionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionId?: StringFieldUpdateOperationsInput | string
    modelId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    messages?: MCPMessageUpdateManyWithoutSessionNestedInput
  }

  export type MCPSessionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionId?: StringFieldUpdateOperationsInput | string
    modelId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    messages?: MCPMessageUncheckedUpdateManyWithoutSessionNestedInput
  }

  export type MCPSessionCreateManyInput = {
    id?: string
    sessionId: string
    modelId: string
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type MCPSessionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionId?: StringFieldUpdateOperationsInput | string
    modelId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MCPSessionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionId?: StringFieldUpdateOperationsInput | string
    modelId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MCPMessageCreateInput = {
    id?: string
    role: string
    content: string
    createdAt?: Date | string
    updatedAt?: Date | string
    session: MCPSessionCreateNestedOneWithoutMessagesInput
  }

  export type MCPMessageUncheckedCreateInput = {
    id?: string
    sessionId: string
    role: string
    content: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type MCPMessageUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    session?: MCPSessionUpdateOneRequiredWithoutMessagesNestedInput
  }

  export type MCPMessageUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionId?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MCPMessageCreateManyInput = {
    id?: string
    sessionId: string
    role: string
    content: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type MCPMessageUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MCPMessageUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionId?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
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
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
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

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type BoardColumnCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    order?: SortOrder
    color?: SortOrder
    sortOption?: SortOrder
    isDefault?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BoardColumnAvgOrderByAggregateInput = {
    order?: SortOrder
  }

  export type BoardColumnMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    order?: SortOrder
    color?: SortOrder
    sortOption?: SortOrder
    isDefault?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BoardColumnMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    order?: SortOrder
    color?: SortOrder
    sortOption?: SortOrder
    isDefault?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BoardColumnSumOrderByAggregateInput = {
    order?: SortOrder
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
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
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

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
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
  }

  export type TagListRelationFilter = {
    every?: TagWhereInput
    some?: TagWhereInput
    none?: TagWhereInput
  }

  export type TaskNullableRelationFilter = {
    is?: TaskWhereInput | null
    isNot?: TaskWhereInput | null
  }

  export type TaskListRelationFilter = {
    every?: TaskWhereInput
    some?: TaskWhereInput
    none?: TaskWhereInput
  }

  export type TagOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type TaskOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type TaskCountOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    status?: SortOrder
    priority?: SortOrder
    dueDate?: SortOrder
    assignee?: SortOrder
    color?: SortOrder
    parentId?: SortOrder
    acceptanceCriteria?: SortOrder
    estimatedEffort?: SortOrder
    loggedTime?: SortOrder
    sortOrder?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TaskAvgOrderByAggregateInput = {
    estimatedEffort?: SortOrder
    loggedTime?: SortOrder
    sortOrder?: SortOrder
  }

  export type TaskMaxOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    status?: SortOrder
    priority?: SortOrder
    dueDate?: SortOrder
    assignee?: SortOrder
    color?: SortOrder
    parentId?: SortOrder
    acceptanceCriteria?: SortOrder
    estimatedEffort?: SortOrder
    loggedTime?: SortOrder
    sortOrder?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TaskMinOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    status?: SortOrder
    priority?: SortOrder
    dueDate?: SortOrder
    assignee?: SortOrder
    color?: SortOrder
    parentId?: SortOrder
    acceptanceCriteria?: SortOrder
    estimatedEffort?: SortOrder
    loggedTime?: SortOrder
    sortOrder?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TaskSumOrderByAggregateInput = {
    estimatedEffort?: SortOrder
    loggedTime?: SortOrder
    sortOrder?: SortOrder
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
  }

  export type TagCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TagMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TagMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type MCPMessageListRelationFilter = {
    every?: MCPMessageWhereInput
    some?: MCPMessageWhereInput
    none?: MCPMessageWhereInput
  }

  export type MCPMessageOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type MCPSessionCountOrderByAggregateInput = {
    id?: SortOrder
    sessionId?: SortOrder
    modelId?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type MCPSessionMaxOrderByAggregateInput = {
    id?: SortOrder
    sessionId?: SortOrder
    modelId?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type MCPSessionMinOrderByAggregateInput = {
    id?: SortOrder
    sessionId?: SortOrder
    modelId?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type MCPSessionRelationFilter = {
    is?: MCPSessionWhereInput
    isNot?: MCPSessionWhereInput
  }

  export type MCPMessageCountOrderByAggregateInput = {
    id?: SortOrder
    sessionId?: SortOrder
    role?: SortOrder
    content?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type MCPMessageMaxOrderByAggregateInput = {
    id?: SortOrder
    sessionId?: SortOrder
    role?: SortOrder
    content?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type MCPMessageMinOrderByAggregateInput = {
    id?: SortOrder
    sessionId?: SortOrder
    role?: SortOrder
    content?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type TagCreateNestedManyWithoutTasksInput = {
    create?: XOR<TagCreateWithoutTasksInput, TagUncheckedCreateWithoutTasksInput> | TagCreateWithoutTasksInput[] | TagUncheckedCreateWithoutTasksInput[]
    connectOrCreate?: TagCreateOrConnectWithoutTasksInput | TagCreateOrConnectWithoutTasksInput[]
    connect?: TagWhereUniqueInput | TagWhereUniqueInput[]
  }

  export type TaskCreateNestedOneWithoutSubTasksInput = {
    create?: XOR<TaskCreateWithoutSubTasksInput, TaskUncheckedCreateWithoutSubTasksInput>
    connectOrCreate?: TaskCreateOrConnectWithoutSubTasksInput
    connect?: TaskWhereUniqueInput
  }

  export type TaskCreateNestedManyWithoutParentInput = {
    create?: XOR<TaskCreateWithoutParentInput, TaskUncheckedCreateWithoutParentInput> | TaskCreateWithoutParentInput[] | TaskUncheckedCreateWithoutParentInput[]
    connectOrCreate?: TaskCreateOrConnectWithoutParentInput | TaskCreateOrConnectWithoutParentInput[]
    createMany?: TaskCreateManyParentInputEnvelope
    connect?: TaskWhereUniqueInput | TaskWhereUniqueInput[]
  }

  export type TagUncheckedCreateNestedManyWithoutTasksInput = {
    create?: XOR<TagCreateWithoutTasksInput, TagUncheckedCreateWithoutTasksInput> | TagCreateWithoutTasksInput[] | TagUncheckedCreateWithoutTasksInput[]
    connectOrCreate?: TagCreateOrConnectWithoutTasksInput | TagCreateOrConnectWithoutTasksInput[]
    connect?: TagWhereUniqueInput | TagWhereUniqueInput[]
  }

  export type TaskUncheckedCreateNestedManyWithoutParentInput = {
    create?: XOR<TaskCreateWithoutParentInput, TaskUncheckedCreateWithoutParentInput> | TaskCreateWithoutParentInput[] | TaskUncheckedCreateWithoutParentInput[]
    connectOrCreate?: TaskCreateOrConnectWithoutParentInput | TaskCreateOrConnectWithoutParentInput[]
    createMany?: TaskCreateManyParentInputEnvelope
    connect?: TaskWhereUniqueInput | TaskWhereUniqueInput[]
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type TagUpdateManyWithoutTasksNestedInput = {
    create?: XOR<TagCreateWithoutTasksInput, TagUncheckedCreateWithoutTasksInput> | TagCreateWithoutTasksInput[] | TagUncheckedCreateWithoutTasksInput[]
    connectOrCreate?: TagCreateOrConnectWithoutTasksInput | TagCreateOrConnectWithoutTasksInput[]
    upsert?: TagUpsertWithWhereUniqueWithoutTasksInput | TagUpsertWithWhereUniqueWithoutTasksInput[]
    set?: TagWhereUniqueInput | TagWhereUniqueInput[]
    disconnect?: TagWhereUniqueInput | TagWhereUniqueInput[]
    delete?: TagWhereUniqueInput | TagWhereUniqueInput[]
    connect?: TagWhereUniqueInput | TagWhereUniqueInput[]
    update?: TagUpdateWithWhereUniqueWithoutTasksInput | TagUpdateWithWhereUniqueWithoutTasksInput[]
    updateMany?: TagUpdateManyWithWhereWithoutTasksInput | TagUpdateManyWithWhereWithoutTasksInput[]
    deleteMany?: TagScalarWhereInput | TagScalarWhereInput[]
  }

  export type TaskUpdateOneWithoutSubTasksNestedInput = {
    create?: XOR<TaskCreateWithoutSubTasksInput, TaskUncheckedCreateWithoutSubTasksInput>
    connectOrCreate?: TaskCreateOrConnectWithoutSubTasksInput
    upsert?: TaskUpsertWithoutSubTasksInput
    disconnect?: TaskWhereInput | boolean
    delete?: TaskWhereInput | boolean
    connect?: TaskWhereUniqueInput
    update?: XOR<XOR<TaskUpdateToOneWithWhereWithoutSubTasksInput, TaskUpdateWithoutSubTasksInput>, TaskUncheckedUpdateWithoutSubTasksInput>
  }

  export type TaskUpdateManyWithoutParentNestedInput = {
    create?: XOR<TaskCreateWithoutParentInput, TaskUncheckedCreateWithoutParentInput> | TaskCreateWithoutParentInput[] | TaskUncheckedCreateWithoutParentInput[]
    connectOrCreate?: TaskCreateOrConnectWithoutParentInput | TaskCreateOrConnectWithoutParentInput[]
    upsert?: TaskUpsertWithWhereUniqueWithoutParentInput | TaskUpsertWithWhereUniqueWithoutParentInput[]
    createMany?: TaskCreateManyParentInputEnvelope
    set?: TaskWhereUniqueInput | TaskWhereUniqueInput[]
    disconnect?: TaskWhereUniqueInput | TaskWhereUniqueInput[]
    delete?: TaskWhereUniqueInput | TaskWhereUniqueInput[]
    connect?: TaskWhereUniqueInput | TaskWhereUniqueInput[]
    update?: TaskUpdateWithWhereUniqueWithoutParentInput | TaskUpdateWithWhereUniqueWithoutParentInput[]
    updateMany?: TaskUpdateManyWithWhereWithoutParentInput | TaskUpdateManyWithWhereWithoutParentInput[]
    deleteMany?: TaskScalarWhereInput | TaskScalarWhereInput[]
  }

  export type TagUncheckedUpdateManyWithoutTasksNestedInput = {
    create?: XOR<TagCreateWithoutTasksInput, TagUncheckedCreateWithoutTasksInput> | TagCreateWithoutTasksInput[] | TagUncheckedCreateWithoutTasksInput[]
    connectOrCreate?: TagCreateOrConnectWithoutTasksInput | TagCreateOrConnectWithoutTasksInput[]
    upsert?: TagUpsertWithWhereUniqueWithoutTasksInput | TagUpsertWithWhereUniqueWithoutTasksInput[]
    set?: TagWhereUniqueInput | TagWhereUniqueInput[]
    disconnect?: TagWhereUniqueInput | TagWhereUniqueInput[]
    delete?: TagWhereUniqueInput | TagWhereUniqueInput[]
    connect?: TagWhereUniqueInput | TagWhereUniqueInput[]
    update?: TagUpdateWithWhereUniqueWithoutTasksInput | TagUpdateWithWhereUniqueWithoutTasksInput[]
    updateMany?: TagUpdateManyWithWhereWithoutTasksInput | TagUpdateManyWithWhereWithoutTasksInput[]
    deleteMany?: TagScalarWhereInput | TagScalarWhereInput[]
  }

  export type TaskUncheckedUpdateManyWithoutParentNestedInput = {
    create?: XOR<TaskCreateWithoutParentInput, TaskUncheckedCreateWithoutParentInput> | TaskCreateWithoutParentInput[] | TaskUncheckedCreateWithoutParentInput[]
    connectOrCreate?: TaskCreateOrConnectWithoutParentInput | TaskCreateOrConnectWithoutParentInput[]
    upsert?: TaskUpsertWithWhereUniqueWithoutParentInput | TaskUpsertWithWhereUniqueWithoutParentInput[]
    createMany?: TaskCreateManyParentInputEnvelope
    set?: TaskWhereUniqueInput | TaskWhereUniqueInput[]
    disconnect?: TaskWhereUniqueInput | TaskWhereUniqueInput[]
    delete?: TaskWhereUniqueInput | TaskWhereUniqueInput[]
    connect?: TaskWhereUniqueInput | TaskWhereUniqueInput[]
    update?: TaskUpdateWithWhereUniqueWithoutParentInput | TaskUpdateWithWhereUniqueWithoutParentInput[]
    updateMany?: TaskUpdateManyWithWhereWithoutParentInput | TaskUpdateManyWithWhereWithoutParentInput[]
    deleteMany?: TaskScalarWhereInput | TaskScalarWhereInput[]
  }

  export type TaskCreateNestedManyWithoutTagsInput = {
    create?: XOR<TaskCreateWithoutTagsInput, TaskUncheckedCreateWithoutTagsInput> | TaskCreateWithoutTagsInput[] | TaskUncheckedCreateWithoutTagsInput[]
    connectOrCreate?: TaskCreateOrConnectWithoutTagsInput | TaskCreateOrConnectWithoutTagsInput[]
    connect?: TaskWhereUniqueInput | TaskWhereUniqueInput[]
  }

  export type TaskUncheckedCreateNestedManyWithoutTagsInput = {
    create?: XOR<TaskCreateWithoutTagsInput, TaskUncheckedCreateWithoutTagsInput> | TaskCreateWithoutTagsInput[] | TaskUncheckedCreateWithoutTagsInput[]
    connectOrCreate?: TaskCreateOrConnectWithoutTagsInput | TaskCreateOrConnectWithoutTagsInput[]
    connect?: TaskWhereUniqueInput | TaskWhereUniqueInput[]
  }

  export type TaskUpdateManyWithoutTagsNestedInput = {
    create?: XOR<TaskCreateWithoutTagsInput, TaskUncheckedCreateWithoutTagsInput> | TaskCreateWithoutTagsInput[] | TaskUncheckedCreateWithoutTagsInput[]
    connectOrCreate?: TaskCreateOrConnectWithoutTagsInput | TaskCreateOrConnectWithoutTagsInput[]
    upsert?: TaskUpsertWithWhereUniqueWithoutTagsInput | TaskUpsertWithWhereUniqueWithoutTagsInput[]
    set?: TaskWhereUniqueInput | TaskWhereUniqueInput[]
    disconnect?: TaskWhereUniqueInput | TaskWhereUniqueInput[]
    delete?: TaskWhereUniqueInput | TaskWhereUniqueInput[]
    connect?: TaskWhereUniqueInput | TaskWhereUniqueInput[]
    update?: TaskUpdateWithWhereUniqueWithoutTagsInput | TaskUpdateWithWhereUniqueWithoutTagsInput[]
    updateMany?: TaskUpdateManyWithWhereWithoutTagsInput | TaskUpdateManyWithWhereWithoutTagsInput[]
    deleteMany?: TaskScalarWhereInput | TaskScalarWhereInput[]
  }

  export type TaskUncheckedUpdateManyWithoutTagsNestedInput = {
    create?: XOR<TaskCreateWithoutTagsInput, TaskUncheckedCreateWithoutTagsInput> | TaskCreateWithoutTagsInput[] | TaskUncheckedCreateWithoutTagsInput[]
    connectOrCreate?: TaskCreateOrConnectWithoutTagsInput | TaskCreateOrConnectWithoutTagsInput[]
    upsert?: TaskUpsertWithWhereUniqueWithoutTagsInput | TaskUpsertWithWhereUniqueWithoutTagsInput[]
    set?: TaskWhereUniqueInput | TaskWhereUniqueInput[]
    disconnect?: TaskWhereUniqueInput | TaskWhereUniqueInput[]
    delete?: TaskWhereUniqueInput | TaskWhereUniqueInput[]
    connect?: TaskWhereUniqueInput | TaskWhereUniqueInput[]
    update?: TaskUpdateWithWhereUniqueWithoutTagsInput | TaskUpdateWithWhereUniqueWithoutTagsInput[]
    updateMany?: TaskUpdateManyWithWhereWithoutTagsInput | TaskUpdateManyWithWhereWithoutTagsInput[]
    deleteMany?: TaskScalarWhereInput | TaskScalarWhereInput[]
  }

  export type MCPMessageCreateNestedManyWithoutSessionInput = {
    create?: XOR<MCPMessageCreateWithoutSessionInput, MCPMessageUncheckedCreateWithoutSessionInput> | MCPMessageCreateWithoutSessionInput[] | MCPMessageUncheckedCreateWithoutSessionInput[]
    connectOrCreate?: MCPMessageCreateOrConnectWithoutSessionInput | MCPMessageCreateOrConnectWithoutSessionInput[]
    createMany?: MCPMessageCreateManySessionInputEnvelope
    connect?: MCPMessageWhereUniqueInput | MCPMessageWhereUniqueInput[]
  }

  export type MCPMessageUncheckedCreateNestedManyWithoutSessionInput = {
    create?: XOR<MCPMessageCreateWithoutSessionInput, MCPMessageUncheckedCreateWithoutSessionInput> | MCPMessageCreateWithoutSessionInput[] | MCPMessageUncheckedCreateWithoutSessionInput[]
    connectOrCreate?: MCPMessageCreateOrConnectWithoutSessionInput | MCPMessageCreateOrConnectWithoutSessionInput[]
    createMany?: MCPMessageCreateManySessionInputEnvelope
    connect?: MCPMessageWhereUniqueInput | MCPMessageWhereUniqueInput[]
  }

  export type MCPMessageUpdateManyWithoutSessionNestedInput = {
    create?: XOR<MCPMessageCreateWithoutSessionInput, MCPMessageUncheckedCreateWithoutSessionInput> | MCPMessageCreateWithoutSessionInput[] | MCPMessageUncheckedCreateWithoutSessionInput[]
    connectOrCreate?: MCPMessageCreateOrConnectWithoutSessionInput | MCPMessageCreateOrConnectWithoutSessionInput[]
    upsert?: MCPMessageUpsertWithWhereUniqueWithoutSessionInput | MCPMessageUpsertWithWhereUniqueWithoutSessionInput[]
    createMany?: MCPMessageCreateManySessionInputEnvelope
    set?: MCPMessageWhereUniqueInput | MCPMessageWhereUniqueInput[]
    disconnect?: MCPMessageWhereUniqueInput | MCPMessageWhereUniqueInput[]
    delete?: MCPMessageWhereUniqueInput | MCPMessageWhereUniqueInput[]
    connect?: MCPMessageWhereUniqueInput | MCPMessageWhereUniqueInput[]
    update?: MCPMessageUpdateWithWhereUniqueWithoutSessionInput | MCPMessageUpdateWithWhereUniqueWithoutSessionInput[]
    updateMany?: MCPMessageUpdateManyWithWhereWithoutSessionInput | MCPMessageUpdateManyWithWhereWithoutSessionInput[]
    deleteMany?: MCPMessageScalarWhereInput | MCPMessageScalarWhereInput[]
  }

  export type MCPMessageUncheckedUpdateManyWithoutSessionNestedInput = {
    create?: XOR<MCPMessageCreateWithoutSessionInput, MCPMessageUncheckedCreateWithoutSessionInput> | MCPMessageCreateWithoutSessionInput[] | MCPMessageUncheckedCreateWithoutSessionInput[]
    connectOrCreate?: MCPMessageCreateOrConnectWithoutSessionInput | MCPMessageCreateOrConnectWithoutSessionInput[]
    upsert?: MCPMessageUpsertWithWhereUniqueWithoutSessionInput | MCPMessageUpsertWithWhereUniqueWithoutSessionInput[]
    createMany?: MCPMessageCreateManySessionInputEnvelope
    set?: MCPMessageWhereUniqueInput | MCPMessageWhereUniqueInput[]
    disconnect?: MCPMessageWhereUniqueInput | MCPMessageWhereUniqueInput[]
    delete?: MCPMessageWhereUniqueInput | MCPMessageWhereUniqueInput[]
    connect?: MCPMessageWhereUniqueInput | MCPMessageWhereUniqueInput[]
    update?: MCPMessageUpdateWithWhereUniqueWithoutSessionInput | MCPMessageUpdateWithWhereUniqueWithoutSessionInput[]
    updateMany?: MCPMessageUpdateManyWithWhereWithoutSessionInput | MCPMessageUpdateManyWithWhereWithoutSessionInput[]
    deleteMany?: MCPMessageScalarWhereInput | MCPMessageScalarWhereInput[]
  }

  export type MCPSessionCreateNestedOneWithoutMessagesInput = {
    create?: XOR<MCPSessionCreateWithoutMessagesInput, MCPSessionUncheckedCreateWithoutMessagesInput>
    connectOrCreate?: MCPSessionCreateOrConnectWithoutMessagesInput
    connect?: MCPSessionWhereUniqueInput
  }

  export type MCPSessionUpdateOneRequiredWithoutMessagesNestedInput = {
    create?: XOR<MCPSessionCreateWithoutMessagesInput, MCPSessionUncheckedCreateWithoutMessagesInput>
    connectOrCreate?: MCPSessionCreateOrConnectWithoutMessagesInput
    upsert?: MCPSessionUpsertWithoutMessagesInput
    connect?: MCPSessionWhereUniqueInput
    update?: XOR<XOR<MCPSessionUpdateToOneWithWhereWithoutMessagesInput, MCPSessionUpdateWithoutMessagesInput>, MCPSessionUncheckedUpdateWithoutMessagesInput>
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
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
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

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
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
  }

  export type TagCreateWithoutTasksInput = {
    id?: string
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TagUncheckedCreateWithoutTasksInput = {
    id?: string
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TagCreateOrConnectWithoutTasksInput = {
    where: TagWhereUniqueInput
    create: XOR<TagCreateWithoutTasksInput, TagUncheckedCreateWithoutTasksInput>
  }

  export type TaskCreateWithoutSubTasksInput = {
    id?: string
    title: string
    description?: string
    status: string
    priority?: string | null
    dueDate?: Date | string | null
    assignee?: string | null
    color?: string | null
    acceptanceCriteria?: string
    estimatedEffort?: number | null
    loggedTime?: number | null
    sortOrder?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    tags?: TagCreateNestedManyWithoutTasksInput
    parent?: TaskCreateNestedOneWithoutSubTasksInput
  }

  export type TaskUncheckedCreateWithoutSubTasksInput = {
    id?: string
    title: string
    description?: string
    status: string
    priority?: string | null
    dueDate?: Date | string | null
    assignee?: string | null
    color?: string | null
    parentId?: string | null
    acceptanceCriteria?: string
    estimatedEffort?: number | null
    loggedTime?: number | null
    sortOrder?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    tags?: TagUncheckedCreateNestedManyWithoutTasksInput
  }

  export type TaskCreateOrConnectWithoutSubTasksInput = {
    where: TaskWhereUniqueInput
    create: XOR<TaskCreateWithoutSubTasksInput, TaskUncheckedCreateWithoutSubTasksInput>
  }

  export type TaskCreateWithoutParentInput = {
    id?: string
    title: string
    description?: string
    status: string
    priority?: string | null
    dueDate?: Date | string | null
    assignee?: string | null
    color?: string | null
    acceptanceCriteria?: string
    estimatedEffort?: number | null
    loggedTime?: number | null
    sortOrder?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    tags?: TagCreateNestedManyWithoutTasksInput
    subTasks?: TaskCreateNestedManyWithoutParentInput
  }

  export type TaskUncheckedCreateWithoutParentInput = {
    id?: string
    title: string
    description?: string
    status: string
    priority?: string | null
    dueDate?: Date | string | null
    assignee?: string | null
    color?: string | null
    acceptanceCriteria?: string
    estimatedEffort?: number | null
    loggedTime?: number | null
    sortOrder?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    tags?: TagUncheckedCreateNestedManyWithoutTasksInput
    subTasks?: TaskUncheckedCreateNestedManyWithoutParentInput
  }

  export type TaskCreateOrConnectWithoutParentInput = {
    where: TaskWhereUniqueInput
    create: XOR<TaskCreateWithoutParentInput, TaskUncheckedCreateWithoutParentInput>
  }

  export type TaskCreateManyParentInputEnvelope = {
    data: TaskCreateManyParentInput | TaskCreateManyParentInput[]
    skipDuplicates?: boolean
  }

  export type TagUpsertWithWhereUniqueWithoutTasksInput = {
    where: TagWhereUniqueInput
    update: XOR<TagUpdateWithoutTasksInput, TagUncheckedUpdateWithoutTasksInput>
    create: XOR<TagCreateWithoutTasksInput, TagUncheckedCreateWithoutTasksInput>
  }

  export type TagUpdateWithWhereUniqueWithoutTasksInput = {
    where: TagWhereUniqueInput
    data: XOR<TagUpdateWithoutTasksInput, TagUncheckedUpdateWithoutTasksInput>
  }

  export type TagUpdateManyWithWhereWithoutTasksInput = {
    where: TagScalarWhereInput
    data: XOR<TagUpdateManyMutationInput, TagUncheckedUpdateManyWithoutTasksInput>
  }

  export type TagScalarWhereInput = {
    AND?: TagScalarWhereInput | TagScalarWhereInput[]
    OR?: TagScalarWhereInput[]
    NOT?: TagScalarWhereInput | TagScalarWhereInput[]
    id?: StringFilter<"Tag"> | string
    name?: StringFilter<"Tag"> | string
    createdAt?: DateTimeFilter<"Tag"> | Date | string
    updatedAt?: DateTimeFilter<"Tag"> | Date | string
  }

  export type TaskUpsertWithoutSubTasksInput = {
    update: XOR<TaskUpdateWithoutSubTasksInput, TaskUncheckedUpdateWithoutSubTasksInput>
    create: XOR<TaskCreateWithoutSubTasksInput, TaskUncheckedCreateWithoutSubTasksInput>
    where?: TaskWhereInput
  }

  export type TaskUpdateToOneWithWhereWithoutSubTasksInput = {
    where?: TaskWhereInput
    data: XOR<TaskUpdateWithoutSubTasksInput, TaskUncheckedUpdateWithoutSubTasksInput>
  }

  export type TaskUpdateWithoutSubTasksInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    priority?: NullableStringFieldUpdateOperationsInput | string | null
    dueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    assignee?: NullableStringFieldUpdateOperationsInput | string | null
    color?: NullableStringFieldUpdateOperationsInput | string | null
    acceptanceCriteria?: StringFieldUpdateOperationsInput | string
    estimatedEffort?: NullableFloatFieldUpdateOperationsInput | number | null
    loggedTime?: NullableFloatFieldUpdateOperationsInput | number | null
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tags?: TagUpdateManyWithoutTasksNestedInput
    parent?: TaskUpdateOneWithoutSubTasksNestedInput
  }

  export type TaskUncheckedUpdateWithoutSubTasksInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    priority?: NullableStringFieldUpdateOperationsInput | string | null
    dueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    assignee?: NullableStringFieldUpdateOperationsInput | string | null
    color?: NullableStringFieldUpdateOperationsInput | string | null
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    acceptanceCriteria?: StringFieldUpdateOperationsInput | string
    estimatedEffort?: NullableFloatFieldUpdateOperationsInput | number | null
    loggedTime?: NullableFloatFieldUpdateOperationsInput | number | null
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tags?: TagUncheckedUpdateManyWithoutTasksNestedInput
  }

  export type TaskUpsertWithWhereUniqueWithoutParentInput = {
    where: TaskWhereUniqueInput
    update: XOR<TaskUpdateWithoutParentInput, TaskUncheckedUpdateWithoutParentInput>
    create: XOR<TaskCreateWithoutParentInput, TaskUncheckedCreateWithoutParentInput>
  }

  export type TaskUpdateWithWhereUniqueWithoutParentInput = {
    where: TaskWhereUniqueInput
    data: XOR<TaskUpdateWithoutParentInput, TaskUncheckedUpdateWithoutParentInput>
  }

  export type TaskUpdateManyWithWhereWithoutParentInput = {
    where: TaskScalarWhereInput
    data: XOR<TaskUpdateManyMutationInput, TaskUncheckedUpdateManyWithoutParentInput>
  }

  export type TaskScalarWhereInput = {
    AND?: TaskScalarWhereInput | TaskScalarWhereInput[]
    OR?: TaskScalarWhereInput[]
    NOT?: TaskScalarWhereInput | TaskScalarWhereInput[]
    id?: StringFilter<"Task"> | string
    title?: StringFilter<"Task"> | string
    description?: StringFilter<"Task"> | string
    status?: StringFilter<"Task"> | string
    priority?: StringNullableFilter<"Task"> | string | null
    dueDate?: DateTimeNullableFilter<"Task"> | Date | string | null
    assignee?: StringNullableFilter<"Task"> | string | null
    color?: StringNullableFilter<"Task"> | string | null
    parentId?: StringNullableFilter<"Task"> | string | null
    acceptanceCriteria?: StringFilter<"Task"> | string
    estimatedEffort?: FloatNullableFilter<"Task"> | number | null
    loggedTime?: FloatNullableFilter<"Task"> | number | null
    sortOrder?: IntFilter<"Task"> | number
    createdAt?: DateTimeFilter<"Task"> | Date | string
    updatedAt?: DateTimeFilter<"Task"> | Date | string
  }

  export type TaskCreateWithoutTagsInput = {
    id?: string
    title: string
    description?: string
    status: string
    priority?: string | null
    dueDate?: Date | string | null
    assignee?: string | null
    color?: string | null
    acceptanceCriteria?: string
    estimatedEffort?: number | null
    loggedTime?: number | null
    sortOrder?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    parent?: TaskCreateNestedOneWithoutSubTasksInput
    subTasks?: TaskCreateNestedManyWithoutParentInput
  }

  export type TaskUncheckedCreateWithoutTagsInput = {
    id?: string
    title: string
    description?: string
    status: string
    priority?: string | null
    dueDate?: Date | string | null
    assignee?: string | null
    color?: string | null
    parentId?: string | null
    acceptanceCriteria?: string
    estimatedEffort?: number | null
    loggedTime?: number | null
    sortOrder?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    subTasks?: TaskUncheckedCreateNestedManyWithoutParentInput
  }

  export type TaskCreateOrConnectWithoutTagsInput = {
    where: TaskWhereUniqueInput
    create: XOR<TaskCreateWithoutTagsInput, TaskUncheckedCreateWithoutTagsInput>
  }

  export type TaskUpsertWithWhereUniqueWithoutTagsInput = {
    where: TaskWhereUniqueInput
    update: XOR<TaskUpdateWithoutTagsInput, TaskUncheckedUpdateWithoutTagsInput>
    create: XOR<TaskCreateWithoutTagsInput, TaskUncheckedCreateWithoutTagsInput>
  }

  export type TaskUpdateWithWhereUniqueWithoutTagsInput = {
    where: TaskWhereUniqueInput
    data: XOR<TaskUpdateWithoutTagsInput, TaskUncheckedUpdateWithoutTagsInput>
  }

  export type TaskUpdateManyWithWhereWithoutTagsInput = {
    where: TaskScalarWhereInput
    data: XOR<TaskUpdateManyMutationInput, TaskUncheckedUpdateManyWithoutTagsInput>
  }

  export type MCPMessageCreateWithoutSessionInput = {
    id?: string
    role: string
    content: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type MCPMessageUncheckedCreateWithoutSessionInput = {
    id?: string
    role: string
    content: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type MCPMessageCreateOrConnectWithoutSessionInput = {
    where: MCPMessageWhereUniqueInput
    create: XOR<MCPMessageCreateWithoutSessionInput, MCPMessageUncheckedCreateWithoutSessionInput>
  }

  export type MCPMessageCreateManySessionInputEnvelope = {
    data: MCPMessageCreateManySessionInput | MCPMessageCreateManySessionInput[]
    skipDuplicates?: boolean
  }

  export type MCPMessageUpsertWithWhereUniqueWithoutSessionInput = {
    where: MCPMessageWhereUniqueInput
    update: XOR<MCPMessageUpdateWithoutSessionInput, MCPMessageUncheckedUpdateWithoutSessionInput>
    create: XOR<MCPMessageCreateWithoutSessionInput, MCPMessageUncheckedCreateWithoutSessionInput>
  }

  export type MCPMessageUpdateWithWhereUniqueWithoutSessionInput = {
    where: MCPMessageWhereUniqueInput
    data: XOR<MCPMessageUpdateWithoutSessionInput, MCPMessageUncheckedUpdateWithoutSessionInput>
  }

  export type MCPMessageUpdateManyWithWhereWithoutSessionInput = {
    where: MCPMessageScalarWhereInput
    data: XOR<MCPMessageUpdateManyMutationInput, MCPMessageUncheckedUpdateManyWithoutSessionInput>
  }

  export type MCPMessageScalarWhereInput = {
    AND?: MCPMessageScalarWhereInput | MCPMessageScalarWhereInput[]
    OR?: MCPMessageScalarWhereInput[]
    NOT?: MCPMessageScalarWhereInput | MCPMessageScalarWhereInput[]
    id?: StringFilter<"MCPMessage"> | string
    sessionId?: StringFilter<"MCPMessage"> | string
    role?: StringFilter<"MCPMessage"> | string
    content?: StringFilter<"MCPMessage"> | string
    createdAt?: DateTimeFilter<"MCPMessage"> | Date | string
    updatedAt?: DateTimeFilter<"MCPMessage"> | Date | string
  }

  export type MCPSessionCreateWithoutMessagesInput = {
    id?: string
    sessionId: string
    modelId: string
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type MCPSessionUncheckedCreateWithoutMessagesInput = {
    id?: string
    sessionId: string
    modelId: string
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type MCPSessionCreateOrConnectWithoutMessagesInput = {
    where: MCPSessionWhereUniqueInput
    create: XOR<MCPSessionCreateWithoutMessagesInput, MCPSessionUncheckedCreateWithoutMessagesInput>
  }

  export type MCPSessionUpsertWithoutMessagesInput = {
    update: XOR<MCPSessionUpdateWithoutMessagesInput, MCPSessionUncheckedUpdateWithoutMessagesInput>
    create: XOR<MCPSessionCreateWithoutMessagesInput, MCPSessionUncheckedCreateWithoutMessagesInput>
    where?: MCPSessionWhereInput
  }

  export type MCPSessionUpdateToOneWithWhereWithoutMessagesInput = {
    where?: MCPSessionWhereInput
    data: XOR<MCPSessionUpdateWithoutMessagesInput, MCPSessionUncheckedUpdateWithoutMessagesInput>
  }

  export type MCPSessionUpdateWithoutMessagesInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionId?: StringFieldUpdateOperationsInput | string
    modelId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MCPSessionUncheckedUpdateWithoutMessagesInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionId?: StringFieldUpdateOperationsInput | string
    modelId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TaskCreateManyParentInput = {
    id?: string
    title: string
    description?: string
    status: string
    priority?: string | null
    dueDate?: Date | string | null
    assignee?: string | null
    color?: string | null
    acceptanceCriteria?: string
    estimatedEffort?: number | null
    loggedTime?: number | null
    sortOrder?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TagUpdateWithoutTasksInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TagUncheckedUpdateWithoutTasksInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TagUncheckedUpdateManyWithoutTasksInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TaskUpdateWithoutParentInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    priority?: NullableStringFieldUpdateOperationsInput | string | null
    dueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    assignee?: NullableStringFieldUpdateOperationsInput | string | null
    color?: NullableStringFieldUpdateOperationsInput | string | null
    acceptanceCriteria?: StringFieldUpdateOperationsInput | string
    estimatedEffort?: NullableFloatFieldUpdateOperationsInput | number | null
    loggedTime?: NullableFloatFieldUpdateOperationsInput | number | null
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tags?: TagUpdateManyWithoutTasksNestedInput
    subTasks?: TaskUpdateManyWithoutParentNestedInput
  }

  export type TaskUncheckedUpdateWithoutParentInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    priority?: NullableStringFieldUpdateOperationsInput | string | null
    dueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    assignee?: NullableStringFieldUpdateOperationsInput | string | null
    color?: NullableStringFieldUpdateOperationsInput | string | null
    acceptanceCriteria?: StringFieldUpdateOperationsInput | string
    estimatedEffort?: NullableFloatFieldUpdateOperationsInput | number | null
    loggedTime?: NullableFloatFieldUpdateOperationsInput | number | null
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tags?: TagUncheckedUpdateManyWithoutTasksNestedInput
    subTasks?: TaskUncheckedUpdateManyWithoutParentNestedInput
  }

  export type TaskUncheckedUpdateManyWithoutParentInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    priority?: NullableStringFieldUpdateOperationsInput | string | null
    dueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    assignee?: NullableStringFieldUpdateOperationsInput | string | null
    color?: NullableStringFieldUpdateOperationsInput | string | null
    acceptanceCriteria?: StringFieldUpdateOperationsInput | string
    estimatedEffort?: NullableFloatFieldUpdateOperationsInput | number | null
    loggedTime?: NullableFloatFieldUpdateOperationsInput | number | null
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TaskUpdateWithoutTagsInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    priority?: NullableStringFieldUpdateOperationsInput | string | null
    dueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    assignee?: NullableStringFieldUpdateOperationsInput | string | null
    color?: NullableStringFieldUpdateOperationsInput | string | null
    acceptanceCriteria?: StringFieldUpdateOperationsInput | string
    estimatedEffort?: NullableFloatFieldUpdateOperationsInput | number | null
    loggedTime?: NullableFloatFieldUpdateOperationsInput | number | null
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    parent?: TaskUpdateOneWithoutSubTasksNestedInput
    subTasks?: TaskUpdateManyWithoutParentNestedInput
  }

  export type TaskUncheckedUpdateWithoutTagsInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    priority?: NullableStringFieldUpdateOperationsInput | string | null
    dueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    assignee?: NullableStringFieldUpdateOperationsInput | string | null
    color?: NullableStringFieldUpdateOperationsInput | string | null
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    acceptanceCriteria?: StringFieldUpdateOperationsInput | string
    estimatedEffort?: NullableFloatFieldUpdateOperationsInput | number | null
    loggedTime?: NullableFloatFieldUpdateOperationsInput | number | null
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    subTasks?: TaskUncheckedUpdateManyWithoutParentNestedInput
  }

  export type TaskUncheckedUpdateManyWithoutTagsInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    priority?: NullableStringFieldUpdateOperationsInput | string | null
    dueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    assignee?: NullableStringFieldUpdateOperationsInput | string | null
    color?: NullableStringFieldUpdateOperationsInput | string | null
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    acceptanceCriteria?: StringFieldUpdateOperationsInput | string
    estimatedEffort?: NullableFloatFieldUpdateOperationsInput | number | null
    loggedTime?: NullableFloatFieldUpdateOperationsInput | number | null
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MCPMessageCreateManySessionInput = {
    id?: string
    role: string
    content: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type MCPMessageUpdateWithoutSessionInput = {
    id?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MCPMessageUncheckedUpdateWithoutSessionInput = {
    id?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MCPMessageUncheckedUpdateManyWithoutSessionInput = {
    id?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use TaskCountOutputTypeDefaultArgs instead
     */
    export type TaskCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = TaskCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use TagCountOutputTypeDefaultArgs instead
     */
    export type TagCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = TagCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use MCPSessionCountOutputTypeDefaultArgs instead
     */
    export type MCPSessionCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = MCPSessionCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use BoardColumnDefaultArgs instead
     */
    export type BoardColumnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = BoardColumnDefaultArgs<ExtArgs>
    /**
     * @deprecated Use TaskDefaultArgs instead
     */
    export type TaskArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = TaskDefaultArgs<ExtArgs>
    /**
     * @deprecated Use TagDefaultArgs instead
     */
    export type TagArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = TagDefaultArgs<ExtArgs>
    /**
     * @deprecated Use MCPSessionDefaultArgs instead
     */
    export type MCPSessionArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = MCPSessionDefaultArgs<ExtArgs>
    /**
     * @deprecated Use MCPMessageDefaultArgs instead
     */
    export type MCPMessageArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = MCPMessageDefaultArgs<ExtArgs>

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