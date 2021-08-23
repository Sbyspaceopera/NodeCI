//Export the values for the testing cookie session, taking an user from userFactory as argument

const Buffer = require('safe-buffer').Buffer
const Keygrip = require('keygrip');
// For using process.env (in this case in keys.js) in jest (who is external to node), config the test command launching jest with this "--setupFiles dotenv/config""
const {cookieKey} = require('../../config/keys')
const keygrip = new Keygrip([cookieKey])

module.exports = (user) => {
    const sessionObject = {
        passport:{
            user: user._id.toString()
        }
    }

    const session = Buffer.from(JSON.stringify(sessionObject)).toString('base64');
    const sig = keygrip.sign('express:sess=' + session)

    return {session, sig}
}