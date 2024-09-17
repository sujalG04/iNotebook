const jwt = require('jsonwebtoken');//npm i jsonwebtoken ; it is used to return token 
const JWT_SECRET = "topsecret";
const fetchuser = (req, res, next) => {
    // get the user from the jwt token and add id to req object
    const token = req.header('auth-token');
    if (!token) {
        res.status(401).send({ error: "please authenticate using valid token" });

    }
    try {
        const data = jwt.verify(token, JWT_SECRET);
        req.user = data.user;
        next();
    } catch (error) {
        res.status(401).send({ error: "please authenticate using valid token 2" });
    }
};
module.exports = fetchuser;