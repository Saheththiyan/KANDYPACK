import { API_URL } from './config';

export interface Product {
  product_id: string;
  name: string;
  description: string;
  unit_price: number;
  space_unit: number;
  stock: number;

  // Derived fields for UI convenience
  id: string;
  sku: string;
  price: number;
  image: string;
  category: string;
  spaceConsumption: number;
}

export interface ProductResponse {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export const fetchProducts = async (
  search: string = '',
  page: number = 1,
  pageSize: number = 12,
  sortBy: 'name' | 'price-low' | 'price-high' = 'name'
): Promise<ProductResponse> => {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
    sortBy,
  });
  if (search && search.trim()) params.set('search', search.trim());

  const res = await fetch(`${API_URL}/products?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch products: ${res.status} ${res.statusText}`);
  }

  const server = await res.json(); // { products, total, page, pageSize, totalPages }

  const normalized = (server.products || []).map((p:Product) => ({
    product_id: p.product_id,
    name: p.name,
    description: p.description,
    unit_price: Number(p.unit_price),
    space_unit: Number(p.space_unit),
    stock: Number(p.stock ?? 0),

    id: String(p.product_id),
    sku: `SKU-${String(p.product_id).substring(0, 8)}`,
    price: Number(p.unit_price),
    image: '/placeholder.svg',
    category: 'Product',
    spaceConsumption: Number(p.space_unit),
  }));

  return {
    products: normalized,
    total: Number(server.total ?? normalized.length),
    page: Number(server.page ?? page),
    pageSize: Number(server.pageSize ?? pageSize),
    totalPages: Number(server.totalPages ?? 1),
  };
};


// Cart management (localStorage-based)
export const getCart = (): CartItem[] => {
  const cart = localStorage.getItem('cart');
  return cart ? JSON.parse(cart) : [];
};

export const addToCart = (product: any, quantity: number = 1) => {
  // Ensure product has all required properties for consistency
  const productWithAllProps = {
    ...product,
    id: product.id || product.product_id,
    product_id: product.product_id || product.id,
    price: product.price || product.unit_price,
    unit_price: product.unit_price || product.price,
    spaceConsumption: product.spaceConsumption || product.space_unit,
    space_unit: product.space_unit || product.spaceConsumption
  };

  const cart = getCart();
  const existingItem = cart.find((item: any) => item.product.id === productWithAllProps.id);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({ product: productWithAllProps, quantity });
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  
  // Trigger custom event for cart updates
  window.dispatchEvent(new CustomEvent('cartUpdated'));
};

export const updateCartItem = (productId: string, quantity: number) => {
  const cart = getCart();
  const itemIndex = cart.findIndex((item: any) => item.product.id === productId);

  if (itemIndex > -1) {
    if (quantity <= 0) {
      cart.splice(itemIndex, 1);
    } else {
      cart[itemIndex].quantity = quantity;
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  }
};

export const removeFromCart = (productId: string) => {
  const cart = getCart();
  const updatedCart = cart.filter((item: any) => item.product.id !== productId);
  localStorage.setItem('cart', JSON.stringify(updatedCart));
  window.dispatchEvent(new CustomEvent('cartUpdated'));
};

export const clearCart = () => {
  localStorage.removeItem('cart');
  window.dispatchEvent(new CustomEvent('cartUpdated'));
};

// Sri Lankan cities for delivery
export const cities = [
  'Colombo', 'Negombo', 'Galle', 'Matara', 'Jaffna', 'Trincomalee'
];

export interface Order {
  id: string;
  date: string;
  total: number;
  status: 'Processing' | 'Scheduled' | 'In Transit' | 'Delivered' | 'Cancelled';
  customer: {
    name: string;
    email: string;
    phone: string;
    address: {
      street: string;
      city: string;
    };
  };
  items: {
    product: Product;
    quantity: number;
    price: number;
  }[];
  deliveryDate: string;
  paymentMethod: string;
  logistics: {
    rail: {
      trainId: string;
      departure: string;
      arrival: string;
      allocatedCapacity: number;
      remainingCapacity: number;
      wagonCode: string;
      spaceUsed: number;
    };
    store: {
      name: string;
      address: string;
      handoverTime?: string;
    };
    truck: {
      routeName: string;
      areasCovered: string[];
      etaWindow: string;
      truckPlate: string;
      driver: string;
      assistant: string;
    };
  };
  timeline: {
    status: string;
    timestamp: string;
    completed: boolean;
  }[];
}

// Mock orders storage
const mockOrders: Order[] = [];

// Order management
export const createOrder = async (orderData: {
  customer: Order['customer'];
  deliveryDate: string;
  paymentMethod: string;
}): Promise<Order> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 400));
  
  const cart = getCart();
  if (cart.length === 0) {
    throw new Error('Cart is empty');
  }
  
  // Calculate total space consumption
  const totalSpaceUsed = cart.reduce((sum, item) =>
    sum + (item.product.space_unit * item.quantity), 0
  );
  
  // Generate mock logistics based on city
  const city = orderData.customer.address.city;
  const trainCapacity = 1000;
  const trainId = `TR-${city.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`;
  
  const order: Order = {
    id: `ORD-${Date.now().toString().slice(-6)}`,
    date: new Date().toISOString(),
    total: cart.reduce((sum, item) => sum + (item.product.unit_price * item.quantity), 0) + 200, // +200 delivery fee
    status: 'Processing',
    customer: orderData.customer,
    items: cart.map(item => ({
      product: item.product,
      quantity: item.quantity,
      price: item.product.unit_price
    })),
    deliveryDate: orderData.deliveryDate,
    paymentMethod: orderData.paymentMethod,
    logistics: {
      rail: {
        trainId,
        departure: 'Kandy Central - 08:30 AM',
        arrival: `${city} Station - 02:15 PM`,
        allocatedCapacity: totalSpaceUsed,
        remainingCapacity: trainCapacity - totalSpaceUsed,
        wagonCode: `W-${Math.floor(Math.random() * 20) + 1}`,
        spaceUsed: totalSpaceUsed
      },
      store: {
        name: `${city} Distribution Center`,
        address: `123 Railway Road, ${city}`,
      },
      truck: {
        routeName: `${city}-Route-${Math.floor(Math.random() * 5) + 1}`,
        areasCovered: [`${city} Central`, `${city} South`, `${city} North`],
        etaWindow: '2:00 PM - 6:00 PM',
        truckPlate: `${city.substring(0, 2).toUpperCase()}-${Math.floor(Math.random() * 9000) + 1000}`,
        driver: 'D. Silva',
        assistant: 'A. Perera'
      }
    },
    timeline: [
      {
        status: `Scheduled on Train ${trainId}`,
        timestamp: new Date().toISOString(),
        completed: true
      },
      {
        status: 'Departed Kandy',
        timestamp: '',
        completed: false
      },
      {
        status: `Arrived ${city} Station`,
        timestamp: '',
        completed: false
      },
      {
        status: `Out for delivery (Route ${city}-${Math.floor(Math.random() * 5) + 1})`,
        timestamp: '',
        completed: false
      },
      {
        status: 'Delivered',
        timestamp: '',
        completed: false
      }
    ]
  };
  
  mockOrders.push(order);
  clearCart();
  
  return order;
};