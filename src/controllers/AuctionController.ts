  import moment from 'moment';
import TelegramBot, { Message } from 'node-telegram-bot-api';

import UserController from './UserController';
import userModel from '../models/user';
import auctionModel from '../models/auctions';
import { bot, Ebay } from '../services';

const ebayConfig = {
  scopes: ['https://api.ebay.com/oauth/api_scope'],
  credentials: {
    clientId: 'Oleksand-testappl-PRD-ec8eaa0db-1d2646d0',
    clientSecret: 'PRD-c8ee5576efdd-cfe4-44da-81d8-c686',
  },
};

const ebay = new Ebay(ebayConfig);

export default class AuctionController {
  async create({ chat, message_id }: Message, match: RegExpExecArray | null) {
    if (match) {
      const itemId = match[5];
      const url = match[0];

      const data = await ebay.getItemData(itemId);

      const [
        { CurrentPrice, BidCount, MinimumToBid, EndDate },
      ] = await ebay.getBidsData(itemId);

      const user = await userModel.findOne({ chat_id: chat.id });

      const createdItem = await auctionModel.create({
        endTime: new Date(`${EndDate.Date} ${EndDate.Time}`),
        minimumToBit: JSON.stringify(MinimumToBid),
        currentPrice: JSON.stringify(CurrentPrice),
        imgSrc: data.image.imageUrl,
        status: 'in progress',
        title: data.title,
        user: user?._id,
        bids: BidCount,
        itemId,
        url,
      });

      if (createdItem) {
        const info =
          '🔥 You have started following the new item\n\n' +
          `<a href="${createdItem.url}">${createdItem.title}</a>\n\n` +
          `💵 <i>Current price</i>: ${
            JSON.parse(createdItem.currentPrice).MoneyStandard
          }\n` +
          `💸 <i>Minimum to bid</i>: ${
            JSON.parse(createdItem.minimumToBit).MoneyStandard
          }\n` +
          `⌚️ <i>End time</i>: ${moment(createdItem.endTime).format(
            'LLLL'
          )}\n`;

        await bot.sendPhoto(chat.id, createdItem.imgSrc, {
          caption: info,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: '🌎 Open on Ebay',
                  url: createdItem.url,
                },
              ],
              [
                {
                  text: '⌚️ Show time to left',
                  callback_data: `t:${createdItem.itemId}`,
                },
              ],
              [
                {
                  text: '🗑 Remove from watchlist',
                  callback_data: `r:${createdItem.itemId}`,
                },
              ],
            ],
          },
        });

        await UserController.subscribe(createdItem, chat.id);

        return bot.deleteMessage(chat.id, message_id.toString());
      }
    }
  }
}
