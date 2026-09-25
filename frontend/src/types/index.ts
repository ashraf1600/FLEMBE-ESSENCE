// TypeScript interfaces matching the DRF API responses

export interface CategoryMin {
  id: number;
  name: string;
  slug: string;
}

export interface Category extends CategoryMin {
  description: string;
  image: string | null;
  parent: number | null;
  children: Category[];
  is_active: boolean;
  created_at: string;
}

export interface ProductImage {
  id: number;
  url: string;
  image_url: string;
  alt_text: string;
  is_primary: boolean;
  display_order: number;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  material: string;
  price: string;
  stock_quantity: number;
  stock_status: 'IN_STOCK' | 'OUT_OF_STOCK';
  sku: string;
  category: CategoryMin | null;
  is_active: boolean;
  images: ProductImage[];
  primary_image: ProductImage | null;
  created_at: string;
  updated_at: string;
}

export interface ProductListItem {
  id: number;
  name: string;
  slug: string;
  price: string;
  stock_quantity: number;
  stock_status: 'IN_STOCK' | 'OUT_OF_STOCK';
  category: CategoryMin | null;
  primary_image: ProductImage | null;
  is_active: boolean;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface DeliveryZone {
  id: number;
  name: string;
  city: string;
  area: string;
  delivery_charge: string;
  is_free: boolean;
  is_active: boolean;
}

export interface OrderItem {
  id: number;
  product: number | null;
  product_name: string;
  unit_price: string;
  quantity: number;
  subtotal: string;
}

export interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  delivery_zone_name: string;
  delivery_zone_city: string;
  address: string;
  subtotal: string;
  delivery_charge: string;
  total_amount: string;
  payment_method: string;
  payment_status: string;
  order_status: string;
  policy_accepted: boolean;
  customer_note: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface OrderCreateResponse {
  order_number: string;
  subtotal: string;
  delivery_charge: string;
  total_amount: string;
  payment_method: string;
  payment_status: string;
  order_status: string;
  message: string;
}

export interface CartItem {
  product: ProductListItem;
  quantity: number;
}

export interface CheckoutForm {
  customer: {
    name: string;
    phone: string;
  };
  address: string;
  delivery_zone_id: number | null;
  customer_note: string;
  policy_accepted: boolean;
}
