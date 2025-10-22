// Mock API layer for customer interface with Promise delays

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
  spaceConsumption: number; // units per box
  stock: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  order_id: string;
  date: string;
  total_value: number;
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

// Mock product data
// const mockProducts: Product[] = [
//   {
//     id: '1',
//     sku: 'DET-001',
//     name: 'Premium Laundry Detergent',
//     category: 'Detergents',
//     price: 450,
//     image: '/placeholder.svg',
//     description: 'High-quality concentrated laundry detergent with enzyme action.',
//     spaceConsumption: 24,
//     stock: 150
//   },
//   {
//     id: '2',
//     sku: 'SOAP-001',
//     name: 'Antibacterial Hand Soap',
//     category: 'Soaps',
//     price: 180,
//     image: '/placeholder.svg',
//     description: 'Gentle antibacterial hand soap with moisturizing formula.',
//     spaceConsumption: 36,
//     stock: 200
//   },
//   {
//     id: '3',
//     sku: 'TIS-001',
//     name: 'Premium Facial Tissue',
//     category: 'Tissues',
//     price: 320,
//     image: '/placeholder.svg',
//     description: 'Soft and absorbent facial tissues, 3-ply construction.',
//     spaceConsumption: 12,
//     stock: 80
//   },
//   {
//     id: '4',
//     sku: 'DET-002',
//     name: 'Fabric Softener',
//     category: 'Detergents',
//     price: 380,
//     image: '/placeholder.svg',
//     description: 'Leaves clothes soft and fresh with long-lasting fragrance.',
//     spaceConsumption: 20,
//     stock: 120
//   },
//   {
//     id: '5',
//     sku: 'CLEAN-001',
//     name: 'All-Purpose Cleaner',
//     category: 'Cleaners',
//     price: 220,
//     image: '/placeholder.svg',
//     description: 'Powerful multi-surface cleaner for kitchen and bathroom.',
//     spaceConsumption: 30,
//     stock: 90
//   },
//   {
//     id: '6',
//     sku: 'SOAP-002',
//     name: 'Dishwashing Liquid',
//     category: 'Soaps',
//     price: 160,
//     image: '/placeholder.svg',
//     description: 'Cuts through grease with gentle formula for hands.',
//     spaceConsumption: 28,
//     stock: 180
//   },
//   {
//     id: '7',
//     sku: 'TIS-002',
//     name: 'Kitchen Paper Towels',
//     category: 'Tissues',
//     price: 280,
//     image: '/placeholder.svg',
//     description: 'Extra absorbent paper towels for kitchen cleaning.',
//     spaceConsumption: 16,
//     stock: 100
//   },
//   {
//     id: '8',
//     sku: 'CLEAN-002',
//     name: 'Glass Cleaner',
//     category: 'Cleaners',
//     price: 190,
//     image: '/placeholder.svg',
//     description: 'Streak-free shine for windows and mirrors.',
//     spaceConsumption: 32,
//     stock: 75
//   },
//   {
//     id: '9',
//     sku: 'DET-003',
//     name: 'Stain Remover',
//     category: 'Detergents',
//     price: 350,
//     image: '/placeholder.svg',
//     description: 'Powerful stain removal for tough stains and spots.',
//     spaceConsumption: 40,
//     stock: 60
//   },
//   {
//     id: '10',
//     sku: 'SOAP-003',
//     name: 'Body Wash',
//     category: 'Soaps',
//     price: 420,
//     image: '/placeholder.svg',
//     description: 'Moisturizing body wash with natural extracts.',
//     spaceConsumption: 24,
//     stock: 140
//   },
//   {
//     id: '11',
//     sku: 'TIS-003',
//     name: 'Toilet Paper',
//     category: 'Tissues',
//     price: 380,
//     image: '/placeholder.svg',
//     description: 'Soft and strong toilet paper, 2-ply comfort.',
//     spaceConsumption: 8,
//     stock: 200
//   },
//   {
//     id: '12',
//     sku: 'CLEAN-003',
//     name: 'Floor Cleaner',
//     category: 'Cleaners',
//     price: 240,
//     image: '/placeholder.svg',
//     description: 'Deep cleaning floor cleaner with fresh scent.',
//     spaceConsumption: 25,
//     stock: 85
//   },
//   {
//     id: '13',
//     sku: 'DET-004',
//     name: 'Bleach',
//     category: 'Detergents',
//     price: 180,
//     image: '/placeholder.svg',
//     description: 'Whitening and disinfecting bleach for laundry.',
//     spaceConsumption: 36,
//     stock: 110
//   },
//   {
//     id: '14',
//     sku: 'SOAP-004',
//     name: 'Shampoo',
//     category: 'Soaps',
//     price: 520,
//     image: '/placeholder.svg',
//     description: 'Nourishing shampoo for all hair types.',
//     spaceConsumption: 20,
//     stock: 95
//   },
//   {
//     id: '15',
//     sku: 'TIS-004',
//     name: 'Napkins',
//     category: 'Tissues',
//     price: 150,
//     image: '/placeholder.svg',
//     description: 'Premium dining napkins for restaurants and homes.',
//     spaceConsumption: 50,
//     stock: 160
//   },
//   {
//     id: '16',
//     sku: 'CLEAN-004',
//     name: 'Bathroom Cleaner',
//     category: 'Cleaners',
//     price: 260,
//     image: '/placeholder.svg',
//     description: 'Specialized cleaner for bathroom tiles and fixtures.',
//     spaceConsumption: 28,
//     stock: 70
//   },
//   {
//     id: '17',
//     sku: 'DET-005',
//     name: 'Wool Wash',
//     category: 'Detergents',
//     price: 480,
//     image: '/placeholder.svg',
//     description: 'Gentle detergent specially formulated for wool and delicates.',
//     spaceConsumption: 30,
//     stock: 45
//   },
//   {
//     id: '18',
//     sku: 'SOAP-005',
//     name: 'Conditioner',
//     category: 'Soaps',
//     price: 490,
//     image: '/placeholder.svg',
//     description: 'Deep conditioning treatment for smooth, healthy hair.',
//     spaceConsumption: 20,
//     stock: 85
//   },
//   {
//     id: '19',
//     sku: 'TIS-005',
//     name: 'Wet Wipes',
//     category: 'Tissues',
//     price: 220,
//     image: '/placeholder.svg',
//     description: 'Antibacterial wet wipes for hands and surfaces.',
//     spaceConsumption: 60,
//     stock: 130
//   },
//   {
//     id: '20',
//     sku: 'CLEAN-005',
//     name: 'Carpet Cleaner',
//     category: 'Cleaners',
//     price: 380,
//     image: '/placeholder.svg',
//     description: 'Deep cleaning solution for carpets and upholstery.',
//     spaceConsumption: 22,
//     stock: 55
//   }
// ];

