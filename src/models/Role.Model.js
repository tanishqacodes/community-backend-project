const mongoose = require('mongoose');
const roleSchema = mongoose.Schema({
    id:{
        type:String,
        required:true,
    },
    name:{
        type:String,
        required:true,
        minlength:[2,'Minimum length is 2 characters ...'],
        unique:true,
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

module.exports = mongoose.model('Role',roleSchema);