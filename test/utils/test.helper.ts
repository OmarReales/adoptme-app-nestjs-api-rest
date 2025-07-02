import { expect } from 'chai';
import {
  TestErrorResponse,
  TestPaginatedResponse,
  TestPetResponse,
  TestUserResponse,
} from '../interfaces/test-types';

interface TestResponse {
  status: number;
  body: unknown;
}

export class TestHelper {
  static expectValidationError(response: TestResponse, field?: string): void {
    expect(response.status).to.equal(400);
    const body = response.body as TestErrorResponse;
    expect(body).to.have.property('message');
    if (field) {
      // Check if message is an array (typical for class-validator)
      if (Array.isArray(body.message)) {
        const messageString = body.message.join(' ');
        expect(messageString).to.include(field);
      } else {
        expect(body.message).to.include(field);
      }
    }
  }

  static expectUnauthorized(response: TestResponse): void {
    expect(response.status).to.equal(401);
  }

  static expectForbidden(response: TestResponse): void {
    expect(response.status).to.equal(403);
  }

  static expectNotFound(response: TestResponse): void {
    expect(response.status).to.equal(404);
  }

  static expectSuccess(response: TestResponse, status = 200): void {
    expect(response.status).to.equal(status);
  }

  static expectPaginatedResponse<T>(
    response: TestResponse,
    expectedData?: number,
  ): void {
    const body = response.body as TestPaginatedResponse<T>;
    expect(body).to.have.property('data');
    expect(body).to.have.property('pagination');
    expect(body.pagination).to.have.property('page');
    expect(body.pagination).to.have.property('limit');
    expect(body.pagination).to.have.property('total');
    expect(body.pagination).to.have.property('totalPages');

    if (expectedData !== undefined) {
      expect(body.data).to.have.length(expectedData);
    }
  }

  static expectUserStructure(user: TestUserResponse): void {
    // Accept both _id and id properties for MongoDB documents
    const hasId = '_id' in user || 'id' in user;
    expect(hasId).to.equal(true);
    expect(user).to.have.property('userName');
    expect(user).to.have.property('firstName');
    expect(user).to.have.property('lastName');
    expect(user).to.have.property('email');
    expect(user).to.have.property('role');
    expect(user).to.not.have.property('password'); // Password should not be returned
  }

  static expectPetStructure(pet: TestPetResponse): void {
    // Accept both _id and id properties for MongoDB documents
    const hasId = '_id' in pet || 'id' in pet;
    expect(hasId).to.equal(true);
    expect(pet).to.have.property('name');
    expect(pet).to.have.property('breed');
    expect(pet).to.have.property('age');
    expect(pet).to.have.property('species');
    expect(pet).to.have.property('gender');
    expect(pet).to.have.property('status');
    expect(pet).to.have.property('characteristics');
    expect(pet).to.have.property('likedBy');
  }

  static generateRandomEmail(): string {
    return `test${Math.random().toString(36).substring(7)}@example.com`;
  }

  static generateRandomString(length = 10): string {
    return Math.random()
      .toString(36)
      .substring(2, length + 2);
  }

  static wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  static expectBadRequest(response: TestResponse): void {
    expect(response.status).to.equal(400);
  }

  static expectConflict(response: TestResponse): void {
    expect(response.status).to.equal(409);
  }
}
