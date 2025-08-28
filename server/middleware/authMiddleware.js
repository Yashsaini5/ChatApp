const jwt = require("jsonwebtoken")
const key = process.env.SECRET_KEY

const authMiddleware = (req, res, next) => {
    const token = req.cookies.token

    if(!token) {
        return res.status(401).json({ message: "No token, authorization denied"})
    }

    try{
        const decode = jwt.verify(token, key)
        req.user = decode;
        next();
    } catch (err){
    res.status(403).json({message: "invalid token"})
    }
}

module.exports = {authMiddleware}