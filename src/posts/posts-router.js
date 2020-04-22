const express = require('express');
const PostsService = require('./posts-service');
const { requireAuth } = require('../middleware/jwt-auth');
const path = require('path');

const postsRouter = express.Router();
const jsonBodyParser = express.json();

postsRouter
  .route('/')
  .get(requireAuth, async (req, res, next) => {
    const posts = await PostsService.getPostsByZip(req.app.get('db'), req.user.zip);
    if (!posts) {
      res.status(404).send({ error: { message: 'No posts found' } });
    }
    res.status(200).json(posts);
  })
  .post(requireAuth, jsonBodyParser, async (req, res, next) => {
    const { type, title, description } = req.body;
    const user_id = req.user.id;
    const newPost = {
      user_id,
      type,
      title,
      description,
    };
    if (!type) {
      return res.status(400).json({ error: { message: 'Type required' } });
    }
    if (!title) {
      return res.status(400).json({ error: { message: 'Title required' } });
    }
    if (!description) {
      return res
        .status(400)
        .json({ error: { message: 'Description required' } });
    }
    if (description.length > 500) {
      return res
        .status(400)
        .json({
          error: { message: 'Description must not exceed 500 characters' },
        });
    }
    if (title.length > 60) {
      return res
        .status(400)
        .json({ error: { message: 'Title must not exceed 60 characters' } });
    }
    try {
      const post = await PostsService.insertPost(
        req.app.get('db'), 
        newPost
      );
      res
        .status(201)
        .location(path.posix.join(req.originalUrl, `${post.id}`))
        .json(post);
    } catch (error) {
      next;
    }
  });

postsRouter.route('/:post_id').delete(requireAuth, async (req, res, next) => {
  try {
    const post = await PostsService.deletePost(
      req.app.get('db'),
      req.params.post_id
    );
    if (!post) {
      return res.status(404).json({
        error: { message: 'Post does not exist' },
      });
    }
    res.status(204).end();
  } catch {
    next;
  }
});

module.exports = postsRouter;
