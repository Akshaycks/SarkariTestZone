import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";

const db = new Database("exam_prep.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS exams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    type TEXT DEFAULT 'Full Mock', -- 'Full Mock', 'Subject-wise', 'Chapter-wise', 'PYP'
    duration INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    negative_marking REAL DEFAULT 0.25,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    exam_id INTEGER,
    topic TEXT,
    question_text TEXT NOT NULL,
    question_hindi TEXT,
    option_a TEXT NOT NULL,
    option_a_hindi TEXT,
    option_b TEXT NOT NULL,
    option_b_hindi TEXT,
    option_c TEXT NOT NULL,
    option_c_hindi TEXT,
    option_d TEXT NOT NULL,
    option_d_hindi TEXT,
    correct_option TEXT NOT NULL,
    solution TEXT,
    tricks TEXT,
    FOREIGN KEY(exam_id) REFERENCES exams(id)
  );

  CREATE TABLE IF NOT EXISTS results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    exam_id INTEGER,
    user_id INTEGER,
    student_name TEXT NOT NULL,
    score REAL,
    total_attempted INTEGER,
    correct_answers INTEGER,
    wrong_answers INTEGER,
    accuracy REAL,
    time_spent_per_question TEXT, -- JSON string
    user_answers TEXT, -- JSON string
    tab_switches INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(exam_id) REFERENCES exams(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER,
    user_id INTEGER,
    issue_type TEXT,
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(question_id) REFERENCES questions(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS streaks (
    user_id INTEGER PRIMARY KEY,
    current_streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    daily_goal_completed BOOLEAN DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS updates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL, -- 'vacancy', 'admit_card', 'result'
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    posted_date DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed some data if empty
const examCount = db.prepare("SELECT COUNT(*) as count FROM exams").get() as { count: number };
if (examCount.count === 0) {
  const insertExam = db.prepare("INSERT INTO exams (title, category, duration, total_questions) VALUES (?, ?, ?, ?)");
  const examId = insertExam.run("SSC CGL Tier 1 - Mock 1", "SSC", 60, 4).lastInsertRowid;

  const insertQuestion = db.prepare("INSERT INTO questions (exam_id, question_text, option_a, option_b, option_c, option_d, correct_option) VALUES (?, ?, ?, ?, ?, ?, ?)");
  insertQuestion.run(examId, "What is the capital of India?", "Mumbai", "New Delhi", "Kolkata", "Chennai", "B");
  insertQuestion.run(examId, "Which planet is known as the Red Planet?", "Venus", "Mars", "Jupiter", "Saturn", "B");
  insertQuestion.run(examId, "Who wrote the Indian National Anthem?", "Mahatma Gandhi", "Rabindranath Tagore", "Bankim Chandra Chatterjee", "Subhash Chandra Bose", "B");
  insertQuestion.run(examId, "What is the currency of Japan?", "Yuan", "Won", "Yen", "Dollar", "C");
}

const updateCount = db.prepare("SELECT COUNT(*) as count FROM updates").get() as { count: number };
if (updateCount.count === 0) {
  const insertUpdate = db.prepare("INSERT INTO updates (type, title, content) VALUES (?, ?, ?)");
  insertUpdate.run('vacancy', 'SSC CHSL 2024 Notification Out', 'Detailed notification for SSC CHSL 2024 has been released. Total vacancies: 3712. Application starts from April 8, 2024. Eligibility: 12th Pass. Age Limit: 18-27 years.');
  insertUpdate.run('vacancy', 'SBI Clerk Recruitment 2024', 'State Bank of India has announced 8000+ vacancies for Junior Associates. Apply online before the deadline. Exam expected in June 2024.');
  insertUpdate.run('admit_card', 'SSC CGL Tier 1 Admit Card', 'Download your SSC CGL Tier 1 Admit Card now. The exam is scheduled from September 9 to 26, 2024. Check your exam city and date.');
  insertUpdate.run('admit_card', 'RRB NTPC Phase 2 Hall Ticket', 'Railway Recruitment Board has released the hall tickets for NTPC Phase 2 CBT. Login with your registration number to download.');
  insertUpdate.run('result', 'UPSC Civil Services Final Result', 'UPSC has declared the final result for CSE 2023. Check the merit list and cut-off marks on the official website.');
  insertUpdate.run('result', 'IBPS PO Mains Result 2024', 'IBPS PO Mains result is now available. Candidates can check their qualifying status for the interview round.');
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Auth Routes
  app.post("/api/auth/register", (req, res) => {
    const { name, email, password } = req.body;
    try {
      const result = db.prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)").run(name, email, password);
      res.json({ id: result.lastInsertRowid, name, email, role: 'user' });
    } catch (error) {
      res.status(400).json({ error: "Email already exists" });
    }
  });

  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE email = ? AND password = ?").get(email, password) as any;
    if (user) {
      res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  // API Routes
  app.get("/api/exams", (req, res) => {
    const exams = db.prepare("SELECT * FROM exams ORDER BY created_at DESC").all();
    res.json(exams);
  });

  app.get("/api/exams/:id", (req, res) => {
    const exam = db.prepare("SELECT * FROM exams WHERE id = ?").get(req.params.id);
    if (!exam) return res.status(404).json({ error: "Exam not found" });
    const questions = db.prepare("SELECT * FROM questions WHERE exam_id = ?").all(req.params.id);
    res.json({ ...exam, questions });
  });

  app.post("/api/results", (req, res) => {
    const { examId, userId, studentName, score, totalAttempted, correctAnswers, wrongAnswers, accuracy, timeSpentPerQuestion, userAnswers, tabSwitches } = req.body;
    const result = db.prepare(`
      INSERT INTO results (exam_id, user_id, student_name, score, total_attempted, correct_answers, wrong_answers, accuracy, time_spent_per_question, user_answers, tab_switches)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(examId, userId, studentName, score, totalAttempted, correctAnswers, wrongAnswers, accuracy, JSON.stringify(timeSpentPerQuestion), JSON.stringify(userAnswers), tabSwitches);
    res.json({ id: result.lastInsertRowid });
  });

  app.get("/api/results/:id", (req, res) => {
    const result = db.prepare(`
      SELECT r.*, e.title as exam_title, e.total_questions as exam_total_questions
      FROM results r
      JOIN exams e ON r.exam_id = e.id
      WHERE r.id = ?
    `).get(req.params.id) as any;
    if (result) {
      result.time_spent_per_question = JSON.parse(result.time_spent_per_question);
      result.user_answers = JSON.parse(result.user_answers || '{}');
    }
    res.json(result);
  });

  app.post("/api/reports", (req, res) => {
    const { questionId, userId, issueType, comment } = req.body;
    db.prepare("INSERT INTO reports (question_id, user_id, issue_type, comment) VALUES (?, ?, ?, ?)").run(questionId, userId, issueType, comment);
    res.json({ success: true });
  });

  app.get("/api/trending-exams", (req, res) => {
    let trending = db.prepare(`
      SELECT e.title, e.id, COUNT(r.id) as attempt_count
      FROM exams e
      LEFT JOIN results r ON e.id = r.exam_id
      GROUP BY e.id
      ORDER BY attempt_count DESC
      LIMIT 3
    `).all();

    if (trending.length === 0 || (trending.length > 0 && (trending[0] as any).attempt_count === 0)) {
      trending = db.prepare("SELECT title, id FROM exams ORDER BY created_at DESC LIMIT 3").all();
    }
    res.json(trending);
  });

  app.get("/api/updates", (req, res) => {
    const updates = db.prepare("SELECT * FROM updates ORDER BY posted_date DESC").all();
    res.json(updates);
  });

  app.get("/api/updates/:id", (req, res) => {
    const update = db.prepare("SELECT * FROM updates WHERE id = ?").get(req.params.id);
    if (!update) return res.status(404).json({ error: "Update not found" });
    res.json(update);
  });

  app.get("/api/leaderboard", (req, res) => {
    const leaderboard = db.prepare(`
      SELECT r.*, e.title as exam_title 
      FROM results r 
      JOIN exams e ON r.exam_id = e.id 
      ORDER BY r.score DESC LIMIT 10
    `).all();
    res.json(leaderboard);
  });

  app.get("/api/streaks/:userId", (req, res) => {
    const streak = db.prepare("SELECT * FROM streaks WHERE user_id = ?").get(req.params.userId);
    res.json(streak || { current_streak: 0, daily_goal_completed: 0 });
  });

  app.post("/api/streaks/update", (req, res) => {
    const { userId } = req.body;
    const today = new Date().toISOString().split('T')[0];
    
    let streak = db.prepare("SELECT * FROM streaks WHERE user_id = ?").get(userId) as any;
    
    if (!streak) {
      db.prepare("INSERT INTO streaks (user_id, current_streak, last_activity_date, daily_goal_completed) VALUES (?, 1, ?, 1)")
        .run(userId, today);
    } else {
      if (streak.last_activity_date === today) {
        // Already updated today
      } else {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        let newStreak = streak.last_activity_date === yesterdayStr ? streak.current_streak + 1 : 1;
        db.prepare("UPDATE streaks SET current_streak = ?, last_activity_date = ?, daily_goal_completed = 1 WHERE user_id = ?")
          .run(newStreak, today, userId);
      }
    }
    res.json({ success: true });
  });

  // Admin Routes
  app.post("/api/admin/exams", (req, res) => {
    const { title, category, type, duration, totalQuestions, negativeMarking } = req.body;
    const result = db.prepare("INSERT INTO exams (title, category, type, duration, total_questions, negative_marking) VALUES (?, ?, ?, ?, ?, ?)")
      .run(title, category, type, duration, totalQuestions, negativeMarking);
    res.json({ id: result.lastInsertRowid });
  });

  app.post("/api/admin/questions", (req, res) => {
    const { examId, topic, questionText, questionHindi, optionA, optionAHindi, optionB, optionBHindi, optionC, optionCHindi, optionD, optionDHindi, correctOption, solution, tricks } = req.body;
    const result = db.prepare(`
      INSERT INTO questions (
        exam_id, topic, question_text, question_hindi, 
        option_a, option_a_hindi, option_b, option_b_hindi, 
        option_c, option_c_hindi, option_d, option_d_hindi, 
        correct_option, solution, tricks
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      examId, topic, questionText, questionHindi, 
      optionA, optionAHindi, optionB, optionBHindi, 
      optionC, optionCHindi, optionD, optionDHindi, 
      correctOption, solution, tricks
    );
    res.json({ id: result.lastInsertRowid });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
