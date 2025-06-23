/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { expect } from 'chai';

export class TestHelper {
  static expectValidationError(response: any, field?: string) {
    expect(response.status).to.equal(400);
    expect(response.body).to.have.property('message');
    if (field) {
      // Check if message is an array (typical for class-validator)
      if (Array.isArray(response.body.message)) {
        const messageString = response.body.message.join(' ');
        expect(messageString).to.include(field);
      } else {
        expect(response.body.message).to.include(field);
      }
    }
  }

  static expectUnauthorized(response: any) {
    expect(response.status).to.equal(401);
  }

  static expectForbidden(response: any) {
    expect(response.status).to.equal(403);
  }

  static expectNotFound(response: any) {
    expect(response.status).to.equal(404);
  }

  static expectSuccess(response: any, status = 200) {
    expect(response.status).to.equal(status);
  }

  static expectPaginatedResponse(response: any, expectedData?: number) {
    expect(response.body).to.have.property('data');
    expect(response.body).to.have.property('pagination');
    expect(response.body.pagination).to.have.property('page');
    expect(response.body.pagination).to.have.property('limit');
    expect(response.body.pagination).to.have.property('total');
    expect(response.body.pagination).to.have.property('totalPages');

    if (expectedData !== undefined) {
      expect(response.body.data).to.have.length(expectedData);
    }
  }

  static expectUserStructure(user: any) {
    expect(user).to.have.property('_id');
    expect(user).to.have.property('username');
    expect(user).to.have.property('firstname');
    expect(user).to.have.property('lastname');
    expect(user).to.have.property('email');
    expect(user).to.have.property('age');
    expect(user).to.have.property('role');
    expect(user).to.not.have.property('password'); // Password should not be returned
  }

  static expectPetStructure(pet: any) {
    expect(pet).to.have.property('_id');
    expect(pet).to.have.property('name');
    expect(pet).to.have.property('breed');
    expect(pet).to.have.property('age');
    expect(pet).to.have.property('status');
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
}
