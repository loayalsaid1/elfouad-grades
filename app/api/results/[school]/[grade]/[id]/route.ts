import { type NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET(request: NextRequest, { params }: { params: { school: string; grade: string; id: string } }) {
  try {
    const { school, grade, id: studentId } = params
    const { searchParams } = new URL(request.url)
    const providedPassword = searchParams.get("password")

    // Validate school and grade
    const validSchools = ["international", "modern"]
    const gradeNum = Number.parseInt(grade)

    if (!validSchools.includes(school) || isNaN(gradeNum) || gradeNum < 1 || gradeNum > 8) {
      return NextResponse.json({ error: "Invalid school or grade" }, { status: 400 })
    }

    const csvPath = path.join(process.cwd(), "data", `${school}-${grade}.csv`)

    // Check if file exists
    if (!fs.existsSync(csvPath)) {
      return NextResponse.json({ error: "Data file not found" }, { status: 404 })
    }

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
    const parentPassword = studentData[2]?.trim() // parent password column

    // Check if parent password is required
    const requiresPassword = parentPassword && parentPassword !== "" && parentPassword !== "-"

    if (requiresPassword) {
      if (!providedPassword) {
        return NextResponse.json(
          {
            error: "Parent password required",
            requiresPassword: true,
          },
          { status: 401 },
        )
      }

      if (providedPassword !== parentPassword) {
        return NextResponse.json(
          {
            error: "Incorrect parent password",
            requiresPassword: true,
          },
          { status: 401 },
        )
      }
    }

    // Build subjects object
    const subjects: { [key: string]: { score: number | null; fullMark: number; isAbsent: boolean } } = {}

    // Subjects now start from index 3
    for (let i = 3; i < headers.length; i++) {
      const subjectName = headers[i]
      const fullMark = 100
      const scoreValue = studentData[i]?.trim()

      // Handle absent students (marked with "-")
      const isAbsent = scoreValue === "-" || scoreValue === "" || scoreValue === undefined
      const score = isAbsent ? null : Number.parseFloat(scoreValue)

      subjects[subjectName] = {
        score,
        fullMark,
        isAbsent,
      }
    }

    return NextResponse.json({
      id: studentId,
      name: studentName,
      subjects,
      school,
      grade: gradeNum,
      requiresPassword: false,
    })
  } catch (error) {
    console.error("Error reading student data:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
