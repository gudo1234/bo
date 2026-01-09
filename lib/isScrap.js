import { fetch } from 'undici';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import fs from 'fs/promises';

puppeteer.use(StealthPlugin());

/**
 * Verificación rápida usando undici.
 */
export async function isScrapeableUndici(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
                      'AppleWebKit/537.36 (KHTML, like Gecko) ' +
                      'Chrome/114.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: controller.signal,
      redirect: 'follow',
    });

    clearTimeout(timeout);

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) {
      return { ok: false, status: response.status, reason: `Unexpected content-type: ${contentType}` };
    }

    const html = await response.text();

    const protectionIndicators = [
      'cf-browser-verification',
      'Cloudflare',
      'Just a moment...',
      'Attention Required',
      'Checking your browser',
      'DDoS protection by',
      '<meta http-equiv="refresh"',
    ];

    if (protectionIndicators.some(ind => html.includes(ind))) {
      return { ok: false, status: response.status, reason: 'Cloudflare or similar protection detected' };
    }

    if (response.status >= 400) {
      return { ok: false, status: response.status, reason: 'HTTP error' };
    }

    return { ok: true, status: response.status };

  } catch (error) {
    clearTimeout(timeout);
    return {
      ok: false,
      status: 0,
      reason: error.name === 'AbortError' ? 'Request timed out' : error.message,
    };
  }
}


/**
 * Verificación avanzada con Puppeteer y StealthPlugin.
 */
export async function isScrapeableWithPuppeteer(url) {
  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
                            'AppleWebKit/537.36 (KHTML, like Gecko) ' +
                            'Chrome/114.0.0.0 Safari/537.36');

    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Upgrade-Insecure-Requests': '1',
    });

    const response = await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 15000,
    });

    // Espera 5 segundos de forma compatible con cualquier versión
    await new Promise(resolve => setTimeout(resolve, 5000));

    const status = response?.status() || 0;
    const html = await page.content();

    const blockedIndicators = [
      'Just a moment...',
      'cf-browser-verification',
      'DDoS protection by',
      'Checking your browser',
      'Access denied',
    ];

    if (status >= 400 || blockedIndicators.some(i => html.includes(i))) {
      await page.screenshot({ path: 'bloqueo.png', fullPage: true });
      await fs.writeFile('bloqueo.html', html);
      await browser.close();

      return {
        ok: false,
        status,
        reason: 'Blocked by JS-based protection',
      };
    }

    await browser.close();
    return { ok: true, status };

  } catch (error) {
    return {
      ok: false,
      reason: `Puppeteer error: ${error.message}`,
    };
  }
}



let x =await isScrapeableUndici("https://ApkCombo.app/r2?u=https%3A%2F%2Fapks.39b7cb94d40914bac590886981b0ed6e.r2.cloudflarestorage.com%2Fcom.opera.browser%2F90.0.4752.84419%2F1909013205.664d8e597a49d2d54601f7a936e3943bbcc609f4.apks%3Fresponse-content-disposition%3Dattachment%253B%2520filename%253D%2522Opera_90.0.4752.84419_apkcombo.com.xapk%2522%26response-content-type%3Dapplication%252Fxapk-package-archive%26X-Amz-Algorithm%3DAWS4-HMAC-SHA256%26X-Amz-Date%3D20250623T010249Z%26X-Amz-SignedHeaders%3Dhost%26X-Amz-Expires%3D14400%26X-Amz-Credential%3D3cb727b4cd4780c410b780ac7caa4da3%252F20250623%252Fauto%252Fs3%252Faws4_request%26X-Amz-Signature%3D07b10284c0add31644d45310deb2e321920ef8f080d431283a388b2820738ef4")
console.log(x)

x =await isScrapeableWithPuppeteer(" https://ApkCombo.app/r2?u=https%3A%2F%2Fapks.39b7cb94d40914bac590886981b0ed6e.r2.cloudflarestorage.com%2Fcom.opera.browser%2F90.0.4752.84419%2F1909013205.664d8e597a49d2d54601f7a936e3943bbcc609f4.apks%3Fresponse-content-disposition%3Dattachment%253B%2520filename%253D%2522Opera_90.0.4752.84419_apkcombo.com.xapk%2522%26response-content-type%3Dapplication%252Fxapk-package-archive%26X-Amz-Algorithm%3DAWS4-HMAC-SHA256%26X-Amz-Date%3D20250623T010249Z%26X-Amz-SignedHeaders%3Dhost%26X-Amz-Expires%3D14400%26X-Amz-Credential%3D3cb727b4cd4780c410b780ac7caa4da3%252F20250623%252Fauto%252Fs3%252Faws4_request%26X-Amz-Signature%3D07b10284c0add31644d45310deb2e321920ef8f080d431283a388b2820738ef4")
console.log(x)
