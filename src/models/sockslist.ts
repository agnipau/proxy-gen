export interface SocksListProxies {
  lastPage: number;
  proxies: SocksListProxy[];
}

export interface SocksListProxy {
  ip: string | null;
  port: number | null;
  country: string | null;
  type: string | null;
  lastChecked: string | null;
  checked: string | null;
}
