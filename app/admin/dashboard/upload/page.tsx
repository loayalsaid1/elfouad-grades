"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Info, Upload } from "lucide-react"
import { ContextSelector } from "@/components/admin/context-selector"
import { useAdminUser } from "@/hooks/useAdminUser"
import { useCSVParser } from "@/hooks/useCSVParser"
import { useUploadResults } from "@/hooks/useUploadResults"
import { useCSVBackupUpload } from "@/hooks/useCSVBackupUpload"
import BackToDashboard from "@/components/admin/BackToDashboard"
import LoadingPage from "@/components/admin/LoadingPage"
import { CSVFormatInstructions } from "@/components/admin/upload/CSVFormatInstructions"
import { FileUploadZone } from "@/components/admin/upload/FileUploadZone"
import { ValidationErrors } from "@/components/admin/upload/ValidationErrors"
import { DataPreview } from "@/components/admin/upload/DataPreview"

interface UploadContext {
  school_id: number
  year: number
  term: number
  grade: number
}

export default function UploadPage() {
  const user = useAdminUser()
  const [file, setFile] = useState<File | null>(null)
  const [context, setContext] = useState<UploadContext | null>(null)
  const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null)

  // ⛔⛔ I've spent many days on a promblem, so don't freaking ask me why the hell this useEffect
  // I can't have any explanation why this freaking page the only on in the app the make the HTML has whitespace under it
  // Actually, i'll give you 20 dollars or even 50 if you can tell me!

  // Don't Freaking ask ok. now go do something useful!!!!!!!!!!!!!!!!
    // Effect to scroll to the top and add overflow-hidden to the HTML element
    useEffect(() => {
      window.scrollTo(0, 0)
      document.documentElement.classList.add("overflow-hidden")
      return () => {
        document.documentElement.classList.remove("overflow-hidden")
      }
    }, [])


  const { 
    parsedData, 
    processedStudents, 
    validationErrors, 
    parseCSV, 
    clearData, 
    isAbsentScore 
  } = useCSVParser()
  
  const { loading, uploadResults } = useUploadResults()
  const { uploadCSVBackup, uploading: backupUploading, error: backupError, success: backupSuccess } = useCSVBackupUpload()

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile)
    setMessage({ type: "info", text: "Parsing CSV file..." })
    parseCSV(selectedFile)

    // Upload backup if context is selected
    if (context) {
      setMessage({ type: "info", text: "Uploading backup to Supabase..." })
      const result = await uploadCSVBackup(selectedFile, context)
      if (!result.success) {
        setMessage({ type: "error", text: `Backup upload failed: ${result.error}` })
      } else {
        setMessage({ type: "success", text: "Backup uploaded to Supabase successfully." })
      }
    }
  }

  const handleSave = async () => {
    if (!context) {
      setMessage({ type: "error", text: "Please select an academic context first." })
      return
    }

    if (processedStudents.length === 0) {
      setMessage({ type: "error", text: "No valid student data to save." })
      return
    }

    try {
      const successMessage = await uploadResults(processedStudents, context)
      setMessage({ type: "success", text: successMessage })
      
      // Clear the form
      setFile(null)
      clearData()
    } catch (error: any) {
      setMessage({ type: "error", text: error.message })
    }
  }

  const handleClear = () => {
    setFile(null)
    clearData()
    setMessage(null)
  }

  // Update message when parsing completes
  useEffect(() => {
    if (parsedData && processedStudents.length > 0 && validationErrors.length === 0) {
      const absentCount = processedStudents.reduce((count, student) => {
        return count + Object.values(student.scores).filter((score) => score.absent).length
      }, 0)

      const subjectCount = processedStudents[0]?.scores.length || 0
      
      setMessage({
        type: "success",
        text: `Successfully parsed ${processedStudents.length} students with ${subjectCount} subjects. Found ${absentCount} absent entries.`,
      })
    } else if (validationErrors.length > 0) {
      setMessage({ 
        type: "error", 
        text: `Found ${validationErrors.length} validation errors. Please fix them before saving.` 
      })
    }
  }, [parsedData, processedStudents, validationErrors])

  const canSave = context && processedStudents.length > 0 && validationErrors.length === 0

  // ContextSelector: when context changes, if file is already selected, upload backup
  useEffect(() => {
    if (context && file) {
      (async () => {
        setMessage({ type: "info", text: "Uploading backup to Supabase..." })
        const result = await uploadCSVBackup(file, context)
        if (!result.success) {
          setMessage({ type: "error", text: `Backup upload failed: ${result.error}` })
        } else {
          setMessage({ type: "success", text: "Backup uploaded to Supabase successfully." })
        }
      })()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context])

  if (!user) {
    return <LoadingPage message="Loading upload page..." />
  }

  return (
      <div className="max-w-6xl mx-auto px-3 sm:px-4">
        <BackToDashboard />

        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#223152] flex items-center">
            <div className="bg-[#223152] p-2 sm:p-3 rounded-full mr-2 sm:mr-4 flex-shrink-0">
              <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            Upload Student Results
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
            Upload CSV files with student results data. Use "-" or leave empty for absent students in subject columns only.
          </p>
        </div>

        {/* CSV Format Instructions */}
        <CSVFormatInstructions />

        {/* Context Selection */}
        <div className="mb-6">
          <ContextSelector onContextChange={setContext} />
        </div>

        {/* Upload Area */}
        <FileUploadZone file={file} onFileSelect={handleFileSelect} />

        {/* Messages */}
        {message && (
          <Alert
            className={`mb-6 shadow-lg animate-in slide-in-from-top-2 duration-300 ${
              message.type === "error" 
                ? "border-red-200 bg-red-50" 
                : message.type === "success" 
                  ? "border-green-200 bg-green-50" 
                  : "border-blue-200 bg-blue-50"
            }`}
          >
            {message.type === "error" && <AlertCircle className="h-4 w-4 text-red-600" />}
            {message.type === "success" && <CheckCircle className="h-4 w-4 text-green-600" />}
            {message.type === "info" && <Info className="h-4 w-4 text-blue-600" />}
            <AlertDescription className={`font-medium ${
              message.type === "error" 
                ? "text-red-800" 
                : message.type === "success" 
                  ? "text-green-800" 
                  : "text-blue-800"
            }`}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        {/* Validation Errors */}
        <ValidationErrors errors={validationErrors} />

        {/* Preview */}
        {parsedData && (
          <DataPreview
            parsedData={parsedData}
            processedStudents={processedStudents}
            loading={loading}
            canSave={canSave}
            isAbsentScore={isAbsentScore}
            onClear={handleClear}
            onSave={handleSave}
          />
        )}
      </div>
  )
}
