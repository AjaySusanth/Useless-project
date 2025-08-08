import mongoose  from "mongoose";

const { Schema } = mongoose
 
const UserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  displayName: { type: String },
  avatarUrl: { type: String },
  password: { type: String, required: true }, // <--- NEW!
  groups: [{ type: Schema.Types.ObjectId, ref: "Group" }],
  callStats: {
    totalCalls: { type: Number, default: 0 },
    mamaCalls: { type: Number, default: 0 },
    lastCallAt: { type: Date },
  },
});

export const User = mongoose.model("User", UserSchema);


const GroupSchema = new Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  joinCode: { type: String, required: true, unique: true }, // Unique code to join
  members: [{ type: Schema.Types.ObjectId, ref: "User" }],
  admins: [{ type: Schema.Types.ObjectId, ref: "User" }],    // Admins
  createdAt: { type: Date, default: Date.now },
});

export const Group = mongoose.model("Group", GroupSchema);



const AlertSchema = new Schema({
  group: { type: Schema.Types.ObjectId, ref: "Group", required: true },
  triggeredBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  active: { type: Boolean, default: true },
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date },
  hurryUps: [
    {
      user: { type: Schema.Types.ObjectId, ref: "User" },
      at: { type: Date, default: Date.now }
    }
  ],
  funnyMessage: { type: String }
});

export const Alert = mongoose.model("Alert", AlertSchema);