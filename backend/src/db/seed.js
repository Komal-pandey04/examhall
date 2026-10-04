import fs from 'node:fs';
import { db, initSchema } from './database.js';

const dataUrl = new URL('../data/questions.json', import.meta.url);
const SET_SIZE = 30;

/** Split a list into the fewest roughly-equal chunks of at most `max` items. */
function balancedChunks(list, max) {
  const parts = Math.ceil(list.length / max);
  const base = Math.floor(list.length / parts);
  const extra = list.length % parts;
  const chunks = [];
  let start = 0;
  for (let i = 0; i < parts; i += 1) {
    const size = base + (i < extra ? 1 : 0);
    chunks.push(list.slice(start, start + size));
    start += size;
  }
  return chunks;
}

function buildTests(chapters) {
  const tests = [];
  for (const chapter of chapters) {
    const sets = balancedChunks(chapter.questions, SET_SIZE);
    sets.forEach((questions, i) => {
      const suffix = sets.length > 1 ? ` – Set ${i + 1}` : '';
      tests.push({
        title: `${chapter.title}${suffix}`,
        description: `Management Accounting · ${chapter.title}. Previous-year exam questions (UGC NET, UPPSC, PGT/TGT and more).`,
        durationMinutes: Math.max(10, questions.length),
        questions,
      });
    });
  }
  return tests;
}

export function seedIfEmpty({ reset = false } = {}) {
  initSchema();
  if (reset) {
    db.exec('DELETE FROM results; DELETE FROM attempts; DELETE FROM questions; DELETE FROM tests;');
    db.exec("DELETE FROM sqlite_sequence WHERE name IN ('tests','questions','results')");
  }
  const { count } = db.prepare('SELECT COUNT(*) AS count FROM tests').get();
  if (count > 0) return false;

  const chapters = JSON.parse(fs.readFileSync(dataUrl, 'utf-8'));
  const insertTest = db.prepare(
    `INSERT INTO tests (title, description, duration_minutes, marks_per_question, negative_marking, negative_marks)
     VALUES (@title, @description, @durationMinutes, 1, 0, 0.25)`
  );
  const insertQuestion = db.prepare(
    `INSERT INTO questions (test_id, position, question, options, correct_index, explanation, source)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  );

  db.transaction(() => {
    for (const test of buildTests(chapters)) {
      const testId = insertTest.run(test).lastInsertRowid;
      test.questions.forEach((q, index) => {
        insertQuestion.run(testId, index + 1, q.question, JSON.stringify(q.options), q.correctIndex, q.explanation, q.source);
      });
    }
  })();
  return true;
}

// Run directly: `npm run seed` or `npm run seed:reset`
if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  const seeded = seedIfEmpty({ reset: process.argv.includes('--reset') });
  const tests = db.prepare('SELECT COUNT(*) AS c FROM tests').get().c;
  const questions = db.prepare('SELECT COUNT(*) AS c FROM questions').get().c;
  console.log(seeded ? `Seeded ${tests} tests / ${questions} questions.` : `Database already has data (${tests} tests / ${questions} questions). Use "npm run seed:reset" to reload.`);
}
