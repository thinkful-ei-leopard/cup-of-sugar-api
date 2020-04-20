const express = require('express')
const PostsService = require('./posts-service')
const { requireAuth } = require('../middleware/jwt-auth')
const path = require('path')

const postsRouter = express.Router()
const jsonBodyParser = express.json()

postsRouter
    .route('/')
    .get(requireAuth, (req, res, next) => {
        PostsService.getPostsByZip(req.app.get('db'), req.user.zip)
            .then(posts => {
                if(!posts) {
                    res
                        .status(404)
                        .send('No posts found')
                }
                res
                    .status(200)
                    .json(posts)
            })
            .catch(next)
    })
    .post(requireAuth, jsonBodyParser, (req, res, next) => {
        const { type, title, comments, description } = req.body
        const user_id = req.user.id
        const zip = req.user.zip
        const newPost = { user_id, zip, type, title, comments, description }
        if(!type) {
            return res
                .status(400)
                .json({ error: {message: 'Type required'}})
        }
        if(!title) {
            return res
                .status(400)
                .json({ error: {message: 'Title required'}})
        }
        if(!description) {
            return res
                .status(400)
                .json({ error: {message: 'Description required'}})
        }
        if(description.length > 500) {
            return res
                .status(400)
                .json({error: {message: 'Description must not exceed 500 characters'}})
        }
        if(title.length > 60) {
            return res
                .status(400)
                .json({error: {message: 'Title must not exceed 60 characters'}})
        }
        PostsService.insertPost(req.app.get('db'), newPost) 
            .then(post => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `${post.id}`))
                    .json(post)
            })
    })

postsRouter
    .route('/:post_id')
    .delete(requireAuth, (req, res, next) => {
        PostsService.deletePost(req.app.get('db'), req.params.post_id)
            .then(post => {
                if(!post) {
                    return res.status(404).json({
                        error: {message: 'Post does not exist'}
                    })
                }
                res
                    .status(204)
                    .end()
            })
            .catch(next)
    })