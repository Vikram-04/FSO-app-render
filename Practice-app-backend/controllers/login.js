require("dotenv").config();
const loginRouter = require("express").Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/user");
loginRouter.post("/", async (request, response) => {
  const { username, password } = request.body;
  const user = await User.findOne({ username: username });
  const passwordCorrect =
    user === null ? false : await bcrypt.compare(password, user.passwordHash);
  if (!(user && passwordCorrect)) {
    return response.status(401).json({ error: "invalid username or password" });
  }
  const tokenForUser = { username: user.username, id: user._id };
  const token = jwt.sign(tokenForUser, process.env.SECRET, {
    expiresIn: 60 * 60, // Expires in one hour
  });
  response
    .status(200)
    .send({ token, username: user.username, name: user.name });
});
module.exports = loginRouter;
