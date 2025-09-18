# JWT Authentication System

Comprehensive JWT-based authentication system providing secure user registration, login, and session management with bcrypt password hashing and HTTP-only cookie storage.

## Target

[@generate](../src/auth-system.js)

## Capabilities

### User Registration

Handles new user account creation with email validation, password complexity requirements, and secure password hashing.

- Validates email format and uniqueness against database
- Enforces password complexity requirements (minimum 8 characters, mixed case, numbers, special characters)
- Hashes passwords using bcrypt with salt rounds of 12
- Creates user record with UUID primary key
- Returns success confirmation without exposing sensitive data

### User Authentication

Manages user login with credential verification and JWT token generation.

- Validates email and password against stored credentials
- Uses bcrypt to verify password against stored hash
- Generates JWT access token with user ID and email claims
- Sets HTTP-only, secure cookie with JWT token
- Returns user profile data excluding password hash
- Implements rate limiting to prevent brute force attacks

### Session Management

Handles JWT token validation, refresh, and logout functionality.

- Validates JWT tokens from HTTP-only cookies
- Verifies token signature and expiration
- Provides middleware for protecting authenticated routes
- Clears authentication cookies on logout
- Supports token refresh for extended sessions

### User Profile Management

Provides user profile retrieval and update capabilities.

- Retrieves current user profile from JWT token
- Updates user profile information (first_name, last_name, email)
- Validates email uniqueness when updating
- Returns updated profile data

### Password Management

Handles password changes and reset functionality.

- Validates current password before allowing changes
- Enforces password complexity for new passwords
- Updates password hash in database
- Invalidates existing sessions after password change

### Todo Integration

Integrates authentication with existing todo system to provide user-scoped data access.

- Associates todos with authenticated user through user_id foreign key
- Filters all todo operations to current user's data only
- Automatically sets user_id when creating new todos
- Protects all todo endpoints with authentication middleware

## API

```javascript { .api }
// Authentication middleware
function authenticateToken(req, res, next);

// Registration endpoint
async function register(req, res);

// Login endpoint  
async function login(req, res);

// Logout endpoint
function logout(req, res);

// Get current user profile
async function getCurrentUser(req, res);

// Update user profile
async function updateProfile(req, res);

// Change password
async function changePassword(req, res);

// Database schema helpers
async function createUsersTable();
async function addUserIdToTodos();
async function createIndexes();

// Utility functions
function validateEmail(email);
function validatePassword(password);
function generateAccessToken(user);
function hashPassword(password);
async function comparePassword(password, hash);
```

## Dependencies

### JWT Token Operations

Handles JWT token generation, signing, and verification with configurable expiration and secure algorithm selection.
[@use](jsonwebtoken)

### Password Hashing

Provides secure password hashing using bcrypt algorithm with salt generation and password comparison functionality.
[@use](bcrypt)

### Web Framework

Express.js framework for handling HTTP requests, middleware, and cookie management.
[@use](express)

### Database Connection

PostgreSQL client for database operations including user management and todo data access.
[@use](pg)