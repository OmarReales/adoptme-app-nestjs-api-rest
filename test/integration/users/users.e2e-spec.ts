/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { describe, it, before, after, beforeEach } from 'mocha';
import { expect } from 'chai';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';

import { TestAppSetup } from '../../setup/test-app.setup';
import { TestDatabaseSetup } from '../../setup/test-db.setup';
import { TestHelper } from '../../utils/test.helper';
import { AuthHelper } from '../../utils/auth.helper';
import { TEST_ADMIN, TEST_USER, TEST_USER_2 } from '../../setup/test-data';

describe('Users Integration Tests', () => {
  let app: INestApplication;
  let adminToken: string;
  let userToken: string;

  before(async () => {
    // Setup test database
    await TestDatabaseSetup.setupTestDatabase();

    // Create test app
    app = await TestAppSetup.createTestApp();

    console.log('🧪 Users integration tests started');
  });

  beforeEach(async () => {
    // Clean database and setup test data
    await TestDatabaseSetup.cleanupDatabase();
    await TestAppSetup.setupTestData();

    // Get auth tokens for tests
    adminToken = await AuthHelper.loginAndGetToken(app, TEST_ADMIN);
    userToken = await AuthHelper.loginAndGetToken(app, TEST_USER);
  });

  after(async () => {
    await TestAppSetup.closeTestApp();
    await TestDatabaseSetup.closeConnection();
    console.log('🧪 Users integration tests completed');
  });

  describe('GET /users', () => {
    it('should get all users (admin only)', async () => {
      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      TestHelper.expectPaginatedResponse(response);
      expect(response.body.data).to.have.length.greaterThan(0);

      // Check if users have the correct structure
      response.body.data.forEach((user: any) => {
        TestHelper.expectUserStructure(user);
        expect(user).to.not.have.property('password');
      });
    });

    it('should deny access to regular users', async () => {
      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      TestHelper.expectForbidden(response);
    });

    it('should deny access without token', async () => {
      const response = await request(app.getHttpServer())
        .get('/users')
        .expect(401);

      TestHelper.expectUnauthorized(response);
    });

    it('should support pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/users?page=1&limit=2')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      TestHelper.expectPaginatedResponse(response, 2);
      expect(response.body.pagination.page).to.equal(1);
      expect(response.body.pagination.limit).to.equal(2);
    });

    it('should support filtering by role', async () => {
      const response = await request(app.getHttpServer())
        .get('/users?role=admin')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      TestHelper.expectPaginatedResponse(response);
      response.body.data.forEach((user: any) => {
        expect(user.role).to.equal('admin');
      });
    });
  });

  describe('GET /users/:id', () => {
    it('should get user by id (admin)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/${TEST_USER.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      TestHelper.expectUserStructure(response.body);
      expect(response.body._id).to.equal(TEST_USER.id);
      expect(response.body.email).to.equal(TEST_USER.email);
      expect(response.body).to.not.have.property('password');
    });

    it('should allow users to get their own profile', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/${TEST_USER.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      TestHelper.expectUserStructure(response.body);
      expect(response.body._id).to.equal(TEST_USER.id);
    });

    it('should deny users access to other profiles', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/${TEST_USER_2.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      TestHelper.expectForbidden(response);
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/507f1f77bcf86cd799999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      TestHelper.expectNotFound(response);
    });
  });

  describe('PUT /users/:id', () => {
    it('should update user (admin)', async () => {
      const updateData = {
        firstname: 'UpdatedName',
        lastname: 'UpdatedLastname',
        age: 30,
      };

      const response = await request(app.getHttpServer())
        .put(`/users/${TEST_USER.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      TestHelper.expectUserStructure(response.body);
      expect(response.body.firstname).to.equal(updateData.firstname);
      expect(response.body.lastname).to.equal(updateData.lastname);
      expect(response.body.age).to.equal(updateData.age);
    });

    it('should allow users to update their own profile', async () => {
      const updateData = {
        firstname: 'SelfUpdated',
        age: 26,
      };

      const response = await request(app.getHttpServer())
        .put(`/users/${TEST_USER.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.firstname).to.equal(updateData.firstname);
      expect(response.body.age).to.equal(updateData.age);
    });

    it('should deny users updating other profiles', async () => {
      const updateData = { firstname: 'Hacker' };

      const response = await request(app.getHttpServer())
        .put(`/users/${TEST_USER_2.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(403);

      TestHelper.expectForbidden(response);
    });

    it('should validate update data', async () => {
      const invalidData = {
        age: 15, // Below minimum age
        email: 'invalid-email',
      };

      const response = await request(app.getHttpServer())
        .put(`/users/${TEST_USER.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData)
        .expect(400);

      TestHelper.expectValidationError(response);
    });

    it('should not allow updating email to existing one', async () => {
      const updateData = {
        email: TEST_USER_2.email, // Existing email
      };

      const response = await request(app.getHttpServer())
        .put(`/users/${TEST_USER.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(409);

      expect(response.body.message).to.include('already exists');
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete user (admin only)', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/users/${TEST_USER.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.message).to.include('deleted');

      // Verify user is deleted
      await request(app.getHttpServer())
        .get(`/users/${TEST_USER.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should deny regular users from deleting', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/users/${TEST_USER_2.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      TestHelper.expectForbidden(response);
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app.getHttpServer())
        .delete('/users/507f1f77bcf86cd799999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      TestHelper.expectNotFound(response);
    });
  });

  describe('GET /users/profile/me', () => {
    it('should get current user profile', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/profile/me')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      TestHelper.expectUserStructure(response.body);
      expect(response.body._id).to.equal(TEST_USER.id);
      expect(response.body.email).to.equal(TEST_USER.email);
      expect(response.body).to.not.have.property('password');
    });

    it('should deny access without token', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/profile/me')
        .expect(401);

      TestHelper.expectUnauthorized(response);
    });
  });

  describe('PUT /users/profile/me', () => {
    it('should update current user profile', async () => {
      const updateData = {
        firstname: 'UpdatedByMe',
        lastname: 'UpdatedLastname',
        age: 27,
      };

      const response = await request(app.getHttpServer())
        .put('/users/profile/me')
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(200);

      TestHelper.expectUserStructure(response.body);
      expect(response.body.firstname).to.equal(updateData.firstname);
      expect(response.body.lastname).to.equal(updateData.lastname);
      expect(response.body.age).to.equal(updateData.age);
    });

    it('should validate update data', async () => {
      const invalidData = {
        age: 200, // Above maximum age
      };

      const response = await request(app.getHttpServer())
        .put('/users/profile/me')
        .set('Authorization', `Bearer ${userToken}`)
        .send(invalidData)
        .expect(400);

      TestHelper.expectValidationError(response, 'age');
    });

    it('should deny access without token', async () => {
      const response = await request(app.getHttpServer())
        .put('/users/profile/me')
        .send({ firstname: 'Test' })
        .expect(401);

      TestHelper.expectUnauthorized(response);
    });
  });
});
