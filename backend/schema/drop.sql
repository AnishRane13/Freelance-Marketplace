-- First drop the triggers
DROP TRIGGER IF EXISTS after_job_completion ON job_completion;
DROP FUNCTION IF EXISTS update_user_earnings();

-- Drop tables with foreign key constraints first
DROP TABLE IF EXISTS payment_tracking_meta;
DROP TABLE IF EXISTS agreements;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS job_completion;
DROP TABLE IF EXISTS payment_tracking;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS contract_acceptance;
DROP TABLE IF EXISTS selected_freelancers;
DROP TABLE IF EXISTS quotes;
DROP TABLE IF EXISTS jobs;
DROP TABLE IF EXISTS subscriptions;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS likes;
DROP TABLE IF EXISTS post_images;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS companies;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

---------------------------------------------------

-- If only want to remove values but not the tables

-- Truncate tables in the correct order to handle dependencies
TRUNCATE TABLE payment_tracking_meta, agreements, notifications, job_completion, payment_tracking,
             payments, contract_acceptance, selected_freelancers, quotes, jobs,
             subscriptions, comments, likes, post_images, posts, companies, categories, users
CASCADE;