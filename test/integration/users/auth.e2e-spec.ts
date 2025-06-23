/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { describe, it, before, after, beforeEach } from 'mocha';
import { expect } from 'chai';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';

import { TestAppSetup } from '../../setup/test-app.setup';
import { TestDatabaseSetup } from '../../setup/test-db.setup';
import { TestHelper } from '../../utils/test.helper';
import { TEST_ADMIN, TEST_USER } from '../../setup/test-data';

describe('Auth Integration Tests', () => {
  let app: INestApplication;

  before(async () => {
    // Setup test database
    await TestDatabaseSetup.setupTestDatabase();

    // Create test app
    app = await TestAppSetup.createTestApp();

    console.log('🧪 Auth integration tests started');
  });

  beforeEach(async () => {
    // Clean database and setup test data
    await TestDatabaseSetup.cleanupDatabase();
    await TestAppSetup.setupTestData();
  });

  after(async () => {
    await TestAppSetup.closeTestApp();
    await TestDatabaseSetup.closeConnection();
    console.log('🧪 Auth integration tests completed');
  });

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const newUser = {
        username: TestHelper.generateRandomString(),
        firstname: 'Test',
        lastname: 'User',
        email: TestHelper.generateRandomEmail(),
        password: 'TestPassword123!',
        age: 25,
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(newUser)
        .expect(201);

      expect(response.body).to.have.property('access_token');
      expect(response.body).to.have.property('user');
      TestHelper.expectUserStructure(response.body.user);
      expect(response.body.user.email).to.equal(newUser.email);
      expect(response.body.user.role).to.equal('user');
    });

    it('should not register user with existing email', async () => {
      const existingUser = {
        username: 'test_user',
        firstname: 'Test',
        lastname: 'User',
        email: TEST_USER.email,
        password: 'TestPassword123!',
        age: 25,
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(existingUser)
        .expect(409);

      expect(response.body.message).to.include('already exists');
    });

    it('should validate required fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({})
        .expect(400);

      TestHelper.expectValidationError(response);
    });

    it('should validate email format', async () => {
      const invalidUser = {
        username: 'test_user',
        firstname: 'Test',
        lastname: 'User',
        email: 'invalid-email',
        password: 'TestPassword123!',
        age: 25,
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(invalidUser)
        .expect(400);

      TestHelper.expectValidationError(response, 'email');
    });

    it('should validate password strength', async () => {
      const weakPasswordUser = {
        username: 'test_user',
        firstname: 'Test',
        lastname: 'User',
        email: TestHelper.generateRandomEmail(),
        password: '123',
        age: 25,
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(weakPasswordUser)
        .expect(400);

      TestHelper.expectValidationError(response, 'password');
    });
  });

  describe('POST /auth/login', () => {
    it('should login admin user successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: TEST_ADMIN.email,
          password: TEST_ADMIN.password,
        })
        .expect(200);

      expect(response.body).to.have.property('access_token');
      expect(response.body).to.have.property('user');
      TestHelper.expectUserStructure(response.body.user);
      expect(response.body.user.role).to.equal('admin');
    });

    it('should login regular user successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: TEST_USER.email,
          password: TEST_USER.password,
        })
        .expect(200);

      expect(response.body).to.have.property('access_token');
      expect(response.body).to.have.property('user');
      TestHelper.expectUserStructure(response.body.user);
      expect(response.body.user.role).to.equal('user');
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: TEST_USER.email,
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body.message).to.include('Invalid credentials');
    });

    it('should reject non-existent user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'password123',
        })
        .expect(401);

      expect(response.body.message).to.include('Invalid credentials');
    });

    it('should validate required fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({})
        .expect(400);

      TestHelper.expectValidationError(response);
    });
  });
});
