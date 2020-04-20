const CommentsService = {
    getCommentsByPostId(db, id) {
        return db
            .from('comments as comment')
            .where('comment.post_id', id)
            .select('*')
    } 
}