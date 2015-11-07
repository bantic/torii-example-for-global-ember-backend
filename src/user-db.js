var uuid = require('node-uuid');

function createSessionId() {
  return uuid.v4();
}

var USERS = {};

module.exports = {
  findById: function(id) {
    var found = false;
    Object.keys(USERS).forEach(function(email) {
      var user = USERS[email];

      if (user.id === id) {
        found = user;
      }
    });

    return found;
  },

  findOrCreateByEmail: function(email) {
    var user = USERS[email];

    if (!user) {
      USERS[email] = {
        id: createSessionId(),
        email: email
      };
    }

    return USERS[email];
  },

  removeId: function(sessionId) {
    var foundEmail;

    Object.keys(USERS).forEach(function(email) {
      var user = USERS[email];

      if (user.id === sessionId) {
        foundEmail = email;
      }
    });

    if (foundEmail) {
      delete USERS[foundEmail];
    }
  }
};
