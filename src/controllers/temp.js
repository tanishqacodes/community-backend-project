const communitiesCollection = require('../models/Community.Model');
const usersCollection = require('../models/User.Model');

module.exports.temp = async (req, res) => {
        const pageSize = 10;
        const page = 1;
        const skip = (page - 1) * pageSize;
        const total = await communitiesCollection.countDocuments();

        const communities = await communitiesCollection.find().skip(skip).limit(pageSize);

        // console.log("communities : ",communities);
        // Use a for loop to populate the "owner" field
        let output = [];
        for (const community of communities) {
            let result = {};
            result.id = community.id;
            result.name = community.name;
            result.slug = community.slug;
            let newData;
            const owner = await usersCollection.findOne({ id: community.owner });
            if (owner) {
                newData = {
                    name : owner.name,
                    email : owner.email,
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
                    total,
                    page,
                    pages: Math.ceil(total / pageSize)
                }
            },
            data: output
        });
    
}
