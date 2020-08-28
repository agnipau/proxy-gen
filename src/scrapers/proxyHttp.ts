import got from "got";
import * as cheerio from "cheerio";
import { emptyTextToNull } from "../utils";
import { ProxyHttpProxies, ProxyHttpProxy } from "../models/proxy-http";

const prerendererEndpoint = "https://service.prerender.io/";

export async function proxyHttpAllProxies(): Promise<ProxyHttpProxies | null> {
  const firstPage: ProxyHttpProxies | null = (await proxyHttp().next()).value;

  if (firstPage === null) return null;

  const { lastPage } = firstPage;

  return {
    lastPage,
    proxies: [
      ...firstPage.proxies,
      ...(
        await Promise.all(
          Array.from(Array(lastPage)).map(async (_, i) => {
            console.log(`==> Launched request no. ${i + 1} for Proxy HTTP`);
            const data = (await proxyHttp(i + 1).next())
              .value as ProxyHttpProxies | null;
            console.log(`==> Received response no. ${i + 1} for Proxy HTTP`);
            return data;
          }),
        )
      )
        .filter((x): x is ProxyHttpProxies => x !== null)
        .flatMap(x => x.proxies),
    ],
  };
}

export async function* proxyHttp(
  page: number = 0,
): AsyncGenerator<ProxyHttpProxies | null> {
  while (true) {
    try {
      const $ = cheerio.load(
        (
          await got.get(
            `${prerendererEndpoint}https://proxyhttp.net/free-list/anonymous-server-hide-ip-address/${page++}`,
            {
              headers: {
                "User-Agent":
                  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.88 Safari/537.36",
              },
              timeout: 3000,
            },
          )
        ).body,
      );

      const lastPage = (() => {
        const anchors = Array.from($("div#pages > a"));
        return parseInt($(anchors[anchors.length - 2]).text());
      })();

      const results: ProxyHttpProxy[] = Array.from(
        $("table.proxytbl tbody > tr:nth-child(n+2)"),
      ).map(row => {
        const r = $(row);
        const cols = Array.from(r.find("td")).map(x => $(x));

        return {
          ip: emptyTextToNull(cols[0].text()),
          port: emptyTextToNull(cols[1].text().trim()),
          country: emptyTextToNull(cols[2].text().trim()),
          anonymity: emptyTextToNull(cols[3].text().trim()),
          https: emptyTextToNull(cols[4].text().trim()) === null,
          lastChecked: emptyTextToNull(cols[5].text().trim()),
          checked: emptyTextToNull(cols[6].text().trim()),
        };
      });

      if (results.length === 0) break;

      yield {
        lastPage,
        proxies: results,
      };
    } catch (err) {
      console.log(`==> Error: ${err.message}`);
      return null;
    }
  }
}
