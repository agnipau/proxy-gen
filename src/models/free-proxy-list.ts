export enum FreeProxyListAnonymity {
  Anonymous,
  Elite,
  Transparent
}

export interface FreeProxyListProxy {
  ip: string | null
  port: number | null
  countryCode: string | null
  country: string | null
  anonimity: FreeProxyListAnonymity | null
  google: boolean | null
  https: boolean | null
  lastChecked: string | null
}
