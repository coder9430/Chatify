const { addMessage, getMessages,setpin } = require("../controllers/messageController");
const router = require("express").Router();

router.post("/addmsg/", addMessage);
router.post("/getmsg/", getMessages);
router.post("/setpin",setpin);

module.exports = router;
