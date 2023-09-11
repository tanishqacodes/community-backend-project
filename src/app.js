const express = require('express');
const dbConnection = require('./config/database');

// router
const authRouter = require('./routes/authRoutes');
const communityRouter = require('./routes/communityRoutes');
const roleRouter = require('./routes/roleRoutes');
const memberRouter = require('./routes/memberRoutes');

// middleware
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));


dbConnection.init()
    .then(function () {
        console.log("Database connected");

        app.listen(PORT, function () {
            console.log(`server on port ${PORT}`);
        });
    })
    .catch(function (err) {
        console.log(err);
    });

// routes
app.use('/v1/auth', authRouter);
app.use('/v1/community', communityRouter);
app.use('/v1/role', roleRouter);
app.use('/v1/member', memberRouter);


