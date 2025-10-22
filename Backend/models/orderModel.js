import crypto from "crypto";
import db from "../config/db.js";

const PAYMENT_METHOD_LABELS = {
  card: "Credit/Debit Card",
  cod: "Cash on Delivery",
};

let schemaEnsured = false;

async function ensureOrderSchema() {
  if (schemaEnsured) {return;}

  try {
    await db.query("SELECT payment_method FROM `Order` LIMIT 1");
    schemaEnsured = true;
  } catch (error) {
    if (error.code === "ER_BAD_FIELD_ERROR") {
      await db.query(
        "ALTER TABLE `Order` ADD COLUMN payment_method VARCHAR(50) DEFAULT 'cod'"
      );
      schemaEnsured = true;
    } else {
      throw error;
    }
  }
}

const normalizeCustomerRow = (row) =>
  row
    ? {
        id: row.customer_id,
        name: row.name,
        email: row.email,
        phone: row.phone,
        address: {
          street: row.address,
          city: row.city,
        },
      }
    : null;

function normalizeItemRow(row) {
  const unitPrice = Number(row.unit_price ?? 0);
  const quantity = Number(row.quantity ?? 0);
  const spaceUnit = Number(row.space_unit ?? 0);
  const subTotal =
    row.sub_total !== undefined
      ? Number(row.sub_total)
      : unitPrice * quantity;

  return {
    product: {
      id: row.product_id,
      product_id: row.product_id,
      sku: `SKU-${String(row.product_id).slice(0, 8)}`,
      name: row.product_name,
      description: row.product_description,
      price: unitPrice,
      unit_price: unitPrice,
      image: "/placeholder.svg",
      category: "Product",
      spaceConsumption: spaceUnit,
      space_unit: spaceUnit,
      stock: Number(row.stock ?? 0),
    },
    quantity,
    price: unitPrice,
    subTotal,
  };
}

const hashString = (value) =>
  String(value ?? "")
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);

function buildLogistics(orderId, city, totalSpace) {
  const safeCity = city || "Destination";
  const hash = hashString(orderId || safeCity);
  const trainCapacity = 1000;
  const wagonNumber = (hash % 20) + 1;
  const routeNumber = (hash % 5) + 1;
  const driverNames = ["D. Silva", "K. Perera", "M. Fernando", "S. Jayawardena"];
  const assistantNames = [
    "A. Perera",
    "N. Kumari",
    "P. Senanayake",
    "R. Dias",
  ];

  const allocatedCapacity = totalSpace;
  const remainingCapacity = Math.max(trainCapacity - allocatedCapacity, 0);

  return {
    rail: {
      trainId: `TR-${safeCity.slice(0, 3).toUpperCase()}-${String(hash)
        .padStart(4, "0")
        .slice(-4)}`,
      departure: "Kandy Central - 08:30 AM",
      arrival: `${safeCity} Station - 02:${String(15 + (hash % 45)).padStart(
        2,
        "0"
      )} PM`,
      allocatedCapacity,
      remainingCapacity,
      wagonCode: `W-${wagonNumber}`,
      spaceUsed: allocatedCapacity,
    },
    store: {
      name: `${safeCity} Distribution Center`,
      address: `123 ${safeCity} Logistics Park`,
      handoverTime: "10:30 AM",
    },
    truck: {
      routeName: `${safeCity}-Route-${routeNumber}`,
      areasCovered: [
        `${safeCity} Central`,
        `${safeCity} West`,
        `${safeCity} East`,
      ],
      etaWindow: "2:00 PM - 6:00 PM",
      truckPlate: `${safeCity.slice(0, 2).toUpperCase()}-${String(
        6000 + (hash % 900)
      ).padStart(4, "0")}`,
      driver: driverNames[hash % driverNames.length],
      assistant: assistantNames[hash % assistantNames.length],
    },
  };
}

function buildTimeline(status, orderDate, logistics, city) {
  const stages = [
    {
      key: "Processing",
      status: `Scheduled on Train ${logistics.rail.trainId}`,
    },
    { key: "Scheduled", status: "Departed Kandy" },
    {
      key: "In Transit",
      status: `Arrived ${city || "Destination"} Station`,
    },
    {
      key: "Out for delivery",
      status: `Out for delivery (${logistics.truck.routeName})`,
    },
    { key: "Delivered", status: "Delivered" },
  ];

  const flowOrdering = ["Processing", "Scheduled", "In Transit", "Delivered"];
  const normalizedStatus = status || "Processing";
  const completedIndex = Math.max(flowOrdering.indexOf(normalizedStatus), 0);
  const baseDate = orderDate instanceof Date ? orderDate : new Date();

  return stages.map((stage, index) => ({
    status: stage.status,
    timestamp:
      index <= completedIndex
        ? new Date(baseDate.getTime() + index * 24 * 60 * 60 * 1000).toISOString()
        : "",
    completed: index <= completedIndex,
  }));
}

