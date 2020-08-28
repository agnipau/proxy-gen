import { delay } from "../utils";
import {
  FreeProxyListsProxyLists,
  FreeProxyListsProxy,
  FreeProxyListsProxyList,
} from "../models/free-proxy-lists";
import got from "got";
import * as cheerio from "cheerio";

async function freeProxyListsProxyList(
  category: string,
  id: string,
  requestsTimeoutMs?: number,
): Promise<FreeProxyListsProxy[] | null> {
  try {
    const { body } = await got.get(
      `http://www.freeproxylists.com/load_${category}_${id}.html`,
      {
        headers: {
          Accept: "*/*",
          "Accept-Encoding": "gzip, deflate",
          "Accept-Language": "en-US;q=0.8,en;q=0.7",
          Connection: "keep-alive",
          Host: "www.freeproxylists.com",
          Referer: `http://www.freeproxylists.com/${category}/${id}.html`,
          "User-Agent":
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.88 Safari/537.36",
        },
        timeout: requestsTimeoutMs,
      },
    );

    return body
      .split("&lt;td&gt;")
      .slice(1)
      .map((x: string) => x.split("&lt;/td&gt;")[0])
      .reduce((acc: any[], x: string) => {
        if (acc.length === 0) {
          acc.push({
            ip: x,
            port: undefined,
            https: undefined,
            latency: undefined,
            dateChecked: undefined,
            country: undefined,
          });
          return acc;
        }

        if (acc[acc.length - 1].port === undefined) {
          acc[acc.length - 1].port = parseInt(x);
          return acc;
        }

        if (acc[acc.length - 1].https === undefined) {
          acc[acc.length - 1].https = x === "true" ? true : false;
          return acc;
        }

        if (acc[acc.length - 1].latency === undefined) {
          acc[acc.length - 1].latency = parseInt(x);
          return acc;
        }

        if (acc[acc.length - 1].dateChecked === undefined) {
          acc[acc.length - 1].dateChecked = x;
          return acc;
        }

        if (acc[acc.length - 1].country === undefined) {
          acc[acc.length - 1].country = x;
          return acc;
        }

        acc.push({
          ip: x,
          port: undefined,
          https: undefined,
          latency: undefined,
          dateChecked: undefined,
          country: undefined,
        });
        return acc;
      }, []);
  } catch (err) {
    console.log(`==> Error: ${err.message}`);
    return null;
  }
}

export async function freeProxyLists(
  delayMs: number = 3000,
  requestsTimeoutMs?: number,
): Promise<FreeProxyListsProxyLists> {
  const proxyLists: (FreeProxyListsProxyList[] | null)[] = await Promise.all(
    [
      "http://www.freeproxylists.com/elite.html",
      "http://www.freeproxylists.com/anonymous.html",
      "http://www.freeproxylists.com/non-anonymous.html",
      "http://www.freeproxylists.com/https.html",
      "http://www.freeproxylists.com/standard.html",
      "http://www.freeproxylists.com/socks.html",
    ].map(async url => {
      try {
        const $ = cheerio.load(
          (
            await got.get(url, {
              headers: {
                Accept:
                  "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                "Accept-Encoding": "gzip, deflate",
                "Accept-Language": "en-US;q=0.8,en;q=0.7",
                "Cache-Control": "max-age=0",
                Connection: "keep-alive",
                Host: "www.freeproxylists.com",
                "Upgrade-Insecure-Requests": "1",
                "User-Agent":
                  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.88 Safari/537.36",
              },
              timeout: requestsTimeoutMs,
            })
          ).body,
        );

        return Array.from(
          $(
            "body > table > tbody > tr:nth-child(4) > td:nth-child(3) > table > tbody > tr:nth-child(2) > td table > tbody > tr:nth-child(n+2)",
          ),
        ).map(row => {
          const cols = Array.from($(row).find("td")).map(x => $(x));

          const rawProxyList = cols[0].find("a");
          const rawProxyListText = rawProxyList.text();
          const rawProxyListHref = rawProxyList.attr("href") ?? null;

          const detailedProxyList = cols[1].find("a");
          const detailedProxyListText = detailedProxyList.text();
          const detailedProxyListHref = detailedProxyList.attr("href") ?? null;

          const numberOfProxiesText = cols[2].text();

          const dateCheckedText = cols[3].text();

          return {
            category:
              url
                .split("/")
                .pop()
                ?.split(".")[0] ?? null,
            id: rawProxyListHref?.split("/")[1].split(".")[0] ?? null,
            rawProxyList: {
              url:
                rawProxyListHref === null
                  ? null
                  : `http://www.freeproxylists.com/${rawProxyListHref}`,
              name: rawProxyListText === "" ? null : rawProxyListText,
              size: (cols[0]
                .text()
                .split(rawProxyListText)[1]
                ?.trim()
                .replace(/[()]/g, "") ?? null) as string | null,
            },
            detailedProxyList: {
              url:
                detailedProxyListHref === null
                  ? null
                  : `http://www.freeproxylists.com/${detailedProxyListHref}`,
              name: detailedProxyListText === "" ? null : detailedProxyListText,
              size: (cols[1]
                .text()
                .split(detailedProxyListText)[1]
                ?.trim()
                .replace(/[()]/g, "") ?? null) as string | null,
            },
            numberOfProxies:
              numberOfProxiesText === "" ? null : parseInt(numberOfProxiesText),
            dateChecked: dateCheckedText === "" ? null : dateCheckedText.trim(),
            proxies: null,
          };
        });
      } catch (err) {
        console.log(`==> Error on url ${url}: ${err.message}`);
        return null;
      }
    }),
  );

  let promises = [];
  for (let i = 0; i < proxyLists.length; i++) {
    if (proxyLists[i] === null) continue;

    for (let k = 0; k < proxyLists[i]!.length; k++) {
      promises.push(
        (async () => {
          console.log(`  -> Launched proxyLists[${i}][${k}]`);
          proxyLists[i]![k].proxies = await freeProxyListsProxyList(
            proxyLists[i]![k].category!,
            `d${proxyLists[i]![k].id}`,
          );
          console.log(`  -> Finished proxyLists[${i}][${k}]`);
        })(),
      );

      if (k + 1 === proxyLists[i]!.length) {
        await Promise.all(promises);
        promises = [];
        await delay(delayMs);
      }
    }
  }

  return {
    elite: proxyLists[0],
    anonymous: proxyLists[1],
    nonAnonymous: proxyLists[2],
    https: proxyLists[3],
    standard: proxyLists[4],
    socks: proxyLists[5],
  };
}
