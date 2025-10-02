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
    weekly_hours INT,
    status VARCHAR(20),
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
    PRIMARY KEY (customer_id)
);

-- Create the Driver table
CREATE TABLE Driver (
    driver_id CHAR(36) NOT NULL,
    name VARCHAR(100),
    license_no VARCHAR(20),
    weekly_hours INT,
    status VARCHAR(20),
    PRIMARY KEY (driver_id)
);

-- Create the Product table
CREATE TABLE Product (
    product_id CHAR(36) NOT NULL,
    name VARCHAR(100),
    description TEXT,
    unit_price DECIMAL(10,2),
    space_unit INT,
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
('90e7ff56-407a-4ba3-a6ed-277953862c73', 'Carol Davis', 30, 'Inactive');

INSERT INTO Customer (customer_id, name, type, address, city, phone, email) VALUES
('3f0459e3-df95-4ad4-b94c-6b0c67290027', 'Tharaka', 'Retail', '123 Main St', 'New York', '555-0101', 'retailA@example.com'),
('29fc8097-6caf-4918-adec-0e700393ea6d', 'Buvindu', 'Wholesale', '456 Oak Ave', 'Los Angeles', '555-0102', 'wholesaleB@example.com'),
('c7538e0f-7ad2-4f9b-85aa-31a7b0487d42', 'Tharumini', 'Corporate', '789 Pine Rd', 'Chicago', '555-0103', 'corporateC@example.com'),
('b1a4c2d3-6f7e-4abc-9d12-3e4f5a6b7c8d', 'Neela', 'Corporate', '456 Lakeview Dr', 'Miami', '555-0104', 'neela@example.com');

INSERT INTO Driver (driver_id, name, license_no, weekly_hours, status) VALUES
('1d672079-260a-48e6-9e5c-2fef6092bdf0', 'David Wilson', 'DL123456', 40, 'Active'),
('e7f72fc9-ce18-44b4-97f2-50781eb754a7', 'Eva Martinez', 'DL789012', 38, 'Active'),
('a9288a54-4e4a-4a49-806e-b7170502539a', 'Frank Lee', 'DL345678', 35, 'On Leave');

INSERT INTO Product (product_id, name, description, unit_price, space_unit) VALUES
('7f159ff9-2998-4b89-a994-1fb732683475', 'Chocolate Bar', 'Delicious milk chocolate treat', 2.99, 1),
('4a3b6d7c-e0da-4004-90b5-baabe2fec960', 'Candy Pack', 'Assorted gummy candies', 5.49, 2),
('1cb2763a-51d3-4c2c-9452-533505bf3ef5', 'Lollipop', 'Fruit-flavored lollipop on a stick', 0.99, 1);

INSERT INTO Store (store_id, name, city, address, capacity) VALUES
('e28cf701-474a-440f-bca9-2f90605aa65b', 'Kandy Central Store', 'New York', '100 Candy Blvd', 1000),
('8683216c-ce35-4024-83fa-bfa73005d431', 'Sweet Depot LA', 'Los Angeles', '200 Sugar St', 800),
('a44f797f-45ff-40a7-99c0-d946e8c4ad42', 'Candy Warehouse CHI', 'Chicago', '300 Treat Ave', 1200);

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
('3f0459e3-df95-4ad4-b94c-6b0c67290027', 'a44f797f-45ff-40a7-99c0-d946e8c4ad42', 'Loop CHI, North Side, South Side', 150);

INSERT INTO `Order` (order_id, customer_id, order_date, required_date, status, total_value) VALUES
('29fc8097-6caf-4918-adec-0e700393ea6d', '3f0459e3-df95-4ad4-b94c-6b0c67290027', '2025-09-01', '2025-09-10', 'Pending', 50.00),
('c7538e0f-7ad2-4f9b-85aa-31a7b0487d42', '29fc8097-6caf-4918-adec-0e700393ea6d', '2025-09-05', '2025-09-15', 'Shipped', 100.00),
('1d672079-260a-48e6-9e5c-2fef6092bdf0', 'c7538e0f-7ad2-4f9b-85aa-31a7b0487d42', '2025-09-10', '2025-09-20', 'Delivered', 75.50);

INSERT INTO Delivery_Schedule (delivery_id, route_id, truck_id, driver_id, assistant_id, delivery_date, status) VALUES
('e7f72fc9-ce18-44b4-97f2-50781eb754a7', '98b43b99-6e29-4f1f-8eac-d0384350db96', 'f550ff2e-1080-4b29-af61-f46b009bf1ac', '1d672079-260a-48e6-9e5c-2fef6092bdf0', 'fd160307-a56a-4f04-b88d-6422d29496a3', '2025-09-12', 'Scheduled'),
('a9288a54-4e4a-4a49-806e-b7170502539a', '90e7ff56-407a-4ba3-a6ed-277953862c73', '0e0862ca-9a7f-4850-bed3-040eba35b0f8', 'e7f72fc9-ce18-44b4-97f2-50781eb754a7', '98b43b99-6e29-4f1f-8eac-d0384350db96', '2025-09-15', 'In Progress'),
('7f159ff9-2998-4b89-a994-1fb732683475', '3f0459e3-df95-4ad4-b94c-6b0c67290027', 'fd160307-a56a-4f04-b88d-6422d29496a3', 'a9288a54-4e4a-4a49-806e-b7170502539a', '90e7ff56-407a-4ba3-a6ed-277953862c73', '2025-09-18', 'Completed');

INSERT INTO Allocation (allocation_id, train_schedule_id, order_id, space_consumed, store_id) VALUES
('4a3b6d7c-e0da-4004-90b5-baabe2fec960', '3730fc56-cd09-4bc1-8dc2-26f8eb549f5f', '29fc8097-6caf-4918-adec-0e700393ea6d', 5, 'e28cf701-474a-440f-bca9-2f90605aa65b'),
('1cb2763a-51d3-4c2c-9452-533505bf3ef5', '141fb849-05cd-4581-bf0e-2969ec839a6f', 'c7538e0f-7ad2-4f9b-85aa-31a7b0487d42', 10, '8683216c-ce35-4024-83fa-bfa73005d431'),
('e28cf701-474a-440f-bca9-2f90605aa65b', '7e23eb1c-aa68-4297-a8ec-02f5681f2e5c', '1d672079-260a-48e6-9e5c-2fef6092bdf0', 8, 'a44f797f-45ff-40a7-99c0-d946e8c4ad42');

INSERT INTO Order_Item (product_id, order_id, quantity, sub_total) VALUES
('7f159ff9-2998-4b89-a994-1fb732683475', '29fc8097-6caf-4918-adec-0e700393ea6d', 10, 29.90),
('4a3b6d7c-e0da-4004-90b5-baabe2fec960', 'c7538e0f-7ad2-4f9b-85aa-31a7b0487d42', 15, 82.35),
('1cb2763a-51d3-4c2c-9452-533505bf3ef5', '1d672079-260a-48e6-9e5c-2fef6092bdf0', 20, 19.80);

INSERT INTO Delivers (delivery_id, order_id, delivered_time) VALUES
('e7f72fc9-ce18-44b4-97f2-50781eb754a7', '29fc8097-6caf-4918-adec-0e700393ea6d', '14:30:00'),
('a9288a54-4e4a-4a49-806e-b7170502539a', 'c7538e0f-7ad2-4f9b-85aa-31a7b0487d42', '16:45:00'),
('7f159ff9-2998-4b89-a994-1fb732683475', '1d672079-260a-48e6-9e5c-2fef6092bdf0', '12:15:00');
