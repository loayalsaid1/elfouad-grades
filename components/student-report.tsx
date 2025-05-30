import type React from "react"
import { Document, Page, Text, View, StyleSheet, Image, Font } from "@react-pdf/renderer"

// Register a font that supports Arabic characters
Font.register({
  family: "Amiri",
  src: "https://fonts.gstatic.com/s/amiri/v17/J7aRnpd8CGxBHpUrtLMA7w.ttf",
})

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 20,
    fontFamily: "Amiri", // Use the Arabic-compatible font
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    borderBottom: 2,
    borderBottomColor: "#223152",
    paddingBottom: 10,
  },
  logo: {
    width: 60,
    height: 60,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#223152",
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#223152",
    marginBottom: 3,
  },
  schoolInfo: {
    alignItems: "flex-end",
    fontSize: 12,
    color: "#223152",
  },
  studentInfo: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: "#f1f5f9",
    borderRadius: 5,
  },
  studentName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#223152",
    marginBottom: 5,
  },
  studentId: {
    fontSize: 12,
    color: "#64748b",
  },
  gradeReference: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: "#f8f9fa",
    borderRadius: 5,
  },
  gradeReferenceTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#223152",
  },
  gradeReferenceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gradeReferenceItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "48%",
    marginBottom: 5,
  },
  gradeColorBox: {
    width: 12,
    height: 12,
    marginRight: 5,
  },
  gradeText: {
    fontSize: 10,
  },
  // Horizontal table styles
  horizontalTable: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  tableHeader: {
    backgroundColor: "#223152",
    color: "white",
    padding: 8,
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: "#ffffff",
  },
  tableCell: {
    padding: 8,
    fontSize: 10,
    textAlign: "center",
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: "#e5e7eb",
  },
  tableCellWithIndicator: {
    padding: 8,
    fontSize: 10,
    textAlign: "center",
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: "#e5e7eb",
    position: "relative",
  },
  gradeIndicator: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTop: 1,
    borderTopColor: "#223152",
    paddingTop: 10,
  },
  footerText: {
    fontSize: 12,
    color: "#223152",
  },
})

const getGradeColor = (score: number) => {
  if (score >= 85) return "#3b82f6" // Blue
  if (score >= 65) return "#10b981" // Green
  if (score >= 50) return "#f59e0b" // Yellow
  return "#ef4444" // Red
}

const getGradeText = (score: number) => {
  if (score >= 85) return "يفوق التوقعات"
  if (score >= 65) return "يلبي التوقعات"
  if (score >= 50) return "يلبي التوقعات أحياناً"
  return "أقل من المتوقع"
}

interface StudentReportProps {
  studentData: {
    id: string
    name: string
    subjects: {
      [key: string]: {
        score: number
        fullMark: number
      }
    }
  }
}

const StudentReport: React.FC<StudentReportProps> = ({ studentData }) => {
  const subjects = Object.entries(studentData.subjects)

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Image style={styles.logo} src="/logo.png" />
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Sixth Primary Report</Text>
            <Text style={styles.headerSubtitle}>First Term 2024-2025</Text>
          </View>
          <View style={styles.schoolInfo}>
            <Text>El Fouad Schools</Text>
            <Text>East Zagazig Directorate</Text>
          </View>
        </View>

        {/* Student Info */}
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>Student: {studentData.name}</Text>
          <Text style={styles.studentId}>ID: {studentData.id}</Text>
        </View>

        {/* Grade Reference */}
        <View style={styles.gradeReference}>
          <Text style={styles.gradeReferenceTitle}>Grade Reference / مرجع الدرجات</Text>
          <View style={styles.gradeReferenceGrid}>
            <View style={styles.gradeReferenceItem}>
              <View style={[styles.gradeColorBox, { backgroundColor: "#3b82f6" }]} />
              <Text style={styles.gradeText}>يفوق التوقعات (85-100)</Text>
            </View>
            <View style={styles.gradeReferenceItem}>
              <View style={[styles.gradeColorBox, { backgroundColor: "#10b981" }]} />
              <Text style={styles.gradeText}>يلبي التوقعات (65-84)</Text>
            </View>
            <View style={styles.gradeReferenceItem}>
              <View style={[styles.gradeColorBox, { backgroundColor: "#f59e0b" }]} />
              <Text style={styles.gradeText}>يلبي التوقعات أحياناً (50-64)</Text>
            </View>
            <View style={styles.gradeReferenceItem}>
              <View style={[styles.gradeColorBox, { backgroundColor: "#ef4444" }]} />
              <Text style={styles.gradeText}>أقل من المتوقع ({"<50"})</Text>
            </View>
          </View>
        </View>

        {/* Horizontal Table */}
        <View style={styles.horizontalTable}>
          {/* Subject Headers */}
          <View style={styles.tableRow}>
            {subjects.map(([subject]) => (
              <Text key={`header-${subject}`} style={styles.tableHeader}>
                {subject}
              </Text>
            ))}
          </View>

          {/* Full Marks Row */}
          <View style={styles.tableRow}>
            {subjects.map(([subject, data]) => (
              <Text key={`fullmark-${subject}`} style={styles.tableCell}>
                Full Mark: {data.fullMark}
              </Text>
            ))}
          </View>

          {/* Student Marks Row with Color Indicators */}
          <View style={styles.tableRow}>
            {subjects.map(([subject, data]) => {
              const gradeColor = getGradeColor(data.score)

              return (
                <View key={`score-${subject}`} style={styles.tableCellWithIndicator}>
                  <View style={[styles.gradeIndicator, { backgroundColor: gradeColor }]} />
                  <Text>{data.score.toFixed(2)}</Text>
                </View>
              )
            })}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>مديرة المدرسة: د/ يسرا اباظة</Text>
          <Text style={styles.footerText}>رئيس الكنترول: ا/ محمد مأمون</Text>
        </View>
      </Page>
    </Document>
  )
}

export default StudentReport
