-- Kandypack Logistics Database Schema

-- Customer Table
CREATE TABLE IF NOT EXISTS Customer (
    customer_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('Retail', 'Wholesale', 'Corporate')),
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE
);

-- Seed Customer Data
INSERT INTO Customer (customer_id, name, type, address, city, phone, email) VALUES
('c1', 'Tharaka', 'Retail', '123 Main St', 'New York', '555-0101', 'retailA@example.com'),
('c2', 'Buvindu', 'Wholesale', '456 Oak Ave', 'Los Angeles', '555-0102', 'wholesaleB@example.com'),
('c3', 'Tharumini', 'Corporate', '789 Pine Rd', 'Chicago', '555-0103', 'corporateC@example.com'),
('c4', 'Neela', 'Retail', '321 Elm St', 'Houston', '555-0104', 'retailD@example.com'),
('c5', 'Kamal Perera', 'Wholesale', '654 Maple Dr', 'Phoenix', '555-0105', 'kamal@example.com'),
('c6', 'Priya Silva', 'Corporate', '987 Birch Ln', 'Philadelphia', '555-0106', 'priya@example.com'),
('c7', 'Rajesh Kumar', 'Retail', '147 Cedar Blvd', 'San Antonio', '555-0107', 'rajesh@example.com'),
('c8', 'Sanjana Fernando', 'Wholesale', '258 Spruce Way', 'San Diego', '555-0108', 'sanjana@example.com'),
('c9', 'Anil Jayawardena', 'Corporate', '369 Willow Ct', 'Dallas', '555-0109', 'anil@example.com'),
('c10', 'Dilani Mendis', 'Retail', '741 Aspen Ter', 'San Jose', '555-0110', 'dilani@example.com');
