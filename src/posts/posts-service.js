const PostsService = {
    getAllPosts(db) {
        return db
            .from('posts')
            .select('*');
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
                return rows[0]
            })
    },

    deletePost(db, id) {
        return db
            .from('posts')
            .where({'id': id})
            .delete()
    },
};

module.exports = PostsService;