export interface ProxyHttpProxies {
  lastPage: number;
  proxies: ProxyHttpProxy[];
}

export interface ProxyHttpProxy {
  ip: string | null;
  port: string | null;
  country: string | null;
  anonymity: string | null;
  https: boolean;
  lastChecked: string | null;
  checked: string | null;
}
