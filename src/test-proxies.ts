import * as net from "net";
import { AllProxiesParsed } from "./models/all-proxies-parsed";

interface ProxyIsValid {
  [proxy: string]: boolean;
}

export function checkConnection(
  ip: string,
  timeout: number = 3000,
): Promise<boolean> {
  return new Promise((resolve, _) => {
    const timer = setTimeout(() => {
      socket.end();
      resolve(false);
    }, timeout);

    const host = ip.includes(":") ? ip.split(":")[0] : ip;
    const port = ip.includes(":") ? parseInt(ip.split(":")[1]) : 80;

    const socket = net.createConnection(port, host, () => {
      clearTimeout(timer);
      socket.end();
      resolve(true);
    });

    socket.on("error", _ => {
      clearTimeout(timer);
      resolve(false);
    });
  });
}

// NOTE: Doesn't work in parallel, probably because the socket fills up quickly.
// Rewrite in rust
export async function testProxies(
  proxyList: string[] | AllProxiesParsed,
): Promise<ProxyIsValid> {
  let count = 1;

  const parsedProxyList: string[] = !Array.isArray(proxyList)
    ? Object.values(proxyList).flat()
    : proxyList;

  const validProxies: ProxyIsValid = {};
  for (const proxy of parsedProxyList) {
    const proxyIsValid = await checkConnection(proxy);
    console.log(
      `==> ${count++} / ${
        parsedProxyList.length
      } ${proxy} -> valid? ${proxyIsValid}`,
    );
    if (!proxyIsValid) continue;
    validProxies[proxy] = proxyIsValid;
  }

  return validProxies;
}
