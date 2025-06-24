/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { expect } from 'chai';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TestAppSetup } from '../../setup/test-app.setup';
import { TestDbSetup } from '../../setup/test-db.setup';
import { AuthHelper } from '../../utils/auth.helper';
import { TestHelper } from '../../utils/test.helper';
import { PetStatus } from '../../../src/schemas/pet.schema';
import { TestPetResponse } from '../../interfaces/test-types';

describe('Pets Integration Tests', () => {
  let app: INestApplication;
  let adminToken: string;
  let userToken: string;
  let secondUserToken: string; // Used for multi-user tests
  let thirdUserToken: string;
  let testPetId: string;

  before(async () => {
    console.log('🧪 Pets integration tests started');
    await TestDbSetup.connect();
    app = await TestAppSetup.createTestApp();
  });

  after(async () => {
    await TestDbSetup.disconnect();
    await app.close();
    console.log('🧪 Pets integration tests completed');
  });

  beforeEach(async () => {
    await TestDbSetup.cleanup();
    await TestAppSetup.setupTestData();

    // Get auth tokens
    adminToken = await AuthHelper.getAdminToken(app);
    userToken = await AuthHelper.getUserToken(app);
    secondUserToken = await AuthHelper.getSecondUserToken(app);
    thirdUserToken = await AuthHelper.getThirdUserToken(app);
  });

  describe('POST /pets', () => {
    it('should create a new pet (admin only)', async () => {
      const petData = {
        name: 'Buddy',
        breed: 'Golden Retriever',
        age: 3,
        description: 'Friendly and energetic dog',
        image: 'https://example.com/buddy.jpg',
      };

      const response = await request(app.getHttpServer() as never)
        .post('/pets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(petData)
        .expect(201);

      const petResponse = response.body as TestPetResponse;
      TestHelper.expectPetStructure(petResponse);
      expect(petResponse.name).to.equal(petData.name);
      expect(petResponse.breed).to.equal(petData.breed);
      expect(petResponse.age).to.equal(petData.age);
      expect(petResponse.status).to.equal(PetStatus.AVAILABLE);
      expect(petResponse.likedBy).to.be.an('array');
      expect(petResponse.likedBy).to.have.lengthOf(0);

      testPetId = petResponse._id;
    });

    it('should deny access to regular users', async () => {
      const petData = {
        name: 'Buddy',
        breed: 'Golden Retriever',
        age: 3,
      };

      const response = await request(app.getHttpServer())
        .post('/pets')
        .set('Authorization', `Bearer ${userToken}`)
        .send(petData)
        .expect(403);

      TestHelper.expectForbidden(response);
    });

    it('should deny access without token', async () => {
      const petData = {
        name: 'Buddy',
        breed: 'Golden Retriever',
        age: 3,
      };

      const response = await request(app.getHttpServer())
        .post('/pets')
        .send(petData)
        .expect(401);

      TestHelper.expectUnauthorized(response);
    });

    it('should validate required fields', async () => {
      const invalidData = {
        // Missing required fields
        description: 'Test description',
      };

      const response = await request(app.getHttpServer())
        .post('/pets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData)
        .expect(400);

      TestHelper.expectValidationError(response);
      // Check that validation messages include required field errors
      const messageString = response.body.message.join(' ');
      expect(messageString).to.include('name');
      expect(messageString).to.include('breed');
      expect(messageString).to.include('age');
    });

    it('should validate age constraints', async () => {
      const invalidData = {
        name: 'Test Pet',
        breed: 'Test Breed',
        age: 50, // Above maximum age
      };

      const response = await request(app.getHttpServer())
        .post('/pets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData)
        .expect(400);

      TestHelper.expectValidationError(response);
    });

    it('should validate name length', async () => {
      const invalidData = {
        name: 'A', // Too short
        breed: 'Test Breed',
        age: 3,
      };

      const response = await request(app.getHttpServer())
        .post('/pets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData)
        .expect(400);

      TestHelper.expectValidationError(response);
    });

    it('should validate image URL format', async () => {
      const invalidData = {
        name: 'Test Pet',
        breed: 'Test Breed',
        age: 3,
        image: 'invalid-url',
      };

      const response = await request(app.getHttpServer())
        .post('/pets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData)
        .expect(400);

      TestHelper.expectValidationError(response);
    });
  });

  describe('GET /pets', () => {
    it('should get all pets with default pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/pets')
        .expect(200);

      TestHelper.expectPaginatedResponse(response);
      expect(response.body.data).to.be.an('array');
      response.body.data.forEach((pet: any) => {
        TestHelper.expectPetStructure(pet);
      });
    });

    it('should support pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/pets?page=1&limit=2')
        .expect(200);

      TestHelper.expectPaginatedResponse(response, 2);
      expect(response.body.pagination.page).to.equal(1);
      expect(response.body.pagination.limit).to.equal(2);
    });

    it('should support filtering by status', async () => {
      const response = await request(app.getHttpServer())
        .get(`/pets?status=${PetStatus.AVAILABLE}`)
        .expect(200);

      TestHelper.expectPaginatedResponse(response);
      response.body.data.forEach((pet: any) => {
        expect(pet.status).to.equal(PetStatus.AVAILABLE);
      });
    });

    it('should support filtering by breed', async () => {
      const breed = 'Labrador';
      const response = await request(app.getHttpServer())
        .get(`/pets?breed=${breed}`)
        .expect(200);

      TestHelper.expectPaginatedResponse(response);
      response.body.data.forEach((pet: any) => {
        expect(pet.breed.toLowerCase()).to.include(breed.toLowerCase());
      });
    });

    it('should support combined filters', async () => {
      const response = await request(app.getHttpServer())
        .get(`/pets?status=${PetStatus.AVAILABLE}&page=1&limit=5`)
        .expect(200);

      TestHelper.expectPaginatedResponse(response, 5);
      response.body.data.forEach((pet: any) => {
        expect(pet.status).to.equal(PetStatus.AVAILABLE);
      });
    });
  });

  describe('GET /pets/:id', () => {
    beforeEach(async () => {
      // Create a test pet
      const petData = {
        name: 'Test Pet',
        breed: 'Test Breed',
        age: 2,
      };

      const createResponse = await request(app.getHttpServer())
        .post('/pets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(petData);

      testPetId = createResponse.body._id;
    });

    it('should get pet by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/pets/${testPetId}`)
        .expect(200);

      TestHelper.expectPetStructure(response.body);
      expect(response.body._id).to.equal(testPetId);
      expect(response.body.name).to.equal('Test Pet');
    });

    it('should return 404 for non-existent pet', async () => {
      const fakeId = '507f1f77bcf86cd799999999';
      const response = await request(app.getHttpServer())
        .get(`/pets/${fakeId}`)
        .expect(404);

      TestHelper.expectNotFound(response);
    });

    it('should return 400 for invalid pet ID format', async () => {
      const invalidId = 'invalid-id';
      const response = await request(app.getHttpServer())
        .get(`/pets/${invalidId}`)
        .expect(400);

      TestHelper.expectBadRequest(response);
    });
  });

  describe('PATCH /pets/:id', () => {
    beforeEach(async () => {
      // Create a test pet
      const petData = {
        name: 'Test Pet',
        breed: 'Test Breed',
        age: 2,
      };

      const createResponse = await request(app.getHttpServer())
        .post('/pets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(petData);

      testPetId = createResponse.body._id;
    });

    it('should update pet (admin only)', async () => {
      const updateData = {
        name: 'Updated Pet Name',
        age: 4,
        description: 'Updated description',
      };

      const response = await request(app.getHttpServer())
        .patch(`/pets/${testPetId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      TestHelper.expectPetStructure(response.body);
      expect(response.body.name).to.equal(updateData.name);
      expect(response.body.age).to.equal(updateData.age);
      expect(response.body.description).to.equal(updateData.description);
    });

    it('should deny access to regular users', async () => {
      const updateData = {
        name: 'Updated Pet Name',
      };

      const response = await request(app.getHttpServer())
        .patch(`/pets/${testPetId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(403);

      TestHelper.expectForbidden(response);
    });

    it('should deny access without token', async () => {
      const updateData = {
        name: 'Updated Pet Name',
      };

      const response = await request(app.getHttpServer())
        .patch(`/pets/${testPetId}`)
        .send(updateData)
        .expect(401);

      TestHelper.expectUnauthorized(response);
    });

    it('should validate update data', async () => {
      const invalidData = {
        age: 50, // Above maximum
      };

      const response = await request(app.getHttpServer())
        .patch(`/pets/${testPetId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData)
        .expect(400);

      TestHelper.expectValidationError(response);
    });

    it('should return 404 for non-existent pet', async () => {
      const fakeId = '507f1f77bcf86cd799999999';
      const updateData = {
        name: 'Updated Name',
      };

      const response = await request(app.getHttpServer())
        .patch(`/pets/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(404);

      TestHelper.expectNotFound(response);
    });
  });

  describe('DELETE /pets/:id', () => {
    beforeEach(async () => {
      // Create a test pet
      const petData = {
        name: 'Test Pet',
        breed: 'Test Breed',
        age: 2,
      };

      const createResponse = await request(app.getHttpServer())
        .post('/pets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(petData);

      testPetId = createResponse.body._id;
    });

    it('should delete pet (admin only)', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/pets/${testPetId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.message).to.include('deleted');

      // Verify pet is deleted
      await request(app.getHttpServer()).get(`/pets/${testPetId}`).expect(404);
    });

    it('should deny access to regular users', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/pets/${testPetId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      TestHelper.expectForbidden(response);
    });

    it('should deny access without token', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/pets/${testPetId}`)
        .expect(401);

      TestHelper.expectUnauthorized(response);
    });

    it('should return 404 for non-existent pet', async () => {
      const fakeId = '507f1f77bcf86cd799999999';
      const response = await request(app.getHttpServer())
        .delete(`/pets/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      TestHelper.expectNotFound(response);
    });
  });

  describe('POST /pets/:id/like', () => {
    beforeEach(async () => {
      // Create a test pet
      const petData = {
        name: 'Test Pet',
        breed: 'Test Breed',
        age: 2,
      };

      const createResponse = await request(app.getHttpServer())
        .post('/pets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(petData);

      testPetId = createResponse.body._id;
    });

    it('should like a pet', async () => {
      const response = await request(app.getHttpServer())
        .post(`/pets/${testPetId}/like`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.message).to.include('liked');

      // Verify pet has like
      const petResponse = await request(app.getHttpServer())
        .get(`/pets/${testPetId}`)
        .expect(200);

      expect(petResponse.body.likedBy).to.have.length(1);
    });

    it('should not allow liking the same pet twice', async () => {
      // First like
      await request(app.getHttpServer())
        .post(`/pets/${testPetId}/like`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      // Second like (should fail)
      const response = await request(app.getHttpServer())
        .post(`/pets/${testPetId}/like`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(409);

      TestHelper.expectConflict(response);
    });

    it('should deny access without token', async () => {
      const response = await request(app.getHttpServer())
        .post(`/pets/${testPetId}/like`)
        .expect(401);

      TestHelper.expectUnauthorized(response);
    });

    it('should return 404 for non-existent pet', async () => {
      const fakeId = '507f1f77bcf86cd799999999';
      const response = await request(app.getHttpServer())
        .post(`/pets/${fakeId}/like`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);

      TestHelper.expectNotFound(response);
    });
  });

  describe('DELETE /pets/:id/like', () => {
    beforeEach(async () => {
      // Create a test pet
      const petData = {
        name: 'Test Pet',
        breed: 'Test Breed',
        age: 2,
      };

      const createResponse = await request(app.getHttpServer())
        .post('/pets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(petData);

      testPetId = createResponse.body._id;

      // Like the pet first
      await request(app.getHttpServer())
        .post(`/pets/${testPetId}/like`)
        .set('Authorization', `Bearer ${userToken}`);
    });

    it('should unlike a pet', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/pets/${testPetId}/like`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.message).to.include('unliked');

      // Verify pet has no likes
      const petResponse = await request(app.getHttpServer())
        .get(`/pets/${testPetId}`)
        .expect(200);

      expect(petResponse.body.likedBy).to.have.length(0);
    });

    it('should not allow unliking a pet not liked', async () => {
      // Unlike first
      await request(app.getHttpServer())
        .delete(`/pets/${testPetId}/like`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      // Try to unlike again
      const response = await request(app.getHttpServer())
        .delete(`/pets/${testPetId}/like`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(409);

      TestHelper.expectConflict(response);
    });

    it('should deny access without token', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/pets/${testPetId}/like`)
        .expect(401);

      TestHelper.expectUnauthorized(response);
    });

    it('should return 404 for non-existent pet', async () => {
      const fakeId = '507f1f77bcf86cd799999999';
      const response = await request(app.getHttpServer())
        .delete(`/pets/${fakeId}/like`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);

      TestHelper.expectNotFound(response);
    });
  });

  describe('GET /pets/my-pets', () => {
    it('should get empty list when user has no pets', async () => {
      const response = await request(app.getHttpServer())
        .get('/pets/my-pets')
        .set('Authorization', `Bearer ${thirdUserToken}`)
        .expect(200);

      expect(response.body).to.be.an('array').that.is.empty;
    });

    it('should deny access without token', async () => {
      const response = await request(app.getHttpServer())
        .get('/pets/my-pets')
        .expect(401);

      TestHelper.expectUnauthorized(response);
    });
  });

  describe('GET /pets/my-liked', () => {
    beforeEach(async () => {
      // Create a test pet and like it
      const petData = {
        name: 'Test Pet',
        breed: 'Test Breed',
        age: 2,
      };

      const createResponse = await request(app.getHttpServer())
        .post('/pets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(petData);

      testPetId = createResponse.body._id;

      await request(app.getHttpServer())
        .post(`/pets/${testPetId}/like`)
        .set('Authorization', `Bearer ${userToken}`);
    });

    it('should get liked pets for user', async () => {
      const response = await request(app.getHttpServer())
        .get('/pets/my-liked')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).to.be.an('array').with.length(3);
      TestHelper.expectPetStructure(response.body[0]);
      // Find the pet we just liked
      const likedPet = response.body.find((pet: any) => pet._id === testPetId);
      expect(likedPet).to.exist;
    });

    it('should deny access without token', async () => {
      const response = await request(app.getHttpServer())
        .get('/pets/my-liked')
        .expect(401);

      TestHelper.expectUnauthorized(response);
    });
  });
});
