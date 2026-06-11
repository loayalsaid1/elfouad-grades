import { GraduationCap } from "lucide-react"
import Image from "next/image"

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative w-32 h-16">
              <Image src="/logo2.png" alt="El Fouad Schools Group" fill className="object-cover" priority />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#223152]">El Fouad Schools Group</h1>
              <p className="text-sm text-gray-600">Student Results Portal</p>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-2 text-[#223152]">
            <GraduationCap className="w-6 h-6" />
            <span className="font-medium">Academic Results System</span>
          </div>
        </div>
      </div>
    </header>
  )
}
