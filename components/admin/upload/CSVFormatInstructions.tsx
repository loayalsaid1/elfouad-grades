import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Info } from "lucide-react"

export function CSVFormatInstructions() {
  return (
    <Card className="mb-6 border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-xl hover:shadow-2xl transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg px-4 py-3 sm:px-6 sm:py-4">
        <CardTitle className="text-white text-base sm:text-lg flex items-center gap-1 sm:gap-2">
          <div className="bg-white/20 p-1 sm:p-2 rounded-full">
            <Info className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          How to format your CSV file
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-6">
        <div className="mb-3 sm:mb-4 p-2 sm:p-4 bg-white rounded-lg border border-blue-200">
          <span className="bg-blue-100 px-2 py-1 sm:px-3 sm:py-1 rounded-full text-blue-800 font-medium text-xs sm:text-sm">Follow these steps to prepare your file:</span>
        </div>
        <ol className="list-decimal list-inside text-xs sm:text-sm text-[#223152] space-y-2 sm:space-y-3 pl-2 sm:pl-4">
          <li>
            <b>First row:</b> Start with <code className="bg-blue-100 px-1 py-0.5 sm:px-2 sm:py-1 rounded font-mono text-[10px] sm:text-xs">id</code>,{" "}
            <code className="bg-blue-100 px-1 py-0.5 sm:px-2 sm:py-1 rounded font-mono text-[10px] sm:text-xs">student_name</code>,{" "}
            <code className="bg-blue-100 px-1 py-0.5 sm:px-2 sm:py-1 rounded font-mono text-[10px] sm:text-xs">parent_password</code>, then one column for each subject
            (e.g. <code className="bg-blue-100 px-1 py-0.5 sm:px-2 sm:py-1 rounded font-mono text-[10px] sm:text-xs">Arabic</code>,{" "}
            <code className="bg-blue-100 px-1 py-0.5 sm:px-2 sm:py-1 rounded font-mono text-[10px] sm:text-xs">Religion</code>,{" "}
            <code className="bg-blue-100 px-1 py-0.5 sm:px-2 sm:py-1 rounded font-mono text-[10px] sm:text-xs">Math</code>, ...).
          </li>
          <li>
            <b>Second row:</b> Enter the{" "}
            <span className="font-semibold text-[#223152]">full mark</span> for each subject (first three columns can be blank).
          </li>
          <li>
            <b>Each following row:</b> Fill in student info and their scores for each subject.
          </li>
          <li>
            For <span className="font-semibold text-red-600">absent students</span> in a subject, use{" "}
            <code className="bg-red-100 px-1 py-0.5 sm:px-2 sm:py-1 rounded font-mono text-red-700 text-[10px] sm:text-xs">-</code> in that cell.
          </li>
          <li>
            If a student <span className="font-semibold text-orange-600">does not take a subject at all</span>, use{" "}
            <code className="bg-orange-100 px-1 py-0.5 sm:px-2 sm:py-1 rounded font-mono text-orange-700 text-[10px] sm:text-xs">N/A</code> in that cell.
          </li>
        </ol>
        <div className="overflow-x-auto mt-3 sm:mt-6 bg-white rounded-lg border-2 border-blue-200 shadow-inner -mx-3 sm:mx-0">
          <table className="min-w-max text-[10px] sm:text-xs">
            <tbody>
              <tr className="bg-gradient-to-r from-blue-100 to-blue-200">
                <td className="border border-blue-300 px-1 py-1 sm:px-3 sm:py-2 font-semibold">id</td>
                <td className="border border-blue-300 px-1 py-1 sm:px-3 sm:py-2 font-semibold">student_name</td>
                <td className="border border-blue-300 px-1 py-1 sm:px-3 sm:py-2 font-semibold">parent_password</td>
                <td className="border border-blue-300 px-1 py-1 sm:px-3 sm:py-2 font-semibold">Arabic</td>
                <td className="border border-blue-300 px-1 py-1 sm:px-3 sm:py-2 font-semibold">Religion</td>
                <td className="border border-blue-300 px-1 py-1 sm:px-3 sm:py-2 font-semibold">Math</td>
                <td className="border border-blue-300 px-1 py-1 sm:px-3 sm:py-2 font-semibold">Science</td>
              </tr>
              <tr className="bg-yellow-50">
                <td className="border border-blue-200 px-1 py-1 sm:px-3 sm:py-2 text-gray-400">-</td>
                <td className="border border-blue-200 px-1 py-1 sm:px-3 sm:py-2 text-gray-400">-</td>
                <td className="border border-blue-200 px-1 py-1 sm:px-3 sm:py-2 text-gray-400">-</td>
                <td className="border border-blue-200 px-1 py-1 sm:px-3 sm:py-2 font-semibold text-yellow-700">100</td>
                <td className="border border-blue-200 px-1 py-1 sm:px-3 sm:py-2 font-semibold text-yellow-700">100</td>
                <td className="border border-blue-200 px-1 py-1 sm:px-3 sm:py-2 font-semibold text-yellow-700">100</td>
                <td className="border border-blue-200 px-1 py-1 sm:px-3 sm:py-2 font-semibold text-yellow-700">100</td>
              </tr>
              <tr className="bg-white hover:bg-gray-50">
                <td className="border border-blue-200 px-1 py-1 sm:px-3 sm:py-2">123</td>
                <td className="border border-blue-200 px-1 py-1 sm:px-3 sm:py-2">Ali Ahmed</td>
                <td className="border border-blue-200 px-1 py-1 sm:px-3 sm:py-2">pw123</td>
                <td className="border border-blue-200 px-1 py-1 sm:px-3 sm:py-2">90</td>
                <td className="border border-blue-200 px-1 py-1 sm:px-3 sm:py-2">96</td>
                <td className="border border-blue-200 px-1 py-1 sm:px-3 sm:py-2">95</td>
                <td className="border border-blue-200 px-1 py-1 sm:px-3 sm:py-2 bg-red-50 text-red-600 font-semibold">-</td>
              </tr>
              <tr className="bg-white hover:bg-gray-50">
                <td className="border border-blue-200 px-1 py-1 sm:px-3 sm:py-2">124</td>
                <td className="border border-blue-200 px-1 py-1 sm:px-3 sm:py-2">Sara Fathy</td>
                <td className="border border-blue-200 px-1 py-1 sm:px-3 sm:py-2 text-gray-400">-</td>
                <td className="border border-blue-200 px-1 py-1 sm:px-3 sm:py-2">98</td>
                <td className="border border-blue-200 px-1 py-1 sm:px-3 sm:py-2">100</td>
                <td className="border border-blue-200 px-1 py-1 sm:px-3 sm:py-2">90</td>
                <td className="border border-blue-200 px-1 py-1 sm:px-3 sm:py-2">96</td>
              </tr>
              <tr className="bg-white hover:bg-gray-50">
                <td className="border border-blue-200 px-1 py-1 sm:px-3 sm:py-2">125</td>
                <td className="border border-blue-200 px-1 py-1 sm:px-3 sm:py-2">Mohamed Samir</td>
                <td className="border border-blue-200 px-1 py-1 sm:px-3 sm:py-2">pw999</td>
                <td className="border border-blue-200 px-1 py-1 sm:px-3 sm:py-2">89</td>
                <td className="border border-blue-200 px-1 py-1 sm:px-3 sm:py-2">100</td>
                <td className="border border-blue-200 px-1 py-1 sm:px-3 sm:py-2 bg-orange-50 text-orange-600 font-semibold">N/A</td>
                <td className="border border-blue-200 px-1 py-1 sm:px-3 sm:py-2">100</td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
