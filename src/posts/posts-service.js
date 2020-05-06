const PostsService = {
  getAllPosts(db) {
    return db
      .from('users')
      .innerJoin('posts', 'users.id', 'posts.user_id')
      .select('*');
  },

  getPostsByZip(db, zip) {
    return db
      .from('users as user')
      .where('user.zip', zip)
      .innerJoin('posts', 'posts.user_id', '=', 'user.id')
      .select('posts.id', 'user.name', 'user.user_name', 'user.zip', 'posts.user_id', 'posts.date_modified', 'posts.type', 'posts.title', 'posts.description', 'posts.comments', 'posts.resolved');
  },

  getById(db, id) {
    return db
      .from('posts as post')
      .select('*')
      .where('post.id', id)
      .first();
  },

  getByUserId(db, id) {
    return db
      .from('posts as post')
      .select('*')
      .where('post.user_id', id);
  },

  insertPost(db, newPost) {
    return db
      .insert(newPost)
      .into('posts')
      .returning('*')
      .then(rows => {
        return rows[0];
      });
  },

  editPost(db, id, title, description, resolved) {
    return db
      .from('posts')
      .where('id', id)
      .update({
        title,
        description,
        resolved
      })
      .returning('*')
      .then(rows => {
        return rows[0];
      });
  },

  deletePost(db, id) {
    return db
      .from('posts')
      .where({'id': id})
      .delete();
  },
};

module.exports = PostsService;