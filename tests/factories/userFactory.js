//Create a real user in the db on testing purposes
const mongoose = require('mongoose')
const User = mongoose.model('User')

module.exports = () => {
    return new User({
        
    }).save();
}