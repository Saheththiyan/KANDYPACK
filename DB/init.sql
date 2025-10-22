-- Create the Admin table
CREATE TABLE Admin (
    admin_id CHAR(36) NOT NULL,
    username VARCHAR(100),
    email VARCHAR(100),
    password VARCHAR(255),
    PRIMARY KEY (admin_id)
);

-- Create the Store table
CREATE TABLE Store (
    store_id CHAR(36) NOT NULL,
    name VARCHAR(100),
    city VARCHAR(50),
    address VARCHAR(255),
    capacity INT,
    PRIMARY KEY (store_id)
);

-- Create the Assistant table
CREATE TABLE Assistant (
    assistant_id CHAR(36) NOT NULL,
    name VARCHAR(100),
    weekly_hours INT,
    status VARCHAR(20),
    store_id CHAR(36),
    PRIMARY KEY (assistant_id),
    FOREIGN KEY (store_id) REFERENCES Store(store_id)
);
-- Create the Customer table
CREATE TABLE Customer (
    customer_id CHAR(36) NOT NULL,
    name VARCHAR(100),
    type VARCHAR(50),
    address VARCHAR(255),
    city VARCHAR(50),
    phone VARCHAR(20),
    email VARCHAR(320),
    password VARCHAR(255),
    PRIMARY KEY (customer_id)
);

-- Create the Driver table
CREATE TABLE Driver (
    driver_id CHAR(36) NOT NULL,
    name VARCHAR(100),
    license_no VARCHAR(20),
    weekly_hours INT,
    status VARCHAR(20),
    store_id CHAR(36),
    PRIMARY KEY (driver_id),
    FOREIGN KEY (store_id) REFERENCES Store(store_id)
);

-- Create the Product table
CREATE TABLE Product (
    product_id CHAR(36) NOT NULL,
    name VARCHAR(100),
    description TEXT,
    unit_price DECIMAL(10,2),
    space_unit INT,
    stock INT DEFAULT 0,
    PRIMARY KEY (product_id)
);

-- Create the Train_Schedule table
CREATE TABLE Train_Schedule (
    train_schedule_id CHAR(36) NOT NULL,
    departure_city VARCHAR(50),
    arrival_city VARCHAR(50),
    schedule_date DATE,
    departure_time TIME,
    arrival_time TIME,
    capacity INT,
    PRIMARY KEY (train_schedule_id)
);

-- Create the Truck table
CREATE TABLE Truck (
    truck_id CHAR(36) NOT NULL,
    license_plate VARCHAR(15),
    capacity DECIMAL(6,2),
    status VARCHAR(20),
    store_id CHAR(36),
    PRIMARY KEY (truck_id),
    FOREIGN KEY (store_id) REFERENCES Store(store_id)
);

-- Create the Route table
CREATE TABLE Route (
    route_id CHAR(36) NOT NULL,
    store_id CHAR(36),
    stops VARCHAR(255),
    max_delivery_time INT,
    PRIMARY KEY (route_id),
    FOREIGN KEY (store_id) REFERENCES Store(store_id)
);

-- Create the Order table
CREATE TABLE `Order` (
    order_id CHAR(36) NOT NULL,
    customer_id CHAR(36),
    order_date DATE,
    required_date DATE,
    status VARCHAR(20),
    total_value DECIMAL(10,2),
    payment_method VARCHAR(50) DEFAULT 'cod',
    PRIMARY KEY (order_id),
    FOREIGN KEY (customer_id) REFERENCES Customer(customer_id)
);

-- Create the Delivery_Schedule table
-- Note: Assumed 'status' is VARCHAR(20) based on similar fields in other tables; the provided ERD had 'status time' which may be a parsing error.
CREATE TABLE Delivery_Schedule (
    delivery_id CHAR(36) NOT NULL,
    route_id CHAR(36),
    truck_id CHAR(36),
    driver_id CHAR(36),
    assistant_id CHAR(36),
    delivery_date DATE,
    status VARCHAR(20),
    PRIMARY KEY (delivery_id),
    FOREIGN KEY (route_id) REFERENCES Route(route_id),
    FOREIGN KEY (truck_id) REFERENCES Truck(truck_id),
    FOREIGN KEY (driver_id) REFERENCES Driver(driver_id),
    FOREIGN KEY (assistant_id) REFERENCES Assistant(assistant_id)
);

-- Create the Allocation table
CREATE TABLE Allocation (
    allocation_id CHAR(36) NOT NULL,
    train_schedule_id CHAR(36),
    order_id CHAR(36),
    space_consumed INT,
    store_id CHAR(36),
    PRIMARY KEY (allocation_id),
    FOREIGN KEY (train_schedule_id) REFERENCES Train_Schedule(train_schedule_id),
    FOREIGN KEY (order_id) REFERENCES `Order`(order_id),
    FOREIGN KEY (store_id) REFERENCES Store(store_id)
);

-- Create the Order_Item table
CREATE TABLE Order_Item (
    product_id CHAR(36) NOT NULL,
    order_id CHAR(36) NOT NULL,
    quantity INT,
    sub_total DECIMAL(10,2),
    PRIMARY KEY (product_id, order_id),
    FOREIGN KEY (product_id) REFERENCES Product(product_id),
    FOREIGN KEY (order_id) REFERENCES `Order`(order_id)
);

-- Create the Delivers table
CREATE TABLE Delivers (
    delivery_id CHAR(36) NOT NULL,
    order_id CHAR(36) NOT NULL,
    delivered_time TIME,
    PRIMARY KEY (delivery_id, order_id),
    FOREIGN KEY (delivery_id) REFERENCES Delivery_Schedule(delivery_id),
    FOREIGN KEY (order_id) REFERENCES `Order`(order_id)
);

INSERT INTO Admin (admin_id, username, email, password) VALUES
('e0878f40-acea-11f0-876f-aac2fc27919f', 'admin1', 'admin1@kandypack.com', '$2b$10$bJEfbQRwVDjQeCZl0ywVROQPyR1AIncyIN3MVeX/Iq3SbRZZYRYhC'),
('eb27d4e1-acea-11f0-876f-aac2fc27919f', 'admin2', 'admin2@kandypack.com', '$2b$10$z7VKArhNWxFBFFZ3LeuG.evcZmPBy2xBHvjAWfbEDvmxGV2bXdePG'),
('f336dbf4-acea-11f0-876f-aac2fc27919f', 'admin3', 'admin3@kandypack.com', '$2b$10$vTh4nJUjmBslcs0vgAKKlOZ5OGWYeHZAOi4C7xtxYgeF5vkvAqJHy'),
('f85b453f-acea-11f0-876f-aac2fc27919f', 'admin4', 'admin4@kandypack.com', '$2b$10$0UYd4sI4IvuCjHlcIyWXVO7zQI23pUQdyNTI1ZClE502Z9fLZyDoy');

INSERT INTO Store (store_id, name, city, address, capacity) VALUES
('e28cf701-474a-440f-bca9-2f90605aa65b', 'Kandy Central Store', 'New York', '100 Candy Blvd', 1000),
('8683216c-ce35-4024-83fa-bfa73005d431', 'Sweet Depot LA', 'Los Angeles', '200 Sugar St', 800),
('a44f797f-45ff-40a7-99c0-d946e8c4ad42', 'Candy Warehouse CHI', 'Chicago', '300 Treat Ave', 1200),
('b5c6d7e8-9f0a-4b1c-2d3e-4f5a6b7c8d9e', 'Sweet Haven Boston', 'Boston', '400 Maple Way', 900),
('c6d7e8f9-0a1b-4c2d-3e4f-5a6b7c8d9e0f', 'Candy Hub Miami', 'Miami', '500 Palm Dr', 1100),
('d7e8f9a0-1b2c-4d3e-4f5a-6b7c8d9e0f1a', 'Treat Station Seattle', 'Seattle', '600 Rainier Ave', 950);

