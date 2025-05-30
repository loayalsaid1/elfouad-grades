export interface StudentResult {
  id: string
  name: string
  subjects: {
    [key: string]: {
      score: number
      fullMark: number
    }
  }
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
