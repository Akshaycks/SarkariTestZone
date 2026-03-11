import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("exam_prep.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT UNIQUE NOT NULL,
    exam_interest TEXT,
    password TEXT,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  -- Ensure columns exist if table was created before
`);

try { db.prepare("ALTER TABLE users ADD COLUMN phone TEXT").run(); } catch (e) {}
try { db.prepare("ALTER TABLE users ADD COLUMN exam_interest TEXT").run(); } catch (e) {}
try { db.prepare("ALTER TABLE results ADD COLUMN face_incidents INTEGER DEFAULT 0").run(); } catch (e) {}
try { db.prepare("ALTER TABLE results ADD COLUMN phone_detected BOOLEAN DEFAULT 0").run(); } catch (e) {}
try { db.prepare("ALTER TABLE updates ADD COLUMN category TEXT").run(); } catch (e) {}

db.exec(`
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
    face_incidents INTEGER DEFAULT 0,
    phone_detected BOOLEAN DEFAULT 0,
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
    category TEXT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    apply_link TEXT,
    syllabus_link TEXT,
    posted_date DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    update_id INTEGER,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    is_read BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(update_id) REFERENCES updates(id)
  );

  CREATE TABLE IF NOT EXISTS faqs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    order_index INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS testimonials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    avatar TEXT,
    rating INTEGER DEFAULT 5
  );
