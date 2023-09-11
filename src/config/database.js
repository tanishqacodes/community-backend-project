const mongoose = require('mongoose');
const mongodb = require('mongodb');

module.exports.init = async function () {
    await mongoose.connect(
        "mongodb+srv://community-user:community-password@cluster0.utw07xz.mongodb.net/communityApp?retryWrites=true&w=majority"
    );
};