INSERT INTO Assistant (assistant_id, name, weekly_hours, status, store_id) VALUES
('fd160307-a56a-4f04-b88d-6422d29496a3', 'Alice Johnson', 35, 'Active', 'e28cf701-474a-440f-bca9-2f90605aa65b'),  -- New York
('98b43b99-6e29-4f1f-8eac-d0384350db96', 'Bob Smith', 40, 'Active', '8683216c-ce35-4024-83fa-bfa73005d431'),  -- Los Angeles
('90e7ff56-407a-4ba3-a6ed-277953862c73', 'Carol Davis', 30, 'Inactive', 'a44f797f-45ff-40a7-99c0-d946e8c4ad42'), -- Chicago
('2e3f4a5b-6c7d-4e8f-9a0b-1c2d3e4f5a6b', 'Dilani Fonseka', 35, 'Active', 'b5c6d7e8-9f0a-4b1c-2d3e-4f5a6b7c8d9e'),  -- Boston
('3f4a5b6c-7d8e-4f9a-0b1c-2d3e4f5a6b7c', 'Ranjith Bandara', 30, 'Active', 'c6d7e8f9-0a1b-4c2d-3e4f-5a6b7c8d9e0f'),  -- Miami
('4a5b6c7d-8e9f-4a0b-1c2d-3e4f5a6b7c8d', 'Chathura Senanayake', 32, 'Inactive', 'd7e8f9a0-1b2c-4d3e-4f5a-6b7c8d9e0f1a'), -- Seattle
('5b6c7d8e-9f0a-4b1c-2d3e-4f5a6b7c8d9e', 'Thilini Perera', 38, 'Active', 'e28cf701-474a-440f-bca9-2f90605aa65b'),  -- New York
('6c7d8e9f-0a1b-4c2d-3e4f-5a6b7c8d9e0f', 'Asoka Wijewardena', 34, 'Active', '8683216c-ce35-4024-83fa-bfa73005d431'),  -- Los Angeles
('7d8e9f0a-1b2c-4d3e-4f5a-6b7c8d9e0f1a', 'Chaminda Silva', 36, 'Active', 'a44f797f-45ff-40a7-99c0-d946e8c4ad42'), -- Chicago
('8e9f0a1b-2c3d-4e4f-5a6b-7c8d9e0f1a2b', 'Sithara Jayasuriya', 33, 'On Leave', 'b5c6d7e8-9f0a-4b1c-2d3e-4f5a6b7c8d9e'),  -- Boston
('9f0a1b2c-3d4e-4f5a-6b7c-8d9e0f1a2b3c', 'Lahiru Fernando', 35, 'Active', 'c6d7e8f9-0a1b-4c2d-3e4f-5a6b7c8d9e0f'),  -- Miami
('0a1b2c3d-4e5f-4a6b-7c8d-9e0f1a2b3c4d', 'Nirosha Dissanayake', 30, 'Active', 'd7e8f9a0-1b2c-4d3e-4f5a-6b7c8d9e0f1a'), -- Seattle
('1b2c3d4e-5f6a-4b7c-8d9e-0f1a2b3c4d5e', 'Upul Rathnayake', 32, 'Active', 'e28cf701-474a-440f-bca9-2f90605aa65b'),  -- New York
('2c3d4e5f-6a7b-4c8d-9e0f-1a2b3c4d5e6f', 'Malika Wijesinghe', 34, 'Inactive', '8683216c-ce35-4024-83fa-bfa73005d431'),  -- Los Angeles
('3d4e5f6a-7b8c-4d9e-0f1a-2b3c4d5e6f7a', 'Sandun Perera', 36, 'Active', 'a44f797f-45ff-40a7-99c0-d946e8c4ad42'), -- Chicago
('4e5f6a7b-8c9d-4e0f-1a2b-3c4d5e6f7a8b', 'Anjali Gunawardena', 35, 'Active', 'b5c6d7e8-9f0a-4b1c-2d3e-4f5a6b7c8d9e'),  -- Boston
('5f6a7b8c-9d0e-4f1a-2b3c-4d5e6f7a8b9c', 'Ruwanthi Mendis', 33, 'Active', 'c6d7e8f9-0a1b-4c2d-3e4f-5a6b7c8d9e0f'),  -- Miami
('6a7b8c9d-0e1f-4a2b-3c4d-5e6f7a8b9c0d', 'Kasun Jayasinghe', 34, 'Active', 'd7e8f9a0-1b2c-4d3e-4f5a-6b7c8d9e0f1a'); -- Seattle

INSERT INTO Customer (customer_id, name, type, address, city, phone, email, password) VALUES
('3f0459e3-df95-4ad4-b94c-6b0c67290027', 'Tharaka', 'Retail', '123 Main St', 'New York', '555-0101', 'retailA@example.com', '$2a$10$kYrzF8Wp1z0stIiW6ERE.ubgN7tfyrdqcRAVg8EEBezDPcJqi.q4K'),
('29fc8097-6caf-4918-adec-0e700393ea6d', 'Buvindu', 'Wholesale', '456 Oak Ave', 'Los Angeles', '555-0102', 'wholesaleB@example.com', '$2a$10$79f05sKVufY36RCgaqEe/ubAREGLslgvnRpE4mhZBy4mJAOlUysuO'),
('c7538e0f-7ad2-4f9b-85aa-31a7b0487d42', 'Tharumini', 'Corporate', '789 Pine Rd', 'Chicago', '555-0103', 'corporateC@example.com', '$2a$10$gOWbfqxOPKnuIvQBljiccuapV2GQ8gZY4XCAQnR13Ovl/dirEPiA2'),
('b1a4c2d3-6f7e-4abc-9d12-3e4f5a6b7c8d', 'Neela', 'Corporate', '456 Lakeview Dr', 'Miami', '555-0104', 'neela@example.com', '$2a$10$Ravp58SJ.MJMlSJ.FZENm.SkldjfO4jCm5RntKrHUAO4nBxhshBLe'),
('a1b2c3d4-5e6f-4a1b-8c2d-3e4f5a6b7c8d', 'Nimal Wijesinghe', 'Retail', '234 Elm St', 'Boston', '555-0105', 'nimal.w@example.com', '$2a$10$KWWwcgEPoraQ/nJ.otpwm..qZI6F..yJ1HRFUH6sS707h/oOlY2he'),
('b2c3d4e5-6f7a-4b2c-9d3e-4f5a6b7c8d9e', 'Kusuma Fernando', 'Wholesale', '567 Cedar Ave', 'Miami', '555-0106', 'kusuma.f@example.com', '$2a$10$RDIZEakAZQjOp/2GRbhBSe546xPrbga6OIMcoRnZXEL3FD/UrojKq'),
('c3d4e5f6-7a8b-4c3d-0e4f-5a6b7c8d9e0f', 'Lanka Traders', 'Corporate', '890 Birch Rd', 'Seattle', '555-0107', 'lanka.traders@example.com', '$2a$10$9j7LMzxKRtIj9GbcnHo2DuyMDzJfwFMv08lFC46C8aowkNviVSFP2'),
('d4e5f6a7-8b9c-4d4e-1f5a-6b7c8d9e0f1a', 'Sunil Perera', 'Retail', '123 Spruce Ln', 'Denver', '555-0108', 'sunil.p@example.com', '$2a$10$q6W2j/4TWpmtCAc5WSQ33e9JKcoeJGAGLSDKQZ7vhyvkrjLPSmzmW'),
('e5f6a7b8-9c0d-4e5f-2a6b-7c8d9e0f1a2b', 'Amara Silva', 'Wholesale', '456 Pine St', 'Houston', '555-0109', 'amara.s@example.com', '$2a$10$awZa21I/3tqrAu7SSQO2yO/5hfwBbvI3BWGlW8airytnAAmOEeyPO'),
('f6a7b8c9-0d1e-4f6a-3b7c-8d9e0f1a2b3c', 'Colombo Sweets', 'Corporate', '789 Oak Dr', 'Atlanta', '555-0110', 'colombo.sweets@example.com', '$2a$10$pZv24mxVCFd0WuJC1dM/dOVyZPNTakvZpS/5AJwRUDKtxR2a1K0vC'),
('a7b8c9d0-1e2f-4a7b-4c8d-9e0f1a2b3c4d', 'Ruwan Dissanayake', 'Retail', '101 Maple Ave', 'Phoenix', '555-0111', 'ruwan.d@example.com', '$2a$10$OPzsrCQSySfTb7vZ1xvYkerQa0hfGyKg8evQLeXjaR208MUv/11ZS'),
('b8c9d0e1-2f3a-4b8c-5d9e-0f1a2b3c4d5e', 'Priya Gunawardena', 'Wholesale', '234 Willow Rd', 'Dallas', '555-0112', 'priya.g@example.com', '$2a$10$NaX0dfKZH6Xh6EpPz9jJmuca5QlOyGp3yNEbYE6NpJgZ/xe2b76Im'),
('c9d0e1f2-3a4b-4c9d-6e0f-1a2b3c4d5e6f', 'Sweet Deals Inc.', 'Corporate', '567 Poplar St', 'San Francisco', '555-0113', 'sweet.deals@example.com', '$2a$10$niGK06HHpnLOf3i6369ki.GOYBSpcy0YEHGl.UKv6.dYSdX7XnHQW'),
('d0e1f2a3-4b5c-4d0e-7f1a-2b3c4d5e6f7a', 'Anura Jayasinghe', 'Retail', '890 Cedar Ln', 'Portland', '555-0114', 'anura.j@example.com', '$2a$10$MzWp6dasHpcsWI/ySw4VbuKRbz.vtOJGpG76E4TI94QqwncngE2qO'),
('e1f2a3b4-5c6d-4e1f-8a2b-3c4d5e6f7a8b', 'Mala Rathnayake', 'Wholesale', '123 Birch Ave', 'Austin', '555-0115', 'mala.r@example.com', '$2a$10$MEayb4NI8eVuGh.XWIjn0.T0TNhRAERfVBT2sCEu2HmvmmzZyKpxq'),
('f2a3b4c5-6d7e-4f2a-9b3c-4d5e6f7a8b9c', 'Candy Corner Ltd.', 'Corporate', '456 Elm Dr', 'New York', '555-0116', 'candy.corner@example.com', '$2a$10$MEayb4NI8eVuGh.XWIjn0.T0TNhRAERfVBT2sCEu2HmvmmzZyKpxq'),
('a3b4c5d6-7e8f-4a3b-0c4d-5e6f7a8b9c0d', 'Sanjaya Mendis', 'Retail', '789 Spruce St', 'San Diego', '555-0117', 'sanjaya.m@example.com', '$2a$10$VkcGzG.Dn3i6chfS0so2Ce9ZeWigvkVMuSXaFH/uM4Oeq/PTjvwYu'),
('b4c5d6e7-8f9a-4b4c-1d5e-6f7a8b9c0d1e', 'Nayana Kumari', 'Wholesale', '101 Oak Rd', 'Charlotte', '555-0118', 'nayana.k@example.com', '$2a$10$So0z0zT45RsQ3v7z53LG3uPz9SmPVU7qUExdkrTcWgjfmGRikAqi.'),
('c5d6e7f8-9a0b-4c5d-2e6f-7a8b9c0d1e2f', 'Global Sweets Co.', 'Corporate', '234 Pine Ave', 'Minneapolis', '555-0119', 'global.sweets@example.com', '$2a$10$kfTi4.S0ny5uQHlPafbLAe81izBYCqbirJGhWdYlmTZL9F/PDLQPi'),
('d6e7f8a9-0b1c-4d6e-3f7a-8b9c0d1e2f3a', 'Kamal Wijeratne', 'Retail', '567 Maple Ln', 'Cleveland', '555-0120', 'kamal.w@example.com', '$2a$10$D9U.9sCeZRzbpelhdjAAZuKJJ08vK7AmTa6o5eJqIAgCahLHva4..'),
('e7f8a9b0-1c2d-4e7f-4a8b-9c0d1e2f3a4b', 'Dilani Fonseka', 'Wholesale', '890 Cedar Dr', 'Orlando', '555-0121', 'dilani.f@example.com', '$2a$10$naNXScnKEQEs2i1PWb8RZuhu.XUvWqhcYIyN09dBu/tarNhf6IA2S'),
('f8a9b0c1-2d3e-4f8a-5b9c-0d1e2f3a4b5c', 'Sweet Haven Stores', 'Corporate', '123 Willow St', 'Tampa', '555-0122', 'sweet.haven@example.com', '$2a$10$RdElWci9jHmwxXR5n9L/OeexYHEScfHDo0O8nrD6CqYnku8LcmhUS'),
('a9b0c1d2-3e4f-4a9b-6c0d-1e2f3a4b5c6d', 'Ranjith Bandara', 'Retail', '456 Birch Rd', 'St. Louis', '555-0123', 'ranjith.b@example.com', '$2a$10$19ht9iZczY85ftdEb6Vi1.4FVMRS8TX9kUI4C0Ws/1wZKMQVNVgaa'),
('b0c1d2e3-4f5a-4b0c-7d1e-2f3a4b5c6d7e', 'Chathura Senanayake', 'Wholesale', '789 Elm Ave', 'Pittsburgh', '555-0124', 'chathura.s@example.com', '$2a$10$v1qqo7ikaUlwU5Zt1OeaM.DEShPBOq3ZopC/hlqxAzWk9N9RsYbmi');

