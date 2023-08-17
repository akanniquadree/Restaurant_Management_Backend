const { validationResult } = require ('express-validator');
const { check } = require ('express-validator');
const jwt = require ('jsonwebtoken');
const dotenv = require ("dotenv")
const UserModel = require ('../Model/UserModel');
const BlackList = require ('../Model/BlackList');

dotenv.config


const signUpValidation = (req, res, next) =>{
    check('email')
    .isEmail()
    .withMessage('Enter a valid email address')
    .normalizeEmail(),
  check('first_name')
    .not()
    .isEmpty()
    .withMessage('You first name is required')
    .trim()
    .escape(),
  check('last_name')
    .not()
    .isEmpty()
    .withMessage('You last name is required')
    .trim()
    .escape(),
  check('password')
    .notEmpty()
    .isLength({ min: 8 })
    .withMessage('Must be at least 8 chars long')
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      let error = {};
      errors.array().map((err) => (error[err.param] = err.msg));
      return res.status(422).json({ error });
    }
    next();

}
const LoginValidation = (req, res, next) =>{
    check('email')
    .isEmail()
    .withMessage('Enter a valid email address')
    .normalizeEmail(),
  check('password').not().isEmpty()
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      let error = {};
      errors.array().map((err) => (error[err.param] = err.msg));
      return res.status(422).json({ error });
    }
    next();

}


const Verify = async(req, res, next) =>{
    const Authorization = req.headers["cookie"]
    if(!Authorization) return res.status(401).json({error:"You are not Authorized"})
    const cookie = Authorization.split("=")[1];
    const BlackListedToken = await BlackList.findOne({token:cookie})
    if(BlackListedToken){
        return res.status(401).json({ message: 'This session has expired. Please re-login' });
    }
    jwt.verify(cookie, process.env.JWT_HEADER,async(err, payload)=>{
        if(err){
            return res.status(403).json({error:"User Authentication Forbiddden, Please Re-login"})
        }
        const {id} = payload
        const user = await UserModel.findById(id)
        const {password, ...others} = user.doc
        req.user = others
        next()
    })
}

const VerifyRole = (req, res, next) =>{
    try {
      const user = req.user; // we have access to the user object = require the request
      const { role } = user; // extract the user role
      // check if user has no advance privileges
      // return an unathorized response
      if (role !== '0A10') {
        return res.status(401).json({
          status: 'failed',
          error: 'You are not authorized to view this.',
        });
      }
      next(); // continue to the next middleware or function
    } catch (err) {
      res.status(500).json({
        status: 'error',
        code: 500,
        data: [],
        error: 'Internal Server Error',
      });
    }
  }


  module.exports = {Verify, VerifyRole, LoginValidation, signUpValidation}