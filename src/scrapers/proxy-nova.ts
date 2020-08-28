import got from "got";
import * as cheerio from "cheerio";
import { emptyTextToNull, hardTrim } from "../utils";
import { ProxyNovaProxy } from "../models/proxy-nova";

export async function proxyNova(): Promise<ProxyNovaProxy[] | null> {
  try {
    const $ = cheerio.load(
      (
        await got.get("https://www.proxynova.com/proxy-server-list/", {
          headers: {
            Accept:
              "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US;q=0.8,en;q=0.7",
            "Cache-Control": "max-age=0",
            Connection: "keep-alive",
            Host: "www.proxynova.com",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "none",
            "Sec-Fetch-User": "?1",
            "Upgrade-Insecure-Requests": "1",
            "User-Agent":
              "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.88 Safari/537.36",
          },
          // NOTE: The server is slow so this is the best timeout
          timeout: 6000,
        })
      ).body,
    );

    return Array.from($("tr[data-proxy-id]")).map(row => {
      const r = $(row);
      const cols = Array.from(r.find("td")).map(x => $(x));

      const portText = emptyTextToNull(hardTrim(cols[1].text()));

      const [, ip] = cols[0]
        .find("script")
        .html()
        ?.split("'") ?? [null, null];

      return {
        ip: ip ?? null,
        port: portText === null ? null : parseInt(portText),
        date: cols[2].find("time").attr("datetime") ?? null,
        speed: emptyTextToNull(hardTrim(cols[3].text())),
        uptime: emptyTextToNull(hardTrim(cols[4].text())),
        country: emptyTextToNull(hardTrim(cols[5].text())),
        anonymity: emptyTextToNull(hardTrim(cols[6].text())),
        youtube: emptyTextToNull(hardTrim(cols[7].text())),
      };
    });
  } catch (err) {
    console.log(`==> Error: ${err.message}`);
    return null;
  }
}