INSERT INTO Driver (driver_id, name, license_no, weekly_hours, status, store_id) VALUES
('1d672079-260a-48e6-9e5c-2fef6092bdf0', 'David Wilson', 'DL123456', 40, 'Active', 'e28cf701-474a-440f-bca9-2f90605aa65b'),  -- New York
('e7f72fc9-ce18-44b4-97f2-50781eb754a7', 'Eva Martinez', 'DL789012', 38, 'Active', '8683216c-ce35-4024-83fa-bfa73005d431'),  -- Los Angeles
('a9288a54-4e4a-4a49-806e-b7170502539a', 'Frank Lee', 'DL345678', 35, 'On Leave', 'a44f797f-45ff-40a7-99c0-d946e8c4ad42'), -- Chicago
('2a3b4c5d-6e7f-4a8b-9c0d-1e2f3a4b5c6d', 'Ruwan Perera', 'DL901234', 40, 'Active', 'b5c6d7e8-9f0a-4b1c-2d3e-4f5a6b7c8d9e'),  -- Boston
('3b4c5d6e-7f8a-4b9c-0d1e-2f3a4b5c6d7e', 'Nimal Fernando', 'DL567890', 38, 'Active', 'c6d7e8f9-0a1b-4c2d-3e4f-5a6b7c8d9e0f'),  -- Miami
('4c5d6e7f-8a9b-4c0d-1e2f-3a4b5c6d7e8f', 'Kumari Silva', 'DL234567', 35, 'On Leave', 'd7e8f9a0-1b2c-4d3e-4f5a-6b7c8d9e0f1a'), -- Seattle
('5d6e7f8a-9b0c-4d1e-2f3a-4b5c6d7e8f9a', 'Saman Wijesinghe', 'DL890123', 40, 'Active', 'e28cf701-474a-440f-bca9-2f90605aa65b'),  -- New York
('6e7f8a9b-0c1d-4e2f-3a4b-5c6d7e8f9a0b', 'Priya Gunawardena', 'DL456789', 36, 'Active', '8683216c-ce35-4024-83fa-bfa73005d431'),  -- Los Angeles
('7f8a9b0c-1d2e-4f3a-4b5c-6d7e8f9a0b1c', 'Anura Jayasinghe', 'DL123890', 39, 'Active', 'a44f797f-45ff-40a7-99c0-d946e8c4ad42'), -- Chicago
('8a9b0c1d-2e3f-4a4b-5c6d-7e8f9a0b1c2d', 'Mala Rathnayake', 'DL789456', 34, 'On Leave', 'b5c6d7e8-9f0a-4b1c-2d3e-4f5a6b7c8d9e'),  -- Boston
('9b0c1d2e-3f4a-4b5c-6d7e-8f9a0b1c2d3e', 'Sanjaya Mendis', 'DL345123', 40, 'Active', 'c6d7e8f9-0a1b-4c2d-3e4f-5a6b7c8d9e0f'),  -- Miami
('0c1d2e3f-4a5b-4c6d-7e8f-9a0b1c2d3e4f', 'Nayana Kumari', 'DL901567', 37, 'Active', 'd7e8f9a0-1b2c-4d3e-4f5a-6b7c8d9e0f1a'), -- Seattle
('1d2e3f4a-5b6c-4d7e-8f9a-0b1c2d3e4f5a', 'Kamal Wijeratne', 'DL678234', 38, 'Active', 'e28cf701-474a-440f-bca9-2f90605aa65b');  -- New York

INSERT INTO Product (product_id, name, description, unit_price, space_unit, stock) VALUES
('7f159ff9-2998-4b89-a994-1fb732683475', 'Chocolate Bar', 'Delicious milk chocolate treat', 2.99, 1, 10),
('4a3b6d7c-e0da-4004-90b5-baabe2fec960', 'Candy Pack', 'Assorted gummy candies', 5.49, 2, 23),
('1cb2763a-51d3-4c2c-9452-533505bf3ef5', 'Lollipop', 'Fruit-flavored lollipop on a stick', 0.99, 1, 45),
('2b3c4d5e-6f7a-4b8c-9d0e-1f2a3b4c5d6e', 'Gummy Bears', 'Colorful chewy gummy candies', 3.99, 2, 27),
('3c4d5e6f-7a8b-4c9d-0e1f-2a3b4c5d6e7f', 'Caramel Chews', 'Soft caramel candies wrapped individually', 4.49, 1, 90),
('4d5e6f7a-8b9c-4d0e-1f2a-3b4c5d6e7f8a', 'Dark Chocolate Truffles', 'Rich dark chocolate with creamy filling', 7.99, 3, 45),
('5e6f7a8b-9c0d-4e1f-2a3b-4c5d6e7f8a9b', 'Peppermint Sticks', 'Classic peppermint-flavored hard candy', 1.99, 1, 87),
('6f7a8b9c-0d1e-4f2a-3b4c-5d6e7f8a9b0c', 'Jelly Beans', 'Assorted fruit-flavored jelly beans', 3.29, 2, 23),
('7a8b9c0d-1e2f-4f2a-4c5d-6e7f8a9b0c1d', 'Toffee Crunch', 'Crunchy toffee coated in milk chocolate', 5.99, 2, 39),
('8b9c0d1e-2f3a-4a3b-5c6e-7f8a9b0c1d2e', 'Licorice Twists', 'Black licorice twists with a sweet bite', 2.79, 1, 98),
('9c0d1e2f-3a4b-4b4c-6d7f-8a9b0c1d2e3f', 'Marshmallow Pops', 'Fluffy marshmallows dipped in chocolate', 4.99, 3, 10),
('0d1e2f3a-4b5c-4c5d-7e8a-9b0c1d2e3f4a', 'Sour Worms', 'Tangy sour gummy worms', 3.49, 2, 55),
('1e2f3a4b-5c6d-4d6e-8f9b-0c1d2e3f4a5b', 'Candy Canes', 'Traditional peppermint candy canes', 1.49, 1, 56),
('7b8c9d0e-1f2a-4b3c-4d5e-6f7a8b9c0d1e', 'Milk Chocolate Almonds', 'Whole almonds coated in smooth milk chocolate', 6.99, 2, 0),
('8c9d0e1f-2a3b-4c4d-5e6f-7a8b9c0d1e2f', 'Sour Patch Kids', 'Sweet and sour chewy candies in assorted flavors', 3.79, 2, 0);

