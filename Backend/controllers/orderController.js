import {
  createOrder as createOrderModel,
  getOrderById as getOrderByIdModel,
  getOrders,
  getOrdersByCustomer,
} from "../models/orderModel.js";

const normalizePaymentMethod = (method) =>
  method === "card" ? "card" : "cod";

const normalizeContact = (body) => {
  if (body.contact && typeof body.contact === "object") {
    return {
      name: body.contact.name ?? null,
      phone: body.contact.phone ?? null,
      address: body.contact.address ?? null,
      city: body.contact.city ?? null,
    };
  }

  return {
    name: body.name ?? null,
    phone: body.phone ?? null,
    address:
      typeof body.address === "object" ? body.address.street : body.address ?? null,
    city:
      typeof body.address === "object"
        ? body.address.city
        : body.city ?? null,
  };
};

export async function getAllOrders(req, res) {
  try {
    const { role, id } = req.user || {};
    const orders =
      role === "Customer" ? await getOrdersByCustomer(id) : await getOrders();

    res.json({ success: true, orders });
  } catch (err) {
    console.error("Fetch orders error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function getOrderById(req, res) {
  const { id } = req.params;

  try {
    const order = await getOrderByIdModel(id);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    if (
      req.user?.role === "Customer" &&
      order.customer_id !== req.user.id
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Access to this order is denied" });
    }

    res.json({ success: true, order });
  } catch (err) {
    console.error("Fetch order error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function createOrder(req, res) {
  const {
    items,
    required_date: requiredDate,
    paymentMethod,
    totalAmount,
  } = req.body;

  const customerId =
    req.user?.role === "Customer" ? req.user.id : req.body.customer_id;

  if (!customerId) {
    return res
      .status(400)
      .json({ success: false, message: "Customer id is required" });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Order must include at least one item",
    });
  }

  if (!requiredDate) {
    return res.status(400).json({
      success: false,
      message: "Required delivery date is missing",
    });
  }

  for (const item of items) {
    if (!item.productId || !item.quantity || !item.price) {
      return res.status(400).json({
        success: false,
        message:
          "Each item must include productId, quantity, and price values",
      });
    }
  }

  const computedTotal = items.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.quantity),
    0
  );
  const finalTotal =
    totalAmount !== undefined ? Number(totalAmount) : computedTotal;

  try {
    const newOrder = await createOrderModel(
      customerId,
      items,
      finalTotal,
      requiredDate,
      normalizePaymentMethod(paymentMethod),
      normalizeContact(req.body)
    );

    res.status(201).json({
      success: true,
      order: newOrder,
    });
  } catch (err) {
    console.error("Order creation error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to create order",
      details: err.message,
    });
  }
}
