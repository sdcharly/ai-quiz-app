const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const Project = require('../models/Project');
const auth = require('../middleware/auth');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Set up multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, uuidv4() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// @route   POST api/projects
// @desc    Create a new project
// @access  Private (Admin only)
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Not authorized' });
  }

  const { name, quizDuration, questionCount } = req.body;

  try {
    const newProject = new Project({
      name,
      quizDuration,
      questionCount,
      admin: req.user.id
    });

    const project = await newProject.save();
    res.json(project);
  } catch (err) {
    console.error(err.message);
    if (err.code === 11000) {
      return res.status(400).json({ msg: 'A project with this name already exists' });
    }
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// @route   GET api/projects
// @desc    Get all projects for an admin
// @access  Private (Admin only)
router.get('/', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Not authorized' });
  }

  try {
    const projects = await Project.find({ admin: req.user.id });
    res.json(projects);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// @route   POST api/projects/:id/upload
// @desc    Upload a document to a project
// @access  Private (Admin only)
router.post('/:id/upload', auth, upload.single('document'), async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Not authorized' });
  }

  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }

    if (project.admin.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }

    project.documents.push(req.file.path);
    await project.save();

    res.json(project);
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// @route   DELETE api/projects/:id/document/:docIndex
// @desc    Delete a document from a project
// @access  Private (Admin only)
router.delete('/:id/document/:docIndex', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Not authorized' });
  }

  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }

    if (project.admin.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    const docIndex = parseInt(req.params.docIndex);
    if (docIndex < 0 || docIndex >= project.documents.length) {
      return res.status(400).json({ msg: 'Invalid document index' });
    }

    const filePath = project.documents[docIndex];
    fs.unlink(filePath, (err) => {
      if (err) console.error('Error deleting file:', err);
    });

    project.documents.splice(docIndex, 1);
    await project.save();

    res.json(project);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// @route   GET api/projects/:id
// @desc    Get a specific project
// @access  Private (Admin only)
router.get('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Not authorized' });
  }

  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }

    if (project.admin.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    res.json(project);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Test route
router.get('/test', (req, res) => {
  res.send('Projects route is working');
});

module.exports = router;