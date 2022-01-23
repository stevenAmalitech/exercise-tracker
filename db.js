const { connect, Schema, model } = require("mongoose");

async function connectDb() {
  try {
    await connect("mongodb://localhost:27017/exercisetracker", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (error) {
    throw error;
  }
}

const ExerciseSchema = new Schema(
  {
    userId: { type: String, required: true },
    description: String,
    duration: Number,
    date: {
      type: Date,
      get: (date) => date.toDateString(),
    },
  },
  {
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

const UserSchema = new Schema({
  username: String,
});

const Exercise = model("Exercise", ExerciseSchema);
const User = model("User", UserSchema);

module.exports = { connectDb, Exercise, User };
