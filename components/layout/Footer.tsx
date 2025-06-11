'use client'

import React from 'react'
import { Facebook, Globe, Linkedin, Instagram, ExternalLink } from "lucide-react"
import { CURRENT_ROUND } from '@/constants/currentRound'
import { usePathname } from "next/navigation"

export default function Footer() {
  const pathname = usePathname()

    // Determine Facebook link based on route
  let facebookUrl = "https://www.facebook.com/share/1HSJHe1df4/"
  if (pathname?.startsWith("/international")) {
    facebookUrl = "https://www.facebook.com/share/19DbXqKcRA/"
  } else if (pathname?.startsWith("/modern")) {
    facebookUrl = "https://www.facebook.com/share/16TciEwA8g/"
  }
  const socialLinks = [
    {
      name: "Facebook",
      url: facebookUrl,
      icon: Facebook,
      color: "hover:text-blue-600",
    },
    {
      name: "Website",
      url: "https://www.elfouadinternationalschools.com/",
      icon: Globe,
      color: "hover:text-orange-500",
    },
    {
      name: "LinkedIn",
      url: "https://eg.linkedin.com/company/el-fouad-international-schools",
      icon: Linkedin,
      color: "hover:text-blue-700",
    },
    {
      name: "Instagram",
      url: "https://www.instagram.com/elfouad_schools/?hl=ar",
      icon: Instagram,
      color: "hover:text-pink-600",
    },
  ]

  return (
    <footer className="bg-[#223152] text-white py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* School Info */}
          <div className="text-center md:text-left">
            <h3 className="text-xl font-bold mb-2">El Fouad Schools</h3>
            <p className="text-gray-300 text-sm">Excellence in Education • East Zagazig Directorate</p>
            <p className="text-gray-400 text-xs mt-1">Student Results Portal</p>
          </div>

          {/* Social Links */}
          <div className="flex flex-col items-center gap-4">
            <p className="text-sm text-gray-300">Connect with us</p>
            <div className="flex gap-4">
              {socialLinks.map((link) => {
                const IconComponent = link.icon
                return (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-2 rounded-full bg-white/10 transition-all duration-200 ${link.color} hover:bg-white/20 hover:scale-110`}
                    title={link.name}
                  >
                    <IconComponent size={20} />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Copyright */}
          <div className="text-center md:text-right text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} El Fouad Schools</p>
            <p>All rights reserved</p>
          </div>
        </div>

        {/* Bottom Border */}
        <div className="mt-6 pt-4 border-t border-white/20 text-center">
          <p className="text-xs text-gray-400">Student Results Portal • {CURRENT_ROUND.term == 1 ? 'First' : 'Second'} Term {CURRENT_ROUND.startYear}-{CURRENT_ROUND.endYear}</p>
        </div>
      </div>
    </footer>
  )
}
