const config = require('config')
const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
    if (req.method === 'OPTIONS') {
        return next()
    }

    try {
        const token = req.headers.authorization.split(' ')[1] // "Bearer TOKEN"
        if (!token) {
            throw Error
        }

        const decoded = jwt.verify(token, config.get('jwtSecret'))
        req.user = decoded
        next()
    }   catch(err) {
        res.status(401).json({ message: "No authorization" })
    }
}