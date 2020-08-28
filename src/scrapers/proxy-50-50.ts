import got from 'got'
import * as cheerio from 'cheerio'
import { emptyTextToNull } from '../utils'
import {
  Proxy5050Proxy,
  Proxy5050ProxyListUrl,
  Proxy5050ProxyListProxies,
  Proxy5050Proxies
} from '../models/proxy-50-50'
import * as json5 from 'json5'

// TODO: Fare un generatore asincrono che itera per gli anni e i mesi e mettere
// un'opzione per non scrapeare altri mesi e anni

function monthNameToNumber(monthName: string): number | null {
  switch (monthName.trim().toLowerCase()) {
    case 'december':
      return 12
    case 'november':
      return 11
    case 'october':
      return 10
    case 'september':
      return 9
    case 'august':
      return 8
    case 'july':
      return 7
    case 'june':
      return 6
    case 'may':
      return 5
    case 'april':
      return 4
    case 'march':
      return 3
    case 'february':
      return 2
    case 'jenuary':
      return 1
    default:
      return null
  }
}

export async function proxy5050ProxyList(
  url: string
): Promise<Proxy5050Proxies | null> {
  try {
    const $ = cheerio.load(
      (
        await got.get(url, {
          headers: {
            accept:
              'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
            'accept-encoding': 'gzip, deflate, br',
            'accept-language': 'en-US;q=0.8,en;q=0.7',
            'cache-control': 'max-age=0',
            'sec-fetch-mode': 'navigate',
            'sec-fetch-site': 'same-origin',
            'sec-fetch-user': '?1',
            'upgrade-insecure-requests': '1',
            'user-agent':
              'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.88 Safari/537.36'
          },
          timeout: 3000
        })
      ).body
    )

    const proxyList: Proxy5050Proxy[] = Array.from(
      $('div.post-body tbody > tr:nth-child(n+2)')
    ).map(row => {
      const r = $(row)
      const cols = Array.from(r.find('td'))
        .slice(1)
        .map(x => $(x))

      const portText = emptyTextToNull(cols[1].text())

      return {
        proxy: emptyTextToNull(cols[0].text()),
        port: portText === null ? null : parseInt(portText),
        country: emptyTextToNull(cols[3].text())
      }
    })

    const proxyListUrls: Proxy5050ProxyListUrl[] = await Promise.all(
      Array.from($('div#BlogArchive1_ArchiveList > ul > li.archivedate')).map(
        async year => {
          const y = $(year)
          const yearText = emptyTextToNull(
            $(Array.from(y.find('a.post-count-link'))[0])
              .text()
              .trim()
          )

          const months = await Promise.all(
            Array.from(y.find('ul.hierarchy > li')).map(async month => {
              const m = $(month)
              const monthText = emptyTextToNull(
                m
                  .find('a.post-count-link')
                  .text()
                  .trim()
              )

              const ajaxUrl =
                monthText === null
                  ? null
                  : `${url}?action=getTitles&widgetId=BlogArchive1&widgetType=BlogArchive&responseType=js&path=https%3A%2F%2Fproxy50-50.blogspot.com%2F2019%2F${monthNameToNumber(
                      monthText ?? ''
                    )}%2F`

              if (ajaxUrl === null) return null

              try {
                const proxies: Proxy5050ProxyListProxies = json5.parse(
                  (
                    await got.get(ajaxUrl, {
                      headers: {
                        accept: '*/*',
                        'accept-encoding': 'gzip, deflate, br',
                        'accept-language': 'en-US;q=0.8,en;q=0.7',
                        'sec-fetch-mode': 'cors',
                        'sec-fetch-site': 'same-origin',
                        'user-agent':
                          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.88 Safari/537.36'
                      },
                      timeout: 3000
                    })
                  ).body
                    .split("getTitles',")[1]
                    .split(');')[0]
                )

                return { month: monthText, ajaxUrl, proxies }
              } catch (err) {
                console.log(`==> Error: ${err.message}`)
                return null
              }
            })
          )

          return { year: yearText === null ? null : parseInt(yearText), months }
        }
      )
    )

    return { proxyList, proxyListUrls }
  } catch (err) {
    console.log(`==> Error: ${err.message}`)
    return null
  }
}

export async function proxy5050(): Promise<Proxy5050Proxies | null> {
  return await proxy5050ProxyList('https://proxy50-50.blogspot.com')
}
