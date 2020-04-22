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
            admin_status: true
        },
        {
            id: 2,
            name: 'test2',
            user_name: 'test2',
            password: 'pw',
            email: 'test@test.com',
            zip: 31254,
            admin_status: false
        },
        {
            id: 3,
            name: 'test3',
            user_name: 'test3',
            password: 'insecure',
            email: 'test@test.com',
            zip: 31254,
            admin_status: false
        },
    ]
}

function makePostsArray() {
    return [
        {
          id: 1,
          user_id: 1,
          date_modified: "2020-04-22T15:07:04.118Z",
          type: 'request',
          title: 'testing 1 2',
          description: 'its a test descrition',
          comments: 0
        },
        {
            id: 2,
            user_id: 1,
            date_modified: "2020-04-22T15:07:04.118Z",
            type: 'offer',
            title: 'testing 1 2 3',
            description: 'its a description',
            comments: 0
        },
        {
            id: 3,
            user_id: 2,
            date_modified: "2020-04-22T15:07:04.118Z",
            type: 'request',
            title: 'testing 1 2 12 12',
            description: 'its a test',
            comments: 0
        },
    ]
}

function makeCommentsArray() {
    return [
        {
            id: 1,
            user_id: 1,
            post_id: 1,
            date_modified: "2020-04-22T15:07:04.118Z",
            content: 'test content'
        },
        {
            id: 2,
            user_id: 1,
            post_id: 2,
            date_modified: "2020-04-22T15:07:04.118Z",
            content: 'test 2 content'
        },
        {
            id: 3,
            user_id: 2,
            post_id: 1,
            date_modified: "2020-04-22T15:07:04.118Z",
            content: 'test 3 content'
        },
        {
            id: 4,
            user_id: 2,
            post_id: 3,
            date_modified: "2020-04-22T15:07:04.118Z",
            content: 'test 4 content'
        },
    ]
}

function seedCupOfSugarTables(db, users, posts = [], comments = []) {
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

function makeExpectedPost(post, user) {
    return {
        id: post.id,
        name: user.name,
        user_name: user.user_name,
        zip: user.zip,
        user_id: post.user_id,
        date_modified: post.date_modified,
        type: post.type,
        title: post.title,
        description: post.description,
        comments: post.comments
    }
}

function getUserForItem(item, userArr) {
    let user = userArr.find(user => user.id === item.user_id)
    return user
}

function makeExpectedComment(comment, user) {
    return {
        id: comment.id,
        name: user.name,
        user_name: user.user_name,
        zip: user.zip,
        user_id: comment.user_id,
        post_id: comment.post_id,
        date_modified: comment.date_modified,
        content: comment.content
    }
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
    const token = jwt.sign({ id: user.id }, secret, {
        subject: user.name,
        algorithm: 'HS256',
      })
    console.log(token)
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
    seedCupOfSugarTables,
    getUserForItem
}