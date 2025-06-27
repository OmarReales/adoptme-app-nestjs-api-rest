/**
 * Test response interfaces for type safety in tests
 */

export interface TestPetResponse {
  _id?: string;
  id?: string;
  name: string;
  breed: string;
  age: number;
  species: string; // PetSpecies enum
  gender: string; // PetGender enum
  owner?: string | null; // ObjectId as string
  status: string; // PetStatus enum
  description?: string;
  image?: string;
  characteristics: string[];
  likedBy: string[]; // ObjectId[] as string[]
  createdAt?: string;
  updatedAt?: string;
}

export interface TestUserResponse {
  _id?: string;
  id?: string;
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  age: number;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TestPaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface TestApiResponse<T = unknown> {
  success?: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface TestErrorResponse {
  message: string;
  error?: string;
  statusCode?: number;
}

// Mock interfaces for testing
export interface MockQueryResult<T> {
  exec: () => Promise<T>;
}

export interface MockModelMethods<T> {
  find: () => MockQueryResult<T[]>;
  findById: (id: string) => MockQueryResult<T | null>;
  findOne: (filter: Partial<T>) => MockQueryResult<T | null>;
  findByIdAndUpdate: (
    id: string,
    update: Partial<T>,
    options?: unknown,
  ) => MockQueryResult<T | null>;
  findByIdAndDelete: (id: string) => MockQueryResult<T | null>;
  countDocuments: (filter?: Partial<T>) => MockQueryResult<number>;
  create: (doc: Partial<T>) => Promise<T>;
  save: () => Promise<T>;
}

export type MockModel<T> = MockModelMethods<T>;

export interface MockLogger {
  debug: (message: string, context?: string) => void;
  log: (message: string, context?: string) => void;
  info: (message: string, context?: string) => void;
  warn: (message: string, context?: string) => void;
  error: (message: string, stack?: string, context?: string) => void;
  logDatabaseOperation: (
    operation: string,
    collection: string,
    result?: unknown,
  ) => void;
  logBusinessEvent: (event: string, data: unknown, context?: string) => void;
}

// Service mock interfaces
export interface MockPetService {
  petModel: MockModel<TestPetResponse>;
  logger: MockLogger;
}

export interface MockUserService {
  userModel: MockModel<TestUserResponse>;
  logger: MockLogger;
}
