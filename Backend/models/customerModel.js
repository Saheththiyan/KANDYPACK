const db = require('../config/db'); // assuming you have db connection setup

class Customer {
  constructor(customer_id, name, type, address, city, phone, email) {
    this.customer_id = customer_id;
    this.name = name;
    this.type = type;
    this.address = address;
    this.city = city;
    this.phone = phone;
    this.email = email;
  }
}

const getAllCustomers = (callback) => {
  db.query('SELECT * FROM Customer', (err, results) => {
    if (err) return callback(err, null);

    // Map each row to a Customer object
    const customers = results.map(row => new Customer(
      row.customer_id,
      row.name,
      row.type,
      row.address,
      row.city,
      row.phone,
      row.email
    ));

    callback(null, customers);
  });
};

// Export functions
module.exports = {
  getAllCustomers
};