const express = require('express')
const CommentsService = require('./comments-service')
const { requireAuth } = require('../middleware/jwt-auth')
const path = require('path')

const commentsRouter = express.Router()
const jsonBodyParser = express.json()

commentsRouter
    .route('/post_id') 
    .get(async (req, res, next) => {
        try {
            const comments = await CommentsService.getCommentsByPostId(req.app.get('db'), req.params.post_id)
                if (!comments) {
                    return res.status(404).send('No comments found')
                }
                res
                    .status(200)
                    .json(comments)
        }
        catch{next}
    })
    .post(async (req, res, next) => {
        const { content } = req.body
        let post_id = req.params.post_id
        let newComment = { post_id, content }
        if (content.length > 500) {
            return res
                .status(400)
                .send({error: {message: 'Comment must not exceed 500 characters'}})
        }
        try {
            const comment = await CommentsService.insertComment(req.app.get('db'), newComment)
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `${comment.id}`))
                    .json(comment)
        }
        catch{next}
    })

commentsRouter
    .route('/comment/comment_id')
    .delete(async (req, res, next) => {
        try {
            await CommentsService.deleteComment(req.app.get('db'), req.params.comment_id)
                res
                    .status(204)
                    .end()
        }
        catch{next}
    })