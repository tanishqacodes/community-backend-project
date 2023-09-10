const mongoose = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require('bcrypt');
const { hashPassword } = require('../utils/bcrypt');

const userSchema = mongoose.Schema({
    id:{
        type:String,
        required:true,
    },
    name:{
        type:String,
        required : [true,'Please enter an name...'],
        minlength : [2,'Minimum name length is 2 character.. '],
    },
    email:{
        type:String,
        required:[true,'Please enter an email...'],
        unique:true,
        lowercase:true,
        validate : [isEmail,'Please enter valid email....'],
    },
    password:{
        type:String,
        required:true,
        minlength : [7,'Minimum password length is 6 character'],
    },
    created_at:{
        type:Date,
        default: new Date(),
    },
    updated_at:{
        type:Date,
        default: new Date(),
    },
});

userSchema.pre('save', async function(next){
    // this indicate the instance of the (user) created using User.create({email,password}) in auth controller
    // console.log("user about to created & saved and this represent local instace of it : ",this);

    // HASH PASSWORD
    this.password = await hashPassword(this.password);

    next();
    // next() => indicates the response 
});

userSchema.statics.login = async function(email,password){
    const user = await this.findOne({email : email});
    if(user){
        const auth = await bcrypt.compare(password,user.password);
        if(auth){
            return user;
        }
        throw Error('incorrect password');
    }
    throw Error('incorrect email');
}

userSchema.options.toJSON = {
    transform: function (doc, ret) {
        // Remove the circular reference and any unwanted properties
        delete ret.circularReference; // Replace with the actual circular reference field name
        delete ret.unwantedProperty; // Replace with any unwanted properties
    },
};

module.exports = mongoose.model('User',userSchema);