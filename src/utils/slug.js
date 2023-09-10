const Community = require('../models/Community.Model');

function generateSlug(name){
    return name
        .toLowerCase() 
        .replace(/\s+/g, '-') 
        .replace(/[^a-z0-9-]/g, ''); 
}
async function generateUniqueSlug(name){
    const tempslug = generateSlug(name);
    let slug = tempslug;
    let count = 1;
    // const communites = db.collection('communities');
    while (true) {
        const existingCommunity = await Community.findOne({ tempslug });
        if (!existingCommunity) {
            return tempslug;
        }
        slug = `${tempslug}-${count}`;
        count++;
    }
}

module.exports = {
    generateUniqueSlug,
};