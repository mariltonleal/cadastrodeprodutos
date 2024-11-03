export interface User {
  id: string;
  email: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  user_id: string;
  created_at: string;
}