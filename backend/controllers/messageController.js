const Messages = require("../models/messageModel");
const PinnedUsers = require("../models/pinnedUsersModel");

module.exports.getMessages = async (req, res, next) => {
  try {
    const { from, to } = req.body;

    const messages = await Messages.find({
      users: {
        $all: [from, to],
      },
    }).sort({ updatedAt: 1 });

    const projectedMessages = messages.map((msg) => {
      return {
        fromSelf: msg.sender.toString() === from,
        message: msg.message.text,
      };
    });
    res.json(projectedMessages);
  } catch (ex) {
    next(ex);
  }
};

module.exports.addMessage = async (req, res, next) => {
  try {
    const { from, to, message } = req.body;
    const data = await Messages.create({
      message: { text: message },
      users: [from, to],
      sender: from,
    });
    if (data) return res.json({ msg: "Message added successfully." });
    else return res.json({ msg: "Failed to add message to the database" });
  } catch (ex) {
    next(ex);
  }
};

module.exports.setpin = async (req, res, next) => {
  try {
    const { isPin, user_id, chat_id } = req.body;

    // Find the User document with the specified user_id
    var user = await PinnedUsers.findOne({ user_id });

    if (!user) {
      // If the User document does not exist, create a new User document
      const newUser = new PinnedUsers({ user_id });
      await newUser.save();
      user = newUser;
    }

    if (isPin) {
      // If isPin is true, add the chat_id to the pinned_users array
      user.pinned_users.push(chat_id);
    } else {
      // If isPin is false, remove the chat_id from the pinned_users array
      user.pinned_users = user.pinned_users.filter(
        (id) => id.toString() !== chat_id
      );
    }

    // Save the updated User document
    await user.save();

    res.json({ success: true, message: "isPin updated successfully" });
  } catch (ex) {
    console.error(ex);
    next(ex);
  }
};
