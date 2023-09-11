const User = require('../models/User.Model');
const { generateId } = require('../utils/snowflakes');
const { generateJWT } = require('../utils/jwt');
const { getAccessToken , getUserbyToken } = require('../middleware/authentication');

const handleErrors = (err) => {
    // console.log(err.message, err.code);
    let errors = { email: '', password: '' ,name: ''};
    if (err.message === 'incorrect email') {
        errors.email = 'This email is not registered , Please check the email ...';
    }
    if (err.message === 'incorrect password') {
        errors.password = 'Password is incorrect , Please try another password ...';
    }
    if (err.code === 11000) {
        errors.email = 'Email is already registered !!!';
        return errors;
    }
    if (err.message.includes('User validation failed')) {
        Object.values(err.errors).forEach(({ properties }) => {
            // console.log(error.properties);
            errors[properties.path] = properties.message;
        });
    }
    return errors;
}

module.exports.signup = async (req, res) => {
    var { name, email, password } = req.body;
    console.log("SignUp : ");
    console.log("Name : ", name);
    console.log("Email : ", email);
    console.log("Password : ", password);
    try {
        let ifUserFounded = await User.findOne({ email: email });
        if (ifUserFounded) {
            return res.status(409).json({
                success: false,
                error: 'User already exists',
            });
        }   
        let id = generateId();

        const user =  await User.create({id, name , email , password});

        const access_token = generateJWT(user);

        if (user) {
            return res.status(201).json({
                status: true,
                content: {
                    data: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        created_at: user.created_at
                    },
                    meta: {
                        access_token,
                    }
                }
            });
        }
        return res.status(500).json({
            success: false,
            error: "Something went wrong , user is not saved..",
        });
    } catch (error) {
        console.log("signup : ",error);
        const errors = handleErrors(error);
        res.status(400).json({ errors });
    }
}


module.exports.signin = async (req, res) => {
    var { email, password } = req.body;
    try {
        const checkIfUserExists = await User.findOne({ email: email });
        if (!checkIfUserExists) {
            return res.status(400).json({
                success: false,
                error: 'User does not exits ..',
            });
        }
        const user = await User.login(email, password);
        const access_token = generateJWT(user);
        return res.status(200).json({
            status: true,
            content: {
                data: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    created_at: user.created_at
                },
                meta: {
                    access_token: access_token,
                }
            }
        });
    } catch (error) {
        const errors = handleErrors(error);
        res.status(400).json({ errors });
    }
}

module.exports.me = async(req,res)=>{

    const token = getAccessToken(req,res);
    // console.log("access_token : ",token);

    const userData = getUserbyToken(token);
    // console.log("user data : ",userData);
    if(userData){
        return res.status(200).json({
            status:true,
            content:{
                data:{
                    id:userData.id,
                    name:userData.name,
                    email:userData.email,
                    created_at:userData.created_at,
                }
            }
        });
    }
    return res.status(400).json({ 
        success: false, 
        error: 'User token expried or Invalid' 
    });
}
// module.exports = signup;