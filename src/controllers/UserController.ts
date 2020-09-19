import path from 'path';
import { Message } from 'node-telegram-bot-api';

import { captchaResolver } from '../utils/captchaResolver';
import auctionModel from '../models/auctions';
import userModel from '../models/user';

import { bot, pup } from '../services';

export default class UserController {
  static async create({ chat }: Message) {
    const existedUser = await userModel.findOne({ chat_id: chat.id });

    if (!existedUser) {
      return userModel.create({
        first_name: chat.first_name,
        last_name: chat.last_name,
        username: chat.username,
        chat_id: chat.id,
      });
    }
  }

  static async login(email: string, password: string, chatId?: number) {
    const browser = await pup.getBrowser();
    const page = await browser.newPage();

    await page.goto('https://www.ebay.com/');

    await page.waitForSelector('#gh-ug > a');
    await page.click('#gh-ug > a');

    await page.waitFor(2000);

    if ((await page.$('#captcha-box')) !== null) {
      await captchaResolver(page);
    }

    await page.waitFor(2000);

    if (chatId) {
      await page.screenshot({ path: path.resolve('./temp/login.png') });
      await bot.sendPhoto(chatId, path.resolve('./temp/login.png'));
    }

    await page.focus('#userid');
    await page.keyboard.type(email, { delay: 100 });
    await page.click('#signin-continue-btn');

    await page.waitFor(2000);

    if (chatId) {
      await page.screenshot({ path: path.resolve('./temp/login.png') });
      await bot.sendPhoto(chatId, path.resolve('./temp/login.png'));
    }

    await page.focus('#pass');
    await page.keyboard.type(password, { delay: 120 });
    await page.click('#sgnBt');

    await page.waitFor(2000);

    if ((await page.$('#captcha-box')) !== null) {
      await captchaResolver(page);
    }

    await page.waitFor(2000);

    if (chatId) {
      await page.screenshot({ path: path.resolve('./temp/login.png') });
      await bot.sendPhoto(chatId, path.resolve('./temp/login.png'));
    }

    return page.close();
  }

  static subscribe(data: any, chatId: number) {
    setTimeout(async () => {
      const { message_id } = await bot.sendPhoto(chatId, data.imgSrc, {
        caption:
          '🔔 The auction ends soon!\n\n' +
          `<a href="${data.url}">${data.title}</a>`,
        parse_mode: 'HTML',
      });

      if (!(await UserController.checkIsAuthorized())) {
        // await UserController.login( !
        //   <email>,!
        //   <pass>,!
        //   chatId!
        // );
      }

      const browser = await pup.getBrowser();
      const page = await browser.newPage();

      await page.goto(
        `https://offer.ebay.com/ws/eBayISAPI.dll?MakeBid&item=${
          data.itemId
        }&maxbid=${'0'}`
      );

      const interval = setInterval(async () => {
        if (Date.now() >= Date.parse(data.endTime) - 1000) {
          clearInterval(interval);
          bot.sendMessage(chatId, 'The auction ended!', {
            reply_to_message_id: message_id,
          });
          // await page.click('#but_v4-2');
          await auctionModel.deleteOne({ itemId: data.itemId });
          await pup.close();
        }
      }, 100);
    }, Date.parse(data.endTime) - Date.now() - 120000);
  }

  static async checkIsAuthorized() {
    const browser = await pup.getBrowser();
    const page = await browser.newPage();
    await page.goto('https://www.ebay.com/');
    const cookies = await page.cookies();
    await page.close();

    return cookies.find(({ name }) => name === 'shs');
  }
}
