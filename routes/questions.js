const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const auth = require('../middleware/auth');

// @route   GET /api/questions
// @desc    Get all questions
// @access  Public
router.get('/', async (req, res) => {
    try {
        const questions = await Question.find()
            .populate('author', 'name email picture')
            .sort({ createdAt: -1 });

        // Get answer counts for each question
        const questionsWithAnswers = await Promise.all(
            questions.map(async (question) => {
                const answerCount = await Answer.countDocuments({ questionId: question._id });
                return {
                    id: question._id,
                    title: question.title,
                    description: question.description,
                    subject: question.subject,
                    author: question.author.name,
                    authorEmail: question.author.email,
                    authorPicture: question.author.picture,
                    votes: question.votes,
                    answers: [], // We'll populate this in detail view
                    answerCount,
                    createdAt: question.createdAt,
                };
            })
        );

        res.json(questionsWithAnswers);
    } catch (error) {
        console.error('Get questions error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/questions/:id
// @desc    Get single question with answers
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const question = await Question.findById(req.params.id)
            .populate('author', 'name email picture');

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        const answers = await Answer.find({ questionId: question._id })
            .populate('author', 'name email picture')
            .sort({ createdAt: -1 });

        res.json({
            id: question._id,
            title: question.title,
            description: question.description,
            subject: question.subject,
            author: question.author.name,
            authorEmail: question.author.email,
            authorPicture: question.author.picture,
            votes: question.votes,
            createdAt: question.createdAt,
            answers: answers.map(answer => ({
                id: answer._id,
                text: answer.text,
                author: answer.author.name,
                authorEmail: answer.author.email,
                authorPicture: answer.author.picture,
                votes: answer.votes,
                createdAt: answer.createdAt,
            })),
        });
    } catch (error) {
        console.error('Get question error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/questions
// @desc    Create new question
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const { title, description, subject } = req.body;

        const question = await Question.create({
            title,
            description,
            subject,
            author: req.user._id,
        });

        const populatedQuestion = await Question.findById(question._id)
            .populate('author', 'name email picture');

        res.status(201).json({
            id: populatedQuestion._id,
            title: populatedQuestion.title,
            description: populatedQuestion.description,
            subject: populatedQuestion.subject,
            author: populatedQuestion.author.name,
            authorEmail: populatedQuestion.author.email,
            authorPicture: populatedQuestion.author.picture,
            votes: populatedQuestion.votes,
            answers: [],
            createdAt: populatedQuestion.createdAt,
        });
    } catch (error) {
        console.error('Create question error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/questions/:id/answers
// @desc    Add answer to question
// @access  Private
router.post('/:id/answers', auth, async (req, res) => {
    try {
        const { text } = req.body;

        const question = await Question.findById(req.params.id);
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        const answer = await Answer.create({
            questionId: req.params.id,
            text,
            author: req.user._id,
        });

        const populatedAnswer = await Answer.findById(answer._id)
            .populate('author', 'name email picture');

        res.status(201).json({
            id: populatedAnswer._id,
            text: populatedAnswer.text,
            author: populatedAnswer.author.name,
            authorEmail: populatedAnswer.author.email,
            authorPicture: populatedAnswer.author.picture,
            votes: populatedAnswer.votes,
            createdAt: populatedAnswer.createdAt,
        });
    } catch (error) {
        console.error('Add answer error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
