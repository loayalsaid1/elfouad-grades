import type React from "react"
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer"

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 20,
    fontFamily: "Helvetica",
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
  gradeReference: {
    marginBottom: 20,
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
  studentInfo: {
    marginBottom: 20,
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
  table: {
    display: "table",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#223152",
    marginBottom: 20,
  },
  tableRow: {
    margin: "auto",
    flexDirection: "row",
  },
  tableHeader: {
    backgroundColor: "#223152",
  },
  tableHeaderCell: {
    margin: "auto",
    padding: 8,
    fontSize: 12,
    fontWeight: "bold",
    color: "white",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#223152",
    textAlign: "center",
  },
  tableCell: {
    margin: "auto",
    padding: 8,
    fontSize: 11,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#223152",
    textAlign: "center",
  },
  subjectCell: {
    width: "25%",
    textAlign: "left",
  },
  markCell: {
    width: "15%",
  },
  gradeCell: {
    width: "20%",
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

const getGradeLevel = (score: number, fullMark: number) => {
  const percentage = score // The score is already a percentage in this dataset
  if (percentage >= 85) return { text: "يفوق التوقعات", color: "#3b82f6" }
  if (percentage >= 65) return { text: "يلبي التوقعات", color: "#10b981" }
  if (percentage >= 50) return { text: "يلبي التوقعات أحياناً", color: "#f59e0b" }
  return { text: "أقل من المتوقع", color: "#ef4444" }
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

        {/* Results Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableHeaderCell, styles.subjectCell]}>Subject</Text>
            <Text style={[styles.tableHeaderCell, styles.markCell]}>Full Mark</Text>
            <Text style={[styles.tableHeaderCell, styles.markCell]}>Student Mark</Text>
            <Text style={[styles.tableHeaderCell, styles.gradeCell]}>Grade</Text>
          </View>

          {/* Table Rows */}
          {Object.entries(studentData.subjects).map(([subject, data]) => {
            const grade = getGradeLevel(data.score, data.fullMark)

            return (
              <View key={subject} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.subjectCell]}>{subject}</Text>
                <Text style={[styles.tableCell, styles.markCell]}>{data.fullMark}</Text>
                <Text style={[styles.tableCell, styles.markCell]}>{data.score.toFixed(2)}</Text>
                <Text style={[styles.tableCell, styles.gradeCell]}>{grade.text}</Text>
              </View>
            )
          })}
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
