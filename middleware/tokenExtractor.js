const jwt = require('jsonwebtoken')


const tokenExtractor = (request, response, next) => {

  const authorization = request.get('authorization')
  const token = (authorization && authorization.toLowerCase().startsWith('bearer '))
    ? authorization.substring(7)
    : null

  const decodedToken = jwt.verify(token, process.env.SECRET)
  if (!token || !decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  request.userId = decodedToken.id

  next()
}

module.exports = tokenExtractor