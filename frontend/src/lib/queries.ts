import api from '../lib/api';
import type {
  Category, Product, ProductListItem, PaginatedResponse,
  DeliveryZone, OrderCreateResponse, Order
} from '../types';

// ─── Categories ───────────────────────────────────────────────────────────────

export const fetchCategories = async (): Promise<Category[]> => {
  const { data } = await api.get<PaginatedResponse<Category>>('/categories/');
  return data.results;
};

export const fetchCategoryBySlug = async (slug: string): Promise<Category> => {
  const { data } = await api.get<Category>(`/categories/${slug}/`);
  return data;
};

// ─── Products ─────────────────────────────────────────────────────────────────

export interface ProductQueryParams {
  search?: string;
  category?: string;
  min_price?: number;
  max_price?: number;
  ordering?: string;
  in_stock?: boolean;
  page?: number;
  ids?: string;
}

export const fetchProducts = async (params?: ProductQueryParams): Promise<PaginatedResponse<ProductListItem>> => {
  const { data } = await api.get<PaginatedResponse<ProductListItem>>('/products/', { params });
  return data;
};

export const fetchProductBySlug = async (slug: string): Promise<Product> => {
  const { data } = await api.get<Product>(`/products/${slug}/`);
  return data;
};

// ─── Delivery Zones ──────────────────────────────────────────────────────────

export const fetchDeliveryZones = async (): Promise<DeliveryZone[]> => {
  const { data } = await api.get<PaginatedResponse<DeliveryZone>>('/delivery-zones/');
  return data.results;
};

// ─── Orders ───────────────────────────────────────────────────────────────────

export interface OrderPayload {
  customer: { name: string; phone: string };
  address: string;
  delivery_zone_id: number;
  items: { product_id: number; quantity: number }[];
  customer_note: string;
  policy_accepted: boolean;
}

export const createOrder = async (payload: OrderPayload): Promise<OrderCreateResponse> => {
  const { data } = await api.post<OrderCreateResponse>('/orders/', payload);
  return data;
};

export const fetchOrder = async (orderNumber: string): Promise<Order> => {
  const { data } = await api.get<Order>(`/orders/${orderNumber}/`);
  return data;
};
