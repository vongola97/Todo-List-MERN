# Todo-List-MERN

## Overview
This project is a Todo List application built using the MERN stack (MongoDB, Express, React, Node.js). It allows users to manage their tasks efficiently with a modern and responsive interface.

## Features
- **CRUD Operations**: Create, Read, Update, and Delete tasks.
- **User Authentication**: Secure login and registration.
- **Responsive Design**: Optimized for both desktop and mobile devices.

## Installation

1. **Clone the repository**
   ```
   git clone https://github.com/vongola97/Todo-List-MERN.git
   cd Todo-List-MERN
   ```

2. **Install dependencies for server and client**
    ```
    cd api
    npm install
    cd ../client
    npm install
    ```

3. **Create a .env file in the root directory and add your MongoDB URI**
    ```
    MONGO_URI=your_mongodb_uri
    ```

4. **Run the application**
    ```
    cd api
    npm start
    cd ../client
    npm start
    ```

## Usage
- **Navigate to the Client:** Open your browser and go to http://localhost:3000.
- **User Registration:** Register a new user or log in with existing credentials.
- **Manage Tasks:** Add, edit, or delete tasks from your todo list.

## Technologies Used
- **Frontend:** React, CSS
- **Backend:** Node.js, Express
- **Database:** MongoDB