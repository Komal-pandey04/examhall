import crypto from 'node:crypto';
import { db } from '../db/database.js';

const toAttempt = (row) =>
  row && {
    id: row.id,
    testId: row.test_id,
    studentName: row.student_name,
    mode: row.mode,
    startedAt: row.started_at,
    endsAt: row.ends_at,
    status: row.status,
  };

export const attemptModel = {
  create({ testId, studentName, mode, durationMinutes }) {
    const id = crypto.randomUUID();
    const startedAt = Date.now();
    const endsAt = startedAt + durationMinutes * 60 * 1000;
    db.prepare('INSERT INTO attempts (id, test_id, student_name, mode, started_at, ends_at) VALUES (?, ?, ?, ?, ?, ?)').run(id, testId, studentName, mode, startedAt, endsAt);
    return this.findById(id);
  },
  findById: (id) => toAttempt(db.prepare('SELECT * FROM attempts WHERE id = ?').get(id)),
  markSubmitted: (id) => db.prepare("UPDATE attempts SET status = 'submitted' WHERE id = ?").run(id),
};
