const Community = require('../models/Community.Model');
const User = require('../models/User.Model');
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
        const skip = (page-1) * perPage;
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