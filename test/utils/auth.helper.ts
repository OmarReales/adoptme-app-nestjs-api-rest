/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { TEST_ADMIN, TEST_USER, TEST_USER_2 } from '../setup/test-data';

export interface AuthTokens {
  adminToken: string;
  userToken: string;
  user2Token: string;
}

export class AuthHelper {
  static async getAuthTokens(app: INestApplication): Promise<AuthTokens> {
    // Login as admin
    const adminResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: TEST_ADMIN.email,
        password: TEST_ADMIN.password,
      })
      .expect(200);

    // Login as regular user
    const userResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: TEST_USER.email,
        password: TEST_USER.password,
      })
      .expect(200);

    // Login as second user
    const user2Response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: TEST_USER_2.email,
        password: TEST_USER_2.password,
      })
      .expect(200);

    return {
      adminToken: adminResponse.body.access_token,
      userToken: userResponse.body.access_token,
      user2Token: user2Response.body.access_token,
    };
  }

  static getAuthHeaders(token: string) {
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  static async loginUser(
    app: INestApplication,
    email: string,
    password: string,
  ): Promise<string> {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(200);

    return response.body.access_token;
  }

  static async loginAndGetToken(
    app: INestApplication,
    user: { email: string; password: string },
  ): Promise<string> {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: user.email,
        password: user.password,
      })
      .expect(200);

    return response.body.access_token;
  }
}
