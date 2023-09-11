const Community = require('../models/Community.Model');
const User = require('../models/User.Model');
const Member = require('../models/Member.Model');
const Role = require('../models/Role.Model');

const { generateUniqueSlug } = require('../utils/slug');
const { generateId } = require('../utils/snowflakes');
const { getAccessToken, getUserbyToken } = require('../middleware/authentication')


const handleErrors = (err) => {
    // console.log(err.message, err.code);
    let errors = { name: '' };
    if (err.message.includes('Community validation failed')) {
        Object.values(err.errors).forEach(({ properties }) => {
            // console.log(error.properties);
            errors[properties.path] = properties.message;
        });
    }
    return errors;
}

module.exports.create = async (req, res) => {
    var { name } = req.body;
    var token = getAccessToken(req, res);
    // console.log("token : ", token);
    var user = getUserbyToken(token);
    // console.log("user ; ", user);
    try {
        const checkIfCommunityExists = await Community.findOne({ name: name });
        if (checkIfCommunityExists) {
            return res.status(409).json({
                success: false,
                error: 'Community already exists'
            });
        }
        var id = generateId();
        var slug = await generateUniqueSlug(name);
        var owner = user.id;
        let community = new Community({
            id: id,
            name: name,
            slug: slug,
            owner: owner,
        });

        let communitySaved = await community.save();
        if (!communitySaved) {
            res.status(500).json({
                success: false,
                error: "internal server error, community not saved..."
            });
        }

        var memberId = generateId();
        var memberCommunity = id;
        var memberUser = user.id;
        // id of community admin
        var roleData = await Role.findOne({ name: "Community Admin" });
        var memberRole = roleData.id;
        let member = new Member({
            id: memberId,
            community: memberCommunity,
            user: memberUser,
            role: memberRole,
            created_at: new Date(),
        });

        let memberSaved = await member.save();

        if (!memberSaved) {
            res.status(500).json({
                success: false,
                error: "internal server error, community not saved..."
            });
        }

        res.status(200).json({
            status: true,
            content: {
                data: {
                    id: communitySaved.id,
                    name: communitySaved.name,
                    slug: communitySaved.slug,
                    owner: communitySaved.owner,
                    created_at: communitySaved.created_at,
                    updated_at: communitySaved.updated_at
                }
            }
        });

    } catch (error) {
        const errors = handleErrors(error);
        res.status(400).json({ errors });
    }
}

module.exports.getAllCommunity = async (req, res) => {
    try {
        const page = req.query.page || 1;
        const perPage = 10;
        const skip = (page - 1) * perPage;
        const total = await Community.countDocuments();

        if (!total) {
            return res.status(500).json({
                success: false,
                error: "Internal server error",
            });
        }

        const communities = await Community.find().skip(skip).limit(perPage);

        let output = [];
        for (const community of communities) {
            let result = {};
            result.id = community.id;
            result.name = community.name;
            result.slug = community.slug;
            let newData;
            const owner = await User.findOne({ id: community.owner });
            if (owner) {
                newData = {
                    name: owner.name,
                    email: owner.email,
                }
            }
            result.owner = newData;
            result.created_at = community.created_at;
            result.updated_at = community.updated_at;

            output.push(result);
        }

        res.status(200).json({
            success: true,
            content: {
                meta: {
                    total: total,
                    pages: Math.ceil(total / perPage),
                    page: page
                }
            },
            data: output
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: "Internal Server Error"
        });
    }
}

module.exports.myOwnedCommunity = async (req, res) => {
    var token = getAccessToken(req, res);
    // console.log("token : ", token);
    var user = getUserbyToken(token);
    // console.log("user ; ", user);

    try {
        const page = req.query.page || 1;
        const perPage = 10;
        const skip = (page - 1) * perPage;

        const myOwnedCommunities = [];
        const communities = await Community.find().skip(skip).limit(perPage);

        for (const community of communities) {
            if (community.owner === user.id) {
                myOwnedCommunities.push(community);
            }
        }

        console.log(myOwnedCommunities);

        const total = myOwnedCommunities.length;

        res.status(200).json({
            status: true,
            content: {
                meta: {
                    total: total,
                    pages: Math.ceil(total / perPage),
                    page: page
                },
                data: myOwnedCommunities
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: "Internal Server Error"
        });
    }
}

module.exports.getAllCommunityMembers = async (req, res) => {

    const communityId = req.params;
    // console.log(communityId.id);

    try {

        const page = req.query.page || 1;
        const perPage = 10;
        const skip = (page - 1) * perPage;
        const collection = await Member.find({ community: communityId.id }).skip(skip).limit(perPage);
        // console.log(collection);

        const communityMember = [];

        // const communities = await Community.find().skip(skip).limit(perPage);

        for (const ele of collection) {
            const result = {};
            result.id = ele.id;
            result.community = ele.community;

            // user
            const userData = await User.findOne({ id: ele.user });
            if (!userData) {
                res.status(500).json({
                    success: false,
                    error: "User does not exits anymore..."
                });
            }
            result.user = {
                id: userData.id,
                name: userData.name,
            }

            // role
            const roleData = await Role.findOne({ id: ele.role });
            if (!roleData) {
                res.status(500).json({
                    success: false,
                    error: "Role does not exits anymore..."
                });
            }
            result.role = {
                id: roleData.id,
                name: roleData.name
            }

            result.created_at = ele.created_at,

                communityMember.push(result);
        };

        // console.log(communityMember);
        const total = communityMember.length;

        res.status(200).json({
            status: true,
            content: {
                meta: {
                    total: total,
                    pages: Math.ceil(total / perPage),
                    page: page
                },
                data: communityMember
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: "Internal Server Error"
        });
    }
}


module.exports.myJoinedCommunity = async (req, res) => {
    var token = getAccessToken(req, res);
    // console.log("token : ", token);
    var userData = getUserbyToken(token);
    // console.log("user ; ", user);

    try {
        const page = req.query.page || 1;
        const perPage = 10;
        const skip = (page - 1) * perPage;

        const communities = await Member.find({ user: userData.id }).skip(skip).limit(perPage);
        // console.log("comunities : ",communities);

        const myJoinedCommunities = [];

        for (const data of communities) {
            // console.log("data : ",data);
            const result = {};
            const communityData = await Community.findOne({ id: data.community });

            if (!communityData) {
                res.status(400).json({
                    success: false,
                    error: "Community does not exists."
                });
            }

            // console.log(communityData);
            result.id = communityData.id;
            result.name = communityData.name;
            result.slug = communityData.slug;

            // user data
            const ownerData = await User.findOne({ id: communityData.owner });
            if (!ownerData) {
                res.status(400).json({
                    success: false,
                    error: "User does not exists."
                });
            }
            // console.log("owner data : ",ownerData);
            result.owner = {
                id: ownerData.id,
                name: ownerData.name,
            };

            result.created_at = communityData.created_at;
            result.updated_at = communityData.updated_at;

            myJoinedCommunities.push(result);
        }

        // console.log("my joined community : ",myJoinedCommunities);

        const total = myJoinedCommunities.length;

        res.status(200).json({
            status: true,
            content: {
                meta: {
                    total: total,
                    pages: Math.ceil(total / perPage),
                    page: page
                },
                data: myJoinedCommunities
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: "Internal Server Error"
        });
    }

}