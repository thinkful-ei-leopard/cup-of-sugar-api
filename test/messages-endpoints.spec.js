const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');
require('dotenv').config();

describe('Messages Endpoints', () => {
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
    beforeEach('Insert Messages', () => {
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
        name: 'GET /api/messages',
        path: '/api/messages',
        method: supertest(app).get,
      },
      {
        name: 'GET /api/messages/:thread_id',
        path: '/api/messages/1',
        method: supertest(app).get,
      },
      {
        name: 'POST /api/messages/:thread_id',
        path: '/api/messages/1',
        method: supertest(app).post,
      },
      {
        name: 'DELETE /api/messages/message/:message_id',
        path: '/api/messages/message/1',
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
  describe('POST /api/messages/:thread_id', () => {
    context('Given no message content', () => {
      beforeEach('Seed tables', () => {
        return helpers.seedCupOfSugarTables(
          db,
          testUsers,
          testPosts,
          testComments,
          testThreads,
        );
      });
      it('Responds with 400 Bad Request', () => {
        const contentlessMessage = {
          content: null
        };
        return supertest(app) 
          .post('/api/messages/1')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0], process.env.JWT_SECRET))
          .send(contentlessMessage)
          .expect(400);
      });
    });
    context('given valid message content', () => {
      beforeEach('Seed tables', () => {
        return helpers.seedCupOfSugarTables(
          db,
          testUsers,
          testPosts,
          testComments,
          testThreads,
        );
      });
      it('responds with 201 and new message', () => {
        let newMessage = {
          newMessage: 'Oooweee can do!'
        };
        return supertest(app)
          .post('/api/messages/1')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0], process.env.JWT_SECRET))
          .send(newMessage)
          .expect(201)
          .expect(res => {
            expect(res.body).to.have.property('id');
            expect(res.body.content).to.eql(newMessage.newMessage);
            expect(res.body).to.have.property('thread_id');
            expect(res.body).to.have.property('date_modified');
            expect(res.body).to.have.property('user_id');
          });
      });
    });
  });
  describe('GET /api/messages/:thread_id', () => {
    context('Given no messages', () => {
      before('insert users and threads', () => {
        return helpers.seedUsers(
          db,
          testUsers
        )
      });
      it('responds with 200 and an empty array', () => {
        return supertest(app)
          .get('/api/messages/1')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0], process.env.JWT_SECRET))
          .expect(200)
          .expect(res => {
            expect(res.body).to.eql([]);
          });
      });
    });
    context('Given messages exist', () => {
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
      it('responds with 200 and test messages', () => {
        const thread = testThreads.find(thread => thread.id === testMessages[0].thread_id);
        const expectedMessage1 = helpers.makeExpectedMessage(testMessages[0], thread);
        const expectedMessage2 = helpers.makeExpectedMessage(testMessages[1], thread);
        const expectedMessage3 = helpers.makeExpectedMessage2(testMessages[2], thread);
        const expectedArr = [expectedMessage1, expectedMessage2, expectedMessage3];
        return supertest(app)
          .get(`/api/messages/${testMessages[0].thread_id}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0], process.env.JWT_SECRET))
          .expect(200, expectedArr);
      });
    });
  });
  describe('DELETE /api/messages/message/:message_id', () => {
    context('Given no message', () => {
      before('insert users', () => {
        return helpers.seedUsers(
          db,
          testUsers
        );
      });
      it('responds with 404 not found', () => {
        return supertest(app)
          .delete('/api/messages/message/1')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0], process.env.JWT_SECRET))
          .expect(404);
      });
    });
    context('Given the message exists', () => {
      beforeEach('insert messages', () => {
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
          .delete(`/api/messages/message/${testMessages[0].id}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0], process.env.JWT_SECRET))
          .expect(204);
      });
    });
  });
});
