const mongoose = require('mongoose');

module.exports = (cb) => {
    mongoose.connect('mongodb://0.0.0.0:27017/community-app').then(() => {
        console.log("Database Connected...");
        return;
    }).catch((err) => {
        return cb(err);
    });
}

