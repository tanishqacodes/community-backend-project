const Member = require('../models/Member.Model');
const Community = require('../models/Community.Model');
const User = require('../models/User.Model');
const Role = require('../models/Role.Model');

const { generateId } = require('../utils/snowflakes');

// const { getAccessToken, getUserbyToken } = require('../middleware/authentication');
const { verifyJWT } = require('../utils/jwt');

module.exports.addMember = async (req, res) => {
    var { community, user, role } = req.body;

    console.log(community, user, role);

    var token = req.headers.authorization?.split(' ')[1];
    // console.log(" access token : ",token);
    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'Unauthorized'
        });
    }
    // console.log("token : ",token);

    var data = verifyJWT(token);
    // console.log('data ; ',data);

    try {
        const communityData = await Community.findOne({ id: community });
        const userData = await User.findOne({ id: user });
        const roleData = await Role.findOne({ id: role });
        if (!communityData) {
            return res.status(400).json({
                success: false,
                error: 'community does not exits ',
            });
        }
        if (!roleData) {
            return res.status(400).json({
                success: false,
                error: 'role does not exits ',
            });
        }
        if (!userData) {
            return res.status(400).json({
                success: false,
                error: 'user does not exits ',
            });
        }

        if (communityData.owner !== data.id) {
            return res.status(400).json({
                success: false,
                error: 'NOT_ALLOWED_ACCESS',
            });
        }

        var id = generateId();
        let member = new Member({
            id: id,
            community: community,
            user: user,
            role: role,
        });

        let memberSaved = await member.save();
        if (!memberSaved) {
            return res.status(500).json({
                success: false,
                error: "internal server error, member not saved..."
            });
        }

        return res.status(200).json({
            status: true,
            content: {
                data: {
                    id: memberSaved.id,
                    community: memberSaved.community,
                    user: memberSaved.user,
                    role: memberSaved.role,
                    created_at: memberSaved.created_at
                }
            }
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            error: 'improper input',
        });
    }
}

module.exports.deleteMember = async (req, res) => {
    const deleteId = req.params;
    console.log(deleteId.id);

    const token = req.headers.authorization?.split(' ')[1];
    // console.log(" access token : ",token);
    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'Unauthorized'
        });
    }
    // console.log("token : ",token);

    var userData = verifyJWT(token);

    console.log("user data : ", userData);

    const memberData = await Member.findOne({ id: deleteId.id });
    console.log(memberData);

    const communityData = await Member.find({ community: memberData.community });
    console.log("community data : ", communityData);

    for (const element of communityData) {
        console.log(element.user, userData.id);
        if (element.user === userData.id) {
            const roleData = await Role.findOne({ id: element.role });
            if (!roleData) {
                res.status(400).json({
                    success: false,
                    error: 'role does not exits',
                });
            }
            console.log("role data : ",roleData);
            if(roleData.name === "Community Moderator"  || roleData.name === "Community Admin"){
                console.log("role name : ", roleData.name);

                const result = await Member.deleteOne({ id : memberData.id });
                // console.log("deleted :",result);
                if(result.deletedCount === 1){
                    res.status(200).json({
                        status: true,
                    });
                }
                res.status(500).json({
                    status: false,
                    error : 'internal server error ,  member not deleted.',
                });
            }
            res.status(400).json({
                success: false,
                error: 'NOT_ALLOWED_ACCESS',
            });
        }
    }

    res.status(400).json({
        success: false,
        error: 'improper input',
    });
}