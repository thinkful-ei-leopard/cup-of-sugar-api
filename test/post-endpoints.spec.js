const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')
require('dotenv').config()

describe('Posts Endpoints', function () {
    let db
    const {
        testUsers,
        testPosts,
        testComments
    } = helpers.makeCupOfSugarFixtures() 

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.Test_DATABASE_URL,
        })
        app.set('db', db)
    })
    after('disconnect from db', () => db.destroy())

    before('cleanup', () => helpers.cleanTables(db))

    afterEach('cleanup', () => helpers.cleanTables(db))

    describe('Protected endpoints', () => {
        this.beforeEach('Insert Posts', () => {
            helpers.makeCupOfSugarFixtures(
                db,
                testUsers,
                testPosts,
                testComments
            )
        })
        const protectedEndpoints = [
            {
                name: 'GET /api/posts',
                path: '/api/posts'
            },
        ]
        protectedEndpoints.forEach(endpoint => {
            describe(endpoint.name, () => {
                it(`responds with 401 'Missing bearer token' when no bearer token`, () => {
                    return supertest(app)
                        .get(endpoint.path)
                        .expect(401, { error: `Missing bearer token` })
                })
                it(`responds 401 'Unauthorized request' when invalid JWT secret`, () => {
                    const validUser = testUsers[0]
                    const invalidSecret = 'bad-secret'
                     return supertest(app)
                       .get(endpoint.path)
                       .set('Authorization', helpers.makeAuthHeader(validUser, invalidSecret))
                       .expect(401, { error: `Unauthorized request` })
                })
                it(`responds 401 'Unauthorized request' when invalid sub in payload`, () => {
                    const invalidUser = { name: 'user-not-existy', id: 1 }
                    return supertest(app)
                      .get(endpoint.path)
                      .set('Authorization', helpers.makeAuthHeader(invalidUser))
                      .expect(401, { error: `Unauthorized request` })
                })
            })
        })
    })
    describe('POST /api/posts', () => {
        context('Given no post description')
            beforeEach('Insert posts', () => {
                helpers.seedCupOfSugarTables(
                    db,
                    testUsers,
                    testPosts,
                    testComments,
                    testPosts
                )
            it('Responds with 400 Bad Request', () => {
                const descriptionlessPost = {
                    id: 1,
                    user_id: 1,
                    date_modified: new Date(),
                    type: 'request',
                    title: 'testing 1 2',
                    description: null
                }
                return supertest(app) 
                    .post('/api/posts')
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0], process.env.JWT_SECRET))
                    .send(descriptionlessPost)
                    .expect(400)
            })
        })
        context('Given no post title')
            beforeEach('Insert posts', () => {
                helpers.seedCupOfSugarTables(
                    db,
                    testUsers,
                    testPosts,
                    testComments,
                    testPosts
                )
            it('Responds with 400 Bad Request', () => {
                const titlelessPost = {
                    id: 1,
                    user_id: 1,
                    date_modified: new Date(),
                    type: 'request',
                    title: null,
                    description: 'its a test description'
                }
                return supertest(app) 
                    .post('/api/posts')
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0], process.env.JWT_SECRET))
                    .send(titlelessPost)
                    .expect(400)
            })
        })
        context('given valid post description and title', () => {
            beforeEach('insert posts', () => {
                helpers.seedCupOfSugarTables(
                    db,
                    testUsers,
                    testPosts,
                    testComments,
                    testPosts
                )
            })
            it('responds with 201 and new post', () => {
                newPost = {
                    id: 1,
                    user_id: 1,
                    date_modified: new Date(),
                    type: 'request',
                    title: 'its a test title',
                    description: 'its a test description'
                }
                return supertest(app)
                .post('/api/posts')
                .set('Authorization', helpers.makeAuthHeader(testUsers[0], process.env.JWT_SECRET))
                .send(newPost)
                .expect(201)
                .expect(res => {
                    expect(res.body).to.have.property('id')
                    expect(res.body.description).to.eql(newPost.description)
                    expect(res.body.title).to.eql(newPost.title)
                    expect(res.body.type).to.eql(newPost.type)
                    expect(res.body).to.have.property('user_id')
                    expect(res.body).to.have.property('date_modified')
                })
            })
        })
    })
    describe('DELETE /api/posts/:post_id', () => {
        context(`Given no post`, () => {
            before('insert users', () =>
              helpers.seedUsers(
                db,
                testUsers
              )
            )
            it(`responds with 404 not found`, () => {
                return supertest(app)
                .delete('/api/posts/1')
                .set('Authorization', helpers.makeAuthHeader(testUsers[0], process.env.JWT_SECRET))
                .expect(404)
            })
        })
        context('Given the post exists', () => {
            beforeEach('insert posts', () => {
              helpers.seedSnapshotTables(
                db,
                testUsers,
                testPosts,
                testComments
              )
            })
            it('responds with 204', () => {
              return supertest(app)
                .delete(`/api/posts/${testPosts[0].id}`)
                .set('Authorization', helpers.makeAuthHeader(testUsers[0], process.env.JWT_SECRET))
                .expect(204)
            })
        })
    })
    describe(`GET /api/posts`, () => {
        context(`Given no posts`, () => {
            before('insert users', () =>
              helpers.seedUsers(
                db,
                testUsers
              )
            )

            it(`responds with 200 and empty list`, () => {
                return supertest(app)
                .get('/api/posts')
                .set('Authorization', helpers.makeAuthHeader(testUsers[0], process.env.JWT_SECRET))
                .expect(200, [])
            })
        context('Given there are posts in the database', () => {
            beforeEach('insert posts', () =>
              helpers.seedSnapshotTables(
                db,
                testUsers,
                testPosts,
                testCommentsG
              )
            )
            it('responds with 200 and all of the posts by zip', () => {
              const expectedPosts = testPosts.map(post =>
                helpers.makeExpectedPost(post)
              )
              return supertest(app)
                .get('/api/comments')
                .set('Authorization', helpers.makeAuthHeader(testUsers[0], process.env.JWT_SECRET))
                .expect(200, expectedPosts)
            })
        })
        })
    })
})