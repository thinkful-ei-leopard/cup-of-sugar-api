const express = require('express')
const CommentsService = require('./comments-service')
const { requireAuth } = require('../middleware/jwt-auth')
const path = require('path')

const commentsRouter = express.Router()
const jsonBodyParser = express.json()

commentsRouter
    .route('/')
    .get(requireAuth, async (req, res, next) => {
        try {
            const comments = await CommentsService.getCommentsByZip(req.app.get('db'), req.user.zip)
            if (!comments) {
                return res.status(404).send('No comments found')
            }
            res
                .status(200)
                .json(comments)
        }
        catch{next}
    })

commentsRouter
    .route('/:post_id') 
    .get(requireAuth, async (req, res, next) => {
        try {
            const comments = await CommentsService.getCommentsByPostId(
                req.app.get('db'), 
                req.params.post_id
            )
                if (comments.length === 0) {
                    return res.status(404).send('No comments found')
                }
                else { res
                        .status(200)
                        .json(comments)
        }}
        catch{next}
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
            let comment = await CommentsService.insertComment(req.app.get('db'), newComment)
            await CommentsService.incrementPostCommentsCount(
                req.app.get('db'), 
                req.params.post_id
            )
            const comments = await CommentsService.getCommentsByPostId(
                req.app.get('db'), 
                req.params.post_id
            )

                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `${comment.id}`))
                    .json(comments[0])
        }
        catch(error) {

        }
    })

commentsRouter
    .route('/comment/:comment_id')
    .delete(requireAuth, (req, res, next) => {
        CommentsService.getCommentById(req.app.get('db'), req.params.comment_id)
        .then(comment => {
            if(comment.length === 0) {
                return res.status(404).send('Comment not found')
            }
        })
        CommentsService.deleteComment(req.app.get('db'), req.params.comment_id)
            .then(comment => {
                res
                .status(204)
                .end()
            })
            .catch(next)
        })

module.exports = commentsRouter