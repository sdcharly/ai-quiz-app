const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
const Project = require('../models/Project');
const auth = require('../middleware/auth');

// @route   POST api/quizzes/start
// @desc    Start a new quiz
// @access  Private (Student only)
router.post('/start', auth, async (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ msg: 'Not authorized' });
  }

  const { projectId } = req.body;

  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }

    // Here you would generate questions based on the project documents
    // For now, we'll just create a placeholder quiz
    const quiz = new Quiz({
      project: projectId,
      student: req.user.id,
      startTime: new Date(),
      questions: [
        {
          question: 'Placeholder question?',
          options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
          correctAnswer: 0,
        }
      ],
    });

    await quiz.save();
    res.json(quiz);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/quizzes/:id/submit
// @desc    Submit a quiz
// @access  Private (Student only)
router.put('/:id/submit', auth, async (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ msg: 'Not authorized' });
  }

  const { answers } = req.body;

  try {
    let quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ msg: 'Quiz not found' });
    }

    if (quiz.student.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    if (quiz.completed) {
      return res.status(400).json({ msg: 'Quiz already submitted' });
    }

    // Update quiz with student answers and calculate score
    quiz.questions.forEach((question, index) => {
      question.studentAnswer = answers[index];
    });

    const score = quiz.questions.reduce((total, question) => {
      return total + (question.studentAnswer === question.correctAnswer ? 1 : 0);
    }, 0);

    quiz.score = score;
    quiz.completed = true;
    quiz.endTime = new Date();

    await quiz.save();
    res.json(quiz);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/quizzes/results
// @desc    Get quiz results for a student
// @access  Private (Student only)
router.get('/results', auth, async (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ msg: 'Not authorized' });
  }

  try {
    const quizzes = await Quiz.find({ student: req.user.id, completed: true })
      .populate('project', 'name');
    res.json(quizzes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
