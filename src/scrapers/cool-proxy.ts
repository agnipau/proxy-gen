import got from "got";
import { CoolProxyProxy } from "../models/cool-proxy";

export async function coolProxy(): Promise<CoolProxyProxy[] | null> {
  try {
    return JSON.parse(
      (
        await got.get("https://www.cool-proxy.net/proxies.json", {
          headers: {
            accept: "application/json, text/plain, */*",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "en-US;q=0.8,en;q=0.7",
            referer: "https://www.cool-proxy.net/",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "user-agent":
              "Mozila/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.88 Safari/537.36",
          },
          timeout: 3000,
        })
      ).body,
    );
  } catch (err) {
    console.log(`==> Error: ${err.message}`);
    return null;
  }
}
