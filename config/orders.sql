CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    FIO VARCHAR(255),
    region VARCHAR(255),
    phone VARCHAR(20),
    product_id INT,
    status VARCHAR(50),
    FOREIGN KEY (product_id) REFERENCES products (id)
);
