export interface ProxyListProxies {
  lastPage: number;
  proxyLists: ProxyListProxy[];
}

export interface ProxyListProxy {
  proxy: string | null;
  protocol: string | null;
  speed: string | null;
  type: string | null;
  country: string | null;
}
