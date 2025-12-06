import { db } from "./db";
import {
  users,
  students,
  subjects,
  assessments,
  grades,
  loginHistory,
} from "@shared/schema";
import { eq, and } from "drizzle-orm";
import type {
  User,
  InsertUser,
  Student,
  InsertStudent,
  Subject,
  InsertSubject,
  Assessment,
  InsertAssessment,
  Grade,
  InsertGrade,
  InsertLoginHistory,
  LoginHistory,
} from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  recordLogin(data: InsertLoginHistory): Promise<LoginHistory>;

  getStudents(): Promise<Student[]>;
  getStudent(id: string): Promise<Student | undefined>;
  getStudentByStudentId(studentId: string): Promise<Student | undefined>;
  getStudentByEmail(email: string): Promise<Student | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: string, student: Partial<InsertStudent>): Promise<Student | undefined>;
  deleteStudent(id: string): Promise<boolean>;

  getSubjects(): Promise<Subject[]>;
  getSubject(id: string): Promise<Subject | undefined>;
  createSubject(subject: InsertSubject): Promise<Subject>;
  updateSubject(id: string, subject: Partial<InsertSubject>): Promise<Subject | undefined>;
  deleteSubject(id: string): Promise<boolean>;

  getAssessments(): Promise<Assessment[]>;
  getAssessment(id: string): Promise<Assessment | undefined>;
  getAssessmentsBySubject(subjectId: string): Promise<Assessment[]>;
  createAssessment(assessment: InsertAssessment): Promise<Assessment>;
  updateAssessment(id: string, assessment: Partial<InsertAssessment>): Promise<Assessment | undefined>;
  deleteAssessment(id: string): Promise<boolean>;

  getGrades(): Promise<Grade[]>;
  getGrade(id: string): Promise<Grade | undefined>;
  getGradesByStudent(studentId: string): Promise<Grade[]>;
  getGradesBySubject(subjectId: string): Promise<Grade[]>;
  getGradeByStudentAndAssessment(studentId: string, assessmentId: string): Promise<Grade | undefined>;
  createGrade(grade: InsertGrade): Promise<Grade>;
  updateGrade(id: string, grade: Partial<InsertGrade>): Promise<Grade | undefined>;
  upsertGrade(grade: InsertGrade): Promise<Grade>;
  deleteGrade(id: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return result[0];
  }

  async recordLogin(data: InsertLoginHistory): Promise<LoginHistory> {
    const result = await db
      .insert(loginHistory)
      .values(data)
      .returning();
    return result[0];
  }

  // Students
  async getStudents(): Promise<Student[]> {
    return await db.select().from(students);
  }

  async getStudent(id: string): Promise<Student | undefined> {
    const result = await db.select().from(students).where(eq(students.id, id)).limit(1);
    return result[0];
  }

  async getStudentByStudentId(studentId: string): Promise<Student | undefined> {
    const result = await db
      .select()
      .from(students)
      .where(eq(students.studentId, studentId))
      .limit(1);
    return result[0];
  }

  async getStudentByEmail(email: string): Promise<Student | undefined> {
    const result = await db
      .select()
      .from(students)
      .where(eq(students.email, email))
      .limit(1);
    return result[0];
  }

  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const result = await db
      .insert(students)
      .values(insertStudent)
      .returning();
    return result[0];
  }

  async updateStudent(id: string, updateData: Partial<InsertStudent>): Promise<Student | undefined> {
    const result = await db
      .update(students)
      .set(updateData)
      .where(eq(students.id, id))
      .returning();
    return result[0];
  }

  async deleteStudent(id: string): Promise<boolean> {
    const result = await db.delete(students).where(eq(students.id, id));
    return true;
  }

  // Subjects
  async getSubjects(): Promise<Subject[]> {
    return await db.select().from(subjects);
  }

  async getSubject(id: string): Promise<Subject | undefined> {
    const result = await db.select().from(subjects).where(eq(subjects.id, id)).limit(1);
    return result[0];
  }

  async createSubject(insertSubject: InsertSubject): Promise<Subject> {
    const result = await db
      .insert(subjects)
      .values(insertSubject)
      .returning();
    return result[0];
  }

  async updateSubject(id: string, updateData: Partial<InsertSubject>): Promise<Subject | undefined> {
    const result = await db
      .update(subjects)
      .set(updateData)
      .where(eq(subjects.id, id))
      .returning();
    return result[0];
  }

  async deleteSubject(id: string): Promise<boolean> {
    const result = await db.delete(subjects).where(eq(subjects.id, id));
    return true;
  }

  // Assessments
  async getAssessments(): Promise<Assessment[]> {
    return await db.select().from(assessments);
  }

  async getAssessment(id: string): Promise<Assessment | undefined> {
    const result = await db
      .select()
      .from(assessments)
      .where(eq(assessments.id, id))
      .limit(1);
    return result[0];
  }

  async getAssessmentsBySubject(subjectId: string): Promise<Assessment[]> {
    return await db
      .select()
      .from(assessments)
      .where(eq(assessments.subjectId, subjectId));
  }

  async createAssessment(insertAssessment: InsertAssessment): Promise<Assessment> {
    const result = await db
      .insert(assessments)
      .values(insertAssessment)
      .returning();
    return result[0];
  }

  async updateAssessment(id: string, updateData: Partial<InsertAssessment>): Promise<Assessment | undefined> {
    const result = await db
      .update(assessments)
      .set(updateData)
      .where(eq(assessments.id, id))
      .returning();
    return result[0];
  }

  async deleteAssessment(id: string): Promise<boolean> {
    const result = await db.delete(assessments).where(eq(assessments.id, id));
    return true;
  }

  // Grades
  async getGrades(): Promise<Grade[]> {
    return await db.select().from(grades);
  }

  async getGrade(id: string): Promise<Grade | undefined> {
    const result = await db.select().from(grades).where(eq(grades.id, id)).limit(1);
    return result[0];
  }

  async getGradesByStudent(studentId: string): Promise<Grade[]> {
    return await db
      .select()
      .from(grades)
      .where(eq(grades.studentId, studentId));
  }

  async getGradesBySubject(subjectId: string): Promise<Grade[]> {
    return await db
      .select()
      .from(grades)
      .where(eq(grades.subjectId, subjectId));
  }

  async getGradeByStudentAndAssessment(
    studentId: string,
    assessmentId: string
  ): Promise<Grade | undefined> {
    const result = await db
      .select()
      .from(grades)
      .where(
        and(
          eq(grades.studentId, studentId),
          eq(grades.assessmentId, assessmentId)
        )
      )
      .limit(1);
    return result[0];
  }

  async createGrade(insertGrade: InsertGrade): Promise<Grade> {
    const result = await db
      .insert(grades)
      .values(insertGrade)
      .returning();
    return result[0];
  }

  async updateGrade(id: string, updateData: Partial<InsertGrade>): Promise<Grade | undefined> {
    const result = await db
      .update(grades)
      .set(updateData)
      .where(eq(grades.id, id))
      .returning();
    return result[0];
  }

  async upsertGrade(insertGrade: InsertGrade): Promise<Grade> {
    // Try to find existing grade
    const existing = await this.getGradeByStudentAndAssessment(
      insertGrade.studentId,
      insertGrade.assessmentId
    );

    if (existing) {
      return await this.updateGrade(existing.id, insertGrade) as Grade;
    } else {
      return await this.createGrade(insertGrade);
    }
  }

  async deleteGrade(id: string): Promise<boolean> {
    const result = await db.delete(grades).where(eq(grades.id, id));
    return true;
  }
}

export const storage = new DatabaseStorage();
