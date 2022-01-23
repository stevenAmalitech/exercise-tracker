const express = require("express");
const app = express();
const cors = require("cors");
const { connectDb, User, Exercise } = require("./db");
require("dotenv").config();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.post("/api/users", async (req, res) => {
  try {
    const { username } = req.body;

    const user = new User({
      username,
    });

    const record = await user.save();
    res.send(record);
  } catch (error) {
    res.sendStatus(500);
  }
});

app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find();
    res.send(users);
  } catch (error) {
    res.statusCode(500);
  }
});

app.post("/api/users/:userId/exercises", async (req, res) => {
  const { ":_id": userId, description, duration, date } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) return res.send("User not found").statusCode(404);

    const exercise = new Exercise({
      userId,
      description,
      duration,
      date: date ? new Date(date) : new Date(),
    });

    const record = await exercise.save();

    res.send({
      username: user.username,
      description: record._doc.description,
      duration: record._doc.duration,
      date: record._doc.date.toDateString(),
      _id: user._id,
    });
  } catch (error) {
    return res.send({ error: "error" });
  }
});

app.get("/api/users/:userId/logs", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) return res.send("User not found").statusCode(404);

    const { username, _id } = user;
    const { from, to, limit } = req.query;
    const filter = { userId: _id };

    const date = {};
    if (from) date.$gte = new Date(from);
    if (to) date.$lte = new Date(to);

    if (from || to) filter.date = date;

    const exercises = await Exercise.find(filter).limit(limit);

    const log = exercises.map(({ description, duration, date }) => ({
      description,
      duration,
      date,
    }));

    res.send({ username, count: log.length, _id, log });
  } catch (error) {
    console.log(error);
    res.send({ error: "error" });
  }
});

let listener;
connectDb().then(() => {
  listener = app.listen(process.env.PORT || 4000, () => {
    console.log("Your app is listening on port " + listener.address().port);
  });
});
