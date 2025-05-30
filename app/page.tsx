"use client"

import Header from "@/components/layout/Header"
import StudentSearchForm from "@/components/search/StudentSearchForm"
import StudentInfo from "@/components/results/StudentInfo"
import GradeReference from "@/components/results/GradeReference"
import ResultsTable from "@/components/results/ResultsTable"
import Instructions from "@/components/Instructions"
import { useStudentSearch } from "@/hooks/useStudentSearch"
import { usePDFGeneration } from "@/hooks/usePDFGeneration"

export default function HomePage() {
  const { studentResult, loading, error, searchStudent } = useStudentSearch()
  const { pdfLoading, generatePDF } = usePDFGeneration()

  const handlePDFGeneration = async () => {
    if (studentResult) {
      await generatePDF(studentResult)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50" dir="ltr">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 sm:space-y-8">
        <StudentSearchForm onSearch={searchStudent} loading={loading} error={error} />
        <GradeReference />
        
        {studentResult && (
          <div className="space-y-6">
            {/* <StudentInfo student={studentResult} onExportPDF={handlePDFGeneration} pdfLoading={pdfLoading} /> */}
            <ResultsTable student={studentResult}  onExportPDF={handlePDFGeneration} pdfLoading={pdfLoading}/>
          </div>
        )}
        { !studentResult && <Instructions />}
      </main>
    </div>
  )
}
