const bcrypt = require("bcrypt");

function comparePassword(password, hashPassword) {
    return bcrypt.compareSync(password, hashPassword);
}

module.exports = comparePassword;