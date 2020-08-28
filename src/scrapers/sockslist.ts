import got from "got";
import * as cheerio from "cheerio";
import { emptyTextToNull } from "../utils";
import { SocksListProxy, SocksListProxies } from "../models/sockslist";

const prerendererEndpoint = "https://service.prerender.io/";

export async function socksListAllProxies(): Promise<SocksListProxies | null> {
  const firstPage: SocksListProxies | null = (await socksList().next()).value;

  if (firstPage === null) return null;

  const { lastPage } = firstPage;

  return {
    lastPage,
    proxies: [
      ...firstPage.proxies,
      ...(
        await Promise.all(
          Array.from(Array(lastPage)).map(async (_, i) => {
            console.log(`==> Launched request no. ${i + 1} for Socks List`);
            const data = (await socksList(i + 1).next())
              .value as SocksListProxies | null;
            console.log(`==> Received response no. ${i + 1} for Socks List`);
            return data;
          }),
        )
      )
        .filter((x): x is SocksListProxies => x !== null)
        .flatMap(x => x.proxies),
    ],
  };
}

export async function* socksList(
  page: number = 1,
): AsyncGenerator<SocksListProxies | null> {
  while (true) {
    try {
      const $ = cheerio.load(
        (
          await got.get(
            `${prerendererEndpoint}https://sockslist.net/proxy/server-socks-hide-ip-address/${page++}`,
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
        const anchors = $("div#pages > a");
        return parseInt($(anchors[anchors.length - 2]).text());
      })();

      const results: SocksListProxy[] = Array.from(
        $("table.proxytbl > tbody > tr:nth-child(n+2)"),
      ).map(row => {
        const r = $(row);
        const cols = Array.from(r.find("td")).map(x => $(x));

        const portText = emptyTextToNull(cols[1].text().trim());

        return {
          ip: emptyTextToNull(cols[0].text()),
          port: portText === null ? null : parseInt(portText),
          country: emptyTextToNull(cols[2].text().trim()),
          type: emptyTextToNull(cols[3].text().trim()),
          lastChecked: emptyTextToNull(cols[4].text()),
          checked: emptyTextToNull(cols[5].text().trim()),
        };
      });

      if (results.length === 0) break;

      yield {
        lastPage,
        proxies: results,
      };
    } catch (err) {
      console.log(`==> Error: ${err.message}`);
      yield null;
    }
  }
}
