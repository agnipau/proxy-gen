import got from "got";
import * as cheerio from "cheerio";
import { emptyTextToNull } from "../utils";
import { ProxyListProxy, ProxyListProxies } from "../models/proxy-list";

export async function proxyListAllProxies(): Promise<ProxyListProxies> {
  const firstPage = await proxyList().next();
  const lastPage = firstPage.value.lastPage;

  return {
    lastPage,
    proxyLists: (
      await Promise.all(
        Array.from(Array(lastPage)).map((_, i) => proxyList(i + 1).next()),
      )
    ).flatMap(x => x.value.proxyLists),
  };
}

export async function* proxyList(
  page: number = 1,
): AsyncGenerator<ProxyListProxies | null> {
  while (true) {
    try {
      const $ = cheerio.load(
        (await got.get(`https://proxy-list.org/english/index.php?p=${page++}`))
          .body,
      );

      const lastPage = parseInt(
        $("a.item")
          .last()
          .text(),
      );

      const results: ProxyListProxy[] = Array.from(
        $("div.proxy-table ul:nth-child(n+2)"),
      ).map(proxy => {
        const p = $(proxy);
        const cols = Array.from(p.find("li")).map(x => $(x));

        const proxyBase64 =
          cols[0]
            .find("script")
            .html()
            ?.split("'")[1]
            .split("'")[0] ?? null;

        return {
          proxy:
            proxyBase64 === null
              ? null
              : Buffer.from(proxyBase64, "base64").toString("ascii"),
          protocol: emptyTextToNull(cols[1].text()),
          speed: emptyTextToNull(cols[2].text()),
          type: emptyTextToNull(cols[3].text()),
          country: cols[4].find("span.country").attr("title") ?? null,
        };
      });

      if (results.length === 0) {
        break;
      }

      yield { lastPage, proxyLists: results };
    } catch (err) {
      console.log(`==> Error: ${err.message}`);
      return null;
    }
  }
}