// Sri Lankan cities for delivery  
export const cities = [
  'Colombo', 'Negombo', 'Galle', 'Matara', 'Jaffna', 'Trincomalee'
];

// Mock orders storage
const mockOrders: Order[] = [];

// API simulation helpers
const simulateDelay = () => {
  const delay = Math.random() * 500 + 400; // 400-900ms
  return new Promise(resolve => setTimeout(resolve, delay));
};

const simulateNetworkError = () => {
  if (Math.random() < 0.03) { // 3% chance
    throw new Error('Network error occurred. Please try again.');
  }
};

// Product API
export const fetchProducts = async (query?: string, page: number = 1, pageSize: number = 12) => {
  await simulateDelay();
  simulateNetworkError();

  let filteredProducts = mockProducts;

  if (query) {
    const searchTerm = query.toLowerCase();
    filteredProducts = mockProducts.filter(product =>
      product.name.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm) ||
      product.sku.toLowerCase().includes(searchTerm)
    );
  }

  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  return {
    products: paginatedProducts,
    total: filteredProducts.length,
    page,
    pageSize,
    totalPages: Math.ceil(filteredProducts.length / pageSize)
  };
};

export const fetchProduct = async (id: string): Promise<Product | null> => {
  await simulateDelay();
  simulateNetworkError();

  return mockProducts.find(product => product.id === id) || null;
};

// Cart management (localStorage-based)
export const getCart = (): CartItem[] => {
  const cart = localStorage.getItem('cart');
  return cart ? JSON.parse(cart) : [];
};

export const addToCart = (product: Product, quantity: number = 1) => {
  const cart = getCart();
  const existingItem = cart.find(item => item.product.id === product.id);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({ product, quantity });
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  
  // Trigger custom event for cart updates
  window.dispatchEvent(new CustomEvent('cartUpdated'));
};

export const updateCartItem = (productId: string, quantity: number) => {
  const cart = getCart();
  const itemIndex = cart.findIndex(item => item.product.id === productId);

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
  const updatedCart = cart.filter(item => item.product.id !== productId);
  localStorage.setItem('cart', JSON.stringify(updatedCart));
  window.dispatchEvent(new CustomEvent('cartUpdated'));
};

export const clearCart = () => {
  localStorage.removeItem('cart');
  window.dispatchEvent(new CustomEvent('cartUpdated'));
};

// Order management
export const createOrder = async (orderData: {
  customer: Order['customer'];
  deliveryDate: string;
  paymentMethod: string;
}): Promise<Order> => {
  await simulateDelay();
  simulateNetworkError();

  const cart = getCart();
  if (cart.length === 0) {
    throw new Error('Cart is empty');
  }

  // Calculate total space consumption
  const totalSpaceUsed = cart.reduce((sum, item) => 
    sum + (item.product.spaceConsumption * item.quantity), 0
  );

  // Generate mock logistics based on city
  const city = orderData.customer.address.city;
  const trainCapacity = 1000;
  const trainId = `TR-${city.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`;
  
  const order: Order = {
    id: `ORD-${Date.now().toString().slice(-6)}`,
    date: new Date().toISOString(),
    total: cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0) + 200, // +200 delivery fee
    status: 'Processing',
    customer: orderData.customer,
    items: cart.map(item => ({
      product: item.product,
      quantity: item.quantity,
      price: item.product.price
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

export const fetchOrders = async (): Promise<Order[]> => {
  await simulateDelay();
  simulateNetworkError();

  // Filter orders by current user (in a real app, this would be server-side)
  return mockOrders.reverse(); // Most recent first
};

export const fetchOrder = async (id: string): Promise<Order | null> => {
  await simulateDelay();
  simulateNetworkError();

  return mockOrders.find(order => order.id === id) || null;
};

export const advanceOrderStatus = async (id: string): Promise<Order | null> => {
  await simulateDelay();
  simulateNetworkError();

  const order = mockOrders.find(order => order.id === id);
  if (!order) return null;

  // Find next incomplete status and mark it as completed
  const nextIncompleteIndex = order.timeline.findIndex(item => !item.completed);
  if (nextIncompleteIndex > -1 && nextIncompleteIndex < order.timeline.length - 1) {
    order.timeline[nextIncompleteIndex + 1].completed = true;
    order.timeline[nextIncompleteIndex + 1].timestamp = new Date().toISOString();
    
    // Update order status based on timeline progress
    const completedCount = order.timeline.filter(item => item.completed).length;
    if (completedCount === 2) order.status = 'Scheduled';
    else if (completedCount === 3) order.status = 'In Transit';
    else if (completedCount === 4) order.status = 'In Transit';
    else if (completedCount === 5) order.status = 'Delivered';
  }

  return order;
};