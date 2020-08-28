import * as cheerio from "cheerio";
import { HideMyNameProxy, HideMyNameProxies } from "../models/hidemy-name";
import * as cloudscraper from "cloudscraper";

const resultsPerPage = 64;

// NOTE: Bannano dopo poco
export async function hideMyNameAllProxies(): Promise<
  HideMyNameProxy[] | null
> {
  const gen = hideMyName();
  const firstIter: HideMyNameProxies | null = (await gen.next()).value;

  if (firstIter === null || firstIter.lastStartOffset === null) {
    return null;
  }

  const totalPages = firstIter.lastStartOffset / resultsPerPage;
  const allProxies = firstIter.results;

  let promises = [];
  for (let i = 1; i <= totalPages; i++) {
    promises.push(async () => (await hideMyName(i).next()).value.results);

    if (i % 6 === 0 || i === totalPages) {
      allProxies.push(...(await Promise.all(promises.map(x => x()))).flat());
      console.log(
        `==> Extracted ${allProxies.length} proxies in total from Hide My Name`,
      );
      promises = [];
    }
  }

  return allProxies;
}

export async function* hideMyName(
  page: number = 0,
): AsyncGenerator<HideMyNameProxies | null> {
  while (true) {
    try {
      const $ = cheerio.load(
        await cloudscraper.get(
          `https://hidemy.name/en/proxy-list/?start=${resultsPerPage * page++}`,
          {
            headers: {
              accept:
                "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
              "accept-encoding": "gzip, deflate, br",
              "accept-language": "en-US;q=0.8,en;q=0.7",
              "cache-control": "max-age=0",
              referer: "https://hidemy.name/en/proxy-list/",
              "sec-fetch-mode": "navigate",
              "sec-fetch-site": "same-origin",
              "sec-fetch-user": "?1",
              "upgrade-insecure-requests": "1",
              "user-agent":
                "Mozilla/5.0 (X11; Linux x86_resultsPerPage) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.88 Safari/537.36",
            },
          },
        ),
      );

      const results = Array.from($("tbody > tr")).map(row => {
        const cols = Array.from($(row).find("td")).map(x => $(x));

        const ipText = cols[0].text();
        const portText = cols[1].text();
        const countryCityText = cols[2].text();
        const speedText = cols[3].text();
        const typeText = cols[4].text();
        const anonymityText = cols[5].text();
        const lastCheckText = cols[6].text();

        return {
          ip: ipText === "" ? null : ipText,
          port: portText === "" ? null : parseInt(portText),
          countryCity:
            countryCityText === ""
              ? null
              : countryCityText.trim().replace("  ", " - "),
          speed: speedText === "" ? null : speedText.trim(),
          type: typeText === "" ? null : typeText,
          anonymity: anonymityText === "" ? null : anonymityText,
          lastCheck: lastCheckText === "" ? null : lastCheckText,
        };
      });

      const lastStartOffsetAttr =
        $("div.proxy__pagination > ul > li:nth-last-child(1) > a").attr(
          "href",
        ) ?? null;

      const lastStartOffset =
        lastStartOffsetAttr === null
          ? null
          : parseInt(lastStartOffsetAttr.split("?start=")[1].split("#")[0]);

      if (results.length === 0) {
        break;
      }

      yield { lastStartOffset, results };
    } catch (err) {
      console.error(
        `==> Error: probably cloudflare blocked this machine's IP and now hidemy.name is not accessible anymore`,
      );
      console.error(`==> Error message: ${err.message}`);
      return null;
    }
  }
}
