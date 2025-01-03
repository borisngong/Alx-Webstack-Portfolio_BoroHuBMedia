const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Member = require("../coreModels/memberSchema");
const { BDERROR } = require("../middlewares/handleErrors");
const {
  sendSuccessResponse,
  sendErrorResponse,
} = require("../coreUtils/_bd_responseHandlers");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../coreUtils/tokenUtils");

/**
 * UserController class to manage user-related operations
 */
class UserController {
  /**
   * initializeAccount - Responsible for initializing a new user account
   * @param {Object} req - representsrequest object
   * @param {Object} res - respresents the response object
   * @param {Function} next - represents next middleware function
   */
  static async initializeAccount(req, res, next) {
    try {
      const { hashedPassword, emailAddress, handle, fullName, aboutMe, role } =
        req.body;

      // Validate input fields
      if (!hashedPassword || !emailAddress || !handle || !fullName) {
        throw new BDERROR("All fields must be filled out", 400);
      }

      // Check for existing user with the same email or handle
      const existingUser = await Member.findOne({
        $or: [{ emailAddress }, { handle }],
      });
      if (existingUser) {
        throw new BDERROR("Email or handle is already taken", 400);
      }

      // Hash the plain password using bcrypt
      const bcryptHashedPassword = await bcrypt.hash(hashedPassword, 10);

      // Create a new user
      const newUser = new Member({
        fullName,
        handle,
        emailAddress,
        hashedPassword: bcryptHashedPassword,
        aboutMe,
        role,
      });

      const savedUser = await newUser.save();

      // Send back the user info without the hashed password
      const { hashedPassword: _, ...userData } = savedUser.toObject();
      sendSuccessResponse(res, userData, 201);
    } catch (error) {
      sendErrorResponse(res, error, error.statusCode || 500);
    }
  }

  /**
   * accessAccount - Responsible authenticating a user and returns access and refresh tokens
   * @param {Object} req - Represents the request object.
   * @param {Object} res - Represnts the response object.
   */
  static async accessAccount(req, res) {
    const { emailAddress, handle, hashedPassword } = req.body;

    try {
      const member = await Member.findOne({
        $or: [{ emailAddress }, { handle }],
      });

      if (!member) {
        return sendErrorResponse(
          res,
          new BDERROR("Registered member not found", 404)
        );
      }

      const pwMatch = await bcrypt.compare(
        hashedPassword,
        member.hashedPassword
      );
      if (!pwMatch) {
        return sendErrorResponse(
          res,
          new BDERROR("Input details incorrect", 401)
        );
      }

      const accessToken = generateAccessToken(member);
      const refreshToken = generateRefreshToken(member);

      // Set the access token in an HttpOnly cookie
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "None",
        maxAge: 1 * 60 * 60 * 1000, // 1 hour
      });

      // Set refresh token in a cookie
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "None",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Return all member details except the hashed password
      const { hashedPassword: _, ...memberData } = member.toObject();
      sendSuccessResponse(
        res,
        {
          message: "Member accessed account successfully",
          member: memberData,
        },
        200
      );
    } catch (error) {
      sendErrorResponse(res, error);
    }
  }

  /**
   * endSession - Ends the user session by clearing cookies.
   * @param {Object} req - represnts request object.
   * @param {Object} res - reoresnts response object.
   * @param {Function} next -  Responsible for calling the next middleware function
   */
  static async endSession(req, res, next) {
    try {
      // Clear the access token and refresh token cookies
      res.clearCookie("accessToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "None",
      });
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "None",
      });

      sendSuccessResponse(
        res,
        { message: "Member session ended successfully" },
        200
      );
    } catch (error) {
      sendErrorResponse(res, error, error.statusCode || 500);
    }
  }

  /**
   * getUserSession - Retrieves the current user's session information.
   * @param {Object} req - represnts the request object
   * @param {Object} res - respresents the response object
   * @param {Function} next - responsible for calling the next middleware function
   */
  static async getUserSession(req, res, next) {
    const token = req.cookies.accessToken; // Access the token from cookies

    // Check if the token exists
    if (!token) {
      return sendErrorResponse(res, new BDERROR("No token provided", 401));
    }

    // Verify the token
    jwt.verify(token, process.env.SKEY_JWT, async (err, data) => {
      if (err) {
        return sendErrorResponse(res, new BDERROR("Invalid token", 401));
      }

      try {
        const id = data.id; // Use the correct field from the token data
        const member = await Member.findOne({ _id: id });

        if (!member) {
          return sendErrorResponse(res, new BDERROR("Member not found", 404));
        }

        // Send the member data as a response, excluding the hashed password
        const { hashedPassword: _, ...memberData } = member.toObject();
        sendSuccessResponse(res, memberData, 200);
      } catch (error) {
        sendErrorResponse(res, error, error.statusCode || 500);
      }
    });
  }
}

module.exports = UserController;
