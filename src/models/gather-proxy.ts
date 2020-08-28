export interface GatherProxyProxy {
  city: string | null
  country: string
  ip: string
  lastUpdate: string
  port: number
  refs: unknown | null
  state: string | null
  time: number
  type: GatherProxyProxyType | null
  uid: string | null
  uptimeLd: string
}

export enum GatherProxyProxyType {
  Elite,
  Anonymous,
  Transparent
}
