import {
  type User, type InsertUser,
  type Student, type InsertStudent,
  type Subject, type InsertSubject,
  type Assessment, type InsertAssessment,
  type Grade, type InsertGrade,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

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

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private students: Map<string, Student>;
  private subjects: Map<string, Subject>;
  private assessments: Map<string, Assessment>;
  private grades: Map<string, Grade>;

  constructor() {
    this.users = new Map();
    this.students = new Map();
    this.subjects = new Map();
    this.assessments = new Map();
    this.grades = new Map();

    this.seedData();
  }

  private seedData() {
    const adminId = randomUUID();
    this.users.set(adminId, {
      id: adminId,
      email: "admin@gmail.com",
      password: "admin123",
      role: "admin",
      name: "System Administrator",
      studentId: null,
      createdAt: new Date(),
    });

    const student1Id = randomUUID();
    const student2Id = randomUUID();
    const student3Id = randomUUID();

    const student1UserId = randomUUID();
    this.users.set(student1UserId, {
      id: student1UserId,
      email: "student1@hcdc.edu.ph",
      password: "student123",
      role: "student",
      name: "Maria Santos",
      studentId: "2024-0001",
      createdAt: new Date(),
    });

    const subject1Id = randomUUID();
    const subject2Id = randomUUID();
    const subject3Id = randomUUID();

    this.subjects.set(subject1Id, {
      id: subject1Id,
      code: "CS201",
      title: "Data Structures and Algorithms",
      description: "Study of fundamental data structures and algorithmic techniques",
    });
    this.subjects.set(subject2Id, {
      id: subject2Id,
      code: "CS202",
      title: "Database Management Systems",
      description: "Principles and applications of database systems",
    });
    this.subjects.set(subject3Id, {
      id: subject3Id,
      code: "CS203",
      title: "Object-Oriented Programming",
      description: "Advanced concepts in OOP using modern programming languages",
    });

    this.students.set(student1Id, {
      id: student1Id,
      studentId: "2024-0001",
      name: "Maria Santos",
      email: "student1@hcdc.edu.ph",
      enrolledSubjects: [subject1Id, subject2Id],
      isActive: true,
    });
    this.students.set(student2Id, {
      id: student2Id,
      studentId: "2024-0002",
      name: "Juan Dela Cruz",
      email: "student2@hcdc.edu.ph",
      enrolledSubjects: [subject1Id, subject3Id],
      isActive: true,
    });
    this.students.set(student3Id, {
      id: student3Id,
      studentId: "2024-0003",
      name: "Ana Reyes",
      email: "student3@hcdc.edu.ph",
      enrolledSubjects: [subject1Id, subject2Id, subject3Id],
      isActive: true,
    });

    const assessment1Id = randomUUID();
    const assessment2Id = randomUUID();
    const assessment3Id = randomUUID();
    const assessment4Id = randomUUID();
    const assessment5Id = randomUUID();
    const assessment6Id = randomUUID();

    this.assessments.set(assessment1Id, {
      id: assessment1Id,
      subjectId: subject1Id,
      name: "Quiz 1",
      category: "quiz",
      weight: 10,
      maxScore: 30,
    });
    this.assessments.set(assessment2Id, {
      id: assessment2Id,
      subjectId: subject1Id,
      name: "Midterm Exam",
      category: "exam",
      weight: 30,
      maxScore: 100,
    });
    this.assessments.set(assessment3Id, {
      id: assessment3Id,
      subjectId: subject1Id,
      name: "BST Project",
      category: "project",
      weight: 25,
      maxScore: 100,
    });
    this.assessments.set(assessment4Id, {
      id: assessment4Id,
      subjectId: subject1Id,
      name: "Final Exam",
      category: "exam",
      weight: 35,
      maxScore: 100,
    });

    this.assessments.set(assessment5Id, {
      id: assessment5Id,
      subjectId: subject2Id,
      name: "SQL Assignment",
      category: "assignment",
      weight: 20,
      maxScore: 50,
    });
    this.assessments.set(assessment6Id, {
      id: assessment6Id,
      subjectId: subject2Id,
      name: "Database Design Project",
      category: "project",
      weight: 40,
      maxScore: 100,
    });

    const gradeData = [
      { studentId: student1Id, assessmentId: assessment1Id, subjectId: subject1Id, score: 28, remarks: "Excellent" },
      { studentId: student1Id, assessmentId: assessment2Id, subjectId: subject1Id, score: 85, remarks: "Good" },
      { studentId: student1Id, assessmentId: assessment3Id, subjectId: subject1Id, score: 92, remarks: "Outstanding" },
      { studentId: student1Id, assessmentId: assessment5Id, subjectId: subject2Id, score: 45, remarks: "Good work" },
      { studentId: student2Id, assessmentId: assessment1Id, subjectId: subject1Id, score: 25, remarks: "Good" },
      { studentId: student2Id, assessmentId: assessment2Id, subjectId: subject1Id, score: 78, remarks: "Keep it up" },
      { studentId: student3Id, assessmentId: assessment1Id, subjectId: subject1Id, score: 30, remarks: "Perfect" },
      { studentId: student3Id, assessmentId: assessment2Id, subjectId: subject1Id, score: 95, remarks: "Excellent" },
      { studentId: student3Id, assessmentId: assessment5Id, subjectId: subject2Id, score: 48, remarks: "Great" },
    ];

    for (const g of gradeData) {
      const gradeId = randomUUID();
      this.grades.set(gradeId, { id: gradeId, ...g });
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }

  async getStudents(): Promise<Student[]> {
    return Array.from(this.students.values());
  }

  async getStudent(id: string): Promise<Student | undefined> {
    return this.students.get(id);
  }

  async getStudentByStudentId(studentId: string): Promise<Student | undefined> {
    return Array.from(this.students.values()).find((s) => s.studentId === studentId);
  }

  async getStudentByEmail(email: string): Promise<Student | undefined> {
    return Array.from(this.students.values()).find(
      (s) => s.email.toLowerCase() === email.toLowerCase()
    );
  }

  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const id = randomUUID();
    const student: Student = { ...insertStudent, id };
    this.students.set(id, student);
    return student;
  }

  async updateStudent(id: string, updates: Partial<InsertStudent>): Promise<Student | undefined> {
    const existing = this.students.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    this.students.set(id, updated);
    return updated;
  }

  async deleteStudent(id: string): Promise<boolean> {
    return this.students.delete(id);
  }

  async getSubjects(): Promise<Subject[]> {
    return Array.from(this.subjects.values());
  }

  async getSubject(id: string): Promise<Subject | undefined> {
    return this.subjects.get(id);
  }

  async createSubject(insertSubject: InsertSubject): Promise<Subject> {
    const id = randomUUID();
    const subject: Subject = { ...insertSubject, id };
    this.subjects.set(id, subject);
    return subject;
  }

  async updateSubject(id: string, updates: Partial<InsertSubject>): Promise<Subject | undefined> {
    const existing = this.subjects.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    this.subjects.set(id, updated);
    return updated;
  }

  async deleteSubject(id: string): Promise<boolean> {
    return this.subjects.delete(id);
  }

  async getAssessments(): Promise<Assessment[]> {
    return Array.from(this.assessments.values());
  }

  async getAssessment(id: string): Promise<Assessment | undefined> {
    return this.assessments.get(id);
  }

  async getAssessmentsBySubject(subjectId: string): Promise<Assessment[]> {
    return Array.from(this.assessments.values()).filter((a) => a.subjectId === subjectId);
  }

  async createAssessment(insertAssessment: InsertAssessment): Promise<Assessment> {
    const id = randomUUID();
    const assessment: Assessment = { ...insertAssessment, id };
    this.assessments.set(id, assessment);
    return assessment;
  }

  async updateAssessment(id: string, updates: Partial<InsertAssessment>): Promise<Assessment | undefined> {
    const existing = this.assessments.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    this.assessments.set(id, updated);
    return updated;
  }

  async deleteAssessment(id: string): Promise<boolean> {
    return this.assessments.delete(id);
  }

  async getGrades(): Promise<Grade[]> {
    return Array.from(this.grades.values());
  }

  async getGrade(id: string): Promise<Grade | undefined> {
    return this.grades.get(id);
  }

  async getGradesByStudent(studentId: string): Promise<Grade[]> {
    return Array.from(this.grades.values()).filter((g) => g.studentId === studentId);
  }

  async getGradesBySubject(subjectId: string): Promise<Grade[]> {
    return Array.from(this.grades.values()).filter((g) => g.subjectId === subjectId);
  }

  async getGradeByStudentAndAssessment(studentId: string, assessmentId: string): Promise<Grade | undefined> {
    return Array.from(this.grades.values()).find(
      (g) => g.studentId === studentId && g.assessmentId === assessmentId
    );
  }

  async createGrade(insertGrade: InsertGrade): Promise<Grade> {
    const id = randomUUID();
    const grade: Grade = { ...insertGrade, id };
    this.grades.set(id, grade);
    return grade;
  }

  async updateGrade(id: string, updates: Partial<InsertGrade>): Promise<Grade | undefined> {
    const existing = this.grades.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    this.grades.set(id, updated);
    return updated;
  }

  async upsertGrade(insertGrade: InsertGrade): Promise<Grade> {
    const existing = await this.getGradeByStudentAndAssessment(
      insertGrade.studentId,
      insertGrade.assessmentId
    );
    if (existing) {
      const updated = await this.updateGrade(existing.id, insertGrade);
      return updated!;
    }
    return this.createGrade(insertGrade);
  }

  async deleteGrade(id: string): Promise<boolean> {
    return this.grades.delete(id);
  }
}

export const storage = new MemStorage();
