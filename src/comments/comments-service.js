const CommentsService = {
    getAllComments(db) {
        return db
            .from('users')
            .innerJoin('comments', 'comments.user_id', '=', 'users.id')
            .select('*')
    },
    getCommentsByPostId(db, id) {
        return db
            .from('comments as comment')
            .where('comment.post_id', id)
            .select('*')
    },

    insertComment(db, newPost) {
        return db
            .insert(newPost)
            .into('comments')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },

    deleteComment(db, id) {
        return db
            .from('comments')
            .where({'id': id})
            .delete()
    },
}

module.exports = CommentsService