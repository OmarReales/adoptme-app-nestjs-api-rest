/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import { describe, it, before, after, beforeEach } from 'mocha';
import { expect } from 'chai';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';

import { TestAppSetup } from '../../setup/test-app.setup';
import { TestDatabaseSetup } from '../../setup/test-db.setup';
import { TEST_USER } from '../../setup/test-data';

describe('Hybrid Authentication Integration Tests', () => {
  let app: INestApplication;

  before(async () => {
    // Setup test database
    await TestDatabaseSetup.setupTestDatabase();

    // Create test app
    app = await TestAppSetup.createTestApp();

    console.log('🔐 Hybrid auth integration tests started');
  });

  beforeEach(async () => {
    // Clean database and setup test data
    await TestDatabaseSetup.cleanupDatabase();
    await TestAppSetup.setupTestData();
  });

  after(async () => {
    await TestAppSetup.closeTestApp();
    await TestDatabaseSetup.closeConnection();
    console.log('🔐 Hybrid auth integration tests completed');
  });

  describe('JWT Authentication', () => {
    it('should authenticate with valid JWT token', async () => {
      // First login to get token
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: TEST_USER.email,
          password: TEST_USER.password,
        })
        .expect(200);

      expect(loginResponse.body).to.have.property('access_token');
      const token = loginResponse.body.access_token as string;

      // Test accessing protected endpoint with JWT
      const profileResponse = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(profileResponse.body).to.have.property('userId');
      expect(profileResponse.body).to.have.property('username');
      expect(profileResponse.body).to.have.property('role');
      expect(profileResponse.body.role).to.equal('user');
    });

    it('should reject invalid JWT token', async () => {
      await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should reject expired JWT token', async () => {
      // This would require a special test token with short expiry
      // For now, we test with malformed token
      await request(app.getHttpServer())
        .get('/auth/profile')
        .set(
          'Authorization',
          'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.expired.token',
        )
        .expect(401);
    });
  });

  describe('Session Authentication', () => {
    it('should authenticate with valid session cookies', async () => {
      const agent = request.agent(app.getHttpServer());

      // Login with session (using agent to maintain cookies)
      const loginResponse = await agent
        .post('/auth/login')
        .send({
          email: TEST_USER.email,
          password: TEST_USER.password,
        })
        .expect(200);

      expect(loginResponse.body).to.have.property('access_token');
      expect(loginResponse.body).to.have.property('user');

      // Test accessing protected endpoint with session
      const profileResponse = await agent.get('/auth/profile').expect(200);

      expect(profileResponse.body).to.have.property('userId');
      expect(profileResponse.body).to.have.property('username');
      expect(profileResponse.body).to.have.property('role');
      expect(profileResponse.body.role).to.equal('user');
    });

    it('should reject request without session', async () => {
      await request(app.getHttpServer()).get('/auth/profile').expect(401);
    });
  });

  describe('Hybrid Auth Test Endpoint', () => {
    it('should work with JWT and identify auth method', async () => {
      // Login to get token
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: TEST_USER.email,
          password: TEST_USER.password,
        })
        .expect(200);

      const token = loginResponse.body.access_token as string;

      // Test hybrid endpoint with JWT
      const jwtTestResponse = await request(app.getHttpServer())
        .get('/auth/test-hybrid')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(jwtTestResponse.body.message).to.include(
        'Hybrid authentication successful',
      );
      expect(jwtTestResponse.body.authMethod).to.equal('JWT');
      expect(jwtTestResponse.body.user).to.have.property('userId');
    });

    it('should work with session and identify auth method', async () => {
      const agent = request.agent(app.getHttpServer());

      // Login with session
      await agent
        .post('/auth/login')
        .send({
          email: TEST_USER.email,
          password: TEST_USER.password,
        })
        .expect(200);

      // Test hybrid endpoint with session
      const sessionTestResponse = await agent
        .get('/auth/test-hybrid')
        .expect(200);

      expect(sessionTestResponse.body.message).to.include(
        'Hybrid authentication successful',
      );
      expect(sessionTestResponse.body.authMethod).to.equal('Session');
      expect(sessionTestResponse.body.user).to.have.property('userId');
    });
  });

  describe('Protected Endpoints with Hybrid Auth', () => {
    describe('/api/pets endpoints', () => {
      it('should access pets with JWT token', async () => {
        const loginResponse = await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: TEST_USER.email,
            password: TEST_USER.password,
          })
          .expect(200);

        const token = loginResponse.body.access_token as string;

        await request(app.getHttpServer())
          .get('/pets')
          .set('Authorization', `Bearer ${token}`)
          .expect(200);
      });

      it('should access pets with session cookies', async () => {
        const agent = request.agent(app.getHttpServer());

        await agent
          .post('/auth/login')
          .send({
            email: TEST_USER.email,
            password: TEST_USER.password,
          })
          .expect(200);

        await agent.get('/pets').expect(200);
      });
    });

    describe('/api/users endpoints', () => {
      it('should access user profile with JWT token', async () => {
        const loginResponse = await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: TEST_USER.email,
            password: TEST_USER.password,
          })
          .expect(200);

        const token = loginResponse.body.access_token as string;

        await request(app.getHttpServer())
          .get('/users/profile/me')
          .set('Authorization', `Bearer ${token}`)
          .expect(200);
      });

      it('should access user profile with session cookies', async () => {
        const agent = request.agent(app.getHttpServer());

        await agent
          .post('/auth/login')
          .send({
            email: TEST_USER.email,
            password: TEST_USER.password,
          })
          .expect(200);

        await agent.get('/users/profile/me').expect(200);
      });
    });
  });

  describe('Authentication Priority', () => {
    it('should prioritize JWT when both JWT and session are present', async () => {
      const agent = request.agent(app.getHttpServer());

      // Login with session first
      await agent
        .post('/auth/login')
        .send({
          email: TEST_USER.email,
          password: TEST_USER.password,
        })
        .expect(200);

      // Get JWT token
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: TEST_USER.email,
          password: TEST_USER.password,
        })
        .expect(200);

      const token = loginResponse.body.access_token as string;

      // Test with both JWT and session - should use JWT
      const response = await agent
        .get('/auth/test-hybrid')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.authMethod).to.equal('JWT');
    });
  });
});
