CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    categories TEXT DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE company (
    company_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    categories TEXT DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


INSERT INTO users (name, email, password)
VALUES ('Anish', 'anishrane178@gmail.com', 'Cspl@1234');

INSERT INTO company (name, email, password)
VALUES ('Chinmay', 'chinmayshelar09@gmail.com', 'Cspl@1234');





INSERT INTO users (name, email, password, categories)
VALUES ('Anish', 'anishrane178@gmail.com', 'Cspl@1234', '["Coding", "Sports"]');

INSERT INTO company (name, email, password, categories)
VALUES ('Chinmay', 'chinmayshelar09@gmail.com', 'Cspl@1234', '["Restaurant", "Photography"]');
