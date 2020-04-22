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
            const comments = await CommentsService.getCommentsByZip(req.app.get('db'), 999)
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
                if (!comments) {
                    return res.status(404).send('No comments found')
                }
                res
                    .status(200)
                    .json(comments)
        }
        catch{next}
    })
    .post(requireAuth, jsonBodyParser, async (req, res, next) => {
        const { content } = req.body;
        const post_id = req.params.post_id
        const user_id = req.user.id
        const newComment = { user_id, post_id, content }
        if (content.length > 500) {
            return res
                .status(400)
                .send({error: {message: 'Comment must not exceed 500 characters'}})
        }
        try {
            const comment = await CommentsService.insertComment(req.app.get('db'), newComment)
            await CommentsService.incrementPostCommentsCount(
                req.app.get('db'), 
                req.params.post_id
            )
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `${comment.id}`))
                    .json(comment)
        }
        catch(error) {

        }
    })

commentsRouter
    .route('/comment/:comment_id')
    .delete(requireAuth, (req, res, next) => {
        CommentsService.deleteComment(req.app.get('db'), req.params.comment_id)
            .then(comment => {
                console.log(comment)
                if(!comment) {
                    return res.status(404).json({
                        error: {message: 'Comment does not exist'}
                    })
                }
                res
                .status(204)
                .end()
            })
            .catch(next)
        })

module.exports = commentsRouter