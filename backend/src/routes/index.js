import { Router } from 'express';
import { asyncHandler as h } from '../utils/asyncHandler.js';
import { requireAdmin } from '../middleware/adminAuth.js';
import * as tests from '../controllers/testController.js';
import * as questions from '../controllers/questionController.js';
import * as attempts from '../controllers/attemptController.js';
import * as results from '../controllers/resultController.js';

const router = Router();

router.get('/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));
router.get('/stats', h(tests.getStats));

// Admin check (lets the panel validate a key without changing data)
router.get('/admin/ping', requireAdmin, (req, res) => res.json({ ok: true }));

// Tests
router.get('/tests', (req, res, next) => {
  req.isAdmin = false; // public listing never includes inactive tests
  next();
}, h(tests.listTests));
router.get('/tests/admin/all', requireAdmin, (req, res, next) => {
  req.isAdmin = true;
  req.query.all = '1';
  next();
}, h(tests.listTests));
router.get('/tests/:id', h(tests.getTest));
router.post('/tests', requireAdmin, h(tests.createTest));
router.put('/tests/:id', requireAdmin, h(tests.updateTest));
router.delete('/tests/:id', requireAdmin, h(tests.deleteTest));

// Questions (admin CRUD) + practice-mode answer check (public)
router.get('/questions', requireAdmin, h(questions.listQuestions));
router.get('/questions/:id', requireAdmin, h(questions.getQuestion));
router.post('/questions', requireAdmin, h(questions.createQuestion));
router.put('/questions/:id', requireAdmin, h(questions.updateQuestion));
router.delete('/questions/:id', requireAdmin, h(questions.deleteQuestion));
router.post('/questions/:id/check', h(questions.checkAnswer));

// Attempts & results
router.post('/attempts', h(attempts.startAttempt));
router.get('/attempts/:id', h(attempts.getAttempt));
router.post('/results', h(results.submitResult));
router.get('/results/:attemptId', h(results.getResult));

export default router;
