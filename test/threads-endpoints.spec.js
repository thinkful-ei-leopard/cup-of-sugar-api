const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');
require('dotenv').config();

describe('Thread Endpoints', () => {
  let db;
  const {
    testUsers,
    testPosts,
    testComments,
    testThreads,
    testMessages
  } = helpers.makeCupOfSugarFixtures(); 

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('cleanup', () => helpers.cleanTables(db));

  afterEach('cleanup', () => helpers.cleanTables(db));

  describe('Protected endpoints', () => {
    beforeEach('Insert Threads', () => {
      return helpers.seedCupOfSugarTables(
        db,
        testUsers,
        testPosts,
        testComments,
        testThreads,
        testMessages
      );
    });
    const protectedEndpoints = [
      {
        name: 'GET /api/threads',
        path: '/api/threads',
        method: supertest(app).get,
      },
      {
        name: 'GET /api/threads/:thread_id',
        path: '/api/threads/1',
        method: supertest(app).get,
      },
      {
        name: 'POST /api/threads',
        path: '/api/threads',
        method: supertest(app).post,
      },
      {
        name: 'DELETE /api/threads/:thread_id',
        path: '/api/threads/1',
        method: supertest(app).delete,
      }
    ];
    protectedEndpoints.forEach(endpoint => {
      describe(endpoint.name, () => {
        it('responds with 401 \'Missing bearer token\' when no bearer token', () => {
          return endpoint.method(endpoint.path)
            .expect(401, { error: 'Missing bearer token' });
        });
        it('responds 401 \'Unauthorized request\' when invalid JWT secret', () => {
          const validUser = testUsers[0];
          const invalidSecret = 'bad-secret';
          return endpoint.method(endpoint.path)
            .set('Authorization', helpers.makeAuthHeader(validUser, invalidSecret))
            .expect(401, { error: 'Unauthorized request' });
        });
        it('responds 401 \'Unauthorized request\' when invalid sub in payload', () => {
          const invalidUser = { name: 'user-not-existy', user_name: 'user-not-existy', id: 1 };
          return endpoint.method(endpoint.path)
            .set('Authorization', helpers.makeAuthHeader(invalidUser))
            .expect(401, { error: 'Unauthorized request' });
        });
      });
    });
  });
  describe('POST /api/threads', () => {
    context('given valid thread', () => {
      beforeEach('seed tables', () => {
        return helpers.seedCupOfSugarTables(
          db,
          testUsers,
          testPosts,
          testComments,
          testThreads,
        );
      });
      it('responds with 201 and new thread', () => {
        let newThread = {
          name1: 'test',
          user_name1: 'test1',
          user_id2: 2, 
          name2: 'test2',
          user_name2: 'test22',
          img_src1: 'source',
          img_alt1: 'image',
          img_src2: 'source2',
          img_alt2: 'image2'
        };
        return supertest(app)
          .post('/api/threads')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0], process.env.JWT_SECRET))
          .send(newThread)
          .expect(201)
          .expect(res => {
            expect(res.body).to.have.property('id');
            expect(res.body.name1).to.eql(newThread.name1);
            expect(res.body.name2).to.eql(newThread.name2);
            expect(res.body.user_name1).to.eql(newThread.user_name1);
            expect(res.body.user_name2).to.eql(newThread.user_name2);
            expect(res.body.img_src1).to.eql(newThread.img_src1);
            expect(res.body.img_alt1).to.eql(newThread.img_alt1);
            expect(res.body.img_alt2).to.eql(newThread.img_alt2);
            expect(res.body.img_src2).to.eql(newThread.img_src2);
            expect(res.body).to.have.property('date_modified');
          });
      });
    });
  });
  describe('GET /api/threads', () => {
    context('Given threads exist', () => {
      before('cleanup', () => helpers.cleanTables(db));
      before('insert all', () => {
        return helpers.seedCupOfSugarTables(
          db,
          testUsers,
          testPosts,
          testComments,
          testThreads
        );
      });
      it('responds with 200 and test threads', () => {
        const expectedThread1 = helpers.makeExpectedThread(testThreads[0]);
        const expectedThread2 = helpers.makeExpectedThread(testThreads[1]);
        const expectedArr = [expectedThread1, expectedThread2];
        return supertest(app)
          .get(`/api/threads`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0], process.env.JWT_SECRET))
          .expect(200, expectedArr);
      });
    });
  });
  describe('DELETE /api/threads/:thread_id', () => {
    context('Given no thread', () => {
      before('insert users', () => {
        return helpers.seedUsers(
          db,
          testUsers
        );
      });
      it('responds with 404 not found', () => {
        return supertest(app)
          .delete('/api/threads/1')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0], process.env.JWT_SECRET))
          .expect(404);
      });
    });
    context('Given the thread exists', () => {
      beforeEach('insert threads', () => {
        return helpers.seedCupOfSugarTables(
          db,
          testUsers,
          testPosts,
          testComments,
          testThreads,
          
        );
      });
      it('responds with 204', () => {
        return supertest(app)
          .delete(`/api/threads/${testThreads[0].id}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0], process.env.JWT_SECRET))
          .expect(204);
      });
    });
  });
  describe('GET /api/threads/thread_id', () => {
    context('Given no threads', () => {
      before('insert users', () => {
        return helpers.seedCupOfSugarTables(
          db,
          testUsers,
          testPosts,
          testComments,
        );
      });
      it('responds with 404 not found', () => {
        return supertest(app)
          .get('/api/threads/1')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0], process.env.JWT_SECRET))
          .expect(404);
      });
    });
    context('Given thread exists', () => {
      before('cleanup', () => helpers.cleanTables(db));
      before('insert all', () => {
        return helpers.seedCupOfSugarTables(
          db,
          testUsers,
          testPosts,
          testComments,
          testThreads
        );
      });
      it('responds with 200 and test threads', () => {
        const expectedThread = helpers.makeExpectedThread(testThreads[0]);
        return supertest(app)
          .get(`/api/threads/${testThreads[0].id}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0], process.env.JWT_SECRET))
          .expect(200, expectedThread);
      });
    });
  });
});