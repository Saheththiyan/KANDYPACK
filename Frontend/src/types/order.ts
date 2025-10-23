export interface OrderProduct {
  id: string;
  product_id?: string;
  name: string;
  price: number;
  unit_price?: number;
  sku?: string;
  image?: string;
  description?: string;
  category?: string;
  spaceConsumption?: number;
  space_unit?: number;
}

export interface OrderItem {
  product: OrderProduct;
  quantity: number;
  price: number;
  subTotal?: number;
}

export interface OrderCustomer {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
  };
}

export interface OrderTimelineEntry {
  status: string;
  timestamp?: string;
  completed: boolean;
}

// export interface OrderLogistics {
//   rail: {
//     trainId: string;
//     departure: string;
//     arrival: string;
//     allocatedCapacity: number;
//     remainingCapacity: number;
//     wagonCode: string;
//     spaceUsed: number;
//   };
//   store: {
//     name: string;
//     address: string;
//     handoverTime?: string;
//   };
  // truck: {
  //   routeName: string;
  //   areasCovered: string[];
  //   etaWindow: string;
  //   truckPlate: string;
  //   driver: string;
  //   assistant: string;
  // };
// }

export interface CustomerOrder {
  id?: string;
  order_id: string;
  customer_id?: string;
  date?: string | null;
  orderDate?: string | null;
  required_date?: string | null;
  deliveryDate?: string | null;
  status: string;
  total: number;
  total_value?: number;
  paymentMethod?: string;
  paymentMethodCode?: string;
  customer?: OrderCustomer;
  items: OrderItem[];
  // logistics?: OrderLogistics;
  timeline?: OrderTimelineEntry[];
}
