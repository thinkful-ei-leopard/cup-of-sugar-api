const CommentsService = {
    getCommentById(db, id) {
        return db
        .from('comments')
        .where('comments.id', id)
        .select('*')
    },
    getAllComments(db) {
        return db
            .from('users')
            .innerJoin('comments', 'comments.user_id', '=', 'users.id')
            .select('*')
    },
    getCommentsByZip(db, zip) {
        return db
            .from('users as user')
            .where('user.zip', zip)
            .innerJoin('comments', 'comments.user_id', '=', 'user.id')
            .select("comments.id", "user.name", "user.user_name", "user.zip", "comments.user_id", "comments.post_id", "comments.date_modified", "comments.content")
    },
    getCommentsByPostId(db, id) {
        return db
            .from('users')
            .innerJoin('comments', 'comments.user_id', '=', 'users.id')
            .where('comments.post_id', id)
            .select("comments.id", "users.name", "users.user_name", "users.zip", "comments.user_id", "comments.post_id", "comments.date_modified", "comments.content")
    },

    insertComment(db, newComment) {
        return db
            .insert(newComment)
            .into('comments')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },

    incrementPostCommentsCount(db, postId) {
        return db
            .from('posts')
            .where('id', postId)
            .increment('comments', 1)
    },

    deleteComment(db, id) {
        return db
            .from('comments')
            .where({'id': id})
            .delete()
    },
}

module.exports = CommentsService