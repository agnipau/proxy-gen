export interface HideMyNameProxies {
  lastStartOffset: number | null
  results: HideMyNameProxy[]
}

export interface HideMyNameProxy {
  ip: string | null
  port: number | null
  countryCity: string | null
  speed: string | null
  type: string | null
  anonymity: string | null
  lastCheck: string | null
}
