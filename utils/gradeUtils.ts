import type { GradeLevel } from "@/types/student"
import { GRADE_COLORS, GRADE_THRESHOLDS } from "@/constants/grades"

export const getGradeLevel = (score: number): GradeLevel => {
  const percentage = score // The score is already a percentage in this dataset

  if (percentage >= GRADE_THRESHOLDS.EXCELLENT) {
    return { level: "excellent", text: "Exceeds Expectations", color: GRADE_COLORS.excellent }
  }
  if (percentage >= GRADE_THRESHOLDS.GOOD) {
    return { level: "good", text: "Meets Expectations", color: GRADE_COLORS.good }
  }
  if (percentage >= GRADE_THRESHOLDS.FAIR) {
    return { level: "fair", text: "Meets Expectations Sometimes", color: GRADE_COLORS.fair }
  }
  return { level: "poor", text: "Less Than Expected", color: GRADE_COLORS.poor }
}

export const getGradeColor = (score: number): string => {
  if (score >= GRADE_THRESHOLDS.EXCELLENT) return "#3b82f6" // Blue
  if (score >= GRADE_THRESHOLDS.GOOD) return "#10b981" // Green
  if (score >= GRADE_THRESHOLDS.FAIR) return "#f59e0b" // Yellow
  return "#ef4444" // Red
}

export const getOrdinalInfo = (num: number) => {
  const ordinals: Record<number, string> = {
    1: "first",
    2: "second",
    3: "third",
    4: "fourth",
    5: "fifth",
    6: "sixth",
    7: "seventh",
    8: "eighth"
  }

  const getOrdinalSuffix = (n: number) => {
    if (n % 100 >= 11 && n % 100 <= 13) return `${n}th`
    switch (n % 10) {
      case 1: return `${n}st`
      case 2: return `${n}nd`
      case 3: return `${n}rd`
      default: return `${n}th`
    }
  }

  return {
    number: num.toString(),
    ordinal: getOrdinalSuffix(num),
    word: ordinals[num] || `${num}th`
  }
}
