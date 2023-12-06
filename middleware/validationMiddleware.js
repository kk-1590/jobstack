import { body, param, validationResult } from "express-validator";
import { BadRequestError, NotFoundError, UnauthorizedError } from "../errors/customErrors.js";
import { JOB_STATUS, JOB_TYPE } from "../utils/constants.js";
import mongoose from "mongoose";
import Job from "../models/JobModel.js";
import User from "../models/UserModel.js";
// import {User} from '../'

const withValidationErrors = (validateValues) => {
  return [
    validateValues,
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorMessages = errors.array().map((error) => error.msg);
        // return res.status(400).json({ errors: errorMessages });
        if(errorMessages[0].startsWith('no job')){
            throw new NotFoundError(errorMessages);
        }
        if(errorMessages[0].startsWith('not authorized to access')){
            throw new UnauthorizedError('not authorized to access');
        }
        throw new BadRequestError(errorMessages);
      }
      console.log(errors.isEmpty());

      next();
    },
  ];
};

// export const validateTest = withValidationErrors([
//     body("name")
//       .notEmpty()
//       .withMessage("name is required")
//       .isLength({ min: 5 })
//       .withMessage('name must be at least 50 characters')
// ])

export const validateJobInput = withValidationErrors([
  body("company")
    .notEmpty()
    .withMessage("company is required")
    .isLength({ min: 3 })
    .withMessage("company name too short"),
  body("position").notEmpty().withMessage("position is required"),
  body("jobLocation").notEmpty().withMessage("job location is required"),

  body("jobStatus")
    .isIn(Object.values(JOB_STATUS))
    .withMessage("invalid status value"),
  body("jobType")
    .isIn(Object.values(JOB_TYPE))
    .withMessage("invalid type value"),
]);

export const validateIdParam = withValidationErrors([
  param("id").custom(async (value, {req}) => {
    const isValidId = mongoose.Types.ObjectId.isValid(value);
    if (!isValidId) {
      throw new BadRequestError("invalid MongoDB id");
    }

    const job = await Job.findById(value);
    if(!job){
        throw new NotFoundError(`no job with id ${value}`);
    }

    // console.log(job);

    const isAdmin = req.user.role === 'admin'
    const isOwner = req.user.userId === job.createdBy.toString()

    if(!isAdmin && !isOwner){
        throw new UnauthorizedError('not authorized to access')
    }


  }),
  // .withMessage("invalid MongoDB id"),
]);

// .withMessage will not work with async functions

export const validateRegisterInput = withValidationErrors([    
    body('name').notEmpty().withMessage('name is required'),
    body('email').notEmpty().withMessage('name is required').isEmail().withMessage('invalid email format')
    .custom(async (email) => {
        const user = await User.findOne({email});
        if(user){
            throw new BadRequestError('email already exists');
        }
    } ),
    body('password').notEmpty().withMessage('name is required').isLength({min : 8}).withMessage('password must be at least 8 characters long'),
    body('location').notEmpty().withMessage('location is required'),
    body('lastName').notEmpty().withMessage('lastName is required'),
])




export const validateLoginInput = withValidationErrors([    
    body('email').notEmpty().withMessage('email is required').isEmail().withMessage('invalid email format'),
    body('password').notEmpty().withMessage('password is required').isLength({min : 8}).withMessage('password must be at least 8 characters long'),
])


export const validateUserInput = withValidationErrors([
    body('name').notEmpty().withMessage('name is required'),
    body('email').notEmpty().withMessage('name is required').isEmail().withMessage('invalid email format')
    .custom(async (email) => {
        const user = await User.findOne({email});
        if(user && user._id.toString() !== req.user.userId ){
            throw new BadRequestError('email already exists');
        }
    } ),
    body('location').notEmpty().withMessage('location is required'),
    body('lastName').notEmpty().withMessage('lastName is required'),
])