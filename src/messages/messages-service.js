const MessagesService = {
    getAllMessages(db) {
        return db
            .from('messages')
            .select('*');
    },

    getByThread(db, thread_id) {
        return db
            .from('messages as message')
            .where('message.thread_id', thread_id)
            .select('*')
    },

    getById(db, id) {
        return db
            .from('messages as message')
            .select('*')
            .where('message.id', id)
            .first();
    },

    getByUserId(db, id) {
        return db
            .from('messages as message')
            .select('*')
            .where('message.user_id', id);
    },

    insertMessage(db, newMessage) {
        return db
            .insert(newMessage)
            .into('messages')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },

    deleteMessage(db, id) {
        return db
            .from('messages')
            .where({'id': id})
            .delete()
    },
}

module.exports = MessagesService