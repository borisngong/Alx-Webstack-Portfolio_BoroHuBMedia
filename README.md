# BoroHubMedia Social Media REST API

A backend REST API for a social media platform with basic CRUD operations for members, posts, comments and chats.

## Introduction

BoroHubMedia is a backend REST API for a social media platform. It is built using Node.js, Express, and MongoDB and has endpoints for authenticating members, member management, posts, comments and chats. The API provides member authentication, member management, post and comment functionalities, likes/dislikes, and robust error checking and response utilities.

## Features

- **Authentication Management**: Account initialization, access Account(login), endSession(logout), and session retrieval.
- **Member Management**: Profile updates, following/unfollowing, and member restrictions(block/unblock), member access token refresh.
- **Content Post Management**: Create, update, retrieve, like/unlike, and delete posts.
- **Comment Management**: Create, update, retrieve, like/unlike, reply to comments, like/dislike comment replies, and delete comments.
- **Chat Management**: Create chat, chatEntry(send messages), retrieve and delete chat capabilities for members.

## HTTP Status Codes and Error Handling

The API employs comprehensive error handling to ensure a smooth member experience. Below are the common HTTP status codes you may encounter, along with their meanings:

### Success Codes

- **200 OK**: The request was successful, and the server returned the requested data.
- **201 Created**: The request was successful, and a new resource was created (e.g., a new content post).
- **204 No Content**: The request was successful, but there is no content to return (e.g., after a successful delete operation).

### Client Error Codes

- **400 Bad Request**: The request could not be processed due to invalid input or missing parameters.
- **401 Unauthorized**: The request requires member authentication or the provided credentials are invalid.
- **403 Forbidden**: The server understood the request but refuses to authorize it.
- **404 Not Found**: The requested resource was not found or does not exist on the server.
- **409 Conflict**: The request could not be completed due to a conflict with the current state of the resource.
- **429 Too Many Requests**: The member has sent too many requests in a given amount of time(e.g Rate limiting for when a member attempts more than five times within 5mins to login with wrong handle or password).

### Server Error Codes

- **500 Internal Server Error**: The server encountered an unexpected condition that prevented it from fulfilling the request.
- **503 Service Unavailable**: The server is currently unable to handle the request due to temporary overloading or maintenance.

### Error Responses

Error responses will include a JSON object with a message detailing the error. For example:

````json
{
  "error": "Too many requests. Please try again later.",
  "status": 429
}
```
Additionally, the API utilizes a custom error handling function called BDERROR to standardize error responses. It also provides utility functions, sendSuccessResponse and sendErrorResponse, to ensure that all responses are formatted uniformly. This enhances the overall user experience by providing clear and consistent feedback to the client.


## Prerequisites

Before running the API, make sure you have the following software installed:

- [Node.js](https://nodejs.org/): Required to run the server, which is built with Express.js, a lightweight Node.js web application framework.
- [MongoDB](https://www.mongodb.com/): Database management system used to store data for the API.

## Installation Instructions

Follow the links above to download and install Node.js and MongoDB.

## Running the API

1. **Clone the repository** using the following command in your terminal:

   ```bash
   git clone https://github.com/borisngong/Alx-Webstack-Portfolio_BoroHuBMedia.git
   cd BoroHubMedia
```
2. ###Install Dependencies

Install the required dependencies by running the following commands:

```bash
npm install
````

3. ### Set Up MongoDB Connection

You can either use **MongoDB Atlas (cloud)** or install **MongoDB locally**.

#### Option 1: MongoDB Atlas (Cloud)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create an account.
2. Log in and set up a new cluster (choose the free option for testing purposes).
3. Create a new database in your cluster.

#### Option 2: MongoDB Local

