import mongoose from "mongoose";

const charitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    imageUrl: { type: String, default: null },
    website: { type: String, default: null },
    email: { type: String, default: null },
    totalContributed: { type: Number, default: 0 }, // in cents
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    upcomingEvents: [
      {
        name: String,
        date: Date,
        description: String
      }
    ],
    supporters: { type: Number, default: 0 } // count of active subscribers supporting this charity
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
      }
    }
  }
);

charitySchema.index({ isActive: 1, isFeatured: -1 });

export const CharityModel = mongoose.model("Charity", charitySchema);
