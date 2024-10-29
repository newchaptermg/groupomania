# Groupomania Project

Groupomania is a social networking platform that allows users to sign up, create posts, and interact with each other. The project includes features like user authentication, post creation, and soft deletion of user accounts.

## Features
- **User Authentication**: Users can sign up, log in, and manage their accounts.
- **Soft Deletion**: Users who delete their account and others are still see the posts created by the deleted user.
- **Post Management**: Users can create, read, update, and delete posts.
- **Read/Unread Post Tracking**: Users can mark posts as read or unread.

## Project Structure
- **Controllers**: Handles business logic, such as creating posts and managing users.
- **Routes**: Defines API endpoints for user actions, protected with authentication middleware.
- **Middleware**: Manages file uploads and token-based user authentication.

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or later)
- PostgreSQL database

### a. Git Clone & database setup

1. Clone the Repository:
   ```bash
   git clone https://github.com/newchaptermg/groupomania.git

2. pgAdmin (PostgreSQL Database Setup)

    Open pgAdmin:

a. Launch pgAdmin (if it’s not installed, download and install it from pgAdmin).
Create a New Database:

b. Right-click on Databases in the pgAdmin sidebar.
Select Create > Database….

c. Name the database (e.g., groupomania) and click Save.

3. Get Database Connection URL:

a. Note down your PostgreSQL connection details. You’ll need them for the DATABASE_URL in your .env file.
b. The format is: postgres://username:password@localhost:5432/groupomania.

4. Run the SQL Commands

Import the schema.sql File:
a. Open the SQL Query Tool in pgAdmin by right-clicking on your database (e.g., groupomania) and selecting Query Tool.
b. Copy the contents of schema.sql (or open the schema.sql file in pgAdmin).
c. Run the SQL commands to set up the database schema - see schema.db
d. Click Execute/Run to create the necessary tables.

5. Environment Variables (.env)
Create a .env File:

Create a .env file in the root directory.
Refer to .env-sample for required environment variables.
Environment Variables Setup:


### Backend database

Backend URL - http://localhost:5000
Backend Folder - groupomania/back
Start the Server - To start the server with nodemon, use the following command:npx nodemon server.js

### Front End 

Frontend URL - http://localhost:3000
Frontend Folder - roupomania/front
Start the Server - To start the server with nodemon, use the following command:npm start

### Database Schema: 

See schema.sql for table definitions.

### Media Uploads: 

Media files (images, videos, audio) are stored in the uploads folder. Ensure the folder has correct read/write permissions.

### API Endpoints

- **Authentication**

POST /auth/signup: Register a new user or reactivate a previously deleted account.
POST /auth/login: Log in a user and receive a JWT token.

- **User Management**

GET /auth/profile: Get the user profile (requires authentication).
DELETE /auth/delete: Soft-delete the user account (requires authentication).
PATCH /auth/change-password: Change the user's password (requires authentication).

- **Posts**

POST /posts/create: Create a new post (requires authentication).
GET /posts: Retrieve all posts (requires authentication).
GET /posts/:id: Retrieve a specific post by ID (requires authentication).
DELETE /posts/:id: Delete a specific post (requires authentication).
PATCH /posts/:id/read: Mark a post as read.
PATCH /posts/:id/unread: Mark a post as unread.


