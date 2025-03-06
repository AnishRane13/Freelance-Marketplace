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

-- POST_IMAGES TABLE (Multiple images per post)
CREATE TABLE post_images (
    image_id SERIAL PRIMARY KEY,
    post_id INT REFERENCES posts(post_id) ON DELETE CASCADE, -- Link to the post
    image_url VARCHAR(255) NOT NULL, -- S3 URL
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Optional
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

-- SUBSCRIPTIONS TABLE (Companies need a subscription to post jobs)
CREATE TABLE subscriptions (
    subscription_id SERIAL PRIMARY KEY,
    company_id INT REFERENCES companies(company_id) ON DELETE CASCADE,
    amount INT NOT NULL, -- Amount paid
    job_limit INT NOT NULL, -- Number of jobs allowed
    jobs_posted INT DEFAULT 0, -- Number of jobs used
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL -- Subscription validity
);

-- JOBS TABLE (Only companies can post jobs)
CREATE TABLE jobs (
    job_id SERIAL PRIMARY KEY,
    company_id INT REFERENCES companies(company_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category_id INT REFERENCES categories(category_id) ON DELETE SET NULL,
    price INT NOT NULL, -- Price offered for the job
    location VARCHAR(150) NOT NULL, -- Location with character limit
    deadline DATE NOT NULL, -- Job completion deadline
    status VARCHAR(20) CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')) DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- QUOTES TABLE (Freelancers submit quotes for jobs)
CREATE TABLE quotes (
    quote_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    job_id INT REFERENCES jobs(job_id) ON DELETE CASCADE,
    quote_price INT NOT NULL, -- Freelancer's price proposal
    cover_letter TEXT NOT NULL, -- Explanation for the quote
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SELECTED FREELANCERS TABLE (Company selects a freelancer for a job)
CREATE TABLE selected_freelancers (
    selection_id SERIAL PRIMARY KEY,
    job_id INT REFERENCES jobs(job_id) ON DELETE CASCADE,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    selected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CONTRACT ACCEPTANCE TABLE (Tracks freelancer's agreement)
CREATE TABLE contract_acceptance (
    acceptance_id SERIAL PRIMARY KEY,
    job_id INT REFERENCES jobs(job_id) ON DELETE CASCADE,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    status VARCHAR(20) CHECK (status IN ('pending', 'accepted', 'declined')) DEFAULT 'pending',
    accepted_at TIMESTAMP -- Set when the user accepts
);

-- PAYMENTS TABLE (Company pays quoted amount to the application)
CREATE TABLE payments (
    payment_id SERIAL PRIMARY KEY,
    job_id INT REFERENCES jobs(job_id) ON DELETE CASCADE,
    company_id INT REFERENCES companies(company_id) ON DELETE CASCADE,
    amount INT NOT NULL, -- Amount paid by company (quoted amount)
    payment_status VARCHAR(20) CHECK (payment_status IN ('pending', 'completed', 'failed')) DEFAULT 'pending',
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- JOB COMPLETION TABLE (Tracks job completion & earnings distribution)
CREATE TABLE job_completion (
    completion_id SERIAL PRIMARY KEY,
    job_id INT REFERENCES jobs(job_id) ON DELETE CASCADE,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    company_id INT REFERENCES companies(company_id) ON DELETE CASCADE,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    amount_paid INT NOT NULL, -- Amount the freelancer receives
    status VARCHAR(20) CHECK (status IN ('pending', 'completed')) DEFAULT 'pending'
);

-- NOTIFICATIONS TABLE (Stores notifications for users and companies)
CREATE TABLE notifications (
    notification_id SERIAL PRIMARY KEY,
    recipient_id INT REFERENCES users(user_id) ON DELETE CASCADE, -- User receiving the notification
    job_id INT REFERENCES jobs(job_id) ON DELETE SET NULL, -- Related job (if applicable)
    type VARCHAR(50) CHECK (type IN ('job_update', 'payment', 'contract', 'system')) NOT NULL,
    message TEXT NOT NULL, -- Notification content
    is_read BOOLEAN DEFAULT FALSE, -- Tracks if user has seen it
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- TRIGGER TO UPDATE USER EARNINGS WHEN JOB IS COMPLETED
CREATE OR REPLACE FUNCTION update_user_earnings()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE users
    SET total_earnings = total_earnings + NEW.amount_paid
    WHERE user_id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_job_completion
AFTER INSERT ON job_completion
FOR EACH ROW
WHEN (NEW.status = 'completed')
EXECUTE FUNCTION update_user_earnings();