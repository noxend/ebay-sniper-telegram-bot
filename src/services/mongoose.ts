import mongoose from 'mongoose';

mongoose
  .connect('mongodb://admin:128500q@ds159546.mlab.com:59546/ebay_snipe_bot', {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch((err) => console.log(err));

export default mongoose;
