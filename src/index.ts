import path from 'path';
import env from 'dotenv';
import fs from 'fs';

env.config();

if (!fs.existsSync(path.resolve('./temp'))) {
  fs.mkdirSync(path.resolve('./temp'));
}

import AuctionController from './controllers/AuctionController';
import { bot, pup } from './services';

const auctionController = new AuctionController();

bot.onText(
  /(http[s]:\/\/)(w+\.ebay\.(com|co\.uk)\/itm)(.*\/)(\d+)/,
  auctionController.create
);

bot.onText(/\/ping/, async (msg) => {
  return bot.sendMessage(msg.chat.id, 'pong');
});

bot.onText(/\/browser/, async (msg) => {
  console.log('ok');
  const browser = await pup.getBrowser();
  const page = await browser.newPage();
  await page.goto('http://google.com/');
  await page.screenshot({
    path: path.resolve('./temp/example.png'),
    fullPage: true,
  });

  await bot.sendPhoto(msg.chat.id, path.resolve('./temp/example.png'));

  return browser.close();
});

console.log({
  env: process.env.NODE_ENV,
  host: process.env.APP_HOST,
  port: process.env.PORT,
  token: process.env.TELEGRAM_TOKEN,
});
