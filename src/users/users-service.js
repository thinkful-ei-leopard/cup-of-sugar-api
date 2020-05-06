const bcrypt = require('bcryptjs');

const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/;

const UsersService = {
  getAllUsersUsernames(db) {
    return db
      .from('users as user')
      .select('user_name');
  },

  getUsersByZip(db, zip) {
    return db 
      .from('users as user')
      .where('user.zip', zip)
      .select('id',
        'name',
        'user_name',
        'zip',
        'img_src',
        'img_alt');
  },

  getById(db, id) {
    return db
      .select('id',
        'name',
        'user_name',
        'zip',
        'img_src',
        'img_alt')
      .from('users as user')
      .where('user.id', id)
      .first();
  },

  insertUser(db, newUser) {
    return db
      .insert(newUser)
      .into('users')
      .returning('*')
      .then(rows => {
        return rows[0];
      });
  },

  hasUserWithUserName(db, user_name) {
    return db('users')
      .where({ user_name })
      .first()
      .then(user => !!user);
  },

  validatePassword(password) {
    if (password.length < 8) {
      return 'Password be longer than 8 characters';
    }
    if (password.length > 72) {
      return 'Password be less than 72 characters';
    }
    if (password.startsWith(' ') || password.endsWith(' ')) {
      return 'Password must not start or end with empty spaces';
    }
    if (!REGEX_UPPER_LOWER_NUMBER_SPECIAL.test(password)) {
      return 'Password must contain one upper case, lower case, number and special character';
    }
    return null;
  },

  hashPassword(password) {
    return bcrypt.hash(password, 12);
  },

  serializeUser(user) {
    return {
      id: user.id,
      name: user.name,
      username: user.username,
    };
  },
};

module.exports = UsersService;