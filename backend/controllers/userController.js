const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const PinnedUsers = require("../models/pinnedUsersModel");

module.exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user)
      return res.json({ msg: "Incorrect Username or Password", status: false });
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.json({ msg: "Incorrect Username or Password", status: false });

    await User.updateOne({ _id: user._id }, { $set: { status: "online" } });
    delete user.password;
    return res.json({ status: true, user });
  } catch (ex) {
    next(ex);
  }
};

module.exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const usernameCheck = await User.findOne({ username });
    if (usernameCheck)
      return res.json({ msg: "Username already used", status: false });
    const emailCheck = await User.findOne({ email });
    if (emailCheck)
      return res.json({ msg: "Email already used", status: false });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      username,
      password: hashedPassword,
      status: "online",
    });
    delete user.password;
    return res.json({ status: true, user });
  } catch (ex) {
    next(ex);
  }
};

module.exports.getAllUsers = async (req, res, next) => {
  try {
    // Find the User document with the specified user_id
    const user = await PinnedUsers.findOne({ user_id: req.params.id });
    if (user) {
      // Fetch the pinned users for the current user
      const pinnedUsers = await User.find({
        _id: { $in: user.pinned_users },
      }).select(["email", "username", "avatarImage", "_id", "status"]);
      const PinnedUSersWithIsPin = pinnedUsers.map((user) => ({
        ...user.toObject(),
        isPin: true,
      }));

      // Fetch the rest of the users
      const otherUsers = await User.find({
        $and: [
          { _id: { $ne: req.params.id } },
          { _id: { $nin: user.pinned_users } },
        ],
      }).select(["email", "username", "avatarImage", "_id", "status"]);

      const OtherUSersWithIsPin = otherUsers.map((user) => ({
        ...user.toObject(),
        isPin: false,
      }));

      //   // Combine the pinned users and other users arrays
      const users = [...PinnedUSersWithIsPin, ...OtherUSersWithIsPin];

      return res.json(users);
    } else {
      try {
        const users = await User.find({ _id: { $ne: req.params.id } }).select([
          "email",
          "username",
          "avatarImage",
          "_id",
          "status",
        ]);

        // Add isPin property with value false to each user
        const usersWithIsPin = users.map((user) => ({
          ...user.toObject(),
          isPin: false,
        }));
        return res.json(usersWithIsPin);
      } catch (ex) {
        next(ex);
      }
    }
  } catch (ex) {
    console.error(ex);
    next(ex);
  }
};

module.exports.setAvatar = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const avatarImage = req.body.image;
    const userData = await User.findByIdAndUpdate(
      userId,
      {
        isAvatarImageSet: true,
        avatarImage,
      },
      { new: true }
    );
    return res.json({
      isSet: userData.isAvatarImageSet,
      image: userData.avatarImage,
    });
  } catch (ex) {
    next(ex);
  }
};

module.exports.logOut = async (req, res, next) => {
  try {
    if (!req.params.id) return res.json({ msg: "User id is required " });
    await User.updateOne(
      { _id: req.params.id },
      { $set: { status: "offline" } }
    );
    onlineUsers.delete(req.params.id);
    return res.status(200).send();
  } catch (ex) {
    next(ex);
  }
};
