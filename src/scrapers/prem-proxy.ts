import got from "got";
import * as cheerio from "cheerio";
import { emptyTextToNull } from "../utils";
import { PremProxyProxy } from "../models/prem-proxy";

// NOTE: This may change
const totalPages = 28;

export async function premProxyAllProxies(
  getAllKnown: boolean = true,
): Promise<PremProxyProxy[]> {
  const allProxies: PremProxyProxy[] = [];

  if (!getAllKnown) {
    for await (const proxies of premProxy()) {
      allProxies.push(...proxies);
      console.log(
        `==> Scraped ${allProxies.length} proxies in total from Prem Proxy`,
      );
    }
    return allProxies;
  }

  let promises: (() => Promise<PremProxyProxy[]>)[] = [];
  for (let i = 1; i <= totalPages; i++) {
    promises.push(async () => {
      const data = (await premProxy(i).next()).value as PremProxyProxy[];
      console.log(`==> Received response no. ${i} from Prem Proxy`);
      return data;
    });

    // TODO: cambiare anche in altri file il <=
    if (i % 10 === 0 || i === totalPages) {
      allProxies.push(...(await Promise.all(promises.map(x => x()))).flat());
      promises = [];
    }
  }

  return allProxies;
}

// TODO: Valutare se usare puppeteer in futuro
export async function* premProxy(
  page: number = 1,
): AsyncGenerator<PremProxyProxy[]> {
  while (true) {
    try {
      const $ = cheerio.load(
        (
          await got.get(
            `https://service.prerender.io/https://premproxy.com/list/${(page++)
              .toString()
              .padStart(2, "0")}.htm`,
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

      const proxies = Array.from(
        $("tbody > tr:nth-child(n+1):nth-last-child(n+2)"),
      ).map(row => {
        const cols = Array.from($(row).find("td")).map(x => $(x));

        const ip = emptyTextToNull(cols[0].text());
        const port = ip?.split(":")[1] ?? null;

        return {
          ip: ip?.split(":")[0] ?? null,
          port: port === null ? null : parseInt(port),
          anonymity: emptyTextToNull(cols[1].text())?.trim() ?? null,
          lastChecked: emptyTextToNull(cols[2].text()),
          country: emptyTextToNull(cols[3].text()),
          city: emptyTextToNull(cols[4].text())?.trim() ?? null,
          isp: emptyTextToNull(cols[5].text()),
        };
      });

      if (proxies.length === 0) {
        return [];
      }

      yield proxies;
    } catch (err) {
      return;
    }
  }
}
