'use client'

import { useRouter } from "next/navigation"
import  useRedirectHomeOnSystemDisable  from "@/hooks/useRedirectHomeOnSystemDisable"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"


export default function SchoolLayout({
	children,
}: {
	children: React.ReactNode
}) {
	useRedirectHomeOnSystemDisable()

	return (
		<div className="h-full flex flex-col">
			<Header />
			<div className="flex-1">
				{children}
			</div>
			<Footer />
		</div>
	)
}
