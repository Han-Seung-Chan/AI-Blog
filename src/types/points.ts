export interface PointTransaction {
  id: string;
  amount: number;
  transaction_type: string;
  description: string;
  created_at: string;
  blog_post?: {
    id: string;
    store_name: string;
  };
}

export interface PointResponse {
  points: number;
  transactions: PointTransaction[];
}