INSERT INTO Train_Schedule (train_schedule_id, departure_city, arrival_city, schedule_date, departure_time, arrival_time, capacity) VALUES
('e5f6a7b8-9c0d-4e1f-2a3b-4c5d6e7f8a9b', 'New York', 'Philadelphia', '2025-10-22', '08:00:00', '11:30:00', 600),
('f6a7b8c9-0d1e-4f2a-3b4c-5d6e7f8a9b0c', 'Philadelphia', 'Charlotte', '2025-10-22', '13:45:00', '18:15:00', 550),
('a7b8c9d0-1e2f-4a3b-4c5d-6e7f8a9b0c1d', 'Los Angeles', 'San Diego', '2025-10-23', '09:15:00', '11:45:00', 450),
('b8c9d0e1-2f3a-4b4c-5d6e-7f8a9b0c1d2e', 'Chicago', 'Minneapolis', '2025-10-23', '06:45:00', '10:30:00', 500),
('c9d0e1f2-3a4b-4c5d-6e7f-8a9b0c1d2e3f', 'Boston', 'Cleveland', '2025-10-24', '10:00:00', '14:15:00', 400),
('d0e1f2a3-4b5c-4d6e-7f8a-9b0c1d2e3f4a', 'Miami', 'Orlando', '2025-10-24', '07:00:00', '09:30:00', 600),
('e1f2a3b4-5c6d-4e7f-8a9b-0c1d2e3f4a5b', 'Seattle', 'Tampa', '2025-10-25', '08:30:00', '20:45:00', 550),
('f2a3b4c5-6d7e-4f8a-9b0c-1d2e3f4a5b6c', 'Austin', 'St. Louis', '2025-10-25', '06:15:00', '12:45:00', 500),
('a3b4c5d6-7e8f-4a9b-0c1d-2e3f4a5b6c7d', 'Pittsburgh', 'Philadelphia', '2025-10-26', '09:45:00', '12:30:00', 450),
('b4c5d6e7-8f9a-4b0c-1d2e-3f4a5b6c7d8e', 'Charlotte', 'New York', '2025-10-26', '07:15:00', '13:30:00', 400);

INSERT INTO Truck (truck_id, license_plate, capacity, status, store_id) VALUES
('f550ff2e-1080-4b29-af61-f46b009bf1ac', 'ABC-123', 1000.50, 'Available', 'e28cf701-474a-440f-bca9-2f90605aa65b'),  -- New York
('0e0862ca-9a7f-4850-bed3-040eba35b0f8', 'XYZ-456', 1500.00, 'In Use', '8683216c-ce35-4024-83fa-bfa73005d431'),  -- Los Angeles
('fd160307-a56a-4f04-b88d-6422d29496a3', 'DEF-789', 1200.75, 'Maintenance', 'a44f797f-45ff-40a7-99c0-d946e8c4ad42'), -- Chicago
('7c8d9e0f-1a2b-4c6d-4e5f-6a7b8c9d0e1f', 'GHI-012', 1100.25, 'Available', 'b5c6d7e8-9f0a-4b1c-2d3e-4f5a6b7c8d9e'),  -- Boston
('8d9e0f1a-2b3c-4d7e-5f6a-7b8c9d0e1f2a', 'JKL-345', 1300.50, 'In Use', 'c6d7e8f9-0a1b-4c2d-3e4f-5a6b7c8d9e0f'),  -- Miami
('9e0f1a2b-3c4d-4e8f-6a7b-8c9d0e1f2a3b', 'MNO-678', 1400.00, 'Available', 'd7e8f9a0-1b2c-4d3e-4f5a-6b7c8d9e0f1a'), -- Seattle
('0f1a2b3c-4d5e-4f9a-7b8c-9d0e1f2a3b4c', 'PQR-901', 1200.25, 'Maintenance', 'e28cf701-474a-440f-bca9-2f90605aa65b'),  -- New York
('1a2b3c4d-5e6f-4a0b-8c9d-0e1f2a3b4c5d', 'STU-234', 1150.75, 'Available', '8683216c-ce35-4024-83fa-bfa73005d431'),  -- Los Angeles
('2b3c4d5e-6f7a-4b8c-9d0e-1f2a3b4c5d6e', 'VWX-567', 1250.50, 'In Use', 'a44f797f-45ff-40a7-99c0-d946e8c4ad42'), -- Chicago
('3c4d5e6f-7a8b-4c9d-0e1f-2a3b4c5d6e7f', 'YZA-890', 1350.00, 'Available', 'b5c6d7e8-9f0a-4b1c-2d3e-4f5a6b7c8d9e'),  -- Boston
('4d5e6f7a-8b9c-4d0e-1f2a-3b4c5d6e7f8a', 'BCD-123', 1450.25, 'In Use', 'c6d7e8f9-0a1b-4c2d-3e4f-5a6b7c8d9e0f'),  -- Miami
('5e6f7a8b-9c0d-4e1f-2a3b-4c5d6e7f8a9b', 'EFG-456', 1050.75, 'Maintenance', 'd7e8f9a0-1b2c-4d3e-4f5a-6b7c8d9e0f1a'), -- Seattle
('6f7a8b9c-0d1e-4f2a-3b4c-5d6e7f8a9b0c', 'HIJ-789', 1550.00, 'Available', 'e28cf701-474a-440f-bca9-2f90605aa65b');  -- New York

INSERT INTO Route (route_id, store_id, stops, max_delivery_time) VALUES
('98b43b99-6e29-4f1f-8eac-d0384350db96', 'e28cf701-474a-440f-bca9-2f90605aa65b', 'Downtown NY, Midtown NY, Brooklyn', 120),
('90e7ff56-407a-4ba3-a6ed-277953862c73', '8683216c-ce35-4024-83fa-bfa73005d431', 'Hollywood, Downtown LA, Santa Monica', 90),
('3f0459e3-df95-4ad4-b94c-6b0c67290027', 'a44f797f-45ff-40a7-99c0-d946e8c4ad42', 'Loop CHI, North Side, South Side', 150),
('e8f9a0b1-2c3d-4e4f-5a6b-7c8d9e0f1a2b', 'e28cf701-474a-440f-bca9-2f90605aa65b', 'Queens, Bronx, Staten Island', 180),  -- NY store route 2
('f9a0b1c2-3d4e-4f5a-6b7c-8d9e0f1a2b3c', 'e28cf701-474a-440f-bca9-2f90605aa65b', 'Upper East Side, Harlem, Chelsea', 100),  -- NY store route 3
('a0b1c2d3-4e5f-4a6b-7c8d-9e0f1a2b3c4d', '8683216c-ce35-4024-83fa-bfa73005d431', 'Beverly Hills, Venice, Pasadena', 110),  -- LA store route 2
('b1c2d3e4-5f6a-4b7c-8d9e-0f1a2b3c4d5e', 'a44f797f-45ff-40a7-99c0-d946e8c4ad42', 'West Side, Lakefront, Suburbs', 140),  -- CHI store route 2
('c2d3e4f5-6a7b-4c8d-9e0f-1a2b3c4d5e6f', 'b5c6d7e8-9f0a-4b1c-2d3e-4f5a6b7c8d9e', 'Downtown Boston, Back Bay, Cambridge', 130),  -- Boston store route 1
('d3e4f5a6-7b8c-4d9e-0f1a-2b3c4d5e6f7a', 'b5c6d7e8-9f0a-4b1c-2d3e-4f5a6b7c8d9e', 'Fenway, South End, North End', 95),  -- Boston store route 2
('e4f5a6b7-8c9d-4e0f-1a2b-3c4d5e6f7a8b', 'c6d7e8f9-0a1b-4c2d-3e4f-5a6b7c8d9e0f', 'South Beach, Downtown Miami, Coral Gables', 105);  -- Miami store route 1 (only 1 for Miami, to vary)

