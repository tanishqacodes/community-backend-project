const mongoose = require('mongoose');
const User = require('./User.Model');

const communitySchema = mongoose.Schema({
    id:{
        type:String,
        required:true,
    },
    name:{
        type:String,
        required:[true,"Please enter name of community"],
        minlength:[2,'Minimum name length is 2 character.. '],
    },
    slug:{
        type:String,
        required:true,
        unique:true,
    },
    owner:{
        type:String,
        required:true,
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

module.exports = mongoose.model("Community",communitySchema);
