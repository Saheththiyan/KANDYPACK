-- Create the Admin table
CREATE TABLE Admin (
    admin_id CHAR(36) NOT NULL,
    username VARCHAR(100),
    email VARCHAR(100),
    password VARCHAR(50),
    PRIMARY KEY (admin_id)
);

-- Create the Assistant table
CREATE TABLE Assistant (
    assistant_id CHAR(36) NOT NULL,
    name VARCHAR(100),
    weekly_hours INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'Active',
    PRIMARY KEY (assistant_id)
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
    password VARCHAR(50),
    PRIMARY KEY (customer_id)
);

-- Create the Driver table
CREATE TABLE Driver (
    driver_id CHAR(36) NOT NULL,
    name VARCHAR(100),
    license_no VARCHAR(20),
    weekly_hours INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'Active',
    PRIMARY KEY (driver_id)
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

-- Create the Store table
CREATE TABLE Store (
    store_id CHAR(36) NOT NULL,
    name VARCHAR(100),
    city VARCHAR(50),
    address VARCHAR(255),
    capacity INT,
    PRIMARY KEY (store_id)
);

-- Create the Train_Schedule table
CREATE TABLE Train_Schedule (
    train_schedule_id CHAR(36) NOT NULL,
    departure_city VARCHAR(50),
    arrival_city VARCHAR(50),
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
    PRIMARY KEY (truck_id)
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
('7e23eb1c-aa68-4297-a8ec-02f5681f2e5c', 'admin1', 'admin1@kandypack.com', 'hashedpass1'),
('f550ff2e-1080-4b29-af61-f46b009bf1ac', 'admin2', 'admin2@kandypack.com', 'hashedpass2'),
('0e0862ca-9a7f-4850-bed3-040eba35b0f8', 'admin3', 'admin3@kandypack.com', 'hashedpass3');

INSERT INTO Assistant (assistant_id, name, weekly_hours, status) VALUES
('fd160307-a56a-4f04-b88d-6422d29496a3', 'Alice Johnson', 35, 'Active'),
('98b43b99-6e29-4f1f-8eac-d0384350db96', 'Bob Smith', 40, 'Active'),
('90e7ff56-407a-4ba3-a6ed-277953862c73', 'Carol Davis', 30, 'Inactive'),
('2e3f4a5b-6c7d-4e8f-9a0b-1c2d3e4f5a6b', 'Dilani Fonseka', 35, 'Active'),
('3f4a5b6c-7d8e-4f9a-0b1c-2d3e4f5a6b7c', 'Ranjith Bandara', 30, 'Active'),
('4a5b6c7d-8e9f-4a0b-1c2d-3e4f5a6b7c8d', 'Chathura Senanayake', 32, 'Inactive'),
('5b6c7d8e-9f0a-4b1c-2d3e-4f5a6b7c8d9e', 'Thilini Perera', 38, 'Active'),
('6c7d8e9f-0a1b-4c2d-3e4f-5a6b7c8d9e0f', 'Asoka Wijewardena', 34, 'Active'),
('7d8e9f0a-1b2c-4d3e-4f5a-6b7c8d9e0f1a', 'Chaminda Silva', 36, 'Active'),
('8e9f0a1b-2c3d-4e4f-5a6b-7c8d9e0f1a2b', 'Sithara Jayasuriya', 33, 'On Leave'),
('9f0a1b2c-3d4e-4f5a-6b7c-8d9e0f1a2b3c', 'Lahiru Fernando', 35, 'Active'),
('0a1b2c3d-4e5f-4a6b-7c8d-9e0f1a2b3c4d', 'Nirosha Dissanayake', 30, 'Active'),
('1b2c3d4e-5f6a-4b7c-8d9e-0f1a2b3c4d5e', 'Upul Rathnayake', 32, 'Active'),
('2c3d4e5f-6a7b-4c8d-9e0f-1a2b3c4d5e6f', 'Malika Wijesinghe', 34, 'Inactive'),
('3d4e5f6a-7b8c-4d9e-0f1a-2b3c4d5e6f7a', 'Sandun Perera', 36, 'Active'),
('4e5f6a7b-8c9d-4e0f-1a2b-3c4d5e6f7a8b', 'Anjali Gunawardena', 35, 'Active'),
('5f6a7b8c-9d0e-4f1a-2b3c-4d5e6f7a8b9c', 'Ruwanthi Mendis', 33, 'Active'),
('6a7b8c9d-0e1f-4a2b-3c4d-5e6f7a8b9c0d', 'Kasun Jayasinghe', 34, 'Active');

INSERT INTO Customer (customer_id, name, type, address, city, phone, email, password) VALUES
('3f0459e3-df95-4ad4-b94c-6b0c67290027', 'Tharaka', 'Retail', '123 Main St', 'New York', '555-0101', 'retailA@example.com', 'password1'),
('29fc8097-6caf-4918-adec-0e700393ea6d', 'Buvindu', 'Wholesale', '456 Oak Ave', 'Los Angeles', '555-0102', 'wholesaleB@example.com', 'password2'),
('c7538e0f-7ad2-4f9b-85aa-31a7b0487d42', 'Tharumini', 'Corporate', '789 Pine Rd', 'Chicago', '555-0103', 'corporateC@example.com', 'password3'),
('b1a4c2d3-6f7e-4abc-9d12-3e4f5a6b7c8d', 'Neela', 'Corporate', '456 Lakeview Dr', 'Miami', '555-0104', 'neela@example.com', 'password4'),
('a1b2c3d4-5e6f-4a1b-8c2d-3e4f5a6b7c8d', 'Nimal Wijesinghe', 'Retail', '234 Elm St', 'Boston', '555-0105', 'nimal.w@example.com', 'password5'),
('b2c3d4e5-6f7a-4b2c-9d3e-4f5a6b7c8d9e', 'Kusuma Fernando', 'Wholesale', '567 Cedar Ave', 'Miami', '555-0106', 'kusuma.f@example.com', 'password6'),
('c3d4e5f6-7a8b-4c3d-0e4f-5a6b7c8d9e0f', 'Lanka Traders', 'Corporate', '890 Birch Rd', 'Seattle', '555-0107', 'lanka.traders@example.com', 'password7'),
('d4e5f6a7-8b9c-4d4e-1f5a-6b7c8d9e0f1a', 'Sunil Perera', 'Retail', '123 Spruce Ln', 'Denver', '555-0108', 'sunil.p@example.com', 'password8'),
('e5f6a7b8-9c0d-4e5f-2a6b-7c8d9e0f1a2b', 'Amara Silva', 'Wholesale', '456 Pine St', 'Houston', '555-0109', 'amara.s@example.com', 'password9'),
('f6a7b8c9-0d1e-4f6a-3b7c-8d9e0f1a2b3c', 'Colombo Sweets', 'Corporate', '789 Oak Dr', 'Atlanta', '555-0110', 'colombo.sweets@example.com', 'password10'),
('a7b8c9d0-1e2f-4a7b-4c8d-9e0f1a2b3c4d', 'Ruwan Dissanayake', 'Retail', '101 Maple Ave', 'Phoenix', '555-0111', 'ruwan.d@example.com', 'password11'),
('b8c9d0e1-2f3a-4b8c-5d9e-0f1a2b3c4d5e', 'Priya Gunawardena', 'Wholesale', '234 Willow Rd', 'Dallas', '555-0112', 'priya.g@example.com', 'password12'),
('c9d0e1f2-3a4b-4c9d-6e0f-1a2b3c4d5e6f', 'Sweet Deals Inc.', 'Corporate', '567 Poplar St', 'San Francisco', '555-0113', 'sweet.deals@example.com', 'password13'),
('d0e1f2a3-4b5c-4d0e-7f1a-2b3c4d5e6f7a', 'Anura Jayasinghe', 'Retail', '890 Cedar Ln', 'Portland', '555-0114', 'anura.j@example.com', 'password14'),
('e1f2a3b4-5c6d-4e1f-8a2b-3c4d5e6f7a8b', 'Mala Rathnayake', 'Wholesale', '123 Birch Ave', 'Austin', '555-0115', 'mala.r@example.com', 'password15'),
('f2a3b4c5-6d7e-4f2a-9b3c-4d5e6f7a8b9c', 'Candy Corner Ltd.', 'Corporate', '456 Elm Dr', 'Philadelphia', '555-0116', 'candy.corner@example.com', 'password16'),
('a3b4c5d6-7e8f-4a3b-0c4d-5e6f7a8b9c0d', 'Sanjaya Mendis', 'Retail', '789 Spruce St', 'San Diego', '555-0117', 'sanjaya.m@example.com', 'password17'),
('b4c5d6e7-8f9a-4b4c-1d5e-6f7a8b9c0d1e', 'Nayana Kumari', 'Wholesale', '101 Oak Rd', 'Charlotte', '555-0118', 'nayana.k@example.com', 'password18'),
('c5d6e7f8-9a0b-4c5d-2e6f-7a8b9c0d1e2f', 'Global Sweets Co.', 'Corporate', '234 Pine Ave', 'Minneapolis', '555-0119', 'global.sweets@example.com', 'password19'),
('d6e7f8a9-0b1c-4d6e-3f7a-8b9c0d1e2f3a', 'Kamal Wijeratne', 'Retail', '567 Maple Ln', 'Cleveland', '555-0120', 'kamal.w@example.com', 'password20'),
('e7f8a9b0-1c2d-4e7f-4a8b-9c0d1e2f3a4b', 'Dilani Fonseka', 'Wholesale', '890 Cedar Dr', 'Orlando', '555-0121', 'dilani.f@example.com', 'password21'),
('f8a9b0c1-2d3e-4f8a-5b9c-0d1e2f3a4b5c', 'Sweet Haven Stores', 'Corporate', '123 Willow St', 'Tampa', '555-0122', 'sweet.haven@example.com', 'password22'),
('a9b0c1d2-3e4f-4a9b-6c0d-1e2f3a4b5c6d', 'Ranjith Bandara', 'Retail', '456 Birch Rd', 'St. Louis', '555-0123', 'ranjith.b@example.com', 'password23'),
('b0c1d2e3-4f5a-4b0c-7d1e-2f3a4b5c6d7e', 'Chathura Senanayake', 'Wholesale', '789 Elm Ave', 'Pittsburgh', '555-0124', 'chathura.s@example.com', 'password24');

INSERT INTO Driver (driver_id, name, license_no, weekly_hours, status) VALUES
('1d672079-260a-48e6-9e5c-2fef6092bdf0', 'David Wilson', 'DL123456', 40, 'Active'),
('e7f72fc9-ce18-44b4-97f2-50781eb754a7', 'Eva Martinez', 'DL789012', 38, 'Active'),
('a9288a54-4e4a-4a49-806e-b7170502539a', 'Frank Lee', 'DL345678', 35, 'On Leave'),
('2a3b4c5d-6e7f-4a8b-9c0d-1e2f3a4b5c6d', 'Ruwan Perera', 'DL901234', 40, 'Active'),
('3b4c5d6e-7f8a-4b9c-0d1e-2f3a4b5c6d7e', 'Nimal Fernando', 'DL567890', 38, 'Active'),
('4c5d6e7f-8a9b-4c0d-1e2f-3a4b5c6d7e8f', 'Kumari Silva', 'DL234567', 35, 'On Leave'),
('5d6e7f8a-9b0c-4d1e-2f3a-4b5c6d7e8f9a', 'Saman Wijesinghe', 'DL890123', 40, 'Active'),
('6e7f8a9b-0c1d-4e2f-3a4b-5c6d7e8f9a0b', 'Priya Gunawardena', 'DL456789', 36, 'Active'),
('7f8a9b0c-1d2e-4f3a-4b5c-6d7e8f9a0b1c', 'Anura Jayasinghe', 'DL123890', 39, 'Active'),
('8a9b0c1d-2e3f-4a4b-5c6d-7e8f9a0b1c2d', 'Mala Rathnayake', 'DL789456', 34, 'On Leave'),
('9b0c1d2e-3f4a-4b5c-6d7e-8f9a0b1c2d3e', 'Sanjaya Mendis', 'DL345123', 40, 'Active'),
('0c1d2e3f-4a5b-4c6d-7e8f-9a0b1c2d3e4f', 'Nayana Kumari', 'DL901567', 37, 'Active'),
('1d2e3f4a-5b6c-4d7e-8f9a-0b1c2d3e4f5a', 'Kamal Wijeratne', 'DL678234', 38, 'Active');

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
('1e2f3a4b-5c6d-4d6e-8f9b-0c1d2e3f4a5b', 'Candy Canes', 'Traditional peppermint candy canes', 1.49, 1, 56);

INSERT INTO Store (store_id, name, city, address, capacity) VALUES
('e28cf701-474a-440f-bca9-2f90605aa65b', 'Kandy Central Store', 'New York', '100 Candy Blvd', 1000),
('8683216c-ce35-4024-83fa-bfa73005d431', 'Sweet Depot LA', 'Los Angeles', '200 Sugar St', 800),
('a44f797f-45ff-40a7-99c0-d946e8c4ad42', 'Candy Warehouse CHI', 'Chicago', '300 Treat Ave', 1200),
('b5c6d7e8-9f0a-4b1c-2d3e-4f5a6b7c8d9e', 'Sweet Haven Boston', 'Boston', '400 Maple Way', 900),
('c6d7e8f9-0a1b-4c2d-3e4f-5a6b7c8d9e0f', 'Candy Hub Miami', 'Miami', '500 Palm Dr', 1100),
('d7e8f9a0-1b2c-4d3e-4f5a-6b7c8d9e0f1a', 'Treat Station Seattle', 'Seattle', '600 Rainier Ave', 950);

INSERT INTO Train_Schedule (train_schedule_id, departure_city, arrival_city, departure_time, arrival_time, capacity) VALUES
('3730fc56-cd09-4bc1-8dc2-26f8eb549f5f', 'New York', 'Los Angeles', '08:00:00', '20:00:00', 500),
('141fb849-05cd-4581-bf0e-2969ec839a6f', 'Los Angeles', 'Chicago', '09:30:00', '18:45:00', 400),
('7e23eb1c-aa68-4297-a8ec-02f5681f2e5c', 'Kandy', 'New York', '07:15:00', '19:30:00', 600);

INSERT INTO Truck (truck_id, license_plate, capacity, status) VALUES
('f550ff2e-1080-4b29-af61-f46b009bf1ac', 'ABC-123', 1000.50, 'Available'),
('0e0862ca-9a7f-4850-bed3-040eba35b0f8', 'XYZ-456', 1500.00, 'In Use'),
('fd160307-a56a-4f04-b88d-6422d29496a3', 'DEF-789', 1200.75, 'Maintenance');

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
('29fc8097-6caf-4918-adec-0e700393ea6d', '3f0459e3-df95-4ad4-b94c-6b0c67290027', '2025-09-01', '2025-09-10', 'Pending', 50.00),
('c7538e0f-7ad2-4f9b-85aa-31a7b0487d42', '29fc8097-6caf-4918-adec-0e700393ea6d', '2025-09-05', '2025-09-15', 'Shipped', 100.00),
('1d672079-260a-48e6-9e5c-2fef6092bdf0', 'c7538e0f-7ad2-4f9b-85aa-31a7b0487d42', '2025-09-10', '2025-09-20', 'Delivered', 75.50),
('2f3a4b5c-6d7e-4f8a-9b0c-1d2e3f4a5b6c', 'a1b2c3d4-5e6f-4a1b-8c2d-3e4f5a6b7c8d', '2025-10-01', '2025-10-08', 'Pending', 45.00),
('3a4b5c6d-7e8f-4a2b-0c1d-2e3f4a5b6c7d', 'b2c3d4e5-6f7a-4b2c-9d3e-4f5a6b7c8d9e', '2025-10-02', '2025-10-09', 'Shipped', 120.50),
('4b5c6d7e-8f9a-4b3c-1d2e-3f4a5b6c7d8e', 'c3d4e5f6-7a8b-4c3d-0e4f-5a6b7c8d9e0f', '2025-10-03', '2025-10-10', 'Delivered', 80.25),
('5c6d7e8f-9a0b-4c4d-2e3f-4a5b6c7d8e9f', 'd4e5f6a7-8b9c-4d4e-1f5a-6b7c8d9e0f1a', '2025-10-04', '2025-10-11', 'Pending', 60.75),
('6d7e8f9a-0b1c-4d5e-3f4a-5b6c7d8e9f0a', 'e5f6a7b8-9c0d-4e5f-2a6b-7c8d9e0f1a2b', '2025-10-05', '2025-10-12', 'Shipped', 95.00),
('7e8f9a0b-1c2d-4e6f-4a5b-6c7d8e9f0a1b', 'f6a7b8c9-0d1e-4f6a-3b7c-8d9e0f1a2b3c', '2025-10-06', '2025-10-13', 'Delivered', 150.00),
('8f9a0b1c-2d3e-4f7a-5b6c-7d8e9f0a1b2c', 'a7b8c9d0-1e2f-4a7b-4c8d-9e0f1a2b3c4d', '2025-10-07', '2025-10-14', 'Pending', 70.50),
('9a0b1c2d-3e4f-4a8b-6c7d-8e9f0a1b2c3d', 'b8c9d0e1-2f3a-4b8c-5d9e-0f1a2b3c4d5e', '2025-10-08', '2025-10-15', 'Shipped', 110.25),
('0b1c2d3e-4f5a-4b9c-7d8e-9f0a1b2c3d4e', 'c9d0e1f2-3a4b-4c9d-6e0f-1a2b3c4d5e6f', '2025-10-09', '2025-10-16', 'Delivered', 85.00),
('1c2d3e4f-5a6b-4c0d-8e9f-0a1b2c3d4e5f', 'd0e1f2a3-4b5c-4d0e-7f1a-2b3c4d5e6f7a', '2025-10-10', '2025-10-17', 'Pending', 55.75),
('2d3e4f5a-6b7c-4d1e-9f0a-1b2c3d4e5f6a', 'e1f2a3b4-5c6d-4e1f-8a2b-3c4d5e6f7a8b', '2025-10-11', '2025-10-18', 'Shipped', 130.00),
('3e4f5a6b-7c8d-4e2f-0a1b-2c3d4e5f6a7b', 'f2a3b4c5-6d7e-4f2a-9b3c-4d5e6f7a8b9c', '2025-10-12', '2025-10-19', 'Delivered', 90.50),
('4f5a6b7c-8d9e-4f3a-1b2c-3d4e5f6a7b8c', 'a3b4c5d6-7e8f-4a3b-0c4d-5e6f7a8b9c0d', '2025-10-13', '2025-10-20', 'Pending', 65.25),
('5a6b7c8d-9e0f-4a4b-2c3d-4e5f6a7b8c9d', 'b4c5d6e7-8f9a-4b4c-1d5e-6f7a8b9c0d1e', '2025-10-14', '2025-10-21', 'Shipped', 100.00),
('6b7c8d9e-0f1a-4b5c-3d4e-5f6a7b8c9d0e', 'c5d6e7f8-9a0b-4c5d-2e6f-7a8b9c0d1e2f', '2025-10-15', '2025-10-22', 'Delivered', 75.75),
('7c8d9e0f-1a2b-4c6d-4e5f-6a7b8c9d0e1f', 'd6e7f8a9-0b1c-4d6e-3f7a-8b9c0d1e2f3a', '2025-10-16', '2025-10-23', 'Pending', 50.50),
('8d9e0f1a-2b3c-4d7e-5f6a-7b8c9d0e1f2a', 'e7f8a9b0-1c2d-4e7f-4a8b-9c0d1e2f3a4b', '2025-10-17', '2025-10-24', 'Shipped', 115.25),
('9e0f1a2b-3c4d-4e8f-6a7b-8c9d0e1f2a3b', 'f8a9b0c1-2d3e-4f8a-5b9c-0d1e2f3a4b5c', '2025-10-18', '2025-10-25', 'Delivered', 95.00),
('0f1a2b3c-4d5e-4f9a-7b8c-9d0e1f2a3b4c', 'a9b0c1d2-3e4f-4a9b-6c0d-1e2f3a4b5c6d', '2025-10-19', '2025-10-26', 'Pending', 60.00),
('1a2b3c4d-5e6f-4a0b-8c9d-0e1f2a3b4c5d', 'b0c1d2e3-4f5a-4b0c-7d1e-2f3a4b5c6d7e', '2025-10-20', '2025-10-27', 'Shipped', 105.50);

INSERT INTO Delivery_Schedule (delivery_id, route_id, truck_id, driver_id, assistant_id, delivery_date, status) VALUES
('e7f72fc9-ce18-44b4-97f2-50781eb754a7', '98b43b99-6e29-4f1f-8eac-d0384350db96', 'f550ff2e-1080-4b29-af61-f46b009bf1ac', '1d672079-260a-48e6-9e5c-2fef6092bdf0', 'fd160307-a56a-4f04-b88d-6422d29496a3', '2025-09-12', 'Scheduled'),
('a9288a54-4e4a-4a49-806e-b7170502539a', '90e7ff56-407a-4ba3-a6ed-277953862c73', '0e0862ca-9a7f-4850-bed3-040eba35b0f8', 'e7f72fc9-ce18-44b4-97f2-50781eb754a7', '98b43b99-6e29-4f1f-8eac-d0384350db96', '2025-09-15', 'In Progress'),
('7f159ff9-2998-4b89-a994-1fb732683475', '3f0459e3-df95-4ad4-b94c-6b0c67290027', 'fd160307-a56a-4f04-b88d-6422d29496a3', 'a9288a54-4e4a-4a49-806e-b7170502539a', '90e7ff56-407a-4ba3-a6ed-277953862c73', '2025-09-18', 'Completed'),
('f5a6b7c8-9d0e-4f1a-2b3c-4d5e6f7a8b9c', 'e8f9a0b1-2c3d-4e4f-5a6b-7c8d9e0f1a2b', 'f550ff2e-1080-4b29-af61-f46b009bf1ac', '1d672079-260a-48e6-9e5c-2fef6092bdf0', 'fd160307-a56a-4f04-b88d-6422d29496a3', '2025-10-15', 'Scheduled'),
('a6b7c8d9-0e1f-4a2b-3c4d-5e6f7a8b9c0d', 'f9a0b1c2-3d4e-4f5a-6b7c-8d9e0f1a2b3c', '0e0862ca-9a7f-4850-bed3-040eba35b0f8', 'e7f72fc9-ce18-44b4-97f2-50781eb754a7', '98b43b99-6e29-4f1f-8eac-d0384350db96', '2025-10-16', 'In Progress'),
('b7c8d9e0-1f2a-4b3c-4d5e-6f7a8b9c0d1e', 'a0b1c2d3-4e5f-4a6b-7c8d-9e0f1a2b3c4d', 'fd160307-a56a-4f04-b88d-6422d29496a3', 'a9288a54-4e4a-4a49-806e-b7170502539a', '90e7ff56-407a-4ba3-a6ed-277953862c73', '2025-10-17', 'Scheduled'),
('c8d9e0f1-2a3b-4c4d-5e6f-7a8b9c0d1e2f', 'b1c2d3e4-5f6a-4b7c-8d9e-0f1a2b3c4d5e', 'f550ff2e-1080-4b29-af61-f46b009bf1ac', '1d672079-260a-48e6-9e5c-2fef6092bdf0', 'fd160307-a56a-4f04-b88d-6422d29496a3', '2025-10-18', 'Completed'),
('d9e0f1a2-3b4c-4d5e-6f7a-8b9c0d1e2f3a', 'c2d3e4f5-6a7b-4c8d-9e0f-1a2b3c4d5e6f', '0e0862ca-9a7f-4850-bed3-040eba35b0f8', 'e7f72fc9-ce18-44b4-97f2-50781eb754a7', '98b43b99-6e29-4f1f-8eac-d0384350db96', '2025-10-19', 'Scheduled'),
('e0f1a2b3-4c5d-4e6f-7a8b-9c0d1e2f3a4b', 'd3e4f5a6-7b8c-4d9e-0f1a-2b3c4d5e6f7a', 'fd160307-a56a-4f04-b88d-6422d29496a3', 'a9288a54-4e4a-4a49-806e-b7170502539a', '90e7ff56-407a-4ba3-a6ed-277953862c73', '2025-10-20', 'In Progress'),
('f1a2b3c4-5d6e-4f7a-8b9c-0d1e2f3a4b5c', 'e4f5a6b7-8c9d-4e0f-1a2b-3c4d5e6f7a8b', 'f550ff2e-1080-4b29-af61-f46b009bf1ac', '1d672079-260a-48e6-9e5c-2fef6092bdf0', 'fd160307-a56a-4f04-b88d-6422d29496a3', '2025-10-21', 'Scheduled');

INSERT INTO Allocation (allocation_id, train_schedule_id, order_id, space_consumed, store_id) VALUES
('4a3b6d7c-e0da-4004-90b5-baabe2fec960', '3730fc56-cd09-4bc1-8dc2-26f8eb549f5f', '29fc8097-6caf-4918-adec-0e700393ea6d', 5, 'e28cf701-474a-440f-bca9-2f90605aa65b'),
('1cb2763a-51d3-4c2c-9452-533505bf3ef5', '141fb849-05cd-4581-bf0e-2969ec839a6f', 'c7538e0f-7ad2-4f9b-85aa-31a7b0487d42', 10, '8683216c-ce35-4024-83fa-bfa73005d431'),
('e28cf701-474a-440f-bca9-2f90605aa65b', '7e23eb1c-aa68-4297-a8ec-02f5681f2e5c', '1d672079-260a-48e6-9e5c-2fef6092bdf0', 8, 'a44f797f-45ff-40a7-99c0-d946e8c4ad42');

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
('5e6f7a8b-9c0d-4e1f-2a3b-4c5d6e7f8a9b', '1a2b3c4d-5e6f-4a0b-8c9d-0e1f2a3b4c5d', 25, 49.75); -- Peppermint Sticks: 25 * 1.99

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


DELIMITER $$

CREATE TRIGGER before_insert_driver
BEFORE INSERT ON Driver
FOR EACH ROW
BEGIN
IF NEW.driver_id IS NULL THEN
SET NEW.driver_id = UUID();
END IF;
END $$

DELIMITER ;

DELIMITER $$

CREATE TRIGGER before_insert_assistant
BEFORE INSERT ON Assistant
FOR EACH ROW
BEGIN
IF NEW.assistant_id IS NULL THEN
SET NEW.assistant_id = UUID();
END IF;
END $$

DELIMITER ;

DELIMITER $$

CREATE TRIGGER before_insert_product
BEFORE INSERT ON Product
FOR EACH ROW
BEGIN
IF NEW.product_id IS NULL THEN
SET NEW.product_id  = UUID();
END IF;
END $$

DELIMITER ;

DELIMITER $$

CREATE TRIGGER before_insert_store
BEFORE INSERT ON Store
FOR EACH ROW
BEGIN
IF NEW.store_id IS NULL THEN
SET NEW.store_id  = UUID();
END IF;
END $$

DELIMITER ;

DELIMITER $$

CREATE TRIGGER before_insert_route
BEFORE INSERT ON Route
FOR EACH ROW
BEGIN
IF NEW.route_id IS NULL THEN
SET NEW.route_id  = UUID();
END IF;
END $$

DELIMITER ;

DELIMITER $$

CREATE TRIGGER before_insert_truck
BEFORE INSERT ON Truck
FOR EACH ROW
BEGIN
IF NEW.truck_id IS NULL THEN
SET NEW.truck_id  = UUID();
END IF;
END $$

DELIMITER ;