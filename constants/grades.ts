export const GRADE_COLORS = {
  excellent: "bg-blue-100 text-blue-800 border-blue-200",
  good: "bg-green-100 text-green-800 border-green-200",
  fair: "bg-yellow-100 text-yellow-800 border-yellow-200",
  poor: "bg-red-100 text-red-800 border-red-200",
  absent: "bg-gray-100 text-gray-800 border-gray-200",
} as const

export const GRADE_THRESHOLDS = {
  EXCELLENT: 85,
  GOOD: 65,
  FAIR: 50,
} as const

export const GRADE_REFERENCE_DATA = [
  {
    color: "#3b82f6",
    textAr: "يفوق التوقعات",
    textEn: "Exceeds Expectations",
    range: "85-100",
  },
  {
    color: "#10b981",
    textAr: "يلبي التوقعات",
    textEn: "Meets Expectations",
    range: "65-84",
  },
  {
    color: "#f59e0b",
    textAr: "يلبي التوقعات أحياناً",
    textEn: "Meets Expectations Sometimes",
    range: "50-64",
  },
  {
    color: "#ef4444",
    textAr: "أقل من المتوقع",
    textEn: "Less than expected",
    range: "<50",
  },
]
