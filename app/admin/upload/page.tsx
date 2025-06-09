"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, FileText, AlertCircle } from "lucide-react"
import Papa from "papaparse"

export default function UploadPage() {
  const [file, setFile] = useState(null)
  const [parsedData, setParsedData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const supabase = createClientComponentClient()

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0]
    if (file) {
      setFile(file)
      parseCSV(file)
    }
  }, [])

  const parseCSV = (file) => {
    Papa.parse(file, {
      complete: (results) => {
        console.log("Parsed CSV:", results.data)
        setParsedData(results.data)
        setMessage("CSV parsed successfully! Review the data below.")
      },
      header: false,
      skipEmptyLines: true,
    })
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.ms-excel": [".csv"],
    },
    multiple: false,
  })

  const handleSave = async () => {
    if (!parsedData || parsedData.length < 3) {
      setMessage("Invalid CSV format. Please check your file.")
      return
    }

    setLoading(true)
    try {
      // This is a simplified save - you can enhance this based on your needs
      const headers = parsedData[0]
      const fullMarks = parsedData[1]
      const students = parsedData.slice(2)

      console.log("Would save:", { headers, fullMarks, students })
      setMessage("Data saved successfully! (This is a demo - implement actual save logic)")
    } catch (error) {
      setMessage("Error saving data: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Upload Student Results</h1>
          <p className="text-gray-600 mt-2">Upload CSV files with student results data</p>
        </div>

        {/* Upload Area */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select CSV File</CardTitle>
            <CardDescription>
              Upload a CSV file with student results. Format: id, student_name, parent_password, then subject columns.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              {isDragActive ? (
                <p className="text-blue-600">Drop the CSV file here...</p>
              ) : (
                <div>
                  <p className="text-gray-600 mb-2">Drag and drop a CSV file here, or click to select</p>
                  <Button variant="outline">Choose File</Button>
                </div>
              )}
            </div>

            {file && (
              <div className="mt-4 flex items-center text-sm text-gray-600">
                <FileText className="h-4 w-4 mr-2" />
                {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </div>
            )}
          </CardContent>
        </Card>

        {/* Messages */}
        {message && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {/* Preview */}
        {parsedData && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Data Preview</CardTitle>
              <CardDescription>Review the parsed data before saving to database</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200">
                  <tbody>
                    {parsedData.slice(0, 10).map((row, index) => (
                      <tr
                        key={index}
                        className={index === 0 ? "bg-blue-50" : index === 1 ? "bg-yellow-50" : "bg-white"}
                      >
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex} className="border border-gray-200 px-3 py-2 text-sm">
                            {cell || "-"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedData.length > 10 && (
                <p className="text-sm text-gray-500 mt-2">Showing first 10 rows of {parsedData.length} total rows</p>
              )}

              <div className="mt-4 flex justify-end space-x-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setFile(null)
                    setParsedData(null)
                  }}
                >
                  Clear
                </Button>
                <Button onClick={handleSave} disabled={loading}>
                  {loading ? "Saving..." : "Save to Database"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
