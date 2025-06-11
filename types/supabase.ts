export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      schools: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: { 
          id?: number
          name?: string
        }
      }
      academic_contexts: {
        Row: {
          id: number
          school_id: number
          year: number
          term: number
          grade: number
          is_active?: boolean
        }
        Insert: {
          id?: number
          school_id: number
          year: number
          term: number
          grade: number
          is_active?: boolean
        }
        Update: {
          id?: number
          school_id?: number
          year?: number
          term?: number
          grade?: number
          is_active?: boolean
        }
      }
      student_results: {
        Row: {
          id: number
          student_id: string
          student_name: string
          parent_password: string | null
          context_id: number
          scores: Json
        }
        Insert: {
          id?: number
          student_id: string
          student_name: string
          parent_password?: string | null
          context_id: number
          scores: Json
        }
        Update: {
          id?: number
          student_id?: string
          student_name?: string
          parent_password?: string | null
          context_id?: number
          scores?: Json
        }
      }
      system_settings: {
        Row: {
          id: number
          key: string
          value: Json
        }
        Insert: {
          id?: number
          key: string
          value: Json
        }
        Update: {
          id?: number
          key?: string
          value?: Json
        }
      }
    }
  }
}

export type Subject = {
  subject: string
  score: number | null
  full_mark: number
  absent: boolean
}

export type Scores = Subject[]

export type ParsedStudent = {
  student_id: string
  student_name: string
  parent_password?: string | null
  scores: Scores
}

export type CSVUploadContext = {
  school_id: number
  year: number
  term: number
  grade: number
}
