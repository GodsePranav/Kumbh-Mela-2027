/**
 * Shared utility helpers
 */

const jwt = require('jsonwebtoken');

/** Generate a signed JWT token */
const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

/** Standard success response */
const sendSuccess = (res, data, message = 'Success', statusCode = 200) =>
  res.status(statusCode).json({ success: true, message, data });

/** Standard error response */
const sendError = (res, message = 'Error', statusCode = 400) =>
  res.status(statusCode).json({ success: false, message });

/** Pagination helper */
const paginate = (query, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return query.skip(skip).limit(limit);
};

module.exports = { generateToken, sendSuccess, sendError, paginate };
