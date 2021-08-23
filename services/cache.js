//Here is the "monkey patching" of mongoose. (Adding a new method to an existing class)
//We added the redis logic for caching in the Query.prototype.exec()
// We decide if a query need to be cached with the Query.prototype.cache() new function
//'this' refere to the query in this cas, dont use arrow function
const mongoose = require('mongoose')
const redis = require('redis')
const util = require('util')

const redisUrl = process.env.REDIS_PORT
const client = redis.createClient(redisUrl)
client.hget = util.promisify(client.hget)
const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function(options = {}) {
    this.useCache = true
    this.hashKey = JSON.stringify(options.key || '')
    return this
}

mongoose.Query.prototype.exec = async function() {
    if(!this.useCache){
        return await exec.apply(this, arguments)
    }

    const key =JSON.stringify({
        ...this.getQuery(),
        collection: this.mongooseCollection.name,
    }) 

    //See if we have a value for 'key' in redis 
    const cacheValue = await client.hget(this.hashKey, key);

    // If we do, return that
    if(cacheValue){
        const doc = JSON.parse(cacheValue)

        Array.isArray(doc)
            ? doc.map(d => new this.model(d))
            : new this.model(doc)
    }

    // Otherwise, issue the query and store the result in redis
    const result = await exec.apply(this, arguments);

    client.hset(this.hashKey, key, JSON.stringify(result), 'EX', 10)

    return result
}

//'clearHash' will be export in middlewares
//using at the end for clearing some specific cache
module.exports = {
    clearHash(hashKey){
        client.del(JSON.stringify(hashKey))
    }
}