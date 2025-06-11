import { type NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const studentId = params.id
    const csvPath = path.join(process.cwd(), "data", "students.csv")
    const csvContent = fs.readFileSync(csvPath, "utf-8")

    const lines = csvContent.trim().split("\n")
    const headers = lines[0].split(",")

    // Find student data
    const studentLine = lines.slice(1).find((line) => {
      const data = line.split(",")
      return data[0] === studentId
    })

    if (!studentLine) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    const studentData = studentLine.split(",")
    const studentName = studentData[1]

    // Build subjects array
    const scores: { subject: string; score: number; fullMark: number }[] = []

    for (let i = 2; i < headers.length; i++) {
      const subjectName = headers[i]
      // For this dataset, we'll use 100 as the full mark for all subjects
      const fullMark = 100
      const score = Number.parseFloat(studentData[i])

      scores.push({
        subject: subjectName,
        score,
        fullMark,
      })
    }

    return NextResponse.json({
      id: studentId,
      name: studentName,
      scores,
    })
  } catch (error) {
    console.error("Error reading student data:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
