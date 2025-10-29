const request = require("supertest");
const { Genre } = require("../../../models/genre");
const { User } = require("../../../models/user");
const mongoose = require("mongoose");

let server;

describe("auth middleware", () => {
  let token;

  beforeEach(() => {
    server = require("../../../index");
    token = new User().generateAuthToken();
  });

  afterEach(async () => {
    await server.close();
    await Genre.deleteMany({});
  });

  const exec = () => {
    return request(server)
      .post("/api/genres")
      .set("x-auth-token", token)
      .send({ name: "genre1" });
  };

  it("Should return 401 if no token provided", async () => {
    token = "";
    const res = await exec();

    expect(res.status).toBe(401);
  });

  it("Should return 200 if token is valid", async () => {
    const res = await exec();

    expect(res.status).toBe(200);
  });

  it("Should return 400 if token is invalid", async () => {
    token = "125648";
    const res = await exec();

    expect(res.status).toBe(400);
  });
});
