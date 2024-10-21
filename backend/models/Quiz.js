const mongoose = require('mongoose');

const QuizSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  questions: [{
    question: String,
    options: [String],
    correctAnswer: Number,
    studentAnswer: Number,
  }],
  startTime: {
    type: Date,
    required: true,
  },
  endTime: Date,
  score: Number,
  completed: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model('Quiz', QuizSchema);
