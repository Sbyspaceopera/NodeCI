//Setup the mongodb connection through mongoose (cause the testing environnement is different from the server)
require('../models/User')
const {mongoURI} = require('../config/keys')


const mongoose = require('mongoose')

mongoose.Promise = global.Promise
mongoose.connect(mongoURI, {useNewUrlParser: true, useUnifiedTopology: true})