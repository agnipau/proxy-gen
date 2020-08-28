import got from "got";
import * as cheerio from "cheerio";
import { emptyTextToNull } from "../utils";
import { SpysOneProxy } from "../models/spys-one";

const prerendererEndpoint = "https://service.prerender.io/";

export async function spysOne(): Promise<SpysOneProxy[]> {
  return (
    await Promise.all(
      [
        `${prerendererEndpoint}http://spys.one/en/https-ssl-proxy/`,
        `${prerendererEndpoint}http://spys.one/en/socks-proxy-list/`,
        `${prerendererEndpoint}http://spys.one/en/http-proxy-list/`,
        `${prerendererEndpoint}http://spys.one/en/anonymous-proxy-list/`,
        `${prerendererEndpoint}http://spys.one/en/non-anonymous-proxy-list/`,
      ].map(async url => {
        return (
          await Promise.all(
            [0, 1, 2].map(async page => {
              const pageUrl = url + (page === 0 ? "" : page);

              try {
                const $ = cheerio.load(
                  (
                    await got.get(pageUrl, {
                      headers: {
                        "User-Agent":
                          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.88 Safari/537.36",
                      },
                      timeout: 3000,
                    })
                  ).body,
                );

                return Array.from(
                  $(
                    "table table tbody > tr.spy1xx[onmouseover],tr.spy1x[onmouseover]",
                  ),
                ).map(row => {
                  const r = $(row);
                  const cols = Array.from(r.find("td")).map(x => $(x));

                  const ip = emptyTextToNull(cols[0].text());
                  const port =
                    (ip?.includes(":") ? parseInt(ip.split(":")[1]) : null) ??
                    null;

                  return {
                    ip: (ip?.includes(":") ? ip.split(":")[0] : ip) ?? null,
                    port,
                    https: emptyTextToNull(cols[1].text()),
                    anonymity: emptyTextToNull(cols[2].text()),
                    country: emptyTextToNull(cols[3].text()),
                    hostnameOrg: emptyTextToNull(cols[4].text()),
                    latency: emptyTextToNull(cols[5].text()),
                    uptime: emptyTextToNull(cols[8].text()),
                    checkDate: emptyTextToNull(cols[9].text()),
                  };
                });
              } catch (err) {
                console.log(`==> Error on url ${pageUrl}: ${err.message}`);
                return null;
              }
            }),
          )
        )
          .filter((x): x is SpysOneProxy[] => x !== null)
          .flat();
      }),
    )
  ).flat();
}
