import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./db-storage";
import { z } from "zod";
import {
  insertStudentSchema,
  insertSubjectSchema,
  insertAssessmentSchema,
  insertGradeSchema,
  loginSchema,
} from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const parsed = loginSchema.parse(req.body);
      let user = await storage.getUserByEmail(parsed.email);

      // If user doesn't exist and it's a student email, create new student
      if (!user) {
        // Extract student ID from email (e.g., "2024-0001@school.com" -> "2024-0001")
        const emailParts = parsed.email.split("@");
        const studentId = emailParts[0]; // Use email prefix as student ID
        const name = parsed.email.split("@")[0]; // Default name from email

        // Get all subjects to enroll the new student
        const subjects = await storage.getSubjects();
        const subjectIds = subjects.map((s) => s.id);

        // Create new student record with all subjects
        try {
          await storage.createStudent({
            studentId,
            name,
            email: parsed.email,
            enrolledSubjects: subjectIds,
            isActive: true,
          });
        } catch {
          // Student might already exist, continue
        }

        // Create new user account
        user = await storage.createUser({
          email: parsed.email,
          password: parsed.password,
          role: "student",
          name,
          studentId,
        });
      } else if (user.password !== parsed.password) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Record login
      await storage.recordLogin({
        userId: user.id,
        email: user.email,
        role: user.role,
        ipAddress: req.ip || req.socket.remoteAddress || "unknown",
        userAgent: req.get("user-agent") || "unknown",
      });

      const { password, ...safeUser } = user;
      return res.json({ user: safeUser });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Login error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/students", async (_req: Request, res: Response) => {
    try {
      const students = await storage.getStudents();
      return res.json(students);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch students" });
    }
  });

  app.get("/api/students/:id", async (req: Request, res: Response) => {
    try {
      const student = await storage.getStudent(req.params.id);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      return res.json(student);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch student" });
    }
  });

  app.post("/api/students", async (req: Request, res: Response) => {
    try {
      const parsed = insertStudentSchema.parse(req.body);

      const existingByEmail = await storage.getStudentByEmail(parsed.email);
      if (existingByEmail) {
        return res.status(400).json({ message: "Email already in use" });
      }

      const existingById = await storage.getStudentByStudentId(parsed.studentId);
      if (existingById) {
        return res.status(400).json({ message: "Student ID already exists" });
      }

      const student = await storage.createStudent(parsed);
      return res.status(201).json(student);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      return res.status(500).json({ message: "Failed to create student" });
    }
  });

  app.patch("/api/students/:id", async (req: Request, res: Response) => {
    try {
      const partialSchema = insertStudentSchema.partial();
      const parsed = partialSchema.parse(req.body);
      const updated = await storage.updateStudent(req.params.id, parsed);
      if (!updated) {
        return res.status(404).json({ message: "Student not found" });
      }
      return res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      return res.status(500).json({ message: "Failed to update student" });
    }
  });

  app.delete("/api/students/:id", async (req: Request, res: Response) => {
    try {
      const deleted = await storage.deleteStudent(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Student not found" });
      }
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ message: "Failed to delete student" });
    }
  });

  app.post("/api/students/:id/mark-read", async (req: Request, res: Response) => {
    try {
      const updated = await storage.markStudentAsRead(req.params.id);
      if (!updated) {
        return res.status(404).json({ message: "Student not found" });
      }
      return res.json(updated);
    } catch (error) {
      return res.status(500).json({ message: "Failed to mark student as read" });
    }
  });

  app.get("/api/subjects", async (_req: Request, res: Response) => {
    try {
      const subjects = await storage.getSubjects();
      return res.json(subjects);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch subjects" });
    }
  });

  app.get("/api/subjects/:id", async (req: Request, res: Response) => {
    try {
      const subject = await storage.getSubject(req.params.id);
      if (!subject) {
        return res.status(404).json({ message: "Subject not found" });
      }
      return res.json(subject);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch subject" });
    }
  });

  app.post("/api/subjects", async (req: Request, res: Response) => {
    try {
      const parsed = insertSubjectSchema.parse(req.body);
      const subject = await storage.createSubject(parsed);
      return res.status(201).json(subject);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      return res.status(500).json({ message: "Failed to create subject" });
    }
  });

  app.patch("/api/subjects/:id", async (req: Request, res: Response) => {
    try {
      const partialSchema = insertSubjectSchema.partial();
      const parsed = partialSchema.parse(req.body);
      const updated = await storage.updateSubject(req.params.id, parsed);
      if (!updated) {
        return res.status(404).json({ message: "Subject not found" });
      }
      return res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      return res.status(500).json({ message: "Failed to update subject" });
    }
  });

  app.delete("/api/subjects/:id", async (req: Request, res: Response) => {
    try {
      const deleted = await storage.deleteSubject(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Subject not found" });
      }
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ message: "Failed to delete subject" });
    }
  });

  app.get("/api/assessments", async (_req: Request, res: Response) => {
    try {
      const assessments = await storage.getAssessments();
      return res.json(assessments);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch assessments" });
    }
  });

  app.get("/api/assessments/:id", async (req: Request, res: Response) => {
    try {
      const assessment = await storage.getAssessment(req.params.id);
      if (!assessment) {
        return res.status(404).json({ message: "Assessment not found" });
      }
      return res.json(assessment);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch assessment" });
    }
  });

  app.post("/api/assessments", async (req: Request, res: Response) => {
    try {
      const parsed = insertAssessmentSchema.parse(req.body);

      const subject = await storage.getSubject(parsed.subjectId);
      if (!subject) {
        return res.status(400).json({ message: "Subject not found" });
      }

      const assessment = await storage.createAssessment(parsed);
      return res.status(201).json(assessment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      return res.status(500).json({ message: "Failed to create assessment" });
    }
  });

  app.patch("/api/assessments/:id", async (req: Request, res: Response) => {
    try {
      const partialSchema = insertAssessmentSchema.partial();
      const parsed = partialSchema.parse(req.body);
      const updated = await storage.updateAssessment(req.params.id, parsed);
      if (!updated) {
        return res.status(404).json({ message: "Assessment not found" });
      }
      return res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      return res.status(500).json({ message: "Failed to update assessment" });
    }
  });

  app.delete("/api/assessments/:id", async (req: Request, res: Response) => {
    try {
      const deleted = await storage.deleteAssessment(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Assessment not found" });
      }
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ message: "Failed to delete assessment" });
    }
  });

  app.get("/api/grades", async (_req: Request, res: Response) => {
    try {
      const grades = await storage.getGrades();
      return res.json(grades);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch grades" });
    }
  });

  app.get("/api/grades/:id", async (req: Request, res: Response) => {
    try {
      const grade = await storage.getGrade(req.params.id);
      if (!grade) {
        return res.status(404).json({ message: "Grade not found" });
      }
      return res.json(grade);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch grade" });
    }
  });

  app.post("/api/grades", async (req: Request, res: Response) => {
    try {
      const parsed = insertGradeSchema.parse(req.body);

      const student = await storage.getStudent(parsed.studentId);
      if (!student) {
        return res.status(400).json({ message: "Student not found" });
      }

      const assessment = await storage.getAssessment(parsed.assessmentId);
      if (!assessment) {
        return res.status(400).json({ message: "Assessment not found" });
      }

      if (parsed.score < 0 || parsed.score > assessment.maxScore) {
        return res.status(400).json({
          message: `Score must be between 0 and ${assessment.maxScore}`,
        });
      }

      const grade = await storage.upsertGrade(parsed);
      return res.status(201).json(grade);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      return res.status(500).json({ message: "Failed to create grade" });
    }
  });

  app.patch("/api/grades/:id", async (req: Request, res: Response) => {
    try {
      const partialSchema = insertGradeSchema.partial();
      const parsed = partialSchema.parse(req.body);
      const updated = await storage.updateGrade(req.params.id, parsed);
      if (!updated) {
        return res.status(404).json({ message: "Grade not found" });
      }
      return res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      return res.status(500).json({ message: "Failed to update grade" });
    }
  });

  app.delete("/api/grades/:id", async (req: Request, res: Response) => {
    try {
      const deleted = await storage.deleteGrade(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Grade not found" });
      }
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ message: "Failed to delete grade" });
    }
  });

  app.get("/api/analytics/subjects", async (_req: Request, res: Response) => {
    try {
      const subjects = await storage.getSubjects();
      const students = await storage.getStudents();
      const assessments = await storage.getAssessments();
      const grades = await storage.getGrades();

      const analytics = subjects.map((subject) => {
        const subjectAssessments = assessments.filter((a) => a.subjectId === subject.id);
        const subjectGrades = grades.filter((g) => g.subjectId === subject.id);

        const studentGrades = new Map<string, number>();

        for (const grade of subjectGrades) {
          const assessment = subjectAssessments.find((a) => a.id === grade.assessmentId);
          if (!assessment) continue;

          const percentage = (grade.score / assessment.maxScore) * 100;
          const current = studentGrades.get(grade.studentId) || 0;
          studentGrades.set(grade.studentId, current + percentage);
        }

        const gradeValues = Array.from(studentGrades.values());
        const avgGrade = gradeValues.length > 0
          ? gradeValues.reduce((a, b) => a + b, 0) / gradeValues.length
          : 0;

        const distribution = [
          { range: "90-100", count: 0 },
          { range: "80-89", count: 0 },
          { range: "70-79", count: 0 },
          { range: "60-69", count: 0 },
          { range: "0-59", count: 0 },
        ];

        gradeValues.forEach((g) => {
          if (g >= 90) distribution[0].count++;
          else if (g >= 80) distribution[1].count++;
          else if (g >= 70) distribution[2].count++;
          else if (g >= 60) distribution[3].count++;
          else distribution[4].count++;
        });

        return {
          subjectId: subject.id,
          subjectCode: subject.code,
          subjectTitle: subject.title,
          averageGrade: Math.round(avgGrade * 100) / 100,
          highestGrade: gradeValues.length > 0 ? Math.max(...gradeValues) : 0,
          lowestGrade: gradeValues.length > 0 ? Math.min(...gradeValues) : 0,
          totalStudents: studentGrades.size,
          distribution,
        };
      });

      return res.json(analytics);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  app.get("/api/dashboard/stats", async (_req: Request, res: Response) => {
    try {
      const students = await storage.getStudents();
      const subjects = await storage.getSubjects();
      const assessments = await storage.getAssessments();
      const grades = await storage.getGrades();

      const activeStudents = students.filter((s) => s.isActive).length;

      let totalGradeSum = 0;
      let totalGradeCount = 0;
      for (const grade of grades) {
        const assessment = assessments.find((a) => a.id === grade.assessmentId);
        if (assessment) {
          totalGradeSum += (grade.score / assessment.maxScore) * 100;
          totalGradeCount++;
        }
      }
      const averageGrade = totalGradeCount > 0 ? totalGradeSum / totalGradeCount : 0;

      return res.json({
        totalStudents: students.length,
        activeStudents,
        totalSubjects: subjects.length,
        totalAssessments: assessments.length,
        totalGrades: grades.length,
        averageGrade: Math.round(averageGrade * 100) / 100,
      });
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  return httpServer;
}
