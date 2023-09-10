const { Snowflake }  = require("@theinternetfolks/snowflake");

module.exports.generateId = ()=>{
    return Snowflake.generate().toString();
}