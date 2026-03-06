export interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

export interface Exam {
  id: number;
  title: string;
  category: string;
  type: 'Full Mock' | 'Subject-wise' | 'Chapter-wise' | 'PYP';
  duration: number;
  total_questions: number;
  negative_marking: number;
  created_at: string;
}

export interface Question {
  id: number;
  exam_id: number;
  topic: string;
  question_text: string;
  question_hindi?: string;
  option_a: string;
  option_a_hindi?: string;
  option_b: string;
  option_b_hindi?: string;
  option_c: string;
  option_c_hindi?: string;
  option_d: string;
  option_d_hindi?: string;
  correct_option: string;
  solution?: string;
  tricks?: string;
}

export interface ExamResult {
  id: number;
  exam_id: number;
  user_id: number;
  exam_title?: string;
  exam_total_questions?: number;
  student_name: string;
  score: number;
  total_attempted: number;
  correct_answers: number;
  wrong_answers: number;
  accuracy: number;
  time_spent_per_question: Record<number, number>;
  tab_switches: number;
  created_at: string;
}

export type QuestionStatus = 'not_visited' | 'not_answered' | 'answered' | 'marked_for_review';
