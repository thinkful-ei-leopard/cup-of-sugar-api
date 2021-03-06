const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');
require('dotenv').config();

describe('Comments Endpoints', function () {
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
        name: 'GET /api/comments',
        path: '/api/comments',
        method: supertest(app).get,
      },
      {
        name: 'GET /api/comments/:post_id',
        path: '/api/comments/1',
        method: supertest(app).get,
      },
      {
        name: 'POST /api/comments/:post_id',
        path: '/api/comments/1',
        method: supertest(app).post,
      },
      {
        name: 'DELETE /api/comments/:post_id/:comment_id',
        path: '/api/comments/1/1',
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
          const invalidUser = { user_name: 'user-not-existy', id: 1 };
          return endpoint.method(endpoint.path)
            .set('Authorization', helpers.makeAuthHeader(invalidUser))
            .expect(401, { error: 'Unauthorized request' });
        });
      });
    });
  });
  describe('POST /api/comments/:post_id', () => {
    context('Given no comment content', () => {
      beforeEach('Insert comments', () => {
        return helpers.seedCupOfSugarTables(
          db,
          testUsers,
          testPosts,
          testComments,
          testThreads,
          testMessages
        );
      });
      it('Responds with 400 Bad Request', () => {
        const contentlessComment = {
          id: 1,
          user_id: 1,
          post_id: 1,
          content: null
        };
        return supertest(app) 
          .post('/api/comments/1')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0], process.env.JWT_SECRET))
          .send(contentlessComment)
          .expect(400);
      });
    });
    context('given valid comment content', () => {
      beforeEach('insert comments', () => {
        return helpers.seedCupOfSugarTables(
          db,
          testUsers,
          testPosts,
          testComments,
          testThreads,
          testMessages
        );
      });
      it('responds with 201 and new comment', () => {
        let newComment = {
          content: 'Oooweee can do!',
        };
        return supertest(app)
          .post('/api/comments/1')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0], process.env.JWT_SECRET))
          .send(newComment)
          .expect(201)
          .expect(res => {
            expect(res.body).to.have.property('id');
            expect(res.body.content).to.eql(newComment.content);
            expect(res.body).to.have.property('post_id');
            expect(res.body).to.have.property('date_modified');
            expect(res.body).to.have.property('user_id');
          });
      });
    });
  });
  describe('GET /api/comments/:post_id', () => {
    context('Given no comments', () => {
      before('insert users and posts', () => {
        return helpers.seedUsers(
          db,
          testUsers
        )
      });
      it('responds with 200 and an empty array', () => {
        return supertest(app)
          .get('/api/comments/1')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0], process.env.JWT_SECRET))
          .expect(200)
          .expect(res => {
            expect(res.body).to.eql([]);
          });
      });
    });
    context('Given comments exist', () => {
      before('cleanup', () => helpers.cleanTables(db));
      before('insert all', () => {
        return helpers.seedCupOfSugarTables(
          db,
          testUsers,
          testPosts,
          testComments,
          testThreads,
          testMessages
        );
      });
      it('responds with 200 and test comment', () => {
        const user1 = testUsers.find(user => user.id === testComments[0].user_id);
        const user2 = testUsers.find(user => user.id === testComments[2].user_id);
        const expectedComment1 = helpers.makeExpectedComment(testComments[0], user1);
        const expectedComment2 = helpers.makeExpectedComment(testComments[2], user2);
        const expectedArr = [expectedComment1, expectedComment2];
        return supertest(app)
          .get(`/api/comments/${testComments[0].post_id}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0], process.env.JWT_SECRET))
          .expect(200, expectedArr);
      });
    });
  });
  describe('DELETE /api/comments//:post_id/:comment_id', () => {
    context('Given no comment', () => {
      before('insert users', () => {
        return helpers.seedUsers(
          db,
          testUsers
        );
      });
      it('responds with 404 not found', () => {
        return supertest(app)
          .delete('/api/comments/1/1')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0], process.env.JWT_SECRET))
          .expect(404);
      });
    });
    context('Given the comment exists', () => {
      beforeEach('insert comments', () => {
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
          .delete(`/api/comments/1/${testComments[0].id}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0], process.env.JWT_SECRET))
          .expect(204);
      });
    });
  });
  describe('GET /api/comments', () => {
    context('Given no comments', () => {
      before('insert users', () => {
        return helpers.seedUsers(
          db,
          testUsers
        );
      });

      it('responds with 200 and empty list', () => {
        return supertest(app)
          .get('/api/comments')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0], process.env.JWT_SECRET))
          .expect(200, []);
      });
      context('Given there are comments in the database', () => {
        beforeEach('insert comments', () => {
          return helpers.seedCupOfSugarTables(
            db,
            testUsers,
            testPosts,
            testComments,
            testThreads,
            testMessages
          );
        });
        it('responds with 200 and all of the comments from user zip code', () => {
          const expectedComments = testComments.map(comment =>
            helpers.makeExpectedComment(comment, helpers.getUserForItem(comment, testUsers))
          );
          return supertest(app)
            .get('/api/comments')
            .set('Authorization', helpers.makeAuthHeader(testUsers[0], process.env.JWT_SECRET))
            .expect(200, expectedComments);
        });
      });
    });
  });
});
