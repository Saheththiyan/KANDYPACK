const CustomerModel = require('../models/customerModel');

const fetchCustomers = () => {
  CustomerModel.getAllCustomers((err, customers) => {
    if (err) {
      console.error("Error fetching customers:", err);
    } else {
      customers.forEach(c => {
        console.log(`${c.name}: ${c.email}`);
      });
    }
  });
};

module.exports = { fetchCustomers };