# BoroHubMedia Social Media REST API

A backend REST API for a social media platforms with basic CRUD operations for members, posts and comments.

## Introduction

BoroHubMedia is a backend REST API for a social media platforms. It is built using Node. js, Express, and MongoDB and has endpoints for users, members, and content posts. The API provides user Authentication, User management, Post and comments, likes\dislike functionality with very solid error checking and response utilities

## Features

### User Management

- Initialize user account to create a new user account
- Access user account to log in
- End user session to log out
- Get user session information to retrieve the current user session

### Member Management

- Delete member with admin privileges
- Get member details
- Update member details
- Follow a member
- Unfollow a member
- Get followers list
- Restrict a user
- Unrestrict a user
- Get blocking list
- Search user by member ID
- Update member profile picture
- Update member cover picture

### Content Post Management

- Create posts with or without media
- Update posts
- Get posts by member ID
- Like and unlike posts
- Delete posts

## Prerequisites

Before running the application, make sure you have the following software installed:

- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/)

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/borisngong/Alx-Webstack-Portfolio_BoroHuBMedia.git
   cd BoroHubMedia
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

3.## Set up the MongoDB connection:

### Start by creating a MongoDB database

1. **Download MongoDB Atlas :**

- Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Create and Account and sign in
- Set up a new cluster(Choose the free for testing)
- Create a new database
  2**If you prefer using MongoDb locally:**
