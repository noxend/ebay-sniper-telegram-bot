import { Document } from 'mongoose';

export interface IAuction extends Document {
  // _id?: string;
  itemId: string;
  title: string;
  currentPrice: string;
  minimumToBit: string;
  bids: number;
  url: string;
  imgSrc: string;
  user: string;
  status: string;
  endTime: Date;
}
