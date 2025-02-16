-- USERS TABLE (Both Freelancers & Companies)
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- Hashed Password
    user_type VARCHAR(20) CHECK (user_type IN ('user', 'company')) NOT NULL,
    profile_picture VARCHAR(255), -- S3 URL
    cover_photo VARCHAR(255), -- S3 URL
    bio TEXT,
    categories INTEGER[] DEFAULT '{}',  -- category id will be here
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- COMPANY EXTRA DETAILS
CREATE TABLE companies (
    company_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE, -- Linked to users
    website VARCHAR(255),
    location VARCHAR(255),
    description TEXT
);

-- CATEGORIES TABLE
CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

INSERT INTO categories (name) VALUES
    ('Web Development'),
    ('Graphic Design'),
    ('Digital Marketing'),
    ('Content Writing'),
    ('Video Production'),
    ('Photography'),
    ('Music & Audio'),
    ('Virtual Assistance'),
    ('Data Analysis'),
    ('Mobile App Development');

-- POSTS TABLE (User-created posts)
CREATE TABLE posts (
    post_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE, -- Post Owner
    content TEXT NOT NULL,
    image_url VARCHAR(255), -- S3 URL
    category_id INT REFERENCES categories(category_id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- LIKES TABLE (Tracking likes on posts)
CREATE TABLE likes (
    like_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    post_id INT REFERENCES posts(post_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, post_id) -- Prevents duplicate likes
);

-- COMMENTS TABLE (User comments on posts)
CREATE TABLE comments (
    comment_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    post_id INT REFERENCES posts(post_id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- FOLLOWERS TABLE (For following system)
CREATE TABLE followers (
    follower_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE, -- The person being followed
    follower_user_id INT REFERENCES users(user_id) ON DELETE CASCADE, -- The follower
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, follower_user_id) -- Prevent duplicate follows
);
