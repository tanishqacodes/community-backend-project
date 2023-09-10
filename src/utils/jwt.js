const { JWT_SECRET } = require('../config/secret');
const User = require('../models/User.Model');
const jwt = require('jsonwebtoken');
const maxAge = 3 * 24 * 60 * 60;

module.exports.generateJWT = (user)=>{
    console.log("secret : ",JWT_SECRET);
    return jwt.sign({
        id:user.id,
        name:user.name,
        email:user.email,
        created_at:user.created_at,
    },
    JWT_SECRET,
    {
        expiresIn:maxAge,
    }
    );
}

module.exports.verifyJWT = (token)=>{
    try{
        const user = jwt.verify(token,JWT_SECRET);
        console.log("verify token : ",user);
        return user;
    }
    catch(error){
        return null;
    }
}


// module.exports = generateJWT , verifyJWT;