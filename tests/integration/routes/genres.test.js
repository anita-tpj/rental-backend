const request = require("supertest");
const { Genre } = require("../../../models/genre");
const { User } = require("../../../models/user");
const mongoose = require("mongoose");

let server;

describe("/api/genres", () => {
  beforeEach(() => {
    server = require("../../../index");
  });

  afterEach(async () => {
    await server.close();
    await Genre.deleteMany({});
  });

  describe("GET /", () => {
    it("should return all genres", async () => {
      const genres = [
        { name: "genre1" },
        { name: "genre2" },
        { name: "genre3" },
        { name: "genre3" },
      ];

      await Genre.collection.insertMany(genres);

      const res = await request(server).get("/api/genres");

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(4);
      expect(res.body.some((g) => g.name === "genre1")).toBeTruthy();
      expect(res.body.some((g) => g.name === "genre2")).toBeTruthy();
    });
  });

  describe("GET /:id", () => {
    it("should return genre if valid id is passed", async () => {
      const genre = new Genre({ name: "genre1" });
      await genre.save();

      const res = await request(server).get(`/api/genres/${genre._id}`);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ name: genre.name });
    });

    it("should return 400 if invalid ID is passed", async () => {
      const res = await request(server).get("/api/genres/1");

      expect(res.status).toBe(400);
    });

    it("should return 404 if no genre with a given ID exists", async () => {
      const id = new mongoose.Types.ObjectId();
      const res = await request(server).get(`/api/genres/${id}`);

      expect(res.status).toBe(404);
    });
  });

  describe("POST /", () => {
    let token;
    let name;

    beforeEach(async () => {
      token = await new User().generateAuthToken();
      name = "genre1";
    });

    const exec = () => {
      return request(server)
        .post("/api/genres")
        .set("x-auth-token", token)
        .send({
          name: name,
        });
    };

    it("should return 401 if user is not logged in", async () => {
      token = "";

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it("should return 404 if genre is not valid - less than 5 characters", async () => {
      name = "gen";

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 404 if genre is not valid - more than 50 characters", async () => {
      name = new Array(52).join("g");

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should create and save genre if it is valid", async () => {
      const res = await exec();

      const genre = await Genre.findOne({ name: "genre1" });

      expect(res.status).toBe(200);
      expect(genre).not.toBeNull();
      expect(genre).toMatchObject({ name: "genre1" });
    });

    it("should return genre if it is valid", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ name: name });
    });
  });

  describe("PUT /:id", () => {
    let token;
    let genre;
    let id;
    let newName;

    beforeEach(async () => {
      token = await new User().generateAuthToken();
      newName = "genre2";
      genre = new Genre({ name: "genre1" });
      await genre.save();
      id = genre._id;
    });

    const exec = () => {
      return request(server)
        .put("/api/genres/" + id)
        .set("x-auth-token", token)
        .send({ name: newName });
    };

    it("should return 401 if user is not logged in", async () => {
      token = "";

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it("should return 400 if genre is not valid", async () => {
      newName = "";
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("should return 404 if invalid ID is given", async () => {
      id = 1;

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 404 if there is no genre with given id", async () => {
      id = new mongoose.Types.ObjectId();
      const res = await exec();
      expect(res.status).toBe(404);
    });

    it("should update if genre is valid and exists", async () => {
      const res = await exec();
      const genre = await Genre.findOne({ name: newName });
      expect(res.status).toBe(200);
      expect(genre).toMatchObject({ name: newName });
    });

    it("should return updated genre", async () => {
      const res = await exec();
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ name: newName });
    });
  });

  describe("DELETE /:id", () => {
    let token;
    let genre;
    let id;

    beforeEach(async () => {
      token = await new User({ isAdmin: true }).generateAuthToken();
      genre = new Genre({ name: "genre1" });
      await genre.save();
      id = genre._id;
    });

    const exec = () => {
      return request(server)
        .delete(`/api/genres/${id}`)
        .set("x-auth-token", token)
        .send();
    };

    it("should return 401 if client is not logged in", async () => {
      token = "";

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it("should return 403 if user not authorized (admin)", async () => {
      token = new User({ isAdmin: false }).generateAuthToken();
      const res = await exec();

      expect(res.status).toBe(403);
    });

    it("should return 404 if there is no genre with given ID", async () => {
      id = new mongoose.Types.ObjectId();

      await exec();

      const genre = await Genre.findById(id);

      expect(genre).toBeNull();
    });

    it("should return 404 if invalid ID is given", async () => {
      id = 1;

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should remove genre from db", async () => {
      await exec();
      const genre = await Genre.findById(id);

      expect(genre).toBeNull();
    });

    it("should remove genre from db", async () => {
      const res = await exec();

      expect(res.body).toHaveProperty("_id", genre._id.toHexString());
      expect(res.body).toHaveProperty("name", genre.name);
    });
  });
});
