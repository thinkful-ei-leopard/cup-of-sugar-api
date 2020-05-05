const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');
require('dotenv').config();

describe('Thread Endpoints', () => {
  let db;
  const {
    testUsers,
    testPosts,
    testComments
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
    beforeEach('Insert messages', () => {
      
    })
  })
})