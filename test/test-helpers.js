const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

function makeUsersArray() {
    return [
        {
            id: 1,
            name: 'test1_name',
            user_name: 'test1',
            password: 'password',
            email: 'test@test.com',
            zip: 31254,
            admin_status: true,
            img_alt:'test1 Profile picture',
            img_src:'https://test1.jpg'
        },
        {
            id: 2,
            name: 'test2_name',
            user_name: 'test2',
            password: 'pw',
            email: 'test@test.com',
            zip: 31254,
            admin_status: false,
            img_alt:'test2 Profile picture',
            img_src:'https://test2.jpg'
        },
        {
            id: 3,
            name: 'test3_name',
            user_name: 'test3',
            password: 'insecure',
            email: 'test@test.com',
            zip: 31254,
            admin_status: false,
            img_alt:'test3 Profile picture',
            img_src:'https://test3.jpg'
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
          comments: 0,
          resolved: false,
        },
        {
            id: 2,
            user_id: 1,
            date_modified: "2020-04-22T15:07:04.118Z",
            type: 'offer',
            title: 'testing 1 2 3',
            description: 'its a description',
            comments: 0,
            resolved: false,
        },
        {
            id: 3,
            user_id: 2,
            date_modified: "2020-04-22T15:07:04.118Z",
            type: 'request',
            title: 'testing 1 2 12 12',
            description: 'its a test',
            comments: 0,
            resolved: false,
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

function makeMessagesArray() {
    return [
        {
            id: 1,
            thread_id: 1,
            user_id: 1,
            content: 'test',
            date_modified: '2020-04-22T15:07:04.118Z'
        },
        {
            id: 2,
            thread_id: 1,
            user_id: 1,
            content: 'test test',
            date_modified: '2020-04-22T15:07:04.118Z'
        },
        {
            id: 3,
            thread_id: 1,
            user_id: 2,
            content: 'test test test',
            date_modified: '2020-04-22T15:07:04.118Z'
        }
    ]
}

function makeThreadsArray() {
    return [
        {
            id: 1,
            date_modified: '2020-05-05T15:10:21.720Z',
            img_alt1: 'test1 Profile picture',
            img_alt2: 'test2 Profile picture',
            img_src1: 'https://test1.jpg',
            img_src2: 'https://test2.jpg',
            name1: 'test1_name',
            name2: 'test2_name',
            user_id1: 1,
            user_id2: 2,
            user_name1: 'test1',
            user_name2: 'test2'
        },
        {
            id: 2,
            date_modified: '2020-05-05T15:10:21.720Z',
            img_alt1: 'test1 Profile picture',
            img_alt2: 'test3 Profile picture',
            img_src1: 'https://test1.jpg',
            img_src2: 'https://test3.jpg',
            name1: 'test1_name',
            name2: 'test3_name',
            user_id1: 1,
            user_id2: 3,
            user_name1: 'test1',
            user_name2: 'test3'
        },
        {
            id: 3,
            date_modified: '2020-05-05T15:10:21.720Z',
            img_alt1: 'test2 Profile picture',
            img_alt2: 'test3 Profile picture',
            img_src1: 'https://test2.jpg',
            img_src2: 'https://test3.jpg',
            name1: 'test2_name',
            name2: 'test3_name',
            user_id1: 2,
            user_id2: 3,
            user_name1: 'test2',
            user_name2: 'test3'
        },
    ]
}

function makeCupOfSugarFixtures() {
    const testUsers = makeUsersArray()
    const testPosts = makePostsArray()
    const testComments = makeCommentsArray()
    const testMessages = makeMessagesArray()
    const testThreads = makeThreadsArray()
    return { testUsers, testPosts, testComments, testMessages, testThreads }
}

function seedCupOfSugarTables(db, users, posts = [], comments = [], threads = [], messages = []) {
    return db.transaction(async (trx) => {
      await seedUsers(trx, users)
      await seedPosts(trx, posts)
      if(threads.length > 0) {
      await seedThreads(trx, threads)
      }
      if(comments.length > 0) {
        await trx.into('comments').insert(comments)
        await trx.raw(
          `SELECT setval('comments_id_seq', ?)`,
          [comments[comments.length - 1].id],
      )}
      if(messages.length > 0) {
        await trx.into('messages').insert(messages)
        await trx.raw(
          `SELECT setval('messages_id_seq', ?)`,
          [messages[messages.length - 1].id],
      )}
    })
}

function cleanTables(db) {
    return db.raw(
        `TRUNCATE
            users,
            posts,
            comments,
            threads,
            messages
            RESTART IDENTITY CASCADE`
    )
}

function seedPosts(db, posts) {
    return db.into('posts').insert(posts)
      .then(() =>
        db.raw(
          `SELECT setval('posts_id_seq', ?)`,
          [posts[posts.length - 1].id],
        )
      )
}

function seedUsers(db, users) {
    const preppedUsers = users.map(user => ({
      ...user,
      password: bcrypt.hashSync(user.password, 1)
    }))
    return db.transaction(async trx => {
        await trx.into('users').insert(preppedUsers)
    
        // await trx.raw(
        //   `SELECT setval('user_id_seq', ?)`,
        //   [users[users.length - 1].id],
        // )
      })
}

function seedThreads(db, threads) {
    return db.into('threads').insert(threads)
      .then(() =>
        db.raw(
          `SELECT setval('threads_id_seq', ?)`,
          [threads[threads.length - 1].id],
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
        comments: post.comments,
        resolved: post.resolved,
        img_src: user.img_src
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

function makeExpectedThread(thread) {
    return {
        id: thread.id,
        name1: thread.name1,
        user_name1: thread.user_name1,
        user_id1: thread.user_id1,
        user_id2: thread.user_id2,
        name2: thread.name2,
        user_name2: thread.user_name2,
        date_modified: thread.date_modified,
        img_src1: thread.img_src1,
        img_alt1: thread.img_alt1,
        img_src2: thread.img_src2,
        img_alt2: thread.img_alt2
    }
}

function makeExpectedMessage(message, thread) {
    return {
        id: message.id,
        user_id: thread.user_id1,
        thread_id: thread.id,
        date_modified: message.date_modified,
        content: message.content
    }
}

function makeExpectedMessage2(message, thread) {
    return {
        id: message.id,
        user_id: thread.user_id2,
        thread_id: thread.id,
        date_modified: message.date_modified,
        content: message.content
    }
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
    const token = jwt.sign({ id: user.id }, secret, {
        subject: user.user_name,
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
    seedCupOfSugarTables,
    getUserForItem,
    makeExpectedMessage,
    makeExpectedThread,
    makeExpectedMessage2
}