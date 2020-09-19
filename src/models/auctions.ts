import mongoose from '../services/mongoose';
import { IAuction } from '../interfaces';

const auctionsSchema = new mongoose.Schema(
  {
    hash: {
      type: mongoose.Schema.Types.Number,
    },
    title: {
      type: mongoose.Schema.Types.String,
    },
    currentPrice: {
      type: mongoose.Schema.Types.String,
    },
    minimumToBit: {
      type: mongoose.Schema.Types.String,
    },
    bids: {
      type: mongoose.Schema.Types.Number,
    },
    status: {
      type: mongoose.Schema.Types.String,
    },
    url: {
      type: mongoose.Schema.Types.String,
    },
    imgSrc: {
      type: mongoose.Schema.Types.String,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
    },
    itemId: {
      type: mongoose.Schema.Types.String,
    },
    endTime: {
      type: mongoose.Schema.Types.Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IAuction>('auctions', auctionsSchema);
