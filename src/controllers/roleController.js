const Role = require('../models/Role.Model');
const { generateId } = require('../utils/snowflakes');

const handleErrors = (err) => {
    // console.log(err.message, err.code);
    let errors = { name: '' };
    if (err.message.includes('Role validation failed')) {
        Object.values(err.errors).forEach(({ properties }) => {
            // console.log(error.properties);
            errors[properties.path] = properties.message;
        });
    }
    return errors;
}

module.exports.create = async (req, res) => {
    var { name } = req.body;
    try {
        const ifRoleExists = await Role.findOne({ name: name });
        if (ifRoleExists) {
            return res.status(409).json({
                success: false,
                error: 'Role already exists ',
            });
        }

        var id = generateId();
        let role = new Role({
            id: id,
            name: name,
        });

        let roleSaved = await role.save();
        console.log(roleSaved);
        if (!roleSaved) {
            return res.status(500).json({
                success: false,
                error: ' Internal Server error ,role not saved...',
            });
        }
        res.status(200).json({
            status: true,
            content: {
                data: {
                    id: roleSaved.id,
                    name: roleSaved.name,
                    created_at: roleSaved.created_at,
                    updated_at: roleSaved.updated_at
                }
            }
        });
    } catch (error) {
        const errors = handleErrors(error);
        return res.status(400).json({ errors });
    }

}


module.exports.getAllRole = async (req,res)=>{
    const page = req.query.page || 1;
    const perPage = 10;
    const skip = (page-1) * perPage;
    const total = await Role.countDocuments();

    if (!total) {
        return res.status(500).json({
            success: false,
            error: "Internal server error",
        });
    }

    const roles = await Role.find().skip(skip).limit(perPage);

    res.status(200).json({
        success: true,
        content: {
            meta: {
                total: total,
                pages: Math.ceil(total / perPage),
                page: page
            }
        },
        data: roles
    });
}