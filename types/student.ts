export interface StudentResult {
  id: string
  name: string
  subjects: {
    [key: string]: {
      score: number | null
      fullMark: number
      isAbsent: boolean
    }
  }
  school?: string
  grade?: number
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
