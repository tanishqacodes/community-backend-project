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
app.use(express.urlencoded({extended : false}));

// server
app.listen(PORT,()=>{
    console.log(`listening at port :- ${PORT}`);
});
// database connection
dbConnection(()=>{
    if(err){
        console.log("Error in creating connection with database ....");
    }
});

// routes
app.use('/v1/auth',authRouter);
app.use('/v1/community',communityRouter);
app.use('/v1/role',roleRouter);
app.use('/v1/member',memberRouter);


