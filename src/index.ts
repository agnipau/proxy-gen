import * as fs from "fs";
import { AllProxies } from "./models/all-proxies";
import { parse } from "./parser";
import { coolProxy } from "./scrapers/cool-proxy";
import { freeProxyList } from "./scrapers/free-proxy-list";
import { freeProxyLists } from "./scrapers/free-proxy-lists";
import { hideMyNameAllProxies } from "./scrapers/hide-my-name";
import { newNetTimeAllProxies } from "./scrapers/new-net-time";
import { premProxyAllProxies } from "./scrapers/prem-proxy";
import { proxy5050 } from "./scrapers/proxy-50-50";
import { proxyListAllProxies } from "./scrapers/proxy-list";
import { proxyNova } from "./scrapers/proxy-nova";
import { proxyServerList24 } from "./scrapers/proxy-server-list-24";
import { proxyHttpAllProxies } from "./scrapers/proxyHttp";
import { socksListAllProxies } from "./scrapers/sockslist";
import { spysOne } from "./scrapers/spys-one";
import { testProxies } from "./test-proxies";

// TODO: Controllare break in AsyncGenerator
// TODO: Capire meglio come funzione `return` e `break` in AsyncGenerator

async function main() {
  const data: any = await Promise.all([
    coolProxy(),
    freeProxyList(),
    freeProxyLists(),
    hideMyNameAllProxies(),
    newNetTimeAllProxies(),
    premProxyAllProxies(),
    proxy5050(),
    proxyListAllProxies(),
    proxyNova(),
    proxyServerList24(),
    proxyHttpAllProxies(),
    socksListAllProxies(),
    spysOne(),
  ] as any);

  const allProxies: AllProxies = {
    coolProxy: data[0],
    freeProxyList: data[1],
    freeProxyLists: data[2],
    hideMyNameAllProxies: data[3],
    newNetTimeAllProxies: data[4],
    premProxyAllProxies: data[5],
    proxy5050: data[6],
    proxyListAllProxies: data[7],
    proxyNova: data[8],
    proxyServerList24: data[9],
    proxyHttpAllProxies: data[10],
    socksListAllProxies: data[11],
    spysOne: data[12],
  };

  fs.writeFileSync("proxies.json", JSON.stringify(allProxies, null, 2));

  const nonTestedProxies = parse(allProxies);

  fs.writeFileSync(
    "proxies-non-tested.json",
    JSON.stringify(nonTestedProxies, null, 2),
  );

  const testedProxies = await testProxies(nonTestedProxies);

  fs.writeFileSync(
    "proxies-tested.json",
    JSON.stringify(testedProxies, null, 2),
  );
}

main().catch(console.error);
