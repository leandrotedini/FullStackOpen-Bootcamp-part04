const jwt = require('jsonwebtoken')


const tokenExtractor = (request, response, next) => {

  const authorization = request.get('authorization')
  const token = (authorization && authorization.toLowerCase().startsWith('bearer '))
    ? authorization.substring(7)
    : null

  try {
    const decodedToken = jwt.verify(token, process.env.SECRET)
    request.userId = decodedToken.id

    next()
  }catch{
    return response.status(401).json({ error: 'token missing or invalid' })
  }

}

module.exports = tokenExtractor