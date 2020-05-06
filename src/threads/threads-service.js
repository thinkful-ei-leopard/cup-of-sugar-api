const ThreadsService = {
  getAllThreads(db) {
    return db
      .from('threads')
      .select('*');
  },

  getById(db, id) {
    return db
      .from('threads as thread')
      .select('*')
      .where('thread.id', id)
      .first();
  },

  getByUserId1(db, id) {
    return db
      .from('threads as thread')
      .select('*')
      .where('thread.user_id1', id);
  },

  getByUserId2(db, id) {
    return db
      .from('threads as thread')
      .select('*')
      .where('thread.user_id2', id);
  },

  insertThread(db, newThread) {
    return db
      .insert(newThread)
      .into('threads')
      .returning('*')
      .then(rows => {
        return rows[0];
      });
  },

  deleteThread(db, id) {
    return db
      .from('threads')
      .where({'id': id})
      .delete();
  },
};

module.exports = ThreadsService;