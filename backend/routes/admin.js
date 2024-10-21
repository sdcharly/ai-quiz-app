const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Project = require('../models/Project');
const Quiz = require('../models/Quiz');

// @route   GET api/admin/analytics
// @desc    Get admin analytics
// @access  Private (Admin only)
router.get('/analytics', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Not authorized' });
  }

  try {
    const totalUsers = await User.countDocuments();
    const totalProjects = await Project.countDocuments();
    const totalQuizzesTaken = await Quiz.countDocuments({ completed: true });
    
    const quizzes = await Quiz.find({ completed: true });
    const totalScore = quizzes.reduce((sum, quiz) => sum + quiz.score, 0);
    const averageQuizScore = totalQuizzesTaken > 0 ? (totalScore / totalQuizzesTaken) * 100 : 0;

    const topProjects = await Project.aggregate([
      { $lookup: { from: 'quizzes', localField: '_id', foreignField: 'project', as: 'quizzes' } },
      { $project: { name: 1, averageScore: { $avg: '$quizzes.score' } } },
      { $sort: { averageScore: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      totalUsers,
      totalProjects,
      totalQuizzesTaken,
      averageQuizScore,
      topProjects
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