INSERT INTO `Order` (order_id, customer_id, order_date, required_date, status, total_value) VALUES
('29fc8097-6caf-4918-adec-0e700393ea6d', '3f0459e3-df95-4ad4-b94c-6b0c67290027', '2025-09-01', '2025-09-10', 'Processing', 50.00),
('c7538e0f-7ad2-4f9b-85aa-31a7b0487d42', '29fc8097-6caf-4918-adec-0e700393ea6d', '2025-09-05', '2025-09-15', 'Processing', 100.00),
('1d672079-260a-48e6-9e5c-2fef6092bdf0', 'c7538e0f-7ad2-4f9b-85aa-31a7b0487d42', '2025-09-10', '2025-09-20', 'Delivered', 75.50),
('2f3a4b5c-6d7e-4f8a-9b0c-1d2e3f4a5b6c', 'a1b2c3d4-5e6f-4a1b-8c2d-3e4f5a6b7c8d', '2025-10-01', '2025-10-08', 'Processing', 45.00),
('3a4b5c6d-7e8f-4a2b-0c1d-2e3f4a5b6c7d', 'b2c3d4e5-6f7a-4b2c-9d3e-4f5a6b7c8d9e', '2025-10-02', '2025-10-09', 'Delivered', 120.50),
('4b5c6d7e-8f9a-4b3c-1d2e-3f4a5b6c7d8e', 'c3d4e5f6-7a8b-4c3d-0e4f-5a6b7c8d9e0f', '2025-10-03', '2025-10-10', 'Delivered', 80.25),
('5c6d7e8f-9a0b-4c4d-2e3f-4a5b6c7d8e9f', 'd4e5f6a7-8b9c-4d4e-1f5a-6b7c8d9e0f1a', '2025-10-04', '2025-10-11', 'Processing', 60.75),
('6d7e8f9a-0b1c-4d5e-3f4a-5b6c7d8e9f0a', 'e5f6a7b8-9c0d-4e5f-2a6b-7c8d9e0f1a2b', '2025-10-05', '2025-10-12', 'Delivered', 95.00),
('7e8f9a0b-1c2d-4e6f-4a5b-6c7d8e9f0a1b', 'f6a7b8c9-0d1e-4f6a-3b7c-8d9e0f1a2b3c', '2025-10-06', '2025-10-13', 'Delivered', 150.00),
('8f9a0b1c-2d3e-4f7a-5b6c-7d8e9f0a1b2c', 'a7b8c9d0-1e2f-4a7b-4c8d-9e0f1a2b3c4d', '2025-10-07', '2025-10-14', 'Processing', 70.50),
('9a0b1c2d-3e4f-4a8b-6c7d-8e9f0a1b2c3d', 'b8c9d0e1-2f3a-4b8c-5d9e-0f1a2b3c4d5e', '2025-10-08', '2025-10-15', 'Delivered', 110.25),
('0b1c2d3e-4f5a-4b9c-7d8e-9f0a1b2c3d4e', 'c9d0e1f2-3a4b-4c9d-6e0f-1a2b3c4d5e6f', '2025-10-09', '2025-10-16', 'Delivered', 85.00),
('1c2d3e4f-5a6b-4c0d-8e9f-0a1b2c3d4e5f', 'd0e1f2a3-4b5c-4d0e-7f1a-2b3c4d5e6f7a', '2025-10-10', '2025-10-17', 'Processing', 55.75),
('2d3e4f5a-6b7c-4d1e-9f0a-1b2c3d4e5f6a', 'e1f2a3b4-5c6d-4e1f-8a2b-3c4d5e6f7a8b', '2025-10-11', '2025-10-18', 'Delivered', 130.00),
('3e4f5a6b-7c8d-4e2f-0a1b-2c3d4e5f6a7b', 'f2a3b4c5-6d7e-4f2a-9b3c-4d5e6f7a8b9c', '2025-10-12', '2025-10-19', 'Delivered', 90.50),
('4f5a6b7c-8d9e-4f3a-1b2c-3d4e5f6a7b8c', 'a3b4c5d6-7e8f-4a3b-0c4d-5e6f7a8b9c0d', '2025-10-13', '2025-10-20', 'Processing', 65.25),
('5a6b7c8d-9e0f-4a4b-2c3d-4e5f6a7b8c9d', 'b4c5d6e7-8f9a-4b4c-1d5e-6f7a8b9c0d1e', '2025-10-14', '2025-10-21', 'Delivered', 100.00),
('6b7c8d9e-0f1a-4b5c-3d4e-5f6a7b8c9d0e', 'c5d6e7f8-9a0b-4c5d-2e6f-7a8b9c0d1e2f', '2025-10-15', '2025-10-22', 'Delivered', 75.75),
('7c8d9e0f-1a2b-4c6d-4e5f-6a7b8c9d0e1f', 'd6e7f8a9-0b1c-4d6e-3f7a-8b9c0d1e2f3a', '2025-10-16', '2025-10-23', 'Processing', 50.50),
('8d9e0f1a-2b3c-4d7e-5f6a-7b8c9d0e1f2a', 'e7f8a9b0-1c2d-4e7f-4a8b-9c0d1e2f3a4b', '2025-10-17', '2025-10-24', 'Delivered', 115.25),
('9e0f1a2b-3c4d-4e8f-6a7b-8c9d0e1f2a3b', 'f8a9b0c1-2d3e-4f8a-5b9c-0d1e2f3a4b5c', '2025-10-18', '2025-10-25', 'Delivered', 95.00),
('0f1a2b3c-4d5e-4f9a-7b8c-9d0e1f2a3b4c', 'a9b0c1d2-3e4f-4a9b-6c0d-1e2f3a4b5c6d', '2025-10-19', '2025-10-26', 'Processing', 60.00),
('1a2b3c4d-5e6f-4a0b-8c9d-0e1f2a3b4c5d', 'b0c1d2e3-4f5a-4b0c-7d1e-2f3a4b5c6d7e', '2025-10-20', '2025-10-27', 'Delivered', 105.50),
('9b0c1d2e-3f4a-4b5c-6d7e-8f9a0b1c2d3e', 'e1f2a3b4-5c6d-4e1f-8a2b-3c4d5e6f7a8b', '2025-10-22', '2025-10-29', 'Pending', 108.84),   -- Mala Rathnayake
('0c1d2e3f-4a5b-4c6d-7e8f-9a0b1c2d3e4f', 'f2a3b4c5-6d7e-4f2a-9b3c-4d5e6f7a8b9c', '2025-10-23', '2025-10-30', 'Pending', 145.82), -- Candy Corner Ltd.
('1d2e3f4a-5b6c-4d7e-8f9a-0b1c2d3e4f5a', 'a3b4c5d6-7e8f-4a3b-0c4d-5e6f7a8b9c0d', '2025-10-24', '2025-10-31', 'Pending', 84.73),    -- Sanjaya Mendis
('2e3f4a5b-6c7d-4e8f-9a0b-1c2d3e4f5a6b', 'b4c5d6e7-8f9a-4b4c-1d5e-6f7a8b9c0d1e', '2025-10-25', '2025-11-01', 'Pending', 119.88), -- Nayana Kumari
('3f4a5b6c-7d8e-4f9a-0b1c-2d3e4f5a6b7c', 'c5d6e7f8-9a0b-4c5d-2e6f-7a8b9c0d1e2f', '2025-10-26', '2025-11-02', 'Pending', 165.61),   -- Global Sweets Co.
('4a5b6c7d-8e9f-4a0b-1c2d-3e4f5a6b7c8d', 'd6e7f8a9-0b1c-4d6e-3f7a-8b9c0d1e2f3a', '2025-10-27', '2025-11-03', 'Pending', 93.44), -- Kamal Wijeratne
('5b6c7d8e-9f0a-4b1c-2d3e-4f5a6b7c8d9e', 'e7f8a9b0-1c2d-4e7f-4a8b-9c0d1e2f3a4b', '2025-10-28', '2025-11-04', 'Pending', 110.77),  -- Dilani Fonseka
('6c7d8e9f-0a1b-4c2d-3e4f-5a6b7c8d9e0f', 'f8a9b0c1-2d3e-4f8a-5b9c-0d1e2f3a4b5c', '2025-10-29', '2025-11-05', 'Pending', 132.55), -- Sweet Haven Stores
('7d8e9f0a-1b2c-4d3e-4f5a-6b7c8d9e0f1a', 'a9b0c1d2-3e4f-4a9b-6c0d-1e2f3a4b5c6d', '2025-10-30', '2025-11-06', 'Pending', 102.83),   -- Ranjith Bandara
('8e9f0a1b-2c3d-4e4f-5a6b-7c8d9e0f1a2b', 'b0c1d2e3-4f5a-4b0c-7d1e-2f3a4b5c6d7e', '2025-10-31', '2025-11-07', 'Pending', 121.40); -- Chathura Senanayake

