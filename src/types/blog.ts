export interface BlogPost {
  id: string;
  store_name: string;
  main_keyword: string;
  status: string;
  ai_content?: string;
  blog_url?: string;
  store_url?: string;
  assigned_to?: string;
  assigned_user?: {
    name: string;
    email: string;
  };
  has_images?: boolean;
  rejection_reason?: string;
  created_at: string;
  [key: string]: any;
}

export interface BlogTableColumn {
  key: string;
  title: string;
  render?: (post: BlogPost) => React.ReactNode;
}
