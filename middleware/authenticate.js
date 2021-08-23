//This will be send as a argument in a specific route as midddleware
module.exports = (req, res, next) => {
  if (!req.user) return res.status(401).send({ error: 'Login required' })
  next()
}