INSERT INTO Delivery_Schedule (delivery_id, route_id, truck_id, driver_id, assistant_id, delivery_date, status) VALUES
('e7f72fc9-ce18-44b4-97f2-50781eb754a7', '98b43b99-6e29-4f1f-8eac-d0384350db96', 'f550ff2e-1080-4b29-af61-f46b009bf1ac', '1d672079-260a-48e6-9e5c-2fef6092bdf0', 'fd160307-a56a-4f04-b88d-6422d29496a3', '2025-11-12', 'Scheduled'),
('a9288a54-4e4a-4a49-806e-b7170502539a', '90e7ff56-407a-4ba3-a6ed-277953862c73', '0e0862ca-9a7f-4850-bed3-040eba35b0f8', 'e7f72fc9-ce18-44b4-97f2-50781eb754a7', '98b43b99-6e29-4f1f-8eac-d0384350db96', '2025-11-15', 'In Progress'),
('7f159ff9-2998-4b89-a994-1fb732683475', '3f0459e3-df95-4ad4-b94c-6b0c67290027', 'fd160307-a56a-4f04-b88d-6422d29496a3', 'a9288a54-4e4a-4a49-806e-b7170502539a', '90e7ff56-407a-4ba3-a6ed-277953862c73', '2025-12-18', 'Completed'),
('f5a6b7c8-9d0e-4f1a-2b3c-4d5e6f7a8b9c', 'e8f9a0b1-2c3d-4e4f-5a6b-7c8d9e0f1a2b', 'f550ff2e-1080-4b29-af61-f46b009bf1ac', '1d672079-260a-48e6-9e5c-2fef6092bdf0', 'fd160307-a56a-4f04-b88d-6422d29496a3', '2025-10-15', 'Scheduled'),
('a6b7c8d9-0e1f-4a2b-3c4d-5e6f7a8b9c0d', 'f9a0b1c2-3d4e-4f5a-6b7c-8d9e0f1a2b3c', '0e0862ca-9a7f-4850-bed3-040eba35b0f8', 'e7f72fc9-ce18-44b4-97f2-50781eb754a7', '98b43b99-6e29-4f1f-8eac-d0384350db96', '2025-10-16', 'In Progress'),
('b7c8d9e0-1f2a-4b3c-4d5e-6f7a8b9c0d1e', 'a0b1c2d3-4e5f-4a6b-7c8d-9e0f1a2b3c4d', 'fd160307-a56a-4f04-b88d-6422d29496a3', 'a9288a54-4e4a-4a49-806e-b7170502539a', '90e7ff56-407a-4ba3-a6ed-277953862c73', '2025-10-17', 'Scheduled'),
('c8d9e0f1-2a3b-4c4d-5e6f-7a8b9c0d1e2f', 'b1c2d3e4-5f6a-4b7c-8d9e-0f1a2b3c4d5e', 'f550ff2e-1080-4b29-af61-f46b009bf1ac', '1d672079-260a-48e6-9e5c-2fef6092bdf0', 'fd160307-a56a-4f04-b88d-6422d29496a3', '2025-10-18', 'Completed'),
('d9e0f1a2-3b4c-4d5e-6f7a-8b9c0d1e2f3a', 'c2d3e4f5-6a7b-4c8d-9e0f-1a2b3c4d5e6f', '0e0862ca-9a7f-4850-bed3-040eba35b0f8', 'e7f72fc9-ce18-44b4-97f2-50781eb754a7', '98b43b99-6e29-4f1f-8eac-d0384350db96', '2025-10-19', 'Scheduled'),
('e0f1a2b3-4c5d-4e6f-7a8b-9c0d1e2f3a4b', 'd3e4f5a6-7b8c-4d9e-0f1a-2b3c4d5e6f7a', 'fd160307-a56a-4f04-b88d-6422d29496a3', 'a9288a54-4e4a-4a49-806e-b7170502539a', '90e7ff56-407a-4ba3-a6ed-277953862c73', '2025-10-20', 'In Progress'),
('f1a2b3c4-5d6e-4f7a-8b9c-0d1e2f3a4b5c', 'e4f5a6b7-8c9d-4e0f-1a2b-3c4d5e6f7a8b', 'f550ff2e-1080-4b29-af61-f46b009bf1ac', '1d672079-260a-48e6-9e5c-2fef6092bdf0', 'fd160307-a56a-4f04-b88d-6422d29496a3', '2025-10-21', 'Scheduled');

INSERT INTO Allocation (allocation_id, train_schedule_id, order_id, space_consumed, store_id) VALUES
('4a3b6d7c-e0da-4004-90b5-baabe2fec960', 'a7b8c9d0-1e2f-4a3b-4c5d-6e7f8a9b0c1d', '29fc8097-6caf-4918-adec-0e700393ea6d', 5, 'e28cf701-474a-440f-bca9-2f90605aa65b'),
('1cb2763a-51d3-4c2c-9452-533505bf3ef5', 'e1f2a3b4-5c6d-4e7f-8a9b-0c1d2e3f4a5b', 'c7538e0f-7ad2-4f9b-85aa-31a7b0487d42', 10, '8683216c-ce35-4024-83fa-bfa73005d431'),
('e28cf701-474a-440f-bca9-2f90605aa65b', 'f2a3b4c5-6d7e-4f8a-9b0c-1d2e3f4a5b6c', '1d672079-260a-48e6-9e5c-2fef6092bdf0', 8, 'a44f797f-45ff-40a7-99c0-d946e8c4ad42');