- Follow these instructions [here](https://docs.mongodb.com/manual/installation/)
- Start the MongoDB service by running the `mongod` command in your terminal

### Create a `.env` file in the project root directory:

```bash
touch .env
```

### Add the following environment variables to the `.env` file:

```plaintext
PORT=your_port_number_here or it will run on settings default port
SKEY_JWT=your_secret_key_here
EXP_JWT=24h
UPLOADS_BASE_URL=http://localhost:3000
REFRESH_JWT=your_refresh_token_here
NODE_ENV=test
DB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
```

- **PORT**: The port number for the server to run on
- **SKEY_JWT**: A secret key for JWT token generation which is used to sign the token payload
- **EXP_JWT**: The expiration time for JWT tokens (e.g., 24h for 24 hours, 1d for 1 day)
- **UPLOADS_BASE_URL**: The base URL for media uploads
- **REFRESH_JWT**: A refresh token secret key for generating refresh tokens for user sessions incase of token expiration
- **NODE_ENV**: The environment for the server to run in (e.g., test, development, production)
- **DB_URI**: The connection URI for your MongoDB database
- **username**, **password**, **cluster**, and **database**: Replace these with your actual MongoDB

4. Start the application:

   ```bash
   npm start
   ```

## Basic Usage

Once the application is running, you can use a REST API client (like Postman or Insomnia) to interact with the following endpoints:

### User Management Endpoints

- **POST /initializeAccount**: Initialize a new user account
- **POST /accessAccount**: Access user account to log in
- **GET /endSession**: End user session to log out
- **GET /getUserSession**: Retrieve the current user session information

### Member Management Endpoints

- **DELETE /members/delete/:memberId**: Delete a member with admin privileges.
- **GET /members/:memberId**: Get member details
- **PUT /members/update/:memberId**: Update member details
- **PUT /members/follow/:memberId**: Follow a member
- **DELETE /members/unfollow/:memberId**: Unfollow a member
- **GET /members/followers/:memberId**: Get followers list
- **POST /members/restricted/:memberId**: Restrict/block a user
- **DELETE /members/unrestricted/:memberId**: Unrestrict/unblock a user
- **GET /members/restricting/:memberId**: Get blocking list
- **GET /members/search/:handle**: Search user by member ID
- **PUT /members/avatarUpload/:memberId**: Add member profile picture
- **PUT /members/coverImageUpload/:memberId**: Add member cover picture

### Content Post Management Endpoints

- **POST /content/posts**: Create a new post

  - **Request Body**:
    ```json
    {
      "memberId": "memberId",
      "content": "content",
      "media": "media"
    }
    ```

- **GET /content/get-content/:memberId**:
  Retrieve all content posts for a specific member
- **PUT /content/update/:postId**:
  Update a content post by its ID
- **PUT /content/like-content/:postId**:
  Like a content post

- **PUT /content/unlike-content/:postId**:
  Unlike a content post

- **DELETE /content/delete-content/:postId**:
  Delete a content post by its ID

## Project Structure

```plaintext
├├── BoroHubMedia_Backend          # Root directory for the backend of the BoroHubMedia application
│   ├── .env                       # Environment variables for configuration (e.g., database URI, secret keys)
│   ├── .eslintrc.js                # ESLint configuration file for maintaining code quality
│   ├── .gitignore                  # Git ignore file specifying files and directories to ignore in version control
│   ├── _bd_api                     # Directory containing API route definitions
│   │   ├── authSessionRoutes.js    # Routes for user authentication actions (login, logout)
│   │   ├── contentPostRoutes.js    # Routes for managing content posts (create, update, delete)
│   │   ├── feedbackCommentRoutes.js # Routes for handling comments on posts
│   │   └── membersRoutes.js        # Routes for managing member-related actions (follow, unfollow)
│   ├── _bdmainEntry.js             # Main entry point for the application
│   ├── babel.config.js             # Babel configuration file for transpiling JavaScript
│   ├── config.js                   # Application configuration settings
│   ├── configurations              # Directory for configuration scripts
│   │   ├── databaseSetup.js        # Script for setting up the database connection
│   │   └── environmentLoader.js    # Script for loading environment variables
│   ├── controllers                 # Directory containing controller logic for various functionalities
│   │   ├── authSessionControllers.js # Controllers for user authentication logic
│   │   ├── contentPostController.js  # Controllers for managing content post logic
│   │   ├── feedbackCommentController.js # Controllers for handling comment logic
│   │   └── memberControllers.js   # Controllers for managing member-related logic
│   ├── coreModels                # Directory for core data models used in the application
│   │   ├── chatConversation.js    # Model for chat conversations
│   │   ├── chatEntry.js          # Model for individual chat entries
│   │   ├── contentPost.js        # Model for content posts
│   │   ├── feedbackComment.js     # Model for feedback comments on posts
│   │   ├── memberSchema.js        # Schema for member data
│   │   └── storySchema.js         # Schema for stories
│   ├── coreUtils                 # Directory for utility functions and helpers
│   │   ├── _bd_responseHandlers.js # Utility functions for handling API responses
│   │   ├── create-fileUrl.js     # Utility for generating file URLs
│   │   ├── sanitized.js          # Utility for sanitizing user inputs
│   │   └── tokenUtils.js         # Utility functions for handling tokens (JWT, refresh tokens)
│   ├── docs                      # Directory for documentation files
│   │   ├── postman_collection.json # Postman collection for API testing
│   │   └── swagger.json          # Swagger API documentation file
│   ├── media                     # Directory for media files (e.g., images)
│   │   └── images                # Subdirectory containing image files
│   ├── middlewares               # Directory for middleware functions
│   │   ├── authIsAdmin.js        # Middleware for checking admin permissions
│   │   ├── authenticateToken.js   # Middleware for token authentication
│   │   ├── handleErrors.js       # Middleware for error handling
│   │   ├── mediaUploads.js       # Middleware for handling media uploads
│   │   └── setupMiddleware.js     # Middleware setup configuration
│   ├── package-lock.json         # Dependency lock file generated by npm
│   ├── package.json              # Project metadata and dependencies
│   ├── serverCore.js             # Core server setup and configuration
│   └── swagger                   # Directory for Swagger-related files
│       ├── postmanSetup.js       # Setup file for Postman
│       └── setupSwagger.js       # Setup file for Swagger documentation
└── README.md                     # Project documentation file
```

## Definitions

- **Content**: Represents a post created by a user, including text content and optional media files
- **Member**: Represents a registered user on the platform
- **Middleware**: Functions that process requests and responses, including error handling
- **Endpoints**: API routes that allow interaction with the application

## Postman Documentation

For detailed API usage and examples, refer to the [Postman Documentation](#).

## About the Author

Hi, I'm Ngong Boris Kukwah, a Fullstack Software Engineer specializing in Backend Development and an ALX Africa student. I’m passionate about building efficient, scalable, and robust applications. This project reflects my dedication to learning and implementing best practices in software development

### Connect with me

- \*- **Name**: Ngong Boris Kukwah
- **Email**: [borisngong@gmail.com](mailto:borisngong@gmail.com)
- **LinkedIn**: [Ngong Boris Kukwah](https://www.linkedin.com/in/ngong-boris-kukwah-34063821a/)
- **Twitter**: [boro_didier1](https://x.com/boro_didier1)
- **GitHub**: [borisngong](https://github.com/borisngong)
