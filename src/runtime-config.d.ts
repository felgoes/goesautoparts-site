interface GoesSiteConfig {
  apiBase?: string;
  whatsappNumber?: string;
}

interface Window {
  GOES_CONFIG?: GoesSiteConfig;
}