`);

// Seed some data if empty
const examCount = db.prepare("SELECT COUNT(*) as count FROM exams").get() as { count: number };
if (examCount.count === 0) {
  const insertExam = db.prepare("INSERT INTO exams (title, category, duration, total_questions) VALUES (?, ?, ?, ?)");
  
  // SSC
  const sscId = insertExam.run("SSC CGL Tier 1 - Mock 1", "SSC", 60, 4).lastInsertRowid;
  const insertQuestion = db.prepare("INSERT INTO questions (exam_id, question_text, option_a, option_b, option_c, option_d, correct_option) VALUES (?, ?, ?, ?, ?, ?, ?)");
  insertQuestion.run(sscId, "What is the capital of India?", "Mumbai", "New Delhi", "Kolkata", "Chennai", "B");
  insertQuestion.run(sscId, "Which planet is known as the Red Planet?", "Venus", "Mars", "Jupiter", "Saturn", "B");
  insertQuestion.run(sscId, "Who wrote the Indian National Anthem?", "Mahatma Gandhi", "Rabindranath Tagore", "Bankim Chandra Chatterjee", "Subhash Chandra Bose", "B");
  insertQuestion.run(sscId, "What is the currency of Japan?", "Yuan", "Won", "Yen", "Dollar", "C");

  // Banking
  const bankId = insertExam.run("SBI PO Prelims - Mock 1", "Banking", 60, 2).lastInsertRowid;
  insertQuestion.run(bankId, "What is the full form of ATM?", "Automated Teller Machine", "Any Time Money", "Automatic Transaction Machine", "All Time Money", "A");
  insertQuestion.run(bankId, "Which bank is known as the Banker's Bank in India?", "SBI", "HDFC", "RBI", "ICICI", "C");

  // Railway
  const rlyId = insertExam.run("RRB NTPC CBT 1 - Mock 1", "Railway", 90, 2).lastInsertRowid;
  insertQuestion.run(rlyId, "Who is the current Railway Minister of India?", "Ashwini Vaishnaw", "Piyush Goyal", "Suresh Prabhu", "Nitin Gadkari", "A");
  insertQuestion.run(rlyId, "What is the length of the Indian Railway network?", "60,000 km", "68,000 km", "75,000 km", "80,000 km", "B");

  // SSC CPO Tier I Mock Test
  const cpoId = insertExam.run("Full Test 01: SSC CPO Tier I", "SSC", 120, 200).lastInsertRowid;
  const cpoQuestions = [
    {
      q: "In this question, four statements are given, followed by three conclusions numbered I, II and III. Assuming the statements to be true, even if they seem to be at variance with commonly known facts, decide which of the conclusions logically follows/follow from the statements.\n\nStatements:\nAll pencils are pens.\nSome pens are erasers.\nNo eraser is a sharpener.\nAll sharpeners are markers.\n\nConclusions:\nI. Some markers are not erasers.\nII. Some pens are not sharpeners.\nIII. All pencils are markers.",
      a: "Only conclusion I follows.",
      b: "Only conclusion II follows.",
      c: "Both conclusions I and II follow.",
      d: "Only conclusion III follows.",
      correct: "C",
      topic: "General Intelligence & Reasoning"
    }
  ];

  // Add 199 more dummy questions to make it 200
  for (let i = 2; i <= 200; i++) {
    let topic = "General Intelligence & Reasoning";
    if (i > 50 && i <= 100) topic = "General Knowledge & General Awareness";
    else if (i > 100 && i <= 150) topic = "Quantitative Aptitude";
    else if (i > 150) topic = "English Comprehension";

    cpoQuestions.push({
      q: `Dummy Question ${i} for SSC CPO Tier I. This is a sample question for ${topic}.`,
      a: "Option A",
      b: "Option B",
      c: "Option C",
      d: "Option D",
      correct: "A",
      topic: topic
    });
  }

  cpoQuestions.forEach(q => {
    insertQuestion.run(cpoId, q.q, q.a, q.b, q.c, q.d, q.correct, q.topic);
  });
}

const updateCount = db.prepare("SELECT COUNT(*) as count FROM updates").get() as { count: number };
if (updateCount.count === 0) {
  const insertUpdate = db.prepare("INSERT INTO updates (type, title, content, apply_link, syllabus_link) VALUES (?, ?, ?, ?, ?)");
  insertUpdate.run('vacancy', 'SSC CHSL 2024 Notification Out', 'Detailed notification for SSC CHSL 2024 has been released. Total vacancies: 3712. Application starts from April 8, 2024. Eligibility: 12th Pass. Age Limit: 18-27 years.', 'https://ssc.gov.in', 'https://ssc.gov.in/syllabus');
  insertUpdate.run('vacancy', 'SBI Clerk Recruitment 2024', 'State Bank of India has announced 8000+ vacancies for Junior Associates. Apply online before the deadline. Exam expected in June 2024.', 'https://sbi.co.in/careers', 'https://sbi.co.in/syllabus');
  insertUpdate.run('admit_card', 'SSC CGL Tier 1 Admit Card', 'Download your SSC CGL Tier 1 Admit Card now. The exam is scheduled from September 9 to 26, 2024. Check your exam city and date.', 'https://ssc.gov.in/admitcard', null);
  insertUpdate.run('admit_card', 'RRB NTPC Phase 2 Hall Ticket', 'Railway Recruitment Board has released the hall tickets for NTPC Phase 2 CBT. Login with your registration number to download.', 'https://indianrailways.gov.in', null);
  insertUpdate.run('result', 'UPSC Civil Services Final Result', 'UPSC has declared the final result for CSE 2023. Check the merit list and cut-off marks on the official website.', 'https://upsc.gov.in/results', null);
  insertUpdate.run('result', 'IBPS PO Mains Result 2024', 'IBPS PO Mains result is now available. Candidates can check their qualifying status for the interview round.', 'https://ibps.in', null);
}

const faqCount = db.prepare("SELECT COUNT(*) as count FROM faqs").get() as { count: number };
if (faqCount.count === 0) {
  const insertFaq = db.prepare("INSERT INTO faqs (question, answer, order_index) VALUES (?, ?, ?)");
  insertFaq.run("How can I start preparing for SSC CGL?", "Start by understanding the syllabus and exam pattern. Practice previous year papers and take regular mock tests.", 1);
  insertFaq.run("Are the mock tests free?", "Yes, we provide high-quality free mock tests for all major competitive exams.", 2);
  insertFaq.run("Can I use this on mobile?", "Absolutely! Our platform is fully responsive and works perfectly on all mobile devices.", 3);
}

const testimonialCount = db.prepare("SELECT COUNT(*) as count FROM testimonials").get() as { count: number };
if (testimonialCount.count === 0) {
  const insertTestimonial = db.prepare("INSERT INTO testimonials (name, role, content, avatar, rating) VALUES (?, ?, ?, ?, ?)");
  insertTestimonial.run("Rahul Sharma", "SSC CGL Selected", "The mock tests here are very close to the actual exam level. The AI Doubt Solver helped me clear my concepts quickly.", "https://picsum.photos/seed/rahul/100/100", 5);
  insertTestimonial.run("Priya Verma", "Banking Aspirant", "Best platform for banking exams. The daily streaks keep me motivated to study every day.", "https://picsum.photos/seed/priya/100/100", 5);
}

// Seed Admin User
const adminExists = db.prepare("SELECT * FROM users WHERE role = 'admin'").get();
if (!adminExists) {
  db.prepare("INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)").run("Admin User", "admin@prepinsta.com", "9999999999", "admin123", "admin");
}

const otps = new Map<string, string>();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Auth Routes
  app.post("/api/auth/send-otp", (req, res) => {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: "Phone number is required" });
    
    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otps.set(phone, otp);
    
    console.log(`OTP for ${phone}: ${otp}`); // Log for testing
    res.json({ success: true, message: "OTP sent successfully (Simulated)", otp }); // Sending OTP in response for easy testing in preview
  });

  app.post("/api/auth/register", (req, res) => {
    const { name, phone, exam_interest, otp } = req.body;
    
    if (otps.get(phone) !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }
    
    try {
      const result = db.prepare("INSERT INTO users (name, phone, exam_interest) VALUES (?, ?, ?)").run(name, phone, exam_interest);
      otps.delete(phone);
      res.json({ id: result.lastInsertRowid, name, phone, exam_interest, role: 'user' });
    } catch (error) {
      res.status(400).json({ error: "Phone number already exists" });
    }
  });

  app.post("/api/auth/login", (req, res) => {
    const { phone, password, otp } = req.body;
    
    if (phone === '9999999999' || phone === 'admin@prepinsta.com') {
      // Admin login with password or email
      const user = db.prepare("SELECT * FROM users WHERE (phone = ? OR email = ?) AND password = ?").get(phone, phone, password) as any;
      if (user) {
        return res.json({ id: user.id, name: user.name, email: user.email, phone: user.phone, exam_interest: user.exam_interest, role: user.role });
      }
      return res.status(401).json({ error: "Invalid admin credentials" });
    }

    // User login with OTP
    if (otps.get(phone) !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    const user = db.prepare("SELECT * FROM users WHERE phone = ?").get(phone) as any;
    if (user) {
      otps.delete(phone);
      res.json({ id: user.id, name: user.name, email: user.email, phone: user.phone, exam_interest: user.exam_interest, role: user.role });
    } else {
      res.status(404).json({ error: "User not found. Please register first." });
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
    const { examId, userId, studentName, score, totalAttempted, correctAnswers, wrongAnswers, accuracy, timeSpentPerQuestion, userAnswers, tabSwitches, faceIncidents, phoneDetected } = req.body;
    const result = db.prepare(`
      INSERT INTO results (exam_id, user_id, student_name, score, total_attempted, correct_answers, wrong_answers, accuracy, time_spent_per_question, user_answers, tab_switches, face_incidents, phone_detected)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(examId, userId, studentName, score, totalAttempted, correctAnswers, wrongAnswers, accuracy, JSON.stringify(timeSpentPerQuestion), JSON.stringify(userAnswers), tabSwitches, faceIncidents || 0, phoneDetected ? 1 : 0);
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

  app.get("/api/faqs", (req, res) => {
    const faqs = db.prepare("SELECT * FROM faqs ORDER BY order_index ASC").all();
    res.json(faqs);
  });

  app.get("/api/testimonials", (req, res) => {
    const testimonials = db.prepare("SELECT * FROM testimonials").all();
    res.json(testimonials);
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

  app.get("/api/notifications/:userId", (req, res) => {
    const notifications = db.prepare("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC").all(req.params.userId);
    res.json(notifications);
  });

  app.post("/api/notifications/read/:id", (req, res) => {
    db.prepare("UPDATE notifications SET is_read = 1 WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.post("/api/notifications/read-all/:userId", (req, res) => {
    db.prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ?").run(req.params.userId);
    res.json({ success: true });
  });

  // Admin Routes
  app.get("/api/admin/stats", (req, res) => {
    const exams = db.prepare("SELECT COUNT(*) as count FROM exams").get() as any;
    const questions = db.prepare("SELECT COUNT(*) as count FROM questions").get() as any;
    const users = db.prepare("SELECT COUNT(*) as count FROM users").get() as any;
    const results = db.prepare("SELECT COUNT(*) as count FROM results").get() as any;
    res.json({
      exams: exams.count,
      questions: questions.count,
      users: users.count,
      results: results.count
    });
  });

  app.post("/api/admin/exams", (req, res) => {
    const { title, category, type, duration, totalQuestions, negativeMarking } = req.body;
    const result = db.prepare("INSERT INTO exams (title, category, type, duration, total_questions, negative_marking) VALUES (?, ?, ?, ?, ?, ?)")
      .run(title, category, type, duration, totalQuestions, negativeMarking);
    res.json({ id: result.lastInsertRowid });
  });

  app.delete("/api/admin/exams/:id", (req, res) => {
    db.prepare("DELETE FROM questions WHERE exam_id = ?").run(req.params.id);
    db.prepare("DELETE FROM exams WHERE id = ?").run(req.params.id);
    res.json({ success: true });
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

  app.delete("/api/admin/questions/:id", (req, res) => {
    db.prepare("DELETE FROM questions WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.put("/api/admin/questions/:id", (req, res) => {
    const { topic, questionText, questionHindi, optionA, optionAHindi, optionB, optionBHindi, optionC, optionCHindi, optionD, optionDHindi, correctOption, solution, tricks } = req.body;
    db.prepare(`
      UPDATE questions 
      SET topic = ?, question_text = ?, question_hindi = ?, 
          option_a = ?, option_a_hindi = ?, option_b = ?, option_b_hindi = ?, 
          option_c = ?, option_c_hindi = ?, option_d = ?, option_d_hindi = ?, 
          correct_option = ?, solution = ?, tricks = ?
      WHERE id = ?
    `).run(
      topic, questionText, questionHindi, 
      optionA, optionAHindi, optionB, optionBHindi, 
      optionC, optionCHindi, optionD, optionDHindi, 
      correctOption, solution, tricks, req.params.id
    );
    res.json({ success: true });
  });

  app.post("/api/admin/updates", (req, res) => {
    const { type, category, title, content, apply_link, syllabus_link } = req.body;
    const result = db.prepare("INSERT INTO updates (type, category, title, content, apply_link, syllabus_link) VALUES (?, ?, ?, ?, ?, ?)")
      .run(type, category, title, content, apply_link, syllabus_link);
    const updateId = result.lastInsertRowid;

    // Create notifications for users interested in this category
    const users = db.prepare("SELECT id FROM users WHERE exam_interest = ?").all(category) as { id: number }[];
    const insertNotification = db.prepare("INSERT INTO notifications (user_id, update_id, title, message, type) VALUES (?, ?, ?, ?, ?)");
    
    users.forEach(user => {
      insertNotification.run(user.id, updateId, title, content, type);
    });

    res.json({ id: updateId });
  });

  app.delete("/api/admin/updates/:id", (req, res) => {
    db.prepare("DELETE FROM updates WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.post("/api/admin/faqs", (req, res) => {
    const { question, answer, order_index } = req.body;
    const result = db.prepare("INSERT INTO faqs (question, answer, order_index) VALUES (?, ?, ?)").run(question, answer, order_index);
    res.json({ id: result.lastInsertRowid });
  });

  app.delete("/api/admin/faqs/:id", (req, res) => {
    db.prepare("DELETE FROM faqs WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.post("/api/admin/testimonials", (req, res) => {
    const { name, role, content, avatar, rating } = req.body;
    const result = db.prepare("INSERT INTO testimonials (name, role, content, avatar, rating) VALUES (?, ?, ?, ?, ?)").run(name, role, content, avatar, rating);
    res.json({ id: result.lastInsertRowid });
  });

  app.delete("/api/admin/testimonials/:id", (req, res) => {
    db.prepare("DELETE FROM testimonials WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.put("/api/admin/exams/:id", (req, res) => {
    const { title, category, type, duration, totalQuestions, negativeMarking } = req.body;
    db.prepare(`
      UPDATE exams 
      SET title = ?, category = ?, type = ?, duration = ?, total_questions = ?, negative_marking = ?
      WHERE id = ?
    `).run(title, category, type, duration, totalQuestions, negativeMarking, req.params.id);
    res.json({ success: true });
  });

  app.put("/api/admin/updates/:id", (req, res) => {
    const { type, title, content, apply_link, syllabus_link } = req.body;
    db.prepare(`
      UPDATE updates 
      SET type = ?, title = ?, content = ?, apply_link = ?, syllabus_link = ?
      WHERE id = ?
    `).run(type, title, content, apply_link, syllabus_link, req.params.id);
    res.json({ success: true });
  });

  app.put("/api/admin/faqs/:id", (req, res) => {
    const { question, answer, order_index } = req.body;
    db.prepare(`
      UPDATE faqs 
      SET question = ?, answer = ?, order_index = ?
      WHERE id = ?
    `).run(question, answer, order_index, req.params.id);
    res.json({ success: true });
  });

  app.put("/api/admin/testimonials/:id", (req, res) => {
    const { name, role, content, avatar, rating } = req.body;
    db.prepare(`
      UPDATE testimonials 
      SET name = ?, role = ?, content = ?, avatar = ?, rating = ?
      WHERE id = ?
    `).run(name, role, content, avatar, rating, req.params.id);
    res.json({ success: true });
  });

  app.get("/api/admin/users", (req, res) => {
    const users = db.prepare("SELECT id, name, email, phone, exam_interest, role, created_at FROM users WHERE role = 'user' ORDER BY created_at DESC").all();
    res.json(users);
  });

  app.put("/api/admin/users/:id", (req, res) => {
    const { name, phone, exam_interest } = req.body;
    db.prepare("UPDATE users SET name = ?, phone = ?, exam_interest = ? WHERE id = ?").run(name, phone, exam_interest, req.params.id);
    res.json({ success: true });
  });

  app.get("/api/admin/results", (req, res) => {
    const results = db.prepare(`
      SELECT r.*, e.title as exam_title 
      FROM results r 
      LEFT JOIN exams e ON r.exam_id = e.id 
      ORDER BY r.created_at DESC
    `).all();
    res.json(results);
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
