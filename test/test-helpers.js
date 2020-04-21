const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

function makeUsersArray() {
    return [
        {
            id: 1,
            name: 'test',
            user_name: 'test',
            password: 'password',
            email: 'test@test.com',
            zip: 31254,
            admin: true
        },
        {
            id: 2,
            name: 'test2',
            user_name: 'test2',
            password: 'pw',
            email: 'test@test.com',
            zip: 31254,
            admin: false
        },
        {
            id: 3,
            name: 'test3',
            user_name: 'test3',
            password: 'insecure',
            email: 'test@test.com',
            zip: 31254,
            admin: false
        },
    ]
}

function makePostsArray() {
    return [

    ]
}

function makeCommentsArray() {
    return [

    ]
}

function cleanTables(db) {
    return db.raw(
        `TRUNCATE
            users,
            posts,
            comments
            RESTART IDENTITY CASCADE`
    )
}

function makeCupOfSugarFixtures() {
    const testUsers = makeUsersArray()
    const testPosts = makePostsArray()
    const testComments = makeCommentsArray()
    return { testUsers, testPosts, testComments }
}

function seedUsers(db, users) {
    const preppedUsers = users.map(user => ({
      ...user,
      password: bcrypt.hashSync(user.password, 1)
    }))
    return db.into('users').insert(preppedUsers)
      .then(() =>
        db.raw(
          `SELECT setval('users_id_seq', ?)`,
          [users[users.length - 1].id],
        )
      )
  }

function makeExpectedPost(post) {
    return {

    }
}

function makeExpectedComment(comment) {
    return {

    }
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
    const token = jwt.sign({ id: user.id }, secret, {
        subject: user.name,
        algorithm: 'HS256',
      })
    return `Bearer ${token}`
}

module.exports = {
    seedUsers,
    makeExpectedComment,
    makeExpectedPost, 
    makeUsersArray,
    makePostsArray,
    makeCommentsArray,
    makeCupOfSugarFixtures,
    cleanTables
}