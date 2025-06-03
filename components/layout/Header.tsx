import { GraduationCap } from "lucide-react"
import Image from "next/image"

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Image src="/logo2.webp" alt="El Fouad Schools" width={120} height={60} className="rounded-lg" />
            <div>
              <h1 className="text-2xl font-bold text-[#223152]">El Fouad Schools</h1>
              <p className="text-sm text-gray-600">Student Results Portal</p>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-2 text-[#223152]">
            <GraduationCap className="w-6 h-6" />
            <span className="font-medium">6th Grade Results</span>
          </div>
        </div>
      </div>
    </header>
  )
}
