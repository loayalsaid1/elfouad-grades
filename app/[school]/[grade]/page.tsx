"use client"

import { useParams, useRouter } from "next/navigation"
import { useRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { getOrdinalInfo } from "@/utils/gradeUtils"
import StudentSearchForm from "@/components/search/StudentSearchForm"
import ParentPasswordDialog from "@/components/search/ParentPasswordDialog"
import GradeReference from "@/components/results/GradeReference"
import ResultsTable from "@/components/results/ResultsTable"
import Instructions from "@/components/Instructions"
import { useStudentSearch } from "@/hooks/useStudentSearch"
import { usePDFGeneration } from "@/hooks/usePDFGeneration"
import Image from "next/image"

export default function GradePage() {
  const params = useParams()
  const router = useRouter()
  const school = params.school as string
  const grade = Number.parseInt(params.grade as string)
  const resultsTableRef = useRef<HTMLDivElement | null>(null)
  const [hasStudent, setHasStudent] = useState(false)
  const [currentSchool, setCurrentSchool] = useState<{ name: string; logo: string } | null>(null)

  const {
    studentResult,
    loading,
    error,
    searchStudent,
    showPasswordDialog,
    submitPassword,
    cancelPasswordDialog,
    passwordError,
    passwordLoading,
  } = useStudentSearch(school, grade)

  const { pdfLoading, generatePDF } = usePDFGeneration()

  const schoolInfo = {
    international: {
      name: "El-Fouad International School",
      logo: "/El-Fouad Internsational School Logo .jpg",
    },
    modern: {
      name: "El-Fouad Modern Schools",
      logo: "/El-Fouad Modern Schools logo jpg.jpg",
    },
  }

  useEffect(() => {
    setCurrentSchool(schoolInfo[school as keyof typeof schoolInfo] || null)
  }, [school])

  const ordinalInfo = getOrdinalInfo(grade)

  const handlePDFGeneration = async () => {
    if (studentResult) {
      await generatePDF(studentResult)
    }
  }

  const handleBack = () => {
    router.push(`/${school}`)
  }

  useEffect(() => {
    if (!loading && !error && studentResult) {
      setHasStudent(true)
    } else {
      setHasStudent(false)
    }
  }, [error, studentResult, loading])

  useEffect(() => {
    const onFoundStudent = (): void => {
      if (resultsTableRef.current) resultsTableRef.current.scrollIntoView({ behavior: "smooth" })
    }

    if (hasStudent) {
      onFoundStudent()
    }
  }, [hasStudent])

  if (!currentSchool) {
    return <div>School not found</div>
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 sm:space-y-8">
        {/* Back Button */}
        <Button variant="outline" onClick={handleBack} className="hover:bg-[#223152] hover:text-white">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Grades
        </Button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-white shadow-lg">
              <Image
                src={currentSchool.logo || "/placeholder.svg"}
                alt={`${currentSchool.name} Logo`}
                fill
                className="object-contain p-1"
              />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">{currentSchool.name}</h1>
          <p className="text-xl text-gray-600 capitalize">{ordinalInfo.word} Grade Results</p>
        </div>

        <StudentSearchForm onSearch={searchStudent} loading={loading} error={error} />
        {grade < 8 && <GradeReference />}

        {/* Parent Password Dialog */}
        <ParentPasswordDialog
          open={showPasswordDialog}
          onSubmit={submitPassword}
          onCancel={cancelPasswordDialog}
          loading={passwordLoading}
          error={passwordError}
          studentName={studentResult?.name}
        />

        {studentResult && (
          <div className="space-y-6" ref={resultsTableRef}>
            <ResultsTable student={studentResult} onExportPDF={handlePDFGeneration} pdfLoading={pdfLoading} />
          </div>
        )}

        {!studentResult && <Instructions />}
      </div>
    </div>
  )
}
