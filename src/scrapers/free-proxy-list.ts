import {
  FreeProxyListProxy,
  FreeProxyListAnonymity,
} from "../models/free-proxy-list";
import got from "got";
import * as cheerio from "cheerio";

export async function freeProxyList(): Promise<FreeProxyListProxy[] | null> {
  try {
    const $ = cheerio.load(
      (
        await got.get("https://free-proxy-list.net", {
          headers: {
            "accept-language": "en-US;q=0.8,en;q=0.7",
            "cache-control": "max-age=0",
            "sec-fetch-mode": "navigate",
            "sec-fetch-site": "none",
            "sec-fetch-user": "?1",
            "upgrade-insecure-requests": "1",
            "user-agent":
              "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.88 Safari/537.36",
          },
          timeout: 3000,
        })
      ).body,
    );

    return Array.from($("table#proxylisttable > tbody > tr")).map(tr => {
      const cols = Array.from($(tr).find("td")).map(x => $(x));

      const ipText = cols[0].text();
      const portText = cols[1].text();
      const countryCodeText = cols[2].text();
      const countryText = cols[3].text();
      const anonymityText = cols[4].text();
      const googleText = cols[5].text();
      const httpsText = cols[6].text();
      const lastCheckedText = cols[7].text();

      return {
        ip: ipText === "" ? null : ipText,
        port: portText === "" ? null : parseInt(portText),
        countryCode: countryCodeText === "" ? null : countryCodeText,
        country: countryText === "" ? null : countryText,
        anonimity:
          anonymityText === ""
            ? null
            : anonymityText === "anonymous"
            ? FreeProxyListAnonymity.Anonymous
            : anonymityText === "elite proxy"
            ? FreeProxyListAnonymity.Elite
            : anonymityText === "transparent"
            ? FreeProxyListAnonymity.Transparent
            : null,
        google:
          googleText === ""
            ? null
            : googleText === "yes"
            ? true
            : googleText === "no"
            ? false
            : null,
        https:
          httpsText === ""
            ? null
            : httpsText === "yes"
            ? true
            : httpsText === "no"
            ? false
            : null,
        lastChecked: lastCheckedText === "" ? null : lastCheckedText,
      };
    });
  } catch (err) {
    console.log(`==> Error: ${err.message}`);
    return null;
  }
}
