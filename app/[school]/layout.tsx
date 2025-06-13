'use client'

import { useRouter } from "next/navigation"
import  useRedirectHomeOnSystemDisable  from "@/hooks/useRedirectHomeOnSystemDisable"


export default function SchoolLayout({
	children,
}: {
	children: React.ReactNode
}) {
	useRedirectHomeOnSystemDisable()

	return children
}
