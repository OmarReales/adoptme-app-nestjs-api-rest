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
        userName: TestHelper.generateRandomString(),
        firstName: 'Test',
        lastName: 'User',
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
        userName: 'test_user',
        firstName: 'Test',
        lastName: 'User',
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
        userName: 'test_user',
        firstName: 'Test',
        lastName: 'User',
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
        userName: 'test_user',
        firstName: 'Test',
        lastName: 'User',
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
      expect(response.body).to.have.property('message');
      TestHelper.expectUserStructure(response.body.user);
      expect(response.body.user.role).to.equal('admin');

      // Verify JWT token is returned
      expect(response.body.access_token).to.be.a('string');
      expect(response.body.access_token.length).to.be.greaterThan(0);
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
      expect(response.body).to.have.property('message');
      TestHelper.expectUserStructure(response.body.user);
      expect(response.body.user.role).to.equal('user');

      // Verify JWT token is returned
      expect(response.body.access_token).to.be.a('string');
      expect(response.body.access_token.length).to.be.greaterThan(0);
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

    // NEW: Test hybrid authentication - both JWT and session should work
    it('should allow access to protected endpoints with JWT token', async () => {
      // First login to get token
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: TEST_USER.email,
          password: TEST_USER.password,
        })
        .expect(200);

      const token = loginResponse.body.access_token as string;

      // Test accessing protected endpoint with JWT
      const profileResponse = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(profileResponse.body).to.have.property('userId');
      expect(profileResponse.body).to.have.property('userName');
      expect(profileResponse.body).to.have.property('role');
    });

    it('should allow access to protected endpoints with session cookies', async () => {
      const agent = request.agent(app.getHttpServer());

      // Login with session (using agent to maintain cookies)
      await agent
        .post('/auth/login')
        .send({
          email: TEST_USER.email,
          password: TEST_USER.password,
        })
        .expect(200);

      // Test accessing protected endpoint with session
      const profileResponse = await agent.get('/auth/profile').expect(200);

      expect(profileResponse.body).to.have.property('userId');
      expect(profileResponse.body).to.have.property('userName');
      expect(profileResponse.body).to.have.property('role');
    });

    it('should test hybrid auth endpoint with both methods', async () => {
      // Test with JWT
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: TEST_USER.email,
          password: TEST_USER.password,
        })
        .expect(200);

      const token = loginResponse.body.access_token as string;

      const jwtTestResponse = await request(app.getHttpServer())
        .get('/auth/test-hybrid')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(jwtTestResponse.body.message).to.include(
        'Hybrid authentication successful',
      );
      expect(jwtTestResponse.body.authMethod).to.equal('JWT');

      // Test with session
      const agent = request.agent(app.getHttpServer());

      await agent
        .post('/auth/login')
        .send({
          email: TEST_USER.email,
          password: TEST_USER.password,
        })
        .expect(200);

      const sessionTestResponse = await agent
        .get('/auth/test-hybrid')
        .expect(200);

      expect(sessionTestResponse.body.message).to.include(
        'Hybrid authentication successful',
      );
      expect(sessionTestResponse.body.authMethod).to.equal('Session');
    });
  });
});
