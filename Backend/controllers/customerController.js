import * as customer from "../models/customerModel.js";

export async function getAllCustomers(req, res) {
  try {
    const customers = await customer.getCustomers();
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteCustomer(req, res) {
  const { id } = req.params;

  try {
    const result = await customer.deleteCustomerById(id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.status(200).json({ message: "Customer deleted successfully" });
  } catch (error) {
    if (error.code === "ER_ROW_IS_REFERENCED_2") {
      return res.status(400).json({
        message: "Cannot delete customer, This customer has existing orders.",
      });
    }
    console.error("Delete customer error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
