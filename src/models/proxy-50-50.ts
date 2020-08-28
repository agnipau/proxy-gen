export interface Proxy5050Proxies {
  proxyList: Proxy5050Proxy[]
  proxyListUrls: Proxy5050ProxyListUrl[]
}

export interface Proxy5050Proxy {
  proxy: string | null
  port: number | null
  country: string | null
}

export interface Proxy5050ProxyListUrl {
  year: number | null
  months: (Proxy5050ProxyListUrlMonth | null)[]
}

export interface Proxy5050ProxyListUrlMonth {
  month: string | null
  ajaxUrl: string | null
  proxies: Proxy5050ProxyListProxies
}

export interface Proxy5050ProxyListProxies {
  path: string
  posts: Proxy5050ProxyListPost
}

export interface Proxy5050ProxyListPost {
  title: string
  url: string
}
