import got from "got";
import { GatherProxyProxy, GatherProxyProxyType } from "../models/gather-proxy";

export interface GatherProxyAccount {
  email: string;
  password: string;
}

// TODO: Usare gli account per scaricare la lista completa
// Valutare se cambiare la pass a questi account
export const gatherProxyAccounts: readonly GatherProxyAccount[] = [
  { email: "another1@devnullmail.com", password: "Tt{[V;Ng" },
  { email: "another2@devnullmail.com", password: "l-r5r=_X" },
  { email: "some.one@safetymail.info", password: "1pQGv&!+" },
  { email: "some.one.else@safetymail.info", password: "@EIU$%gX" },
  { email: "some.other@reconmail.com", password: "aC|[#d#9" },
  { email: "email.address@reconmail.com", password: "R_CR#+bu" },
  { email: "real@veryrealemail.com", password: "[dI>>SBG" },
  { email: "really.real@veryrealemail.com", password: "[pQZ*j-s" },
  { email: "someemail4@tradermail.info", password: "q!gL$M{Q" },
];

export async function gatherProxy(): Promise<GatherProxyProxy[]> {
  const { body } = await got.get("http://www.gatherproxy.com", {
    headers: {
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
      "Accept-Encoding": "gzip, deflate",
      "Accept-Language": "en-US;q=0.8,en;q=0.7",
      "Cache-Control": "max-age=0",
      Connection: "keep-alive",
      Cookie: "_lang=en-US",
      Host: "www.gatherproxy.com",
      "Upgrade-Insecure-Requests": "1",
      "User-Agent":
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.88 Safari/537.36",
    },
  });

  return body
    .split("gp.insertPrx(")
    .slice(1)
    .map((x: string) => {
      const data = JSON.parse(`${x.split("}")[0]}}`);

      return {
        city: data.PROXY_CITY === "" ? null : data.PROXY_CITY,
        country: data.PROXY_COUNTRY,
        ip: data.PROXY_IP,
        lastUpdate: data.PROXY_LAST_UPDATE,
        port: parseInt(data.PROXY_PORT, 16),
        refs: data.PROXY_REFS,
        state: data.PROXY_STATE === "" ? null : data.PROXY_STATE,
        time: parseInt(data.PROXY_TIME),
        type:
          data.PROXY_TYPE === "Elite"
            ? GatherProxyProxyType.Elite
            : data.PROXY_TYPE === "Anonymous"
            ? GatherProxyProxyType.Anonymous
            : data.PROXY_TYPE === "Transparent"
            ? GatherProxyProxyType.Transparent
            : null,
        uid: data.PROXY_UID === "" ? null : data.PROXY_UID,
        uptimeLd: data.PROXY_UPTIMELD,
      };
    });
}
