import { db } from '../db/database.js';

const toResult = (row) =>
  row && {
    attemptId: row.attempt_id,
    testId: row.test_id,
    testTitle: row.test_title,
    studentName: row.student_name,
    mode: row.mode,
    score: row.score,
    maxScore: row.max_score,
    correct: row.correct,
    wrong: row.wrong,
    unanswered: row.unanswered,
    attempted: row.correct + row.wrong,
    totalQuestions: row.correct + row.wrong + row.unanswered,
    percentage: row.percentage,
    accuracy: row.correct + row.wrong > 0 ? Math.round((row.correct / (row.correct + row.wrong)) * 10000) / 100 : 0,
    timeTaken: row.time_taken,
    autoSubmitted: Boolean(row.auto_submitted),
    submittedAt: row.submitted_at,
    review: JSON.parse(row.review),
  };

export const resultModel = {
  findByAttempt: (attemptId) => toResult(db.prepare('SELECT * FROM results WHERE attempt_id = ?').get(attemptId)),

  /** Stores the result and closes the attempt atomically. */
  save(attempt, test, calc, { answers, review, timeTaken, autoSubmitted }) {
    db.transaction(() => {
      db.prepare(
        `INSERT INTO results (attempt_id, test_id, student_name, mode, answers, score, max_score, correct, wrong,
                              unanswered, percentage, time_taken, auto_submitted, test_title, review)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(attempt.id, attempt.testId, attempt.studentName, attempt.mode, JSON.stringify(answers), calc.score, calc.maxScore, calc.correct, calc.wrong, calc.unanswered, calc.percentage, timeTaken, autoSubmitted ? 1 : 0, test.title, JSON.stringify(review));
      db.prepare("UPDATE attempts SET status = 'submitted' WHERE id = ?").run(attempt.id);
    })();
    return this.findByAttempt(attempt.id);
  },
};
