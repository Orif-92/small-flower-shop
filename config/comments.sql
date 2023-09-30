CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255),
    text TEXT,
    product_id INT,
    FOREIGN KEY (product_id) REFERENCES products (id)
);
