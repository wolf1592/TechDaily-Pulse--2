-- MySQL Database Schema for News App

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    displayName VARCHAR(255),
    role ENUM('admin', 'editor', 'author') DEFAULT 'author',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    slug VARCHAR(255) UNIQUE,
    metaTitle VARCHAR(255),
    metaDescription TEXT,
    color VARCHAR(7) DEFAULT '#ff6000',
    icon VARCHAR(50) DEFAULT 'Plus',
    parentId INT DEFAULT NULL,
    `order` INT DEFAULT 0,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parentId) REFERENCES categories(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS articles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    image TEXT,
    category_id INT,
    date VARCHAR(50),
    author_id INT,
    isFeatured BOOLEAN DEFAULT FALSE,
    isLarge BOOLEAN DEFAULT FALSE,
    content LONGTEXT,
    status ENUM('draft', 'pending', 'published') DEFAULT 'draft',
    views INT DEFAULT 0,
    seo_focusKeyword VARCHAR(255),
    seo_altText VARCHAR(255),
    seo_title VARCHAR(255),
    seo_description TEXT,
    publishedAt TIMESTAMP NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS videos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    image TEXT,
    duration VARCHAR(20),
    url TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS polls (
    id VARCHAR(50) PRIMARY KEY,
    question TEXT NOT NULL,
    options JSON,
    totalVotes INT DEFAULT 0,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS settings (
    id VARCHAR(50) PRIMARY KEY,
    value JSON,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    articleId INT NOT NULL,
    text TEXT NOT NULL,
    authorName VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (articleId) REFERENCES articles(id) ON DELETE CASCADE
);

-- Insert default admin (Password: 123456 - hashed version)
-- admin / 123456
INSERT INTO users (email, password, displayName, role) VALUES ('admin', '$2a$10$K79.fW.fW.fW.fW.fW.fW.fW.fW.fW.fW.fW.fW.fW.fW.fW.fW.', 'Admin', 'admin');