INSERT INTO Order_Item (product_id, order_id, quantity, sub_total) VALUES
('7f159ff9-2998-4b89-a994-1fb732683475', '29fc8097-6caf-4918-adec-0e700393ea6d', 10, 29.90),
('4a3b6d7c-e0da-4004-90b5-baabe2fec960', 'c7538e0f-7ad2-4f9b-85aa-31a7b0487d42', 15, 82.35),
('1cb2763a-51d3-4c2c-9452-533505bf3ef5', '1d672079-260a-48e6-9e5c-2fef6092bdf0', 20, 19.80),
('7f159ff9-2998-4b89-a994-1fb732683475', '2f3a4b5c-6d7e-4f8a-9b0c-1d2e3f4a5b6c', 8, 23.92),  -- Chocolate Bar: 8 * 2.99
('4a3b6d7c-e0da-4004-90b5-baabe2fec960', '3a4b5c6d-7e8f-4a2b-0c1d-2e3f4a5b6c7d', 12, 65.88), -- Candy Pack: 12 * 5.49
('1cb2763a-51d3-4c2c-9452-533505bf3ef5', '4b5c6d7e-8f9a-4b3c-1d2e-3f4a5b6c7d8e', 15, 14.85), -- Lollipop: 15 * 0.99
('2b3c4d5e-6f7a-4b8c-9d0e-1f2a3b4c5d6e', '5c6d7e8f-9a0b-4c4d-2e3f-4a5b6c7d8e9f', 10, 39.90), -- Gummy Bears: 10 * 3.99
('3c4d5e6f-7a8b-4c9d-0e1f-2a3b4c5d6e7f', '6d7e8f9a-0b1c-4d5e-3f4a-5b6c7d8e9f0a', 20, 89.80), -- Caramel Chews: 20 * 4.49
('4d5e6f7a-8b9c-4d0e-1f2a-3b4c5d6e7f8a', '7e8f9a0b-1c2d-4e6f-4a5b-6c7d8e9f0a1b', 5, 39.95),  -- Dark Chocolate Truffles: 5 * 7.99
('5e6f7a8b-9c0d-4e1f-2a3b-4c5d6e7f8a9b', '8f9a0b1c-2d3e-4f7a-5b6c-7d8e9f0a1b2c', 25, 49.75), -- Peppermint Sticks: 25 * 1.99
('6f7a8b9c-0d1e-4f2a-3b4c-5d6e7f8a9b0c', '9a0b1c2d-3e4f-4a8b-6c7d-8e9f0a1b2c3d', 15, 49.35), -- Jelly Beans: 15 * 3.29
('7a8b9c0d-1e2f-4f2a-4c5d-6e7f8a9b0c1d', '0b1c2d3e-4f5a-4b9c-7d8e-9f0a1b2c3d4e', 10, 59.90), -- Toffee Crunch: 10 * 5.99
('8b9c0d1e-2f3a-4a3b-5c6e-7f8a9b0c1d2e', '1c2d3e4f-5a6b-4c0d-8e9f-0a1b2c3d4e5f', 20, 55.80), -- Licorice Twists: 20 * 2.79
('9c0d1e2f-3a4b-4b4c-6d7f-8a9b0c1d2e3f', '2d3e4f5a-6b7c-4d1e-9f0a-1b2c3d4e5f6a', 8, 39.92),  -- Marshmallow Pops: 8 * 4.99
('0d1e2f3a-4b5c-4c5d-7e8a-9b0c1d2e3f4a', '3e4f5a6b-7c8d-4e2f-0a1b-2c3d4e5f6a7b', 12, 41.88), -- Sour Worms: 12 * 3.49
('1e2f3a4b-5c6d-4d6e-8f9b-0c1d2e3f4a5b', '4f5a6b7c-8d9e-4f3a-1b2c-3d4e5f6a7b8c', 30, 44.70), -- Candy Canes: 30 * 1.49
('7f159ff9-2998-4b89-a994-1fb732683475', '5a6b7c8d-9e0f-4a4b-2c3d-4e5f6a7b8c9d', 10, 29.90), -- Chocolate Bar: 10 * 2.99
('4a3b6d7c-e0da-4004-90b5-baabe2fec960', '6b7c8d9e-0f1a-4b5c-3d4e-5f6a7b8c9d0e', 15, 82.35), -- Candy Pack: 15 * 5.49
('1cb2763a-51d3-4c2c-9452-533505bf3ef5', '7c8d9e0f-1a2b-4c6d-4e5f-6a7b8c9d0e1f', 20, 19.80), -- Lollipop: 20 * 0.99
('2b3c4d5e-6f7a-4b8c-9d0e-1f2a3b4c5d6e', '8d9e0f1a-2b3c-4d7e-5f6a-7b8c9d0e1f2a', 10, 39.90), -- Gummy Bears: 10 * 3.99
('3c4d5e6f-7a8b-4c9d-0e1f-2a3b4c5d6e7f', '9e0f1a2b-3c4d-4e8f-6a7b-8c9d0e1f2a3b', 12, 53.88), -- Caramel Chews: 12 * 4.49
('4d5e6f7a-8b9c-4d0e-1f2a-3b4c5d6e7f8a', '0f1a2b3c-4d5e-4f9a-7b8c-9d0e1f2a3b4c', 6, 47.94),  -- Dark Chocolate Truffles: 6 * 7.99
('5e6f7a8b-9c0d-4e1f-2a3b-4c5d6e7f8a9b', '1a2b3c4d-5e6f-4a0b-8c9d-0e1f2a3b4c5d', 25, 49.75), -- Peppermint Sticks: 25 * 1.99
-- Order 1: 3 products, total 108.84
('7f159ff9-2998-4b89-a994-1fb732683475', '9b0c1d2e-3f4a-4b5c-6d7e-8f9a0b1c2d3e', 12, 35.88),  -- Chocolate Bar: 12 * 2.99
('4a3b6d7c-e0da-4004-90b5-baabe2fec960', '9b0c1d2e-3f4a-4b5c-6d7e-8f9a0b1c2d3e', 7, 38.43),   -- Candy Pack: 7 * 5.49
('1cb2763a-51d3-4c2c-9452-533505bf3ef5', '9b0c1d2e-3f4a-4b5c-6d7e-8f9a0b1c2d3e', 35, 34.65),  -- Lollipop: 35 * 0.99
-- Order 2: 3 products, total 145.82
('2b3c4d5e-6f7a-4b8c-9d0e-1f2a3b4c5d6e', '0c1d2e3f-4a5b-4c6d-7e8f-9a0b1c2d3e4f', 15, 59.85),  -- Gummy Bears: 15 * 3.99
('3c4d5e6f-7a8b-4c9d-0e1f-2a3b4c5d6e7f', '0c1d2e3f-4a5b-4c6d-7e8f-9a0b1c2d3e4f', 12, 53.88),  -- Caramel Chews: 12 * 4.49
('4d5e6f7a-8b9c-4d0e-1f2a-3b4c5d6e7f8a', '0c1d2e3f-4a5b-4c6d-7e8f-9a0b1c2d3e4f', 4, 32.09),   -- Dark Chocolate Truffles: 4 * 7.99
-- Order 3: 2 products, total 84.73
('5e6f7a8b-9c0d-4e1f-2a3b-4c5d6e7f8a9b', '1d2e3f4a-5b6c-4d7e-8f9a-0b1c2d3e4f5a', 20, 39.80),  -- Peppermint Sticks: 20 * 1.99
('6f7a8b9c-0d1e-4f2a-3b4c-5d6e7f8a9b0c', '1d2e3f4a-5b6c-4d7e-8f9a-0b1c2d3e4f5a', 15, 44.93),  -- Jelly Beans: 15 * 3.29
-- Order 4: 3 products, total 119.88
('7a8b9c0d-1e2f-4f2a-4c5d-6e7f8a9b0c1d', '2e3f4a5b-6c7d-4e8f-9a0b-1c2d3e4f5a6b', 10, 59.90),  -- Toffee Crunch: 10 * 5.99
('8b9c0d1e-2f3a-4a3b-5c6e-7f8a9b0c1d2e', '2e3f4a5b-6c7d-4e8f-9a0b-1c2d3e4f5a6b', 12, 33.48),  -- Licorice Twists: 12 * 2.79
('9c0d1e2f-3a4b-4b4c-6d7f-8a9b0c1d2e3f', '2e3f4a5b-6c7d-4e8f-9a0b-1c2d3e4f5a6b', 5, 26.50),   -- Marshmallow Pops: 5 * 4.99
-- Order 5: 3 products, total 165.61
('0d1e2f3a-4b5c-4c5d-7e8a-9b0c1d2e3f4a', '3f4a5b6c-7d8e-4f9a-0b1c-2d3e4f5a6b7c', 15, 52.35),  -- Sour Worms: 15 * 3.49
('1e2f3a4b-5c6d-4d6e-8f9b-0c1d2e3f4a5b', '3f4a5b6c-7d8e-4f9a-0b1c-2d3e4f5a6b7c', 25, 37.25),  -- Candy Canes: 25 * 1.49
('7b8c9d0e-1f2a-4b3c-4d5e-6f7a8b9c0d1e', '3f4a5b6c-7d8e-4f9a-0b1c-2d3e4f5a6b7c', 8, 76.01),   -- Milk Chocolate Almonds: 8 * 6.99
-- Order 6: 2 products, total 93.44
('8c9d0e1f-2a3b-4c4d-5e6f-7a8b9c0d1e2f', '4a5b6c7d-8e9f-4a0b-1c2d-3e4f5a6b7c8d', 10, 37.90),  -- Sour Patch Kids: 10 * 3.79
('7f159ff9-2998-4b89-a994-1fb732683475', '4a5b6c7d-8e9f-4a0b-1c2d-3e4f5a6b7c8d', 19, 55.54),  -- Chocolate Bar: 19 * 2.99
-- Order 7: 3 products, total 110.77
('4a3b6d7c-e0da-4004-90b5-baabe2fec960', '5b6c7d8e-9f0a-4b1c-2d3e-4f5a6b7c8d9e', 8, 43.92),   -- Candy Pack: 8 * 5.49
('1cb2763a-51d3-4c2c-9452-533505bf3ef5', '5b6c7d8e-9f0a-4b1c-2d3e-4f5a6b7c8d9e', 20, 19.80),  -- Lollipop: 20 * 0.99
('2b3c4d5e-6f7a-4b8c-9d0e-1f2a3b4c5d6e', '5b6c7d8e-9f0a-4b1c-2d3e-4f5a6b7c8d9e', 9, 47.05),   -- Gummy Bears: 9 * 3.99
-- Order 8: 3 products, total 132.55
('3c4d5e6f-7a8b-4c9d-0e1f-2a3b4c5d6e7f', '6c7d8e9f-0a1b-4c2d-3e4f-5a6b7c8d9e0f', 10, 44.90),  -- Caramel Chews: 10 * 4.49
('4d5e6f7a-8b9c-4d0e-1f2a-3b4c5d6e7f8a', '6c7d8e9f-0a1b-4c2d-3e4f-5a6b7c8d9e0f', 5, 39.95),   -- Dark Chocolate Truffles: 5 * 7.99
('5e6f7a8b-9c0d-4e1f-2a3b-4c5d6e7f8a9b', '6c7d8e9f-0a1b-4c2d-3e4f-5a6b7c8d9e0f', 24, 47.70),  -- Peppermint Sticks: 24 * 1.99
-- Order 9: 2 products, total 102.83
('6f7a8b9c-0d1e-4f2a-3b4c-5d6e7f8a9b0c', '7d8e9f0a-1b2c-4d3e-4f5a-6b7c8d9e0f1a', 12, 39.48),  -- Jelly Beans: 12 * 3.29
('7a8b9c0d-1e2f-4f2a-4c5d-6e7f8a9b0c1d', '7d8e9f0a-1b2c-4d3e-4f5a-6b7c8d9e0f1a', 8, 63.35),   -- Toffee Crunch: 8 * 5.99
-- Order 10: 2 products, total 121.40
('8b9c0d1e-2f3a-4a3b-5c6e-7f8a9b0c1d2e', '8e9f0a1b-2c3d-4e4f-5a6b-7c8d9e0f1a2b', 15, 41.85),  -- Licorice Twists: 15 * 2.79
('9c0d1e2f-3a4b-4b4c-6d7f-8a9b0c1d2e3f', '8e9f0a1b-2c3d-4e4f-5a6b-7c8d9e0f1a2b', 10, 79.55);  -- Marshmallow Pops: 10 * 4.99

