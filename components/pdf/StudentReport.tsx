import { Document, Page, Text, View, Image, Font } from "@react-pdf/renderer"
import { pdfStyles } from "./styles"
import { getGradeColor } from "@/utils/gradeUtils"
import { GRADE_REFERENCE_DATA } from "@/constants/grades"
import { CURRENT_ROUND } from "@/constants/currentRound"
import type { StudentResult } from "@/types/student"

// Register a font that supports Arabic characters
Font.register({
  family: "NotoSansArabic",
  src: "https://fonts.gstatic.com/s/notosansarabic/v18/nwpxtLGrOAZMl5nJ_wfgRg3DrWFZWsnVBJ_sS6tlqHHFlhQ5l3sQWIHPqzCfyGyvu3CBFQLaig.ttf",
})

interface StudentReportProps {
  studentData: StudentResult
}

export default function StudentReport({ studentData }: StudentReportProps) {
  const subjects = Object.entries(studentData.subjects)

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={pdfStyles.page}>
        {/* Header */}
        <View style={pdfStyles.header}>
          <Image style={pdfStyles.logo} src="/logo2.png" />
          <View style={pdfStyles.headerCenter}>
            <Text style={pdfStyles.headerTitle}>Sixth Primary Report</Text>
            <Text style={pdfStyles.headerSubtitle}>
              {CURRENT_ROUND.term == 1 ? "First" : "Second"} Term {CURRENT_ROUND.startYear}-{CURRENT_ROUND.endYear}
            </Text>
          </View>
          <View style={pdfStyles.schoolInfo}>
            <Text>El Fouad Schools</Text>
            <Text>East Zagazig Directorate</Text>
          </View>
        </View>

        {/* Student Info */}
        <View style={pdfStyles.studentInfo}>
          <Text style={pdfStyles.studentName}>Student: {studentData.name}</Text>
          <Text style={pdfStyles.studentId}>ID: {studentData.id}</Text>
        </View>

        {/* Grade Reference */}
        <View style={pdfStyles.gradeReference}>
          <Text style={pdfStyles.gradeReferenceTitle}>Grade Reference</Text>
          <View style={pdfStyles.gradeReferenceGrid}>
            {GRADE_REFERENCE_DATA.map((grade, index) => (
              <View key={index} style={pdfStyles.gradeReferenceItem}>
                <View style={[pdfStyles.gradeColorBox, { backgroundColor: grade.color }]} />
                <Text style={pdfStyles.gradeText}>
                  {grade.textEn} ({grade.range})
                </Text>
              </View>
            ))}
            {/* Add absent reference */}
            <View style={pdfStyles.gradeReferenceItem}>
              <View style={[pdfStyles.gradeColorBox, { backgroundColor: "#9ca3af" }]} />
              <Text style={pdfStyles.gradeText}>Absent (غ)</Text>
            </View>
          </View>
        </View>

        {/* Horizontal Table */}
        <View style={pdfStyles.horizontalTable}>
          {/* Subject Headers */}
          <View style={pdfStyles.tableRow}>
            {subjects.map(([subject]) => (
              <Text key={`header-${subject}`} style={pdfStyles.tableHeader}>
                {subject}
              </Text>
            ))}
          </View>

          {/* Full Marks Row */}
          <View style={pdfStyles.tableRow}>
            {subjects.map(([subject, data]) => (
              <Text key={`fullmark-${subject}`} style={pdfStyles.tableCell}>
                {data.fullMark}
              </Text>
            ))}
          </View>

          {/* Student Marks Row with Color Indicators */}
          <View style={pdfStyles.tableRow}>
            {subjects.map(([subject, data]) => {
              const gradeColor = getGradeColor(data.score, data.isAbsent)

              return (
                <View key={`score-${subject}`} style={pdfStyles.tableCellWithIndicator}>
                  <View style={[pdfStyles.gradeIndicator, { backgroundColor: gradeColor }]} />
                  <Text>{data.isAbsent ? "غ" : data.score?.toFixed(2)}</Text>
                </View>
              )
            })}
          </View>
        </View>

        {/* Footer */}
        <View style={pdfStyles.footer}>
          <Text style={pdfStyles.footerText}>School Principal: Dr. Yousra Abaza</Text>
          <Text style={pdfStyles.footerText}>Head of Exam Control: Mr. Mohamad Mamoun</Text>
        </View>
      </Page>
    </Document>
  )
}
