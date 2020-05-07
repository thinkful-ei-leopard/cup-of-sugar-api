const express = require('express')
const CommentsService = require('./comments-service')
const { requireAuth } = require('../middleware/jwt-auth')
const path = require('path')
const xss = require('xss')

const commentsRouter = express.Router()
const jsonBodyParser = express.json()

const serializeComment = comment => ({
    id: comment.id,
    name: comment.name,
    user_name: comment.user_name,
    zip: comment.zip,
    user_id: comment.user_id,
    post_id: comment.post_id,
    date_modified: comment.date_modified,
    content: xss(comment.content)
})

commentsRouter
    .route('/')
    .get(requireAuth, async (req, res, next) => {
        try {
            const comments = await CommentsService.getCommentsByZip(
                req.app.get('db'), 
                req.user.zip
            )
            res
                .status(200)
                .json(comments.map(serializeComment))
        } catch(error) {
            next(error)
        }
    })

commentsRouter
    .route('/:post_id') 
    .get(requireAuth, async (req, res, next) => {
        try {
            const comments = await CommentsService.getCommentsByPostId(
                req.app.get('db'), 
                req.params.post_id
            )
            res
                .status(200)
                .json(comments.map(serializeComment))

        } catch(error) {
            next(error)
        }
    })
    .post(requireAuth, jsonBodyParser, async (req, res, next) => {
        const { content } = req.body;
        if(!content) {
            return res.status(400).send('No comment content')
        }
        const post_id = req.params.post_id
        const user_id = req.user.id
        const newComment = { user_id, post_id, content }
        if (content.length > 500) {
            return res
                .status(400)
                .send({error: {message: 'Comment must not exceed 500 characters'}})
        }
        try {
            let comment = await CommentsService.insertComment(
                req.app.get('db'), 
                newComment
            )
            await CommentsService.incrementPostCommentsCount(
                req.app.get('db'), 
                req.params.post_id
            )

                res
                    .status(201)
                    .json(serializeComment(comment))
        } catch(error) {
            next(error)
        }
    })

commentsRouter
    .route('/:post_id/:comment_id')
    .delete(requireAuth, async (req, res, next) => {
        try {
            const comments = await CommentsService.getCommentById(req.app.get('db'), req.params.comment_id)
       
            if(comments.length === 0) {
                return res.status(404).send('Comment not found')
            }
        
            await CommentsService.deleteComment(
                req.app.get('db'), 
                req.params.comment_id
            )
            await CommentsService.decrementPostCommentsCount(
                req.app.get('db'),
                req.params.post_id
            )

            res
                .status(204)
                .end()
        } catch(error) {
            next(error)
        }
    })

module.exports = commentsRouter