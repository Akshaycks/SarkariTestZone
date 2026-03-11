import { Exam, Question, ExamUpdate, FAQ, Testimonial } from '../types';

export const MOCK_EXAMS: Exam[] = [
  { id: 1, title: "SSC CGL Tier 1 - Mock 1", category: "SSC", duration: 60, total_questions: 4, type: 'Full Mock', negative_marking: 0.5, created_at: new Date().toISOString() },
  { id: 2, title: "SBI PO Prelims - Mock 1", category: "Banking", duration: 60, total_questions: 2, type: 'Full Mock', negative_marking: 0.25, created_at: new Date().toISOString() },
  { id: 3, title: "RRB NTPC CBT 1 - Mock 1", category: "Railway", duration: 90, total_questions: 2, type: 'Full Mock', negative_marking: 0.33, created_at: new Date().toISOString() },
  { id: 4, title: "Full Test 01: SSC CPO Tier I", category: "SSC", duration: 120, total_questions: 200, type: 'Full Mock', negative_marking: 0.25, created_at: new Date().toISOString() }
];

export const MOCK_QUESTIONS: Record<number, Question[]> = {
  1: [
    { id: 1, exam_id: 1, question_text: "What is the capital of India?", option_a: "Mumbai", option_b: "New Delhi", option_c: "Kolkata", option_d: "Chennai", correct_option: "B", topic: "General Knowledge" },
    { id: 2, exam_id: 1, question_text: "Which planet is known as the Red Planet?", option_a: "Venus", option_b: "Mars", option_c: "Jupiter", option_d: "Saturn", correct_option: "B", topic: "General Science" },
    { id: 3, exam_id: 1, question_text: "Who wrote the Indian National Anthem?", option_a: "Mahatma Gandhi", option_b: "Rabindranath Tagore", option_c: "Bankim Chandra Chatterjee", option_d: "Subhash Chandra Bose", correct_option: "B", topic: "History" },
    { id: 4, exam_id: 1, question_text: "What is the currency of Japan?", option_a: "Yuan", option_b: "Won", option_c: "Yen", option_d: "Dollar", correct_option: "C", topic: "Economics" }
  ],
  2: [
    { id: 5, exam_id: 2, question_text: "What is the full form of ATM?", option_a: "Automated Teller Machine", option_b: "Any Time Money", option_c: "Automatic Transaction Machine", option_d: "All Time Money", correct_option: "A", topic: "Banking Awareness" },
    { id: 6, exam_id: 2, question_text: "Which bank is known as the Banker's Bank in India?", option_a: "SBI", option_b: "HDFC", option_c: "RBI", option_d: "ICICI", correct_option: "C", topic: "Banking Awareness" }
  ],
  3: [
    { id: 7, exam_id: 3, question_text: "Who is the current Railway Minister of India?", option_a: "Ashwini Vaishnaw", option_b: "Piyush Goyal", option_c: "Suresh Prabhu", option_d: "Nitin Gadkari", correct_option: "A", topic: "Current Affairs" },
    { id: 8, exam_id: 3, question_text: "What is the length of the Indian Railway network?", option_a: "60,000 km", option_b: "68,000 km", option_c: "75,000 km", option_d: "80,000 km", correct_option: "B", topic: "General Knowledge" }
  ]
};

// Generate CPO questions
const cpoQuestions: Question[] = [];
for (let i = 1; i <= 200; i++) {
  let topic = "General Intelligence & Reasoning";
  if (i > 50 && i <= 100) topic = "General Knowledge & General Awareness";
  else if (i > 100 && i <= 150) topic = "Quantitative Aptitude";
  else if (i > 150) topic = "English Comprehension";

  cpoQuestions.push({
    id: 100 + i,
    exam_id: 4,
    question_text: i === 1 ? "In this question, four statements are given, followed by three conclusions numbered I, II and III. Assuming the statements to be true, even if they seem to be at variance with commonly known facts, decide which of the conclusions logically follows/follow from the statements.\n\nStatements:\nAll pencils are pens.\nSome pens are erasers.\nNo eraser is a sharpener.\nAll sharpeners are markers.\n\nConclusions:\nI. Some markers are not erasers.\nII. Some pens are not sharpeners.\nIII. All pencils are markers." : `Dummy Question ${i} for SSC CPO Tier I. This is a sample question for ${topic}.`,
    option_a: "Option A",
    option_b: "Option B",
    option_c: "Option C",
    option_d: "Option D",
    correct_option: i === 1 ? "C" : "A",
    topic: topic
  });
}
MOCK_QUESTIONS[4] = cpoQuestions;

export const MOCK_UPDATES: ExamUpdate[] = [
  { id: 1, type: 'vacancy', title: 'SSC CHSL 2024 Notification Out', content: 'Detailed notification for SSC CHSL 2024 has been released. Total vacancies: 3712. Application starts from April 8, 2024. Eligibility: 12th Pass. Age Limit: 18-27 years.', apply_link: 'https://ssc.gov.in', syllabus_link: 'https://ssc.gov.in/syllabus', posted_date: new Date().toISOString() },
  { id: 2, type: 'vacancy', title: 'SBI Clerk Recruitment 2024', content: 'State Bank of India has announced 8000+ vacancies for Junior Associates. Apply online before the deadline. Exam expected in June 2024.', apply_link: 'https://sbi.co.in/careers', syllabus_link: 'https://sbi.co.in/syllabus', posted_date: new Date().toISOString() },
  { id: 3, type: 'admit_card', title: 'SSC CGL Tier 1 Admit Card', content: 'Download your SSC CGL Tier 1 Admit Card now. The exam is scheduled from September 9 to 26, 2024. Check your exam city and date.', apply_link: 'https://ssc.gov.in/admitcard', posted_date: new Date().toISOString() },
  { id: 4, type: 'result', title: 'UPSC Civil Services Final Result', content: 'UPSC has declared the final result for CSE 2023. Check the merit list and cut-off marks on the official website.', apply_link: 'https://upsc.gov.in/results', posted_date: new Date().toISOString() }
];

export const MOCK_FAQS: FAQ[] = [
  { id: 1, question: "How can I start preparing for SSC CGL?", answer: "Start by understanding the syllabus and exam pattern. Practice previous year papers and take regular mock tests.", order_index: 1 },
  { id: 2, question: "Are the mock tests free?", answer: "Yes, we provide high-quality free mock tests for all major competitive exams.", order_index: 2 },
  { id: 3, question: "Can I use this on mobile?", answer: "Absolutely! Our platform is fully responsive and works perfectly on all mobile devices.", order_index: 3 }
];

export const MOCK_TESTIMONIALS: Testimonial[] = [
  { id: 1, name: "Rahul Sharma", role: "SSC CGL Selected", content: "The mock tests here are very close to the actual exam level. The AI Doubt Solver helped me clear my concepts quickly.", avatar: "https://picsum.photos/seed/rahul/100/100", rating: 5 },
  { id: 2, name: "Priya Verma", role: "Banking Aspirant", content: "Best platform for banking exams. The daily streaks keep me motivated to study every day.", avatar: "https://picsum.photos/seed/priya/100/100", rating: 5 }
];
