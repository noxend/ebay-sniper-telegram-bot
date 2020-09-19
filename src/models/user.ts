import mongoose from '../services/mongoose';

const userSchema = new mongoose.Schema(
  {
    chat_id: {
      type: mongoose.Schema.Types.Number,
    },
    first_name: {
      type: mongoose.Schema.Types.String,
    },
    last_name: {
      type: mongoose.Schema.Types.String,
    },
    username: {
      type: mongoose.Schema.Types.String,
    },
  },
  { timestamps: true }
);

export default mongoose.model('users', userSchema);
