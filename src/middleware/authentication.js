const jwt = require('jsonwebtoken');
const { verifyJWT } = require('../utils/jwt');

module.exports.verifyJWTMiddleware = (req,res,next)=>{
    const token =  req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ 
            success: false, 
            error: 'Unauthorized' 
        });
    }

    const user = verifyJWT(token);

    if(!user){
        return res.status(401).json({ 
            success: false, 
            error: 'Unauthorized' 
        });
    }
    next();
}

module.exports.getAccessToken = (req,res)=>{
    const token = req.headers.authorization?.split(' ')[1];
    console.log(" access token : ",token);
    if (!token) {
        return res.status(401).json({ 
            success: false, 
            error: 'Unauthorized' 
        });
    }
    return token;

}

module.exports.getUserbyToken = (token)=>{
        // console.log("token in get user : ",token);
    const decoded = verifyJWT(token);
    return decoded;
}