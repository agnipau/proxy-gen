import { AllProxies } from "./models/all-proxies";
import { FreeProxyListsProxyList } from "./models/free-proxy-lists";
import { AllProxiesParsed } from "./models/all-proxies-parsed";

export function parse(
  allProxies: AllProxies,
  withKeys: boolean = false,
  removeDuplicates: boolean = true,
): string[] | AllProxiesParsed {
  const coolProxyProxies =
    allProxies.coolProxy
      ?.map(x => `${x.ip}:${x.port}`)
      .filter(x => x.trim().length > 0) ?? [];

  const freeProxyListProxies =
    allProxies.freeProxyList
      ?.map(x => (x.port === null ? x.ip : `${x.ip}:${x.port}`))
      .filter((x): x is string => x !== null && x.trim().length > 0) ?? [];

  const freeProxyListsProxies = Object.values(allProxies.freeProxyLists)
    .filter(
      (x: FreeProxyListsProxyList[] | null): x is FreeProxyListsProxyList[] =>
        x !== null,
    )
    .map(x => x.flatMap(y => y.proxies?.map(z => `${z.ip}:${z.port}`) ?? []))
    .flat()
    .filter(x => x.trim().length > 0);

  const hideMyNameProxies =
    allProxies.hideMyNameAllProxies
      ?.map(x => (x.port === null ? x.ip : `${x.ip}:${x.port}`))
      .filter((x): x is string => x !== null && x.trim().length > 0) ?? [];

  const newNetTimeProxies =
    allProxies.newNetTimeAllProxies
      ?.map(x => (x.port === null ? x.ip : `${x.ip}:${x.port}`))
      .filter((x): x is string => x !== null && x.trim().length > 0) ?? [];

  const premProxyProxies =
    allProxies.premProxyAllProxies
      ?.map(x => (x.port === null ? x.ip : `${x.ip}:${x.port}`))
      .filter((x): x is string => x !== null && x.trim().length > 0) ?? [];

  const proxy5050Proxies =
    allProxies.proxy5050?.proxyList
      .map(x => (x.port === null ? x.proxy : `${x.proxy}:${x.port}`))
      .filter((x): x is string => x !== null && x.trim().length > 0) ?? [];

  const proxyListProxies =
    allProxies.proxyListAllProxies?.proxyLists
      .map(x => x.proxy)
      .filter((x): x is string => x !== null && x.trim().length > 0) ?? [];

  const proxyNovaProxies =
    allProxies.proxyNova
      ?.map(x => (x.port === null ? x.ip : `${x.ip}:${x.port}`))
      .filter((x): x is string => x !== null && x.trim().length > 0) ?? [];

  const proxyServerList24Proxies =
    allProxies.proxyServerList24
      ?.flatMap(x =>
        typeof x.proxyList === "string"
          ? [x.proxyList]
          : x.proxyList?.map(x => x) ?? [],
      )
      .filter(x => x.trim().length > 0) ?? [];

  const proxyHttpProxies =
    allProxies.proxyHttpAllProxies?.proxies
      .map(x => (x.port === null ? x.ip : `${x.ip}:${x.port}`))
      .filter((x): x is string => x !== null && x.trim().length > 0) ?? [];

  const socksListProxies =
    allProxies.socksListAllProxies?.proxies
      .map(x => (x.port === null ? x.ip : `${x.ip}:${x.port}`))
      .filter((x): x is string => x !== null && x.trim().length > 0) ?? [];

  const spysOneProxies =
    allProxies.spysOne
      ?.map(x => (x.port === null ? x.ip : `${x.ip}:${x.port}`))
      .filter((x): x is string => x !== null && x.trim().length > 0) ?? [];

  if (withKeys) {
    return {
      coolProxy: coolProxyProxies,
      freeProxyList: freeProxyListProxies,
      freeProxyLists: freeProxyListsProxies,
      hideMyName: hideMyNameProxies,
      newNetTime: newNetTimeProxies,
      premProxy: premProxyProxies,
      proxy5050: proxy5050Proxies,
      proxyList: proxyListProxies,
      proxyNova: proxyNovaProxies,
      proxyServerList24: proxyServerList24Proxies,
      proxyHttp: proxyHttpProxies,
      socksList: socksListProxies,
      spysOne: spysOneProxies,
    };
  }

  const proxyList = [
    ...coolProxyProxies,
    ...freeProxyListProxies,
    ...freeProxyListsProxies,
    ...hideMyNameProxies,
    ...newNetTimeProxies,
    ...premProxyProxies,
    ...proxy5050Proxies,
    ...proxyListProxies,
    ...proxyNovaProxies,
    ...proxyServerList24Proxies,
    ...proxyHttpProxies,
    ...socksListProxies,
    ...spysOneProxies,
  ];

  if (removeDuplicates) {
    return [
      ...new Set(
        proxyList.filter((x): x is string => x !== null && x.trim() !== ""),
      ),
    ];
  }

  return proxyList;
}
