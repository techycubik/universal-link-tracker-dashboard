export interface BrandLink {
  brand: string;
  UUID: string;
  created_at: string;
  created_by: string;
  real_url: string;
  short_url: string;
  link_status: "active" | "inactive" | "expired";
  campaign_id?: string;
  source?: string;
  metadata?: any;
}

export interface Brand {
  name: string;
  totalLinks: number;
  activeLinks: number;
  inactiveLinks: number;
  expiredLinks: number;
}

export interface CreateLinkInput {
  real_url: string;
  brand: string;
  created_by: string;
  campaign_id?: string;
  source?: string;
  metadata?: any;
}
