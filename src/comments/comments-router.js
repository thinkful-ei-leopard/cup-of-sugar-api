const express = require('express')
const CommentsService = require('./comments-service')
const { requireAuth } = require('../middleware/jwt-auth')
const path = require('path')

const commentsRouter = express.Router()
const jsonBodyParser = express.json()

commentsRouter
    .route('/')
    .get(async (req, res, next) => {
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
    .route('/post_id') 
    .get(requireAuth, async (req, res, next) => {
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
    .post(requireAuth, async (req, res, next) => {
        const { content } = req.body
        const post_id = req.params.post_id
        const user_name = req.user.name
        const user_userName = req.user.userName
        const newComment = { user_name, user_userName, post_id, content }
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
    .delete(requireAuth, async (req, res, next) => {
        try {
            await CommentsService.deleteComment(req.app.get('db'), req.params.comment_id)
                res
                    .status(204)
                    .end()
        }
        catch{next}
    })

module.exports = commentsRouter