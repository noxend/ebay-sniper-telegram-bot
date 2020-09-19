import bodyParser from 'body-parser';
import express, { Request } from 'express';
import TelegramBot, { Update } from 'node-telegram-bot-api';

const token = process.env.TELEGRAM_TOKE;
const host = process.env.APP_HOST;
const env = process.env.NODE_ENV || 'development';
const port = process.env.PORT || 5500;

let bot: TelegramBot;

if (env === 'production') {
  bot = new TelegramBot(token);
  bot.setWebHook(`${host}/bot`);

  const app = express();

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  app.post('/bot', (req: Request<{}, {}, Update>, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
  });

  app.listen(port, () => {
    console.log('listening');
  });
} else {
  bot = new TelegramBot(token, { polling: true });
}

export default bot;
