export interface ProxyListsProxies {
  lastBuildDate: string | null
  proxies: ProxyListsProxy[]
}

export interface ProxyListsProxy {
  ip: string | null
  port: number | null
  type: string | null
  country: string | null
  checkTimestamp: string | null
}
