import axios from 'axios';
import queryString from 'query-string';

export default class Ebay {
  private tokenEndsTime: null | number = null;
  private clientToken: null | string = null;
  private config: any;

  constructor(config: any) {
    this.config = config;
  }

  async setClientToken() {
    const body = queryString.stringify({
      grant_type: 'client_credentials',
      scope: this.config.scopes.join(' '),
    });

    const encodedStr = this.base64Encode(
      `${this.config.credentials.clientId}:${this.config.credentials.clientSecret}`
    );

    const { data } = await axios.post(
      'https://api.ebay.com/identity/v1/oauth2/token',
      body,
      {
        headers: {
          'Content-Length': body.length,
          'Content-Type': 'application/x-www-form-urlencoded',
          authorization: `Basic ${encodedStr}`,
        },
      }
    );

    this.tokenEndsTime = data.expires_in * 1000 + Date.now();
    this.clientToken = data.access_token;
  }

  private isTokenExpiring() {
    if (this.tokenEndsTime && Date.now() >= this.tokenEndsTime - 60000)
      return true;
    else false;
  }

  async getItemData(itemId: number | string) {
    if (this.clientToken === null || this.isTokenExpiring()) {
      await this.setClientToken();
    }

    const response = await axios.get(
      `https://api.ebay.com/buy/browse/v1/item/v1|${itemId}|0`,
      {
        headers: {
          authorization: `Bearer ${this.clientToken}`,
          'Content-Type': 'application/json',
          'X-EBAY-C-ENDUSERCTX':
            'contextualLocation=country=<2_character_country_code>,zip=<zip_code>,affiliateCampaignId=<ePNCampaignId>,affiliateReferenceId=<referenceId></referenceId>',
        },
      }
    );

    return response.data;
  }

  async getBidsData(itemId: string) {
    const response = await axios.get(
      `https://www.ebay.com/lit/v1/item?item=${itemId}&dl=4`
    );

    return response.data.ViewItemLiteResponse.Item;
  }

  private base64Encode(encodeData: string) {
    return Buffer.from(encodeData).toString('base64');
  }
}
