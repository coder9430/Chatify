const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true,
  },
  pinned_users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },
  ],
});
UserSchema.index({ user_id: 1, pinned_users: 1 }, { unique: true });

module.exports = mongoose.model("PinnedUsers", UserSchema);
