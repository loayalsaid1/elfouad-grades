import { useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, FileText } from "lucide-react"

interface FileUploadZoneProps {
  file: File | null
  onFileSelect: (file: File) => void
}

export function FileUploadZone({ file, onFileSelect }: FileUploadZoneProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0]
    if (selectedFile) {
      onFileSelect(selectedFile)
    }
  }, [onFileSelect])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.ms-excel": [".csv"],
    },
    multiple: false,
  })

  return (
    <Card className="mb-6 shadow-xl border-2 hover:border-[#223152] transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-[#223152] to-[#2a3f66] text-white rounded-t-lg">
        <CardTitle className="text-white flex items-center">
          <div className="bg-white/20 p-2 rounded-full mr-3">
            <Upload className="h-5 w-5" />
          </div>
          Select CSV File
        </CardTitle>
        <CardDescription className="text-blue-100">
          Upload a CSV file with student results. <b>The first row must start with columns: "id", "student_name", "parent_password" (in this order), then subject columns.</b> Use "-" or leave empty for absent students in subject columns only.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
            isDragActive 
              ? "border-[#223152] bg-blue-50 scale-[1.02]" 
              : "border-gray-300 hover:border-[#223152] hover:bg-gray-50"
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center space-y-4">
            <div className={`p-4 rounded-full transition-all duration-300 ${
              isDragActive ? "bg-[#223152] scale-110" : "bg-gray-100 hover:bg-[#223152] hover:scale-110"
            }`}>
              <Upload className={`h-8 w-8 transition-colors duration-300 ${
                isDragActive ? "text-white" : "text-gray-400 group-hover:text-white"
              }`} />
            </div>
            <div className="space-y-2">
              {isDragActive ? (
                <p className="text-lg font-medium text-[#223152]">Drop the CSV file here...</p>
              ) : (
                <div>
                  <p className="text-lg font-medium text-[#223152] mb-2">Drag and drop a CSV file here, or click to select</p>
                  <Button variant="outline" className="border-[#223152] text-[#223152] hover:bg-[#223152] hover:text-white">
                    Choose File
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {file && (
          <div className="mt-6 flex items-center p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200 animate-in slide-in-from-top-2 duration-300">
            <FileText className="h-6 w-6 text-[#223152] mr-3" />
            <div className="flex-1">
              <span className="text-sm font-medium text-[#223152]">{file.name}</span>
              <span className="text-xs text-gray-500 ml-2">({(file.size / 1024).toFixed(1)} KB)</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
