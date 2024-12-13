import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, connect, disconnect } from 'mongoose';
import { ConfigService } from '@nestjs/config';

describe('TodosController (e2e)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const mongoUri = mongod.getUri();
    mongoConnection = (await connect(mongoUri)).connection;
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ConfigService)
      .useValue({
        get: jest.fn((key: string) => {
          if (key === 'MONGODB_URI') {
            return mongod.getUri();
          }
          return null;
        }),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    const collections = await mongoConnection.db.collections();
    for (const collection of collections) {
      await collection.deleteMany({});
    }
  });

  afterAll(async () => {
    await app.close();
    await mongoConnection.dropDatabase();
    await mongoConnection.close();
    await mongod.stop();
    await disconnect();
  });

  describe('POST /todos', () => {
    it('should create a TODO', () => {
      return request(app.getHttpServer())
        .post('/todos')
        .send({
          title: 'Test TODO',
          description: 'Test Description',
          completed: false,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toBeDefined();
          expect(res.body.title).toBe('Test TODO');
          expect(res.body.description).toBe('Test Description');
          expect(res.body.completed).toBe(false);
          expect(res.body._id).toBeDefined();
        });
    });

    it('should fail to create a TODO without title', () => {
      return request(app.getHttpServer())
        .post('/todos')
        .send({
          description: 'Test Description',
          completed: false,
        })
        .expect(404)
        .expect((res) => {
          expect(res.body.message).toBe('Title is required');
        });
    });
  });

  describe('GET /todos', () => {
    it('should return an array of todos', async () => {
      // First create a TODO
      await request(app.getHttpServer())
        .post('/todos')
        .send({
          title: 'Test TODO',
          description: 'Test Description',
          completed: false,
        });

      return request(app.getHttpServer())
        .get('/todos')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBe(1);
          expect(res.body[0].title).toBe('Test TODO');
        });
    });
  });

  describe('GET /todos/:id', () => {
    it('should return a single TODO', async () => {
      // First create a TODO
      const createResponse = await request(app.getHttpServer())
        .post('/todos')
        .send({
          title: 'Test TODO',
          description: 'Test Description',
          completed: false,
        });

      const todoId = createResponse.body._id;

      return request(app.getHttpServer())
        .get(`/todos/${todoId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toBeDefined();
          expect(res.body.title).toBe('Test TODO');
          expect(res.body._id).toBe(todoId);
        });
    });

    it('should return 404 for non-existent TODO', () => {
      return request(app.getHttpServer())
        .get('/todos/64a7e7d82c6e6d4b4c9e1234')
        .expect(404)
        .expect((res) => {
          expect(res.body.message).toContain('not found');
        });
    });
  });

  describe('PUT /todos/:id', () => {
    it('should update a TODO', async () => {
      // First create a TODO
      const createResponse = await request(app.getHttpServer())
        .post('/todos')
        .send({
          title: 'Test TODO',
          description: 'Test Description',
          completed: false,
        });

      const todoId = createResponse.body._id;

      return request(app.getHttpServer())
        .put(`/todos/${todoId}`)
        .send({
          title: 'Updated TODO',
          description: 'Updated Description',
          completed: true,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toBeDefined();
          expect(res.body.title).toBe('Updated TODO');
          expect(res.body.description).toBe('Updated Description');
          expect(res.body.completed).toBe(true);
          expect(res.body._id).toBe(todoId);
        });
    });

    it('should return 404 for updating non-existent TODO', () => {
      return request(app.getHttpServer())
        .put('/todos/64a7e7d82c6e6d4b4c9e1234')
        .send({
          title: 'Updated TODO',
          description: 'Updated Description',
          completed: true,
        })
        .expect(404)
        .expect((res) => {
          expect(res.body.message).toContain('not found');
        });
    });
  });

  describe('DELETE /todos/:id', () => {
    it('should delete a TODO', async () => {
      // First create a TODO
      const createResponse = await request(app.getHttpServer())
        .post('/todos')
        .send({
          title: 'Test TODO',
          description: 'Test Description',
          completed: false,
        });

      const todoId = createResponse.body._id;

      return request(app.getHttpServer())
        .delete(`/todos/${todoId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toBeDefined();
          expect(res.body._id).toBe(todoId);
        });
    });

    it('should return 404 for deleting non-existent TODO', () => {
      return request(app.getHttpServer())
        .delete('/todos/64a7e7d82c6e6d4b4c9e1234')
        .expect(404)
        .expect((res) => {
          expect(res.body.message).toContain('not found');
        });
    });
  });
});
