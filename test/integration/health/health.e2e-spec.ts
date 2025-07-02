import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { expect } from 'chai';
import { AppModule } from '../../../src/app.module';

describe('Health Check (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/health (GET)', () => {
    it('should return basic health status', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.body).to.have.property('status', 'healthy');
      expect(response.body).to.have.property('timestamp');
      expect(response.body).to.have.property('service', 'AdoptMe API');
      expect(response.body).to.have.property('version', '1.0.0');
      expect(response.body).to.have.property('uptime');
      expect(response.body).to.have.property('environment');
      expect(response.body.uptime).to.be.a('number');
    });

    it('should not require authentication', async () => {
      await request(app.getHttpServer()).get('/health').expect(200);
    });

    it('should return consistent timestamp format', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.body.timestamp).to.match(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      );
    });
  });

  describe('/health/detailed (GET)', () => {
    it('should return detailed health status', async () => {
      const response = await request(app.getHttpServer())
        .get('/health/detailed')
        .expect(200);

      expect(response.body).to.have.property('status');
      expect(response.body).to.have.property('timestamp');
      expect(response.body).to.have.property('service', 'AdoptMe API');
      expect(response.body).to.have.property('version', '1.0.0');
      expect(response.body).to.have.property('uptime');
      expect(response.body).to.have.property('environment');
      expect(response.body).to.have.property('database');

      // Database property should have status and message
      expect(response.body.database).to.have.property('status');
      expect(response.body.database).to.have.property('message');
    });

    it('should not require authentication', async () => {
      await request(app.getHttpServer()).get('/health/detailed').expect(200);
    });

    it('should include valid database status', async () => {
      const response = await request(app.getHttpServer())
        .get('/health/detailed')
        .expect(200);

      const { database } = response.body;
      expect(['connected', 'disconnected', 'error']).to.include(
        database.status,
      );
      expect(database.message).to.be.a('string');
    });

    it('should return healthy status when database is connected', async () => {
      const response = await request(app.getHttpServer())
        .get('/health/detailed')
        .expect(200);

      if (response.body.database.status === 'connected') {
        expect(response.body.status).to.equal('healthy');
      }
    });
  });

  describe('Health Check Performance', () => {
    it('basic health check should be fast', async () => {
      const start = Date.now();
      await request(app.getHttpServer()).get('/health').expect(200);
      const duration = Date.now() - start;

      // Should respond in less than 100ms
      expect(duration).to.be.lessThan(100);
    });

    it('detailed health check should be reasonably fast', async () => {
      const start = Date.now();
      await request(app.getHttpServer()).get('/health/detailed').expect(200);
      const duration = Date.now() - start;

      // Should respond in less than 1 second
      expect(duration).to.be.lessThan(1000);
    });
  });
});
