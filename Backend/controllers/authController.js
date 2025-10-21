import {
  getAdminByEmail,
  getAdminById,
  updateAdminProfile,
  validateAdminPassword,
} from "../models/adminModel.js";
import {
  createCustomer,
  getCustomerByEmail,
  getCustomerById,
  updateCustomerProfile,
  validateCustomerPassword,
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
    const customer = admin ? null : await getCustomerByEmail(email);

    if (!admin && !customer) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    const role = admin ? "Admin" : "Customer";
    const record = admin || customer;
    const isValid = admin
      ? await validateAdminPassword(record, password)
      : await validateCustomerPassword(record, password);

    if (!isValid) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    const id = admin ? record.admin_id : record.customer_id;
    const name = admin ? record.username : record.name;
    const customerFields = admin
      ? {}
      : {
          phone: customer?.phone ?? null,
          address: customer?.address ?? null,
          city: customer?.city ?? null,
          type: customer?.type ?? null,
        };

    const token = jwt.sign(
      { id, role, email: record.email, name },
      process.env.JWT_SECRET,
      { expiresIn: "48h" }
    );

    res.json({
      success: true,
      token,
      user: {
        id,
        role,
        email: record.email,
        name,
        ...customerFields,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

export async function getProfile(req, res) {
  const { id, role } = req.user;

  try {
    if (role === "Customer") {
      const customer = await getCustomerById(id);
      if (!customer) {
        return res
          .status(404)
          .json({ success: false, message: "Customer not found" });
      }

      return res.json({
        success: true,
        user: {
          id: customer.customer_id,
          role,
          email: customer.email,
          name: customer.name,
          phone: customer.phone,
          address: customer.address,
          city: customer.city,
          type: customer.type,
        },
      });
    }

    if (role === "Admin") {
      const admin = await getAdminById(id);
      if (!admin) {
        return res
          .status(404)
          .json({ success: false, message: "Admin not found" });
      }

      return res.json({
        success: true,
        user: {
          id: admin.admin_id,
          role,
          email: admin.email,
          name: admin.username,
        },
      });
    }

    return res
      .status(400)
      .json({ success: false, message: "Unsupported role" });
  } catch (error) {
    console.error("Profile fetch error:", error);
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
    console.error("Register customer error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

export async function updateProfile(req, res) {
  const { id, role } = req.user;
  const payload = req.body || {};

  try {
    if (role === "Customer") {
      const allowedFields = {
        name: payload.name,
        phone: payload.phone,
        address: payload.address,
        city: payload.city,
        type: payload.type,
      };

      const updated = await updateCustomerProfile(id, allowedFields);

      if (!updated) {
        return res.json({ success: true, user: await getCustomerById(id) });
      }

      return res.json({
        success: true,
        user: {
          id: updated.customer_id,
          role,
          email: updated.email,
          name: updated.name,
          phone: updated.phone,
          address: updated.address,
          city: updated.city,
          type: updated.type,
        },
      });
    }

    if (role === "Admin") {
      const allowedFields = {
        username: payload.name ?? payload.username,
        email: payload.email,
      };

      const updated = await updateAdminProfile(id, allowedFields);

      if (!updated) {
        const admin = await getAdminById(id);
        return res.json({
          success: true,
          user: {
            id: admin.admin_id,
            role,
            email: admin.email,
            name: admin.username,
          },
        });
      }

      return res.json({
        success: true,
        user: {
          id: updated.admin_id,
          role,
          email: updated.email,
          name: updated.username,
        },
      });
    }

    return res
      .status(400)
      .json({ success: false, message: "Unsupported role" });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}
