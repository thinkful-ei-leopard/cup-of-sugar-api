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
        {
          id: 1,
          user_id: 1,
          date_modified: new Date(),
          type: 'request',
          title: 'testing 1 2',
          description: 'its a test descrition'
        },
        {
            id: 3,
            user_id: 1,
            date_modified: new Date(),
            type: 'offer',
            title: 'testing 1 2 3',
            description: 'its a descrition'
        },
        {
            id: 3,
            user_id: 2,
            date_modified: new Date(),
            type: 'request',
            title: 'testing 1 2 12 12',
            description: 'its a test'
        },
    ]
}

function makeCommentsArray() {
    return [
        {
            id: 1,
            user_id: 1,
            post_id: 1,
            date_modified: new Date(),
            content: 'test content'
        },
        {
            id: 2,
            user_id: 1,
            post_id: 2,
            date_modified: new Date(),
            content: 'test 2 content'
        },
        {
            id: 3,
            user_id: 2,
            post_id: 1,
            date_modified: new Date(),
            content: 'test 3 content'
        },
        {
            id: 4,
            user_id: 2,
            post_id: 3,
            date_modified: new Date(),
            content: 'test 4 content'
        },
    ]
}

function seedCupOfSugarTables(db, users, games, players=[], scores=[], pig=[] ) {
    return db.transaction(async trx => {
      await seedUsers(trx, users)
      await trx.into('posts').insert(posts)
      await trx.raw(
        `SELECT setval('posts_id_seq', ?)`,
        [posts[posts.length - 1].id],
      )
      if(comments.length) {
        await trx.into('comments').insert(comments)
        await trx.raw(
          `SELECT setval('comments_id_seq', ?)`,
          [comments[comments.length - 1].id],
      )}
    })
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
        id: post.id,
        user_id: post.user_id,
        date_modified: post.date_modified,
        type: post.type,
        title: post.title,
        description: post.description
    }
}

function makeExpectedComment(comment) {
    return {
        id: comment.id,
        user_id: comment.user_id,
        post_id: comment.post_id,
        date_modified: post.date_modified,
        content: post.content
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
    cleanTables,
    makeAuthHeader,
    seedCupOfSugarTables
}