import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import pupExtra from 'puppeteer-extra';
import pup from 'puppeteer';

let browser: pup.Browser | null;

const getBrowser = async () => {
  if (!browser) {
    pupExtra.use(StealthPlugin());

    browser = await pupExtra.launch({
      args: ['--no-sandbox'],
      defaultViewport: null,
      slowMo: 50,
    });
  }

  return browser;
};

const close = async () => {
  if (browser) {
    await browser.close();
    browser = null;
  }
};

export default { getBrowser, close };
