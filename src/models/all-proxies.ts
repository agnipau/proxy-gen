import { CoolProxyProxy } from "./cool-proxy";
import { FreeProxyListProxy } from "./free-proxy-list";
import { FreeProxyListsProxyLists } from "./free-proxy-lists";
import { HideMyNameProxy } from "./hidemy-name";
import { NewNetTimeProxy } from "./new-net-time";
import { PremProxyProxy } from "./prem-proxy";
import { Proxy5050Proxies } from "./proxy-50-50";
import { ProxyListProxies } from "./proxy-list";
import { ProxyNovaProxy } from "./proxy-nova";
import { ProxyServerList24Proxy } from "./proxy-server-list-24";
import { ProxyHttpProxies } from "./proxy-http";
import { SocksListProxies } from "./sockslist";
import { SpysOneProxy } from "./spys-one";

export interface AllProxies {
  coolProxy: CoolProxyProxy[] | null;
  freeProxyList: FreeProxyListProxy[] | null;
  freeProxyLists: FreeProxyListsProxyLists;
  hideMyNameAllProxies: HideMyNameProxy[] | null;
  newNetTimeAllProxies: NewNetTimeProxy[];
  premProxyAllProxies: PremProxyProxy[];
  proxy5050: Proxy5050Proxies | null;
  proxyListAllProxies: ProxyListProxies;
  proxyNova: ProxyNovaProxy[] | null;
  proxyServerList24: ProxyServerList24Proxy[] | null;
  proxyHttpAllProxies: ProxyHttpProxies | null;
  socksListAllProxies: SocksListProxies | null;
  spysOne: SpysOneProxy[];
}
