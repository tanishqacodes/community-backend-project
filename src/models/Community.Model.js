const mongoose = require('mongoose');

const communitySchema = mongoose.Schema({
    id:{
        type:String,
        required:true,
    },
    name:{
        type:String,
        required:true,
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