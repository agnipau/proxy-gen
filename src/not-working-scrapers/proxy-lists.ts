import got from 'got'
import * as cheerio from 'cheerio'
import { emptyTextToNull } from '../utils'
import { ProxyListsProxies } from '../models/proxy-lists'

export async function proxyLists(): Promise<ProxyListsProxies> {
  const body = (
    await got.get('http://www.proxylists.net/proxylists.xml', {
      headers: {
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'Accept-Encoding': 'gzip, deflate',
        'Accept-Language': 'en-US;q=0.8,en;q=0.7',
        'Cache-Control': 'max-age=0',
        Connection: 'keep-alive',
        Host: 'www.proxylists.net',
        'Upgrade-Insecure-Requests': '1',
        'User-Agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.88 Safari/537.36'
      },
      timeout: 3000
    })
  ).body.replace(/prx:/g, 'prx-')

  const $ = cheerio.load(body, { xmlMode: true })

  return {
    lastBuildDate: emptyTextToNull($('lastBuildDate').text()),
    proxies: Array.from($('prx-proxy')).map(proxy => {
      const p = $(proxy)

      const portText = emptyTextToNull(p.find('prx-port').text())

      return {
        ip: emptyTextToNull(p.find('prx-ip').text()),
        port: portText === null ? null : parseInt(portText),
        type: emptyTextToNull(p.find('prx-type').text()),
        country: emptyTextToNull(p.find('prx-country').text()),
        checkTimestamp: emptyTextToNull(p.find('prx-check_timestamp').text())
      }
    })
  }
}
