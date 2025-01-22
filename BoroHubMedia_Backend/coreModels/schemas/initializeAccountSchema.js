const Joi = require('joi');

/**
 * Schema for initializing an account
 */
const initializeAccountSchema = Joi.object({
  fullName: Joi.string().required().trim(),
  handle: Joi.string().required().trim(),
  emailAddress: Joi.string()
    .required()
    .email({ tlds: { allow: false } })
    .lowercase()
    .trim(),
  plainPassword: Joi.string().required(),
  role: Joi.string().optional().valid('member', 'admin').default('member'),
  aboutMe: Joi.string().optional().trim().max(500),
  location: Joi.string().optional().trim(),
  Hobby: Joi.string().optional().trim(),
  avatar: Joi.string().optional().default(''),
  coverImage: Joi.string().optional().default(''),
});

module.exports = { initializeAccountSchema };
