export interface StudentResult {
  id: string
  name: string
  scores: {
    subject: string
    score: number | null
    full_mark: number
    absent: boolean
  }[]
  school: string
  grade: number
  requiresPassword?: boolean
}

export interface GradeLevel {
  level: string
  text: string
  color: string
}

export interface GradeInfo {
  text: string
  color: string
}

export interface PasswordRequiredError {
  error: string
  requiresPassword: boolean
}
