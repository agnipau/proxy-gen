import got from "got";
import * as cheerio from "cheerio";
import { emptyTextToNull } from "../utils";
import { ProxyServerList24Proxy } from "../models/proxy-server-list-24";

const fakeHeaders = {
  "User-Agent":
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.88 Safari/537.36",
  "Accept-Encoding": "gzip, deflate",
  "Accept-Language": "en-US;q=0.8,en;q=0.7",
  Host: "www.proxyserverlist24.top",
  Connection: "keep-alive",
  "Upgrade-Insecure-Requests": "1",
};

// TODO: Ridurre la duplicazione del codice negli header
export async function proxyServerList24(): Promise<
  ProxyServerList24Proxy[] | null
> {
  try {
    const $ = cheerio.load(
      (
        await got.get("http://www.proxyserverlist24.top/", {
          headers: {
            ...fakeHeaders,
            ...{
              Accept:
                "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
              "Cache-Control": "max-age=0",
            },
          },
          timeout: 3000,
        })
      ).body,
    );

    const proxies: ProxyServerList24Proxy[] = Array.from(
      $("div.post-outer > div"),
    ).map(post => {
      const p = $(post);
      const title = p.find("h3 > a");

      return {
        title: emptyTextToNull(title.text()),
        url: title.attr("href") ?? null,
        description: emptyTextToNull(
          p
            .find("div.post-body")
            .text()
            .trim(),
        ),
        datePosted: p.find("a.timestamp-link > abbr").attr("title") ?? null,
        proxyList: null,
      };
    });

    await Promise.all(
      proxies.map(async proxy => {
        if (proxy.url === null) return;

        try {
          const $ = cheerio.load(
            (
              await got.get(proxy.url, {
                headers: {
                  ...fakeHeaders,
                  ...{
                    Accept:
                      "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                    Referer: "http://www.proxyserverlist24.top/",
                  },
                },
                timeout: 3000,
              })
            ).body,
          );

          proxies.find(x => x.url === proxy.url)!.proxyList =
            emptyTextToNull(
              $("pre.alt2 > span > span:nth-last-child(1)").text(),
            )?.split("\n") ??
            $("div.post-body img").attr("src") ??
            null;
        } catch (err) {
          console.log(`==> Error on url ${proxy.url}: ${err.message}`);
          proxies.find(x => x.url === proxy.url)!.proxyList = null;
        }
      }),
    );

    return proxies;
  } catch (err) {
    console.log(`==> Error: ${err.message}`);
    return null;
  }
}
