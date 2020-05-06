const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');
require('dotenv').config();

describe('Posts Endpoints', function () {
  let db;
  const {
    testUsers,
    testPosts,
    testComments,
    testMessages,
    testThreads
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
    beforeEach('Insert Comments', () => {
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
        name: 'GET /api/posts',
        path: '/api/posts',
        method: supertest(app).get
      },
      {
        name: 'POST /api/posts',
        path: '/api/posts',
        method: supertest(app).post
      },
      {
        name: 'PATCH /api/posts/:post_id',
        path: '/api/posts/1',
        method: supertest(app).patch
      },
      {
        name: 'DELETE /api/posts/:post_id',
        path: '/api/posts/1',
        method: supertest(app).delete
      },
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
          const invalidUser = { user_name: 'user-not-existy', id: 1 };
          return endpoint.method(endpoint.path)
            .set('Authorization', helpers.makeAuthHeader(invalidUser))
            .expect(401, { error: 'Unauthorized request' });
        });
      });
    });
  });
  describe('DELETE /api/posts/:post_id', () => {
    context('Given no post', () => {
      before('insert users', () => {
        return helpers.seedUsers(
          db,
          testUsers
        );
      });
      it('responds with 404 not found', () => {
        return supertest(app)
          .delete('/api/posts/1')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0], process.env.JWT_SECRET))
          .expect(404);
      });
    });
    context('Given the post exists', () => {
      beforeEach('insert posts', () => {
        return helpers.seedCupOfSugarTables(
          db,
          testUsers,
          testPosts,
          testComments,
          testThreads,
          testMessages
        );
      });
      it('responds with 204', () => {
        return supertest(app)
          .delete(`/api/posts/${testPosts[0].id}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0], process.env.JWT_SECRET))
          .expect(204);
      });
    });
  });
  describe('POST /api/posts', () => {
    beforeEach('insert users', () => {
      return helpers.seedUsers(
        db,
        testUsers
      );
    });
    context('Given a valid post', () => {});
    context('Given an empty required field', () => {
      const requiredFields = ['type','title', 'description'];

      requiredFields.forEach(field => {
        const testUser = testUsers[0];
        const newPost = {
          type: 'offer',
          title: 'New Title',
          description: 'New Description'
        };

        it(`responds with 400 and an error message when the '${field}' is missing`, () => {
          delete newPost[field];

          return supertest(app)
            .post('/api/posts')
            .set('Authorization', helpers.makeAuthHeader(testUser, process.env.JWT_SECRET))
            .send(newPost)
            .expect(400, {error: { message: `${field} required`}});
        });
      });
    });
  });
  describe('GET /api/posts', () => {
    context('Given no posts', () => {
      before('insert users', () => {
        return helpers.seedUsers(
          db,
          testUsers
        );
      });

      it('responds with 200 and empty list', () => {
        return supertest(app)
          .get('/api/posts')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0], process.env.JWT_SECRET))
          .expect(200, []);
      });
      context('Given there are posts in the database', () => {
        before('clean tables', () => 
          helpers.cleanTables(db)
        );
        beforeEach('insert posts', () => {
          return helpers.seedCupOfSugarTables(
            db,
            testUsers,
            testPosts,
            testComments,
            testThreads,
            testMessages
          );
        });
        it('responds with 200 and all of the posts by zip', () => {
          const expectedPosts = testPosts.map(post =>
            helpers.makeExpectedPost(post, helpers.getUserForItem(post, testUsers))
          );
          return supertest(app)
            .get('/api/posts')
            .set('Authorization', helpers.makeAuthHeader(testUsers[0], process.env.JWT_SECRET))
            .expect(200, expectedPosts);
        });
      });
    });
  });
});