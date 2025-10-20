import {
  getAdminByEmail,
  validateAdminPassword,
} from "../models/adminModel.js";
import {
  createCustomer,
  getCustomerByEmail,
} from "../models/customerModel.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import crypto from "crypto";
dotenv.config();

export async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Email and password required" });
  }

  try {
    const admin = await getAdminByEmail(email);

    if (!admin) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    const isValid = await validateAdminPassword(admin, password);

    if (!isValid) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: admin.id, role: "Admin", email: admin.email, name: admin.name },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      success: true,
      token,
      user: { email: admin.email, role: "Admin", username: admin.username },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

export async function registerCustomer(req, res) {
  const { name, type, address, city, phone, email, password } = req.body;

  if (!name || !type || !address || !city || !phone || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "All customer fields are required",
    });
  }

  try {
    const existingCustomer = await getCustomerByEmail(email);

    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    const customerId = crypto.randomUUID();

    await createCustomer({
      customer_id: customerId,
      name,
      type,
      address,
      city,
      phone,
      email,
      password,
    });

    res.status(201).json({
      success: true,
      message: "Customer account created successfully",
      customer: {
        customer_id: customerId,
        name,
        email,
        type,
        city,
        phone,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}
