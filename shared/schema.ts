import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table - for authentication (admin, student)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["admin", "student"] }).notNull().default("student"),
  name: text("name").notNull(),
  studentId: text("student_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Login History table
export const loginHistory = pgTable("login_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull(),
  loginAt: timestamp("login_at").defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
});

export const insertLoginHistorySchema = createInsertSchema(loginHistory).omit({
  id: true,
  loginAt: true,
});

export type InsertLoginHistory = z.infer<typeof insertLoginHistorySchema>;
export type LoginHistory = typeof loginHistory.$inferSelect;

// Students table
export const students = pgTable("students", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: text("student_id").notNull().unique(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  enrolledSubjects: text("enrolled_subjects").array().default([]),
  isActive: boolean("is_active").default(true),
});

export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
});

export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Student = typeof students.$inferSelect;

// Subjects table
export const subjects = pgTable("subjects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
});

export const insertSubjectSchema = createInsertSchema(subjects).omit({
  id: true,
});

export type InsertSubject = z.infer<typeof insertSubjectSchema>;
export type Subject = typeof subjects.$inferSelect;

// Assessments table
export const assessments = pgTable("assessments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subjectId: varchar("subject_id").notNull(),
  name: text("name").notNull(),
  category: text("category", { enum: ["quiz", "exam", "project", "assignment"] }).notNull(),
  weight: real("weight").notNull(),
  maxScore: real("max_score").notNull(),
});

export const insertAssessmentSchema = createInsertSchema(assessments).omit({
  id: true,
});

export type InsertAssessment = z.infer<typeof insertAssessmentSchema>;
export type Assessment = typeof assessments.$inferSelect;

// Grades table
export const grades = pgTable("grades", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull(),
  assessmentId: varchar("assessment_id").notNull(),
  subjectId: varchar("subject_id").notNull(),
  score: real("score").notNull(),
  remarks: text("remarks"),
});

export const insertGradeSchema = createInsertSchema(grades).omit({
  id: true,
});

export type InsertGrade = z.infer<typeof insertGradeSchema>;
export type Grade = typeof grades.$inferSelect;

// Login schema for authentication
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginCredentials = z.infer<typeof loginSchema>;

// BST Node type for visualization
export interface BSTNode {
  value: number;
  label: string;
  data: any;
  left: BSTNode | null;
  right: BSTNode | null;
  x?: number;
  y?: number;
  level?: number;
}

// BST Operation log type
export interface BSTOperation {
  type: "insert" | "search" | "delete" | "traverse";
  value: number;
  steps: string[];
  comparisons: number;
  found?: boolean;
}

// Analytics types
export interface GradeDistribution {
  range: string;
  count: number;
}

export interface SubjectAnalytics {
  subjectId: string;
  subjectCode: string;
  subjectTitle: string;
  averageGrade: number;
  highestGrade: number;
  lowestGrade: number;
  totalStudents: number;
  distribution: GradeDistribution[];
}

export interface StudentGradeSummary {
  studentId: string;
  studentName: string;
  subjectId: string;
  subjectCode: string;
  subjectTitle: string;
  assessments: {
    name: string;
    category: string;
    score: number;
    maxScore: number;
    weight: number;
    weightedScore: number;
  }[];
  finalGrade: number;
}
