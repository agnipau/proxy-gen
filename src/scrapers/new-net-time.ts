import got from "got";
import { NewNetTimeProxy } from "../models/new-net-time";
import { emptyTextToNull } from "../utils";
import * as cheerio from "cheerio";

// NOTE: At the time of writing (5 Jenuary 2020) it contains 160 pages
const totalPages = 160;

export async function newNetTimeAllProxies(): Promise<NewNetTimeProxy[]> {
  const allProxies: NewNetTimeProxy[][] | null = [];

  let promises = [];
  for (let i = 1; i <= totalPages; i++) {
    promises.push(async () => (await newNetTime(i).next()).value);

    if (i % 10 === 0 || i === totalPages) {
      allProxies.push(...(await Promise.all(promises.map(x => x()))));
      console.log(
        `==> Extracted ${allProxies.length} proxies in total from New Net Time`,
      );
      promises = [];
    }
  }

  return allProxies.filter(x => x !== null).flat();
}

export async function* newNetTime(
  page: number = 1,
): AsyncGenerator<NewNetTimeProxy[] | null> {
  while (true) {
    try {
      const $ = cheerio.load(
        (
          await got.get(
            `http://www.nntime.com/proxy-list-${(page++)
              .toString()
              .padStart(2, "0")}.htm`,
            {
              headers: {
                Accept:
                  "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                "Accept-Encoding": "gzip, deflate",
                "Accept-Language": "en-US;q=0.8,en;q=0.7",
                Connection: "keep-alive",
                Host: "www.nntime.com",
                "Upgrade-Insecure-Requests": "1",
                "User-Agent":
                  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.88 Safari/537.36",
              },
              timeout: 3000,
            },
          )
        ).body,
      );

      const portDecypher = (() => {
        let arr = $(Array.from($("script"))[1])
          .html()
          ?.trim()
          .split(";");
        arr?.pop();

        const portDecypher = arr?.reduce(
          (acc: { [key: string]: number }, x) => {
            const [k, v] = x.split("=");
            acc[k] = parseInt(v);
            return acc;
          },
          {},
        );

        if (portDecypher === undefined) {
          throw new Error("Port decypher not found");
        }

        return portDecypher;
      })();

      const proxies = Array.from($("table#proxylist > tbody > tr")).map(row => {
        const cols = Array.from($(row).find("td")).map(x => $(x));

        const port =
          cols[1]
            .find("script")
            .html()
            ?.split('document.write(":"+')[1]
            .split(")")[0]
            .split("+")
            .map(k => portDecypher[k])
            .join("") ?? null;

        const ip = emptyTextToNull(cols[1].text());

        return {
          ip: ip?.split(":")[0] ?? null,
          port,
          anonymity: emptyTextToNull(cols[2].text())?.trim() ?? null,
          date: emptyTextToNull(cols[3].text())?.trim() ?? null,
          country: emptyTextToNull(cols[4].text())?.trim() ?? null,
          registeredTo: emptyTextToNull(cols[5].text())?.trim() ?? null,
        };
      });

      if (proxies.length === 0) {
        return [];
      }

      yield proxies;
    } catch (err) {
      console.log(`==> Error: ${err.message}`);
      yield null;
    }
  }
}
