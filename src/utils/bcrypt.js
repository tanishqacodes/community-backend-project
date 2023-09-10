const bcrypt = require('bcrypt');

module.exports.hashPassword = async (password)=>{
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password,salt);
};

// module.exports = hashPassword;