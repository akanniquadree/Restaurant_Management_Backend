import mongoose from 'mongoose';

const BlacklistSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Users"
    }
  },
  { timestamps: true },
);
export default mongoose.model('blacklist', BlacklistSchema);
