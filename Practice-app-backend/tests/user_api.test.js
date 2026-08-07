const { test, describe, beforeEach, after } = require("node:test");
const helper = require("./test_helper");
const User = require("../models/user");
const assert = require("node:assert");
const supertest = require("supertest");
const bcrypt = require("bcrypt");
const app = require("../app");
const { default: mongoose } = require("mongoose");

const api = supertest(app);
describe("when there is initially one user", () => {
  beforeEach(async () => {
    await User.deleteMany({});
    const passwordHash = await bcrypt.hash("password 1", 10);
    const user = new User({
      username: "root",
      passwordHash,
    });
    await user.save();
  });
  test("creation succeeds with a fresh username", async () => {
    const usersAtStart = await helper.usersInDb();
    const newUser = {
      username: "mluukkai",
      name: "Matti Luukkainen",
      password: "salainen",
    };

    await api
      .post("/api/users")
      .send(newUser)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1);
    const usernames = usersAtEnd.map((u) => u.username);
    assert(usernames.includes(newUser.username));
  });
  test("creation fails if username exists", async () => {
    const usersAtStart = await helper.usersInDb();
    const newUser = {
      username: "root",
      name: "Matti Luukkainen",
      password: "salainen",
    };

    const response = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    assert(response.body.error.includes("expected `username` to be unique"));

    const usersAtEnd = await helper.usersInDb();
    assert.strictEqual(usersAtEnd.length, usersAtStart.length);
  });
});
after(async () => {
  mongoose.connection.close();
});