function formatOrder(orderRow, customer, items) {
  const orderDate =
    orderRow.order_date instanceof Date
      ? orderRow.order_date
      : orderRow.order_date
      ? new Date(orderRow.order_date)
      : null;
  const requiredDate =
    orderRow.required_date instanceof Date
      ? orderRow.required_date
      : orderRow.required_date
      ? new Date(orderRow.required_date)
      : null;
  const totalValue = Number(orderRow.total_value ?? 0);
  const paymentMethodCode = orderRow.payment_method || "cod";
  const paymentMethodLabel =
    PAYMENT_METHOD_LABELS[paymentMethodCode] || paymentMethodCode;
  const city = customer?.address?.city || "Destination";
  const totalSpace = items.reduce(
    (sum, item) => sum + Number(item.product.space_unit ?? 0) * item.quantity,
    0
  );
  const logistics = buildLogistics(orderRow.order_id, city, totalSpace);

  return {
    id: orderRow.order_id,
    order_id: orderRow.order_id,
    customer_id: orderRow.customer_id,
    date: orderDate ? orderDate.toISOString() : null,
    orderDate: orderDate ? orderDate.toISOString() : null,
    required_date: requiredDate ? requiredDate.toISOString() : null,
    deliveryDate: requiredDate ? requiredDate.toISOString() : null,
    status: orderRow.status || "Processing",
    total: totalValue,
    total_value: totalValue,
    paymentMethod: paymentMethodLabel,
    paymentMethodCode,
    customer,
    items,
    logistics,
    timeline: buildTimeline(orderRow.status, orderDate, logistics, city),
  };
}

// Simplified fetchOrders using stored procedure
async function fetchOrders(whereClause = "", params = []) {
  await ensureOrderSchema();

  const [rows] = await db.query(
    'CALL GetOrdersWithDetails(?, ?)',
    [whereClause || null, params[0] || null]
  );

  return rows.map(row => {
    const customer = {
      id: row.customer_id,
      name: row.customer_name,
      email: row.customer_email,
      phone: row.customer_phone,
      address: {
        street: row.customer_address,
        city: row.customer_city,
      },
    };

    // Parse items data
    const items = row.items_data ? 
      row.items_data.split('||').map(itemStr => {
        const [productId, quantity, subTotal, name, description, unitPrice, spaceUnit, stock] = 
          itemStr.split(':|:');
        return normalizeItemRow({
          product_id: productId,
          quantity: parseInt(quantity),
          sub_total: parseFloat(subTotal),
          product_name: name,
          product_description: description,
          unit_price: parseFloat(unitPrice),
          space_unit: parseInt(spaceUnit),
          stock: parseInt(stock)
        });
      }) : [];

    return formatOrder(row, customer, items);
  });
}

export async function getOrders() {
  return fetchOrders();
}

export async function getOrdersByCustomer(customerId) {
  return fetchOrders("WHERE o.customer_id = ?", [customerId]);
}

export async function getOrderById(orderId) {
  const [order] = await fetchOrders("WHERE o.order_id = ?", [orderId]);
  return order || null;
}

// Simplified createOrder using stored procedures
export async function createOrder(customerId, items, totalAmount, requiredDate, paymentMethod, contactInfo = {}) {
  await ensureOrderSchema();
  const connection = await db.getConnection();
  
  try {
    // Call stored procedure for order creation
    const [result] = await connection.query(
      'CALL CreateOrderWithItems(?, ?, ?, ?, ?, ?, ?, ?, @order_id)',
      [
        customerId,
        requiredDate,
        totalAmount,
        paymentMethod || 'cod',
        contactInfo.name || null,
        contactInfo.phone || null,
        contactInfo.address || null,
        contactInfo.city || null
      ]
    );

    // Get the generated order ID
    const [orderIdResult] = await connection.query('SELECT @order_id as order_id');
    const orderId = orderIdResult[0].order_id;

    // Add order items using stored procedure
    await connection.query(
      'CALL AddOrderItems(?, ?)',
      [orderId, JSON.stringify(items)]
    );

    return await getOrderById(orderId);
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
}

// Simplified quarterly orders
export async function getQuarterlyOrders(year) {
  const [orders] = await db.query('CALL GetQuarterlySalesAnalytics(?)', [year]);
  return orders;
}

export async function getCustomerOrderHistory(customerId) {
  const [history] = await db.query(
    `
    SELECT 
      YEAR(order_date) AS year,
      MONTH(order_date) AS month,
      COUNT(*) AS totalOrders,
      SUM(total_value) AS totalSpent
    FROM 
      \`Order\`
    WHERE 
      customer_id = ?
    GROUP BY 
      YEAR(order_date), MONTH(order_date)
    ORDER BY 
      YEAR(order_date), MONTH(order_date);
    `,
    [customerId]
  );
  return history;
}
