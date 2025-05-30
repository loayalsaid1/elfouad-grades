import type { GradeLevel } from "@/types/student"
import { GRADE_COLORS, GRADE_THRESHOLDS } from "@/constants/grades"

export const getGradeLevel = (score: number, fullMark: number): GradeLevel => {
  const percentage = score // The score is already a percentage in this dataset

  if (percentage >= GRADE_THRESHOLDS.EXCELLENT) {
    return { level: "excellent", text: "يفوق التوقعات", color: GRADE_COLORS.excellent }
  }
  if (percentage >= GRADE_THRESHOLDS.GOOD) {
    return { level: "good", text: "يلبي التوقعات", color: GRADE_COLORS.good }
  }
  if (percentage >= GRADE_THRESHOLDS.FAIR) {
    return { level: "fair", text: "يلبي التوقعات أحياناً", color: GRADE_COLORS.fair }
  }
  return { level: "poor", text: "أقل من المتوقع", color: GRADE_COLORS.poor }
}

export const getGradeColor = (score: number): string => {
  if (score >= GRADE_THRESHOLDS.EXCELLENT) return "#3b82f6" // Blue
  if (score >= GRADE_THRESHOLDS.GOOD) return "#10b981" // Green
  if (score >= GRADE_THRESHOLDS.FAIR) return "#f59e0b" // Yellow
  return "#ef4444" // Red
}

export const getGradeText = (score: number): string => {
  if (score >= GRADE_THRESHOLDS.EXCELLENT) return "يفوق التوقعات"
  if (score >= GRADE_THRESHOLDS.GOOD) return "يلبي التوقعات"
  if (score >= GRADE_THRESHOLDS.FAIR) return "يلبي التوقعات أحياناً"
  return "أقل من المتوقع"
}
