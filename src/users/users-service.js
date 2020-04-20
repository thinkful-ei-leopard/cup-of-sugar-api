const UsersService = {
    getAllUsers(db) {
        return db
            .from('users as user')
            .select('*');
    },

    getById(db, id) {
        return db
            .select('name')
            .from('users as user')
            .where('user.id', id);
    },

    insertUser(db, newUser) {
        return db
            .insert(newUser)
            .into('users')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },

    hasUserWithUserName(db, username) {
        return db('user')
          .where({ username })
          .first()
          .then(user => !!user)
      },

    validatePassword(password) {
        if (password.length < 8) {
          return 'Password be longer than 8 characters'
        }
        if (password.length > 72) {
          return 'Password be less than 72 characters'
        }
        if (password.startsWith(' ') || password.endsWith(' ')) {
          return 'Password must not start or end with empty spaces'
        }
        if (!REGEX_UPPER_LOWER_NUMBER_SPECIAL.test(password)) {
          return 'Password must contain one upper case, lower case, number and special character'
        }
        return null
      },

      hashPassword(password) {
        return bcrypt.hash(password, 12)
      },

      serializeUser(user) {
        return {
          id: user.id,
          name: user.name,
          username: user.username,
        }
      },
};

module.exports = UsersService;