INSERT INTO Delivers (delivery_id, order_id, delivered_time) VALUES
('e7f72fc9-ce18-44b4-97f2-50781eb754a7', '29fc8097-6caf-4918-adec-0e700393ea6d', '14:30:00'),
('a9288a54-4e4a-4a49-806e-b7170502539a', 'c7538e0f-7ad2-4f9b-85aa-31a7b0487d42', '16:45:00'),
('7f159ff9-2998-4b89-a994-1fb732683475', '1d672079-260a-48e6-9e5c-2fef6092bdf0', '12:15:00'),
('f5a6b7c8-9d0e-4f1a-2b3c-4d5e6f7a8b9c', '2f3a4b5c-6d7e-4f8a-9b0c-1d2e3f4a5b6c', '15:00:00'),
('f5a6b7c8-9d0e-4f1a-2b3c-4d5e6f7a8b9c', '3a4b5c6d-7e8f-4a2b-0c1d-2e3f4a5b6c7d', '15:30:00'),
('f5a6b7c8-9d0e-4f1a-2b3c-4d5e6f7a8b9c', '4b5c6d7e-8f9a-4b3c-1d2e-3f4a5b6c7d8e', '16:00:00'),
('a6b7c8d9-0e1f-4a2b-3c4d-5e6f7a8b9c0d', '5c6d7e8f-9a0b-4c4d-2e3f-4a5b6c7d8e9f', '13:45:00'),
('a6b7c8d9-0e1f-4a2b-3c4d-5e6f7a8b9c0d', '6d7e8f9a-0b1c-4d5e-3f4a-5b6c7d8e9f0a', '14:15:00'),
('a6b7c8d9-0e1f-4a2b-3c4d-5e6f7a8b9c0d', '7e8f9a0b-1c2d-4e6f-4a5b-6c7d8e9f0a1b', '14:45:00'),
('b7c8d9e0-1f2a-4b3c-4d5e-6f7a8b9c0d1e', '8f9a0b1c-2d3e-4f7a-5b6c-7d8e9f0a1b2c', '11:00:00'),
('b7c8d9e0-1f2a-4b3c-4d5e-6f7a8b9c0d1e', '9a0b1c2d-3e4f-4a8b-6c7d-8e9f0a1b2c3d', '11:30:00'),
('b7c8d9e0-1f2a-4b3c-4d5e-6f7a8b9c0d1e', '0b1c2d3e-4f5a-4b9c-7d8e-9f0a1b2c3d4e', '12:00:00'),
('c8d9e0f1-2a3b-4c4d-5e6f-7a8b9c0d1e2f', '1c2d3e4f-5a6b-4c0d-8e9f-0a1b2c3d4e5f', '17:15:00'),
('c8d9e0f1-2a3b-4c4d-5e6f-7a8b9c0d1e2f', '2d3e4f5a-6b7c-4d1e-9f0a-1b2c3d4e5f6a', '17:45:00'),
('c8d9e0f1-2a3b-4c4d-5e6f-7a8b9c0d1e2f', '3e4f5a6b-7c8d-4e2f-0a1b-2c3d4e5f6a7b', '18:15:00'),
('d9e0f1a2-3b4c-4d5e-6f7a-8b9c0d1e2f3a', '4f5a6b7c-8d9e-4f3a-1b2c-3d4e5f6a7b8c', '10:30:00'),
('d9e0f1a2-3b4c-4d5e-6f7a-8b9c0d1e2f3a', '5a6b7c8d-9e0f-4a4b-2c3d-4e5f6a7b8c9d', '11:00:00'),
('d9e0f1a2-3b4c-4d5e-6f7a-8b9c0d1e2f3a', '6b7c8d9e-0f1a-4b5c-3d4e-5f6a7b8c9d0e', '11:30:00'),
('e0f1a2b3-4c5d-4e6f-7a8b-9c0d1e2f3a4b', '7c8d9e0f-1a2b-4c6d-4e5f-6a7b8c9d0e1f', '12:45:00'),
('e0f1a2b3-4c5d-4e6f-7a8b-9c0d1e2f3a4b', '8d9e0f1a-2b3c-4d7e-5f6a-7b8c9d0e1f2a', '13:15:00'),
('e0f1a2b3-4c5d-4e6f-7a8b-9c0d1e2f3a4b', '9e0f1a2b-3c4d-4e8f-6a7b-8c9d0e1f2a3b', '13:45:00'),
('f1a2b3c4-5d6e-4f7a-8b9c-0d1e2f3a4b5c', '0f1a2b3c-4d5e-4f9a-7b8c-9d0e1f2a3b4c', '09:00:00'),
('f1a2b3c4-5d6e-4f7a-8b9c-0d1e2f3a4b5c', '1a2b3c4d-5e6f-4a0b-8c9d-0e1f2a3b4c5d', '09:30:00');


CREATE VIEW Sales_By_City_Route AS
SELECT s.city, r.stops, d.order_id, o.total_value
FROM Route r 
JOIN Store s ON r.store_id = s.store_id
JOIN Delivery_Schedule ds ON r.route_id = ds.route_id
JOIN Delivers d ON ds.delivery_id = d.delivery_id
JOIN `Order` o ON d.order_id = o.order_id;

CREATE VIEW Customer_Order AS
SELECT 
    c.name, 
    o.order_id, 
    c.city, 
    o.order_date, 
    o.required_date, 
    oi.product_id, 
    o.total_value,
    o.status
FROM Customer c
INNER JOIN `Order` o ON o.customer_id = c.customer_id
INNER JOIN Order_Item oi ON oi.order_id = o.order_id;


-- FUNCTION FOR SETTING UUID

DELIMITER $$

CREATE FUNCTION generate_uuid(val CHAR(36))
RETURNS CHAR(36)
DETERMINISTIC
BEGIN
  RETURN IF(val IS NULL, UUID(), val);
END $$

DELIMITER ;


DELIMITER $$

CREATE TRIGGER before_insert_driver
BEFORE INSERT ON Driver
FOR EACH ROW
BEGIN
    SET NEW.driver_id = generate_uuid(NEW.driver_id);
END $$

DELIMITER ;

DELIMITER $$

CREATE TRIGGER before_insert_assistant
BEFORE INSERT ON Assistant
FOR EACH ROW
BEGIN
    SET NEW.assistant_id = generate_uuid(NEW.assistant_id);
END $$

DELIMITER ;

DELIMITER $$

CREATE TRIGGER before_insert_product
BEFORE INSERT ON Product
FOR EACH ROW
BEGIN
    SET NEW.product_id = generate_uuid(NEW.product_id);
END $$

DELIMITER ;

DELIMITER $$

CREATE TRIGGER before_insert_store
BEFORE INSERT ON Store
FOR EACH ROW
BEGIN
    SET NEW.store_id = generate_uuid(NEW.store_id);
END $$

DELIMITER ;

DELIMITER $$

CREATE TRIGGER before_insert_route
BEFORE INSERT ON Route
FOR EACH ROW
BEGIN
    SET NEW.route_id = generate_uuid(NEW.route_id);
END $$

DELIMITER ;

DELIMITER $$

CREATE TRIGGER before_insert_truck
BEFORE INSERT ON Truck
FOR EACH ROW
BEGIN
    SET NEW.truck_id = generate_uuid(NEW.truck_id);
END $$

DELIMITER ;

DELIMITER $$

CREATE TRIGGER before_insert_admin
BEFORE INSERT ON Admin
FOR EACH ROW
BEGIN
    SET NEW.admin_id = generate_uuid(NEW.admin_id);
END $$

DELIMITER ;

DELIMITER $$

CREATE TRIGGER before_insert_allocation
BEFORE INSERT ON Allocation
FOR EACH ROW
BEGIN
IF NEW.allocation_id IS NULL THEN
SET NEW.allocation_id  = UUID();
END IF;
END $$

DELIMITER ;

DELIMITER $$

DROP PROCEDURE IF EXISTS GetOrdersByRouteStore $$

CREATE PROCEDURE GetOrdersByRouteStore(IN routeId CHAR(36))
BEGIN
    SELECT 
        co.order_id,
        co.name,
        co.city,
        co.order_date,
        co.required_date,
        COUNT(co.product_id) as product_count,
        SUM(co.total_value) as total_value,
        co.status
    FROM Customer_Order co
    JOIN Allocation a ON co.order_id = a.order_id
    JOIN Route r ON r.route_id = routeId
    WHERE a.store_id = r.store_id
    GROUP BY co.order_id, co.name, co.city, co.order_date, co.required_date, co.status;
END $$

DELIMITER ;

DELIMITER $$

CREATE PROCEDURE GetOrdersByRouteStore(IN route_id_param VARCHAR(36))
BEGIN
    -- Get the store_id for the route
    DECLARE store_id_var VARCHAR(36);
    
    SELECT store_id INTO store_id_var 
    FROM Route 
    WHERE route_id = route_id_param;
    
    -- Get orders allocated to this store that haven't been assigned to a delivery yet
    SELECT 
        o.order_id,
        o.order_date,
        o.required_date,
        o.status,
        o.total_value,
        c.name,
        c.city,
        a.allocation_id,
        a.store_id,
        ts.departure_city,
        ts.arrival_city,
        ts.schedule_date,
        COUNT(oi.product_id) as product_count
    FROM 
        `Order` o
        JOIN Customer c ON o.customer_id = c.customer_id
        JOIN Order_Item oi ON o.order_id = oi.order_id
        JOIN Allocation a ON o.order_id = a.order_id
        JOIN Train_Schedule ts ON a.train_schedule_id = ts.train_schedule_id
    WHERE 
        a.store_id = store_id_var
        AND o.status = 'Processing'
        AND NOT EXISTS (
            SELECT 1 
            FROM Delivers d 
            WHERE d.order_id = o.order_id
        )
    GROUP BY 
        o.order_id, o.order_date, o.required_date, o.status, o.total_value,
        c.name, c.city, a.allocation_id, a.store_id, 
        ts.departure_city, ts.arrival_city, ts.schedule_date;
END $$

DELIMITER ;