export interface FreeProxyListsProxyLists {
  elite: FreeProxyListsProxyList[] | null
  anonymous: FreeProxyListsProxyList[] | null
  nonAnonymous: FreeProxyListsProxyList[] | null
  https: FreeProxyListsProxyList[] | null
  standard: FreeProxyListsProxyList[] | null
  socks: FreeProxyListsProxyList[] | null
}

export interface FreeProxyListsProxyList {
  category: string | null
  id: string | null
  rawProxyList: {
    url: string | null
    name: string | null
    size: string | null
  }
  detailedProxyList: {
    url: string | null
    name: string | null
    size: string | null
  }
  numberOfProxies: number | null
  dateChecked: string | null
  proxies: FreeProxyListsProxy[] | null
}

export interface FreeProxyListsProxy {
  ip: string
  port: number
  https: boolean
  latency: number
  dateChecked: string
  country: string
}