1. Follow the [installation instructions here](https://docs.mongodb.com/manual/installation/).
2. Start the MongoDB service by running the `mongod` command in your terminal.

---

### Create a `.env` File

In the root directory of the project, create a `.env` file to store your environment variables:

```bash
touch .env
```

5. ### Configure Environment Variables

Add the following variables to your `.env` file:

```plaintext
PORT=3000  # Replace "3000" with your preferred port, or leave it as default
SKEY_JWT=your_secret_key_here
EXP_JWT=24h  # Adjust the JWT token expiration as needed (e.g., 24h, 7d)
UPLOADS_BASE_URL=http://localhost:3000
REFRESH_JWT=your_refresh_token_here
NODE_ENV=development  # Options: development, production, or test
DB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
```

### Explanation of Environment Variables:

- **`PORT`**: Port number for the server (default: 3000).
- **`SKEY_JWT`**: Secret key for signing JWT tokens.
- **`EXP_JWT`**: Expiration time for JWT tokens (e.g., `24h` for 24 hours).
- **`UPLOADS_BASE_URL`**: Base URL for media uploads.
- **`REFRESH_JWT`**: Secret key for generating refresh tokens.
- **`NODE_ENV`**: Environment mode (`development`, `production`, or `test`).
- **`DB_URI`**: MongoDB connection string. Replace `<username>`, `<password>`, `<cluster>`, and `<database>` with your actual MongoDB Atlas credentials that you created above.

---

### Running the Application

#### Start the Application

Use the following command to start the server:

```bash
npm start
```

### Development Mode with Nodemon

To run the application in development mode, use:

```bash
npm run dev
```

Nodeman automatically restarts the server when changes to the code is saved

## Basic Usage

Once the API is running, you can use a REST API client (like Postman or Insomnia) to interact with the API endpoints. These endpoints allow you to manage authentication, members, content posts, feedback comments, and chat functionalities. You can test the API endpoints using the Postman collection provided in the documentation section below.

### Default Base URL

The default base URL for the server is:

````plaintext
http://localhost:3000
If you are running the API on a different port, remember to replace localhost:3000 with the appropriate base URL.
````
## API Documentation

## Documentation

For detailed information on request parameters, response formats, and example payloads, check out the following resource:

- **Postman Collection**: A collection of API endpoints you can import into Postman for testing. [Link to Postman Collection](#) (replace with actual link).

This resource will help you manage authentication, members, content posts, feedback comments, and chat functionalities.

### Using a REST API Client

Use a REST API client (like Postman or Insomnia) to interact with the endpoints. I chosd this tools because they are particularly useful for API testing during development for the following reasons:

- **Automatic Authorization**: Unlike tools like Swagger, which require manual entry of authorization headers or tokens, Postman and Insomnia automatically handle cookies populated by the API. This simplifies the testing process for APIs like mine that are designed to populate cookies automatically.

- **Streamlined Testing Workflow**: Postman and Insomnia offer advanced features for testing, such as saving request/response pairs, managing collections, and great debugging tools, which makes them a better choice in development and testing.

Since my API automatically populates cookies, using Postman or Insomnia ensures that you can efficiently test protected endpoints without the need for repetitive manual configurations(e.g setting the headers, tokens etc).


## API Endpoint Structure

The API's routes are organized under specific paths based on their functionalities.


---

### Authentication Routes
- **Base Route**: `/api/auth`
- **Example**:
  - **POST** `/api/auth/initializeAccount`
    Initializes a new account.

---

### Content Post Routes
- **Base Route**: `/api/content`
- **Example**:
  - **DELETE** `/api/content/delete-content/:postId`
    Deletes a content post by its ID.

---

### Member Management Routes
- **Base Route**: `/api/member`
- **Example**:
  - **PUT** `/api/member/follow/:memberId`
    Follows a specific member by their ID.

---

### Comment Management Routes
- **Base Route**: `/api/comment`
- **Example**:
  - **PUT** `/api/comment/update-comment/:commentId`
    Updates a specific comment by its ID.

---

### Chat Management Routes
- **Base Route**: `/api/chat`
- **Example**:
  - **GET** `/api/chat/get-chat/:chatID`
    Retrieves a specific chat by its ID.

---

## Summary

To access any of the above functionalities, append the relevant endpoint to the base URL. For example, to create a new content post, you would use:

```plaintext
POST http://localhost:3000/api/content/create
```
## API Endpoints

# Authentication Management API

This API provides endpoints for member authentication, including account initialization, login, session management, and logout. Below is a brief overview of the available endpoints, along with instructions on how to run each one.

### Endpoints Overview

1. **Initialize Account**:
   - **POST** `/api/auth/initializeAccount`
   - **How to Run**: To create a new member account, send a POST request to this endpoint with the following JSON body in the request:
   - **Example Request**:
     ```json
     {
       "fullName": "Your Full Name",
       "handle": "yourHandle",
       "emailAddress": "youremail@example.com",
       "plainPassword": "yourPassword123",
       "aboutMe": "A brief description about yourself",
       "role": "admin" // or "member"
     }
     ```
   - **Note**: Joi is used for input validation, and the password is hashed using bcrypt.

2. **Access Account**:
   - **POST** `/api/auth/accessAccount`
   - **How to Run**: To log in, send a POST request to this endpoint with the member's email and password in the request body. Rate limiting is applied to prevent abuse.
   - **Example Request**:
     ```json
     {
       "email": "existingMember@example.com",
       "password": "securePassword123"
     }
     ```

3. **End Session**:
   - **GET** `/api/auth/endSession`
   - **How to Run**: To log out, send a GET request to this endpoint. Authenticated members can log out of their account to end the current session and invalidate or clear the access token and refresh tokens.

4. **Get Current Session**:
   - **GET** `/api/auth/getSession`
   - **How to Run**: To retrieve information about the current session, send a GET request to this endpoint. Authenticated members can access their session details, including all member information.

# Member Management API

This API provides endpoints for managing member accounts, including functionalities for creating, updating, following, unfollowing, and deleting members. Below is a brief overview of the available endpoints, along with instructions on how to run each one.

### Endpoints Overview

1. **Refresh Token**:
   - **POST** `/api/member/refresh-token`
   - **How to Run**: Authenticated members can refresh their access tokens by sending a POST request to this endpoint. This helps to extend the member session without the need to log in again.

2. **Delete a Member**:
   - **DELETE** `/api/member/delete/:memberId`
   - **How to Run**: Admin members can delete a member's account by sending a DELETE request to this endpoint with the member's unique identifier (`memberId`). This will remove all associated data and content.

3. **Retrieve Member Details**:
   - **GET** `/api/member/:memberId`
   - **How to Run**: Authenticated members can retrieve details of a specific member by sending a GET request to this endpoint with the member's unique identifier.

4. **Update Member Details**:
   - **PUT** `/api/member/update/:memberId`
   - **How to Run**: Authenticated members can update their details by sending a PUT request to this endpoint with the updated information in the request body.
   - **Example Request**:
     ```json
     {
       "fullName": "Updated Name",
       "bio": "Updated bio information"
     }
     ```

5. **Follow a Member**:
   - **PUT** `/api/member/follow/:memberId`
   - **How to Run**: Authenticated members can follow another member by sending a PUT request to this endpoint with the member's unique identifier (`memberId`). This adds the member ID to the followers array of the member being followed.

6. **Unfollow a Member**:
   - **DELETE** `/api/member/unfollow/:memberId`
   - **How to Run**: Authenticated members can unfollow a member by sending a DELETE request to this endpoint with the member's unique identifier (`memberId`). This removes the member ID from the followers array of the member being unfollowed.

7. **Get Followers List**:
   - **GET** `/api/member/followers/:memberId`
   - **How to Run**: Authenticated members can retrieve a list of followers for a specific member by sending a GET request to this endpoint with the member's unique identifier.

8. **Restrict a Member**:
   - **POST** `/api/member/restricted/`
   - **How to Run**: Authenticated members can restrict/block another member's account by sending a POST request to this endpoint with the member's unique identifier in the request body. This blocks them from interacting with the member's content.

9. **Unrestrict a Member**:
   - **DELETE** `/api/member/unrestricted/`
   - **How to Run**: Authenticated members can unrestrict/unblock another member's account by sending a DELETE request to this endpoint with the member's unique identifier in the request body. This allows them to interact with the member's content again.

10. **Get Restricted List**:
    - **GET** `/api/member/restricted-list/:memberId`
    - **How to Run**: Members can retrieve a list of restricted members by sending a GET request to this endpoint with their unique identifier.

11. **Search for a Member by Handle**:
    - **GET** `/api/member/search/:handle`
    - **How to Run**: Members can search for other members by their handles or usernames by sending a GET request to this endpoint with the handle as a parameter.

12. **Upload Profile Picture**:
    - **POST** `/api/member/avatarUpload/`
    - **How to Run**: Authenticated members can upload their profile pictures by sending a POST request to this endpoint. Use Postman or Insomnia to set the request type to `POST` and select `form-data` in the body.
    - **Fields**:
      - `avatar`: (File) Upload the profile picture file.
    - **Example Request**:
      - In Insomnia, set the key as `avatar` and select the image file to upload.
      - In Postman, first upload your image file to Postman cloud storage. To do this, click on the "File" option in the `avatar` field, then select "Upload Files" from your local storage. After uploading, you can select the file from Postman cloud storage. The response will include the member's detailed profile with the URL for the uploaded profile image.

13. **Upload Cover Picture**:
    - **PUT** `/api/member/coverImageUpload/`
    - **How to Run**: Authenticated members can upload their cover pictures by sending a PUT request to this endpoint. Use Postman or Insomnia to set the request type to `PUT` and select `form-data` in the body.
    - **Fields**:
      - `coverImage`: (File) Upload the cover picture file.
    - **Example Request**:
      - In Insomnia, set the key as `coverImage` and select the image file to upload.
      - In Postman, first upload your cover image file to Postman cloud storage. To do this, click on the "File" option in the `coverImage` field, then select "Upload Files" from your local storage. After uploading, you can select the file from Postman cloud storage. The response will include the member's detailed profile with the URL for the uploaded cover picture.

# Content Post Management API

This API provides endpoints for managing content posts, including creating, updating, retrieving, liking, unliking, and deleting posts. Below is a brief overview of the available endpoints, along with instructions on how to run each one using Postman.

### Endpoints Overview

1. **Create Content Images**:
   - **POST** `/api/content/create-content-images/:memberId`
   - **How to Run**: Authenticated members can create a new content post with or without images by sending a POST request to this endpoint. Use Postman or Insomnia to set the request type to `POST` and select `form-data` in the body.
   - **Fields**:
     - `content`: (String) The text content of the post.
     - `media`: (File) Upload at least 4 media files.
   - **Example Request**:
     - In Insomnia, set the key as `content` and the value as your post text. For `media`, add multiple keys with the same name (`media`) and select files to upload.
     - In Postman, first upload your files to Postman cloud storage. To do this, click on the "File" option in the `media` field, then select "Upload Files" from your local storage. After uploading, you can select the files from Postman cloud storage. Set the key as `content` and the value as your post text. You can easily add multiple files by clicking the "Add" button next to the `media` key.

2. **Update Content**:
   - **PUT** `/api/content/update-content/:postId`
   - **How to Run**: Members can update their existing content post by sending a PUT request to this endpoint. Use Postman to set the request type to `PUT` and select `form-data` in the body.
   - **Fields**:
     - `content`: (String) The updated text content of the post.
     - `media`: (File) Upload updated media files (optional).
   - **Example Request**:
     - In Postman, set the key as `content` and the value as the updated post text.
     - For `media`, add multiple keys with the same name (`media`) and select files to upload.

3. **Get Member Content**:
   - **GET** `/api/content/get-member-content/:memberId`
   - **How to Run**: To retrieve all content posts created by a specific member, send a GET request to this endpoint with the member's unique identifier (`memberId`).

4. **Get Specific Content Post**:
   - **GET** `/api/content/get-content/:postId`
   - **How to Run**: To fetch details of a specific content post, send a GET request to this endpoint with the post's ID. This will return details of the author and handle of who created the post.

5. **Like Content Post**:
   - **PUT** `/api/content/like-content/:postId`
   - **How to Run**: Authenticated members can like a specific content post by sending a PUT request to this endpoint with the post's ID. This adds their member ID to the post's likes array.

6. **Unlike Content Post**:
   - **PUT** `/api/content/unlike-content/:postId`
   - **How to Run**: Members can remove their like from a specific content post by sending a PUT request to this endpoint with the post's ID. This removes their member ID from the likes array.

7. **Delete Content Post**:
   - **DELETE** `/api/content/delete-content/:postId`
   - **How to Run**: Members can delete a specific content post by sending a DELETE request to this endpoint with the post's ID. Note that only the author of the post or an admin can delete it in case of a violation of rules.

# Feedback Comment Management API

This API provides endpoints for managing feedback comments, including creating, updating, liking, unliking, and deleting comments and replies. Below is a brief overview of the available endpoints:

### Endpoints Overview

1. **Create Comment**:
   - **POST** `/api/comment/create-comment/`
   - **How to Run**: Authenticated members can create a new comment on a specific content post by sending a POST request to this endpoint.
   - **Fields**:
     - `content`: (String) The text content of the comment.
   - **Example Request**:
     ```json
     {
       "content": "This is my comment on the post."
     }
     ```

2. **Update Comment**:
   - **PUT** `/api/comment/update-comment/:commentId`
   - **How to Run**: Authenticated members can update an existing comment by sending a PUT request to this endpoint with the comment's ID. Members can only update comments they have created.
   - **Fields**:
     - `content`: (String) The updated text content of the comment.
   - **Example Request**:
     ```json
     {
       "content": "This is my updated comment."
     }
     ```

3. **Create Comment Reply**:
   - **POST** `/api/comment/comment-reply`
   - **How to Run**: Authenticated members can reply to a specific comment on a content post by sending a POST request to this endpoint.
   - **Fields**:
     - `commentId`: (String) The ID of the comment being replied to.
     - `content`: (String) The text content of the reply.
   - **Example Request**:
     ```json
     {
       "commentId": "12345",
       "content": "This is my reply to the comment."
     }
     ```

4. **Like Comment Reply**:
   - **PUT** `/api/comment/like-comment-reply/:replyId`
   - **How to Run**: Authenticated members can like a specific comment reply by sending a PUT request to this endpoint with the reply's ID.

5. **Dislike Comment Reply**:
   - **PUT** `/api/comment/dislike-comment-reply/:replyId`
   - **How to Run**: Authenticated members can dislike a specific comment reply by sending a PUT request to this endpoint with the reply's ID.

6. **Like Comment**:
   - **PUT** `/api/comment/like-comment/:commentId`
   - **How to Run**: Authenticated members can like a specific comment by sending a PUT request to this endpoint with the comment's ID.

7. **Unlike Comment**:
   - **PUT** `/api/comment/unlike-comment/:commentId`
   - **How to Run**: Authenticated members can remove their like from a specific comment by sending a PUT request to this endpoint with the comment's ID.

8. **Delete Comment**:
   - **DELETE** `/api/comment/delete-comment/:commentId`
   - **How to Run**: Authenticated members can delete a specific comment by sending a DELETE request to this endpoint with the comment's ID. Only the author of the comment or an admin can delete it if it doesn't adhere to rules.


# Chat Management API

This API provides endpoints for managing chat functionalities, including creating chats, adding entries, retrieving chats, and deleting them. Below is a brief overview of the available endpoints:

### Endpoints Overview

1. **Create a Chat**:
   - **POST** `/api/chat/create-chat`
   - **How to Run**: Authenticated members can create a new chat with at least one participant. The chat creator is automatically added as a participant.
   - **Fields**:
     - `participants`: (Array of Strings) An array of member IDs to be added as participants in the chat.
   - **Example Request**:
     ```json
     {
       "participants": ["memberId1", "memberId2"]
     }
     ```

2. **Create a Chat Entry**:
   - **POST** `/api/chat/create-chat-entry/:chatId`
   - **How to Run**: Users can add a new message to an existing chat by sending a POST request to this endpoint with the chat's ID. Members must be participants in the chat to add a message.
   - **Fields**:
     - `message`: (String) The content of the message being sent.
   - **Example Request**:
     ```json
     {
       "message": "Hello, everyone!"
     }
     ```

3. **Get a Chat**:
   - **GET** `/api/chat/get-chat/:chatId`
   - **How to Run**: To retrieve the details and messages of a specific chat, send a GET request to this endpoint with the chat's ID.

4. **Delete a Chat**:
   - **DELETE** `/api/chat/delete-chat/:chatId`
   - **How to Run**: Members can delete a specific chat by sending a DELETE request to this endpoint with the chat's ID. Only the creator of the chat or an admin can delete it if it doesn't adhere to rules.

### Additional Information

For detailed information on request parameters, response formats, and example payloads, please refer to the Postman collection, which contains comprehensive documentation for each endpoint.

Please explore the Postman collection for more insights into managing authentication, members, content posts, feedback comments and chat functionalities.
The Postman collection link can be found below in the documentation section.


## Project Structure
The following is the directory structure of the project, highlighting key components:

├── AUTHOR                          # Author information
├── BoroHubMedia_Backend            # Main backend directory
│   ├── .env                        # Environment variables file
│   ├── .eslintrc.js                # ESLint configuration file
│   ├── .gitignore                  # Git ignore rules
│   ├── config.js                   # General configuration settings
│   ├── package.json                # Project dependencies metadata
│   ├── package-lock.json           # Dependency versions lock
│   ├── serverCore.js               # Server initialization logic
│   ├── _bdmainEntry.js             # Main entry point file
│   ├── docs                        # API documentation files
│   │   └── swagger.json            # Swagger API documentation
│   ├── media                       # Media files directory
│   │   └── images                  # Subdirectory for images
│   │       ├── avatars             # Avatar image files
│   │       ├── coverImages         # Cover image files
│   │       └── mediaFiles          # Other media files
│   ├── _bd_api                     # API route definitions
│   │   ├── authSessionRoutes.js    # Authentication routes file
│   │   ├── chatRoutes.js           # Chat routes file
│   │   ├── feedbackCommentRoutes.js # Feedback comment routes
│   │   └── membersRoutes.js        # Member routes file
│   ├── configurations               # Configuration files directory
│   │   ├── databaseSetup.js        # Database setup logic
│   │   └── environmentLoader.js     # Load environment variables
│   ├── controllers                  # Request handling logic
│   │   ├── authSessionControllers.js # Authentication logic controller
│   │   ├── chatController.js        # Chat logic controller
│   │   ├── feedbackCommentController.js # Feedback comment logic
│   │   └── memberControllers.js     # Member management logic
│   ├── coreModels                   # Core data models directory
│   │   ├── chat.js                  # Chat data model
│   │   ├── chatEntry.js             # Chat entry model
│   │   ├── feedbackComment.js       # Feedback comment model
│   │   ├── memberSchema.js          # Member schema definition
│   │   └── schemas                  # Additional schema files
│   │       └── initializeAccountSchema.js # Account initialization schema
│   ├── coreUtils                    # Utility functions directory
│   │   ├── _bd_responseHandlers.js   # Response handling utilities
│   │   ├── create-fileUrl.js        # File URL creation utility
│   │   ├── sanitized.js             # Data sanitization utilities
│   │   └── tokenUtils.js            # Token management utilities
│   ├── middlewares                  # Middleware functions directory
│   │   ├── authIsAdmin.js           # Admin authentication middleware
│   │   ├── handleErrors.js          # Error handling middleware
│   │   ├── mediaUploads.js          # Media upload middleware
│   │   ├── rateLimiter.js           # Rate limiting middleware
│   │   └── setupMiddleware.js       # Middleware setup logic
│   └── swagger                      # Swagger setup files directory
│       └── setupSwagger.js          # Swagger initialization logic
└── README.md                       # Project documentation file

## Definitions

- **Content**: A post created by a member, which may include text and optional media files.
- **Member**: A registered user on the platform.
- **Middleware**: Functions that handle requests and responses, including error handling and processing.
- **Endpoints**: API routes that facilitate interaction with the application.
- **API**: A set of rules and protocols for building and interacting with software applications.
- **Request**: A message sent by a client to a server to initiate an action or retrieve data.
- **Response**: A message sent by a server back to a client, containing the result of the requested action.
- **Authentication**: The process of verifying the identity of a member before granting access to certain features or data.
- **Authorization**: The process of determining whether a member has permission to perform a specific action or access certain resources.
- **Database**: A structured collection of data that is stored and managed for retrieval and manipulation.
- **Schema**: A blueprint or structure that defines how data is organized in a database, including tables and relationships.


### Common Issues

1. **Port Already in Use**:
   - Ensure no other process is running on the specified port.
   - Kill any processes using the port with:
     ```bash
     kill $(lsof -t -i:3000)
     ```

2. **MongoDB Connection Issues**:
   - Verify MongoDB URI and credentials in the `.env` file.

3. **Missing Dependencies**:
   - If you encounter a "Module Not Found" error for `dotenv`, ensure that you have installed it by running:
     ```bash
     npm install dotenv
     ```

4. **Node.js Version**:
   - Ensure you are using Node.js version 16.x or later. You can check your Node.js version with:
     ```bash
     node -v
     ```

5. **Environment Variable Errors**:
   - Double-check your `.env` file for missing or incorrect variables.

### Features to Add
- Implement WebSocket-based real-time notifications.
- Develop advanced member and post search features.
- Introduce caching (e.g., Redis) to improve performance.
- Intend to add  more detailed comprehensive documentation using Swagger, populating it whose local host link is already running in the api when started
.
### Optimization Plans
- Optimize queries to increase response speeds.
- Incorporate analytics dashboards for user insights.

### User Experience
- Create a user-friendly frontend to showcase the API's capabilities.

## About the Author

Hi, I'm Ngong Boris Kukwah, an ALX Africa Fullstack Software Engineering student  specializing in Backend Development. I’m passionate about building efficient, scalable, and robust applications. This project reflects my dedication to learning and implementing best practices in software development.

### Connect with Me

- **Name**: Ngong Boris Kukwah
- **Email**: [borisngong@gmail.com](mailto:borisngong@gmail.com)
- **LinkedIn**: [Ngong Boris Kukwah](https://www.linkedin.com/in/ngong-boris-kukwah-34063821a/)
- **Twitter**: [@boro_didier1](https://x.com/boro_didier1)
- **GitHub**: [borisngong](https://github.com/borisngong)
````
