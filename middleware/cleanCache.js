//This will be send as a argument in a specific route as midddleware
const {clearHash} = require('../services/cache');

module.exports = async (req, res, next) => {
    //await the end of query
    await next();
    //cleaning the concerned cache
    clearHash(req.user.id)
}