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

  // Stock Keeping Unit
  return {
    product: {
      id: row.product_id,
      product_id: row.product_id,
      sku: `SKU-${String(row.product_id).slice(0, 8)}`, // Take the first 8 characters of the product ID and the prefix 'SKU-'
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

async function fetchOrders(whereClause = "", params = []) {
  await ensureOrderSchema();

  const [orders] = await db.query(
    `
      SELECT 
        o.order_id,
        o.customer_id,
        o.order_date,
        o.required_date,
        o.status,
        o.total_value,
        o.payment_method
      FROM \`Order\` o
      ${whereClause}
      ORDER BY o.order_date DESC, o.order_id DESC
    `,
    params
  );

  if (!orders.length) {
    return [];
  }

  const orderIds = orders.map((order) => order.order_id);

  let itemRows = [];
  if (orderIds.length) {
    const placeholders = orderIds.map(() => "?").join(", ");
    [itemRows] = await db.query(
      `
        SELECT 
          oi.order_id,
          oi.product_id,
          oi.quantity,
          oi.sub_total,
          p.name AS product_name,
          p.description AS product_description,
          p.unit_price,
          p.space_unit,
          p.stock
        FROM Order_Item oi
        JOIN Product p ON oi.product_id = p.product_id
        WHERE oi.order_id IN (${placeholders})
        ORDER BY oi.order_id
      `,
      orderIds
    );
  }

  const itemsByOrder = new Map();
  for (const row of itemRows) {
    const normalized = normalizeItemRow(row);
    if (!itemsByOrder.has(row.order_id)) {
      itemsByOrder.set(row.order_id, []);
    }
    itemsByOrder.get(row.order_id).push(normalized);
  }

  const customerIds = [
    ...new Set(orders.map((order) => order.customer_id).filter(Boolean)),
  ];

  let customerMap = new Map();
  if (customerIds.length) {
    const placeholders = customerIds.map(() => "?").join(", ");
    const [customers] = await db.query(
      `
        SELECT customer_id, name, email, phone, address, city
        FROM Customer
        WHERE customer_id IN (${placeholders})
      `,
      customerIds
    );
    customerMap = new Map(
      customers.map((customer) => [
        customer.customer_id,
        normalizeCustomerRow(customer),
      ])
    );
  }

  return orders.map((order) => {
    const customer = customerMap.get(order.customer_id) || null;
    const items = itemsByOrder.get(order.order_id) || [];
    return formatOrder(order, customer, items);
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

export async function createOrder(
  customerId,
  items,
  totalAmount,
  requiredDate,
  paymentMethod,
  contactInfo = {}
) {
  await ensureOrderSchema();
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const productQuantities = new Map();
    for (const item of items) {
      const productId = item.productId;
      const quantity = Number(item.quantity ?? 0);
      if (!productId || Number.isNaN(quantity) || quantity <= 0) {
        const error = new Error("Invalid order item payload detected");
        error.code = "INVALID_ORDER_ITEM";
        throw error;
      }
      productQuantities.set(
        productId,
        (productQuantities.get(productId) || 0) + quantity
      );
    }

    const productIds = [...productQuantities.keys()];
    if (!productIds.length) {
      const error = new Error("Order must include at least one product");
      error.code = "INVALID_ORDER_ITEM";
      throw error;
    }
    const placeholders = productIds.map(() => "?").join(", ");
    const [productRows] = await connection.query(
      `
        SELECT product_id, name, stock
        FROM Product
        WHERE product_id IN (${placeholders})
        FOR UPDATE
      `,
      productIds
    );

    const stockMap = new Map(
      productRows.map((row) => [
        row.product_id,
        {
          name: row.name,
          stock: Number(row.stock ?? 0),
        },
      ])
    );

    for (const [productId, requestedQty] of productQuantities.entries()) {
      const productInfo = stockMap.get(productId);
      if (!productInfo) {
        const error = new Error(`Product ${productId} not found`);
        error.code = "PRODUCT_NOT_FOUND";
        throw error;
      }

      if (requestedQty > productInfo.stock) {
        const error = new Error(
          `Requested quantity (${requestedQty}) for ${productInfo.name} exceeds available stock (${productInfo.stock}).`
        );
        error.code = "INSUFFICIENT_STOCK";
        error.meta = {
          productId,
          requested: requestedQty,
          available: productInfo.stock,
        };
        throw error;
      }
    }

    const orderId = crypto.randomUUID();
    const normalizedTotal = Number(totalAmount ?? 0);
    const methodCode = paymentMethod || "cod";

    const orderQuery = `
      INSERT INTO \`Order\` (
        order_id, customer_id, order_date, required_date, status, total_value, payment_method
      )
      VALUES (?, ?, NOW(), ?, 'Processing', ?, ?)
    `;

    await connection.query(orderQuery, [
      orderId,
      customerId,
      requiredDate,
      normalizedTotal,
      methodCode,
    ]);

    const orderItemQuery = `
      INSERT INTO Order_Item (product_id, order_id, quantity, sub_total)
      VALUES (?, ?, ?, ?)
    `;

    for (const item of items) {
      const quantity = Number(item.quantity ?? 0);
      const price = Number(item.price ?? 0);
      const subTotal = price * quantity;

      await connection.query(orderItemQuery, [
        item.productId,
        orderId,
        quantity,
        subTotal,
      ]);
    }

    for (const [productId, orderedQty] of productQuantities.entries()) {
      await connection.query(
        `
          UPDATE Product
          SET stock = stock - ?
          WHERE product_id = ?
        `,
        [orderedQty, productId]
      );
    }

    const { name, phone, address, city } = contactInfo;
    if (name || phone || address || city) {
      await connection.query(
        `
          UPDATE Customer
          SET 
            name = COALESCE(?, name),
            phone = COALESCE(?, phone),
            address = COALESCE(?, address),
            city = COALESCE(?, city)
          WHERE customer_id = ?
        `,
        [name ?? null, phone ?? null, address ?? null, city ?? null, customerId]
      );
    }

    await connection.commit();

    return await getOrderById(orderId);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
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

export async function getCustomerOrderSummary(customerId) {
  const [rows] = await db.query(
    `
      SELECT
        COUNT(*) AS totalOrders,
        COALESCE(SUM(CASE WHEN LOWER(status) = 'in transit' THEN 1 ELSE 0 END), 0) AS ordersInTransit,
        COALESCE(SUM(CASE WHEN LOWER(status) = 'delivered' THEN 1 ELSE 0 END), 0) AS ordersDelivered,
        COALESCE(SUM(total_value), 0) AS totalSpent
      FROM \`Order\`
      WHERE customer_id = ?
    `,
    [customerId]
  );

  const [summary = {}] = rows;

  return {
    totalOrders: Number(summary.totalOrders ?? 0),
    ordersInTransit: Number(summary.ordersInTransit ?? 0),
    ordersDelivered: Number(summary.ordersDelivered ?? 0),
    totalSpent: Number(summary.totalSpent ?? 0),
  };
}

export async function getAvailableOrderYears() {
  const [rows] = await db.query(
    `
      SELECT DISTINCT YEAR(order_date) AS year
      FROM \`Order\`
      ORDER BY year DESC
    `
  );

  const years = rows
    .map((row) => Number(row.year))
    .filter((value) => Number.isFinite(value));

  if (!years.length) {
    return [new Date().getFullYear()];
  }

  return years;
}

export async function getQuarterlySalesSummary(year) {
  const [rows] = await db.query(
    `
      WITH quarter_nums AS (
        SELECT 1 AS quarter
        UNION ALL SELECT 2
        UNION ALL SELECT 3
        UNION ALL SELECT 4
      ),
      order_summary AS (
        SELECT 
          QUARTER(order_date) AS quarter,
          COUNT(*) AS totalOrders,
          SUM(total_value) AS totalRevenue
        FROM \`Order\`
        WHERE YEAR(order_date) = ?
        GROUP BY QUARTER(order_date)
      ),
      unit_summary AS (
        SELECT 
          QUARTER(o.order_date) AS quarter,
          SUM(oi.quantity) AS totalUnits
        FROM Order_Item oi
        JOIN \`Order\` o ON oi.order_id = o.order_id
        WHERE YEAR(o.order_date) = ?
        GROUP BY QUARTER(o.order_date)
      )
      SELECT 
        q.quarter,
        COALESCE(o.totalOrders, 0) AS totalOrders,
        COALESCE(o.totalRevenue, 0) AS totalRevenue,
        COALESCE(u.totalUnits, 0) AS totalUnits
      FROM quarter_nums q
      LEFT JOIN order_summary o ON o.quarter = q.quarter
      LEFT JOIN unit_summary u ON u.quarter = q.quarter
      ORDER BY q.quarter
    `,
    [year, year]
  );

  return rows.map((row) => ({
    quarter: Number(row.quarter),
    totalOrders: Number(row.totalOrders ?? 0),
    totalRevenue: Number(row.totalRevenue ?? 0),
    totalUnits: Number(row.totalUnits ?? 0),
  }));
}

export async function getQuarterMonthlyBreakdown(year, quarter) {
  const safeQuarter = [1, 2, 3, 4].includes(Number(quarter))
    ? Number(quarter)
    : 1;

  const startMonth = (safeQuarter - 1) * 3 + 1;
  const months = [startMonth, startMonth + 1, startMonth + 2];

  const [orderRows] = await db.query(
    `
      SELECT 
        MONTH(order_date) AS month,
        SUM(total_value) AS totalRevenue,
        COUNT(*) AS totalOrders
      FROM \`Order\`
      WHERE YEAR(order_date) = ? AND QUARTER(order_date) = ?
      GROUP BY MONTH(order_date)
    `,
    [year, safeQuarter]
  );

  const [unitRows] = await db.query(
    `
      SELECT 
        MONTH(o.order_date) AS month,
        SUM(oi.quantity) AS totalUnits
      FROM Order_Item oi
      JOIN \`Order\` o ON oi.order_id = o.order_id
      WHERE YEAR(o.order_date) = ? AND QUARTER(o.order_date) = ?
      GROUP BY MONTH(o.order_date)
    `,
    [year, safeQuarter]
  );

  const orderMap = new Map();
  for (const row of orderRows) {
    const month = Number(row.month);
    orderMap.set(month, {
      totalRevenue: Number(row.totalRevenue ?? 0),
      totalOrders: Number(row.totalOrders ?? 0),
    });
  }

  const unitMap = new Map();
  for (const row of unitRows) {
    const month = Number(row.month);
    unitMap.set(month, Number(row.totalUnits ?? 0));
  }

  const monthLabels = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return months.map((month) => {
    const orderInfo = orderMap.get(month) || {
      totalRevenue: 0,
      totalOrders: 0,
    };
    const totalUnits = unitMap.get(month) ?? 0;

    return {
      month,
      label: monthLabels[month - 1],
      totalRevenue: orderInfo.totalRevenue,
      totalOrders: orderInfo.totalOrders,
      totalUnits,
    };
  });
}

export async function getQuarterlyOrders(year) {
  const [orders] = await db.query(
    `
    SELECT 
      q.q AS quarter,
      IFNULL(t.totalOrders, 0) AS totalOrders,
      IFNULL(t.totalRevenue, 0) AS totalRevenue
    FROM 
      (SELECT 1 AS q UNION SELECT 2 UNION SELECT 3 UNION SELECT 4) q
    LEFT JOIN (
      SELECT 
        QUARTER(order_date) AS quarter,
        COUNT(*) AS totalOrders,
        SUM(total_value) AS totalRevenue
      FROM 
        \`Order\`
      WHERE 
        YEAR(order_date) = ?
      GROUP BY 
        QUARTER(order_date)
    ) t ON t.quarter = q.q
    ORDER BY 
      q.q;
    `,
    [year]
  );
  return orders;
}
