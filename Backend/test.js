const request = require("supertest");
const mongoose = require("mongoose");
const app = require("./server"); // your express app file
const User = require("./models/User");

let token = "";
let userId = "";

beforeAll(async () => {
  // Connect to test DB
  await mongoose.connect(process.env.MONGO_URI_TEST, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Create a dummy user for login tests
  const user = new User({
    name: "Test User",
    channelLink: "https://youtube.com/test",
    email: "test@example.com",
    password: await require("bcrypt").hash("password123", 10),
    role: "user",
  });
  await user.save();
  userId = user._id.toString();
});

afterAll(async () => {
  await User.deleteMany({});
  await mongoose.connection.close();
});

describe("Auth Endpoints", () => {
  test("POST /login → should login user", async () => {
    const res = await request(app).post("/login").send({
      email: "test@example.com",
      password: "password123",
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    token = res.body.token;
  });

  test("POST /signup → should fail if email already exists", async () => {
    const res = await request(app).post("/singup").send({
      name: "New User",
      channelLink: "https://youtube.com/new",
      email: "test@example.com",
      password: "password123",
    });
    expect(res.statusCode).toBe(400);
  });
});

describe("User Endpoints", () => {
  test("GET /user/:id → should fetch user", async () => {
    const res = await request(app)
      .get(`/user${userId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe("test@example.com");
  });

  test("POST /user/insertData/:id → should insert previous data", async () => {
    const res = await request(app)
      .post(`/user/insertData/${userId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ data: ["first entry", "second entry"] });
    expect(res.statusCode).toBe(200);
    expect(res.body.previousData.length).toBeGreaterThan(0);
  });

  test("GET /user/previous/:id → should fetch previous data", async () => {
    const res = await request(app)
      .get(`/user/previous/${userId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });
});

describe("YouTube Endpoints", () => {
  test("POST /youtube/channelId → should return channelId", async () => {
    const res = await request(app)
      .post("/youtube/channelId")
      .set("Authorization", `Bearer ${token}`)
      .send({ channelLink: "https://www.youtube.com/channel/UC123456789" });
    expect(res.statusCode).toBe(200);
    expect(res.body.channelId).toBeDefined();
  });

  test("POST /youtube/videoId → should return videoId", async () => {
    const res = await request(app)
      .post("/youtube/videoId")
      .set("Authorization", `Bearer ${token}`)
      .send({ videoLink: "https://www.youtube.com/watch?v=abc123" });
    expect(res.statusCode).toBe(200);
    expect(res.body.videoId).toBe("abc123");
  });

  test("POST /youtube/llmReply → should generate reply", async () => {
    const res = await request(app)
      .post("/youtube/llmReply")
      .set("Authorization", `Bearer ${token}`)
      .send({
        videoContext: "Tech video",
        transcript: "Hello world transcript",
        comment: "Great video!",
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.reply).toMatch(/simulated reply/i);
  });
});

describe("Admin Endpoints", () => {
  test("GET /user/admin/ → should deny non-admins", async () => {
    const res = await request(app)
      .get("/user/admin/")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(403);
  });
});
