import {
  getAdminByEmail,
  validateAdminPassword,
} from "../models/adminModel.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { getCustomerByEmail } from "../models/customerModel.js";
dotenv.config();

export async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Email and password required" });
  }

  try {
    // Try to find user in both admin and customer tables
    const admin = await getAdminByEmail(email);
    const customer = !admin ? await getCustomerByEmail(email) : null;
    
    // Determine user and role
    const user = admin || customer;
    const role = admin ? "Admin" : "Customer";
    
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }
    
    // Validate password based on role
    const isValid = admin 
      ? await validateAdminPassword(user, password)
      : await validateCustomerPassword(user, password);

    if (!isValid) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user.id, role, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      success: true,
      token,
      user: { email: user.email, role, username: user.username },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}
