export interface AnalyticsEvent {
  tracking_id: string;
  timestamp: string;
  event_uuid: string;
  brand: string;
  link_uuid?: string;
  event_type: string;

  // Visitor information
  visitor_ip: string;
  user_agent: string;

  // Geolocation
  country: string;
  city: string;
  region: string;
  timezone: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;

  // Network
  asn: string;
  asn_organization: string;
  edge_location: string;

  // Security
  threat_score?: number;
  bot_management?: {
    score: number;
    static_resource: boolean;
    verified_bot: boolean;
  };

  // HTTP/Protocol
  http_protocol: string;
  tls_version?: string;
  tls_cipher?: string;

  // Page/URL
  url: string;
  page_url?: string;
  page_path?: string;
  page_search?: string;
  page_hash?: string;
  page_title?: string;
  referrer: string;

  // Browser/Device
  language?: string;
  accept_language?: string;
  screen_resolution?: string;
  viewport_size?: string;

  // Event-specific
  time_on_page_seconds?: number;
  max_scroll_depth?: number;
  visibility_state?: string;
  hidden?: boolean;

  metadata?: any;
}

export interface EventSession {
  tracking_id: string;
  brand: string;
  event_count: number;
  first_event: string;
  last_event: string;
  country: string;
  city: string;
  user_agent: string;
  events: AnalyticsEvent[];
}
