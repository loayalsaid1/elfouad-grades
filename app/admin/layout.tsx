import Header from "@/components/layout/Header";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="h-full flex flex-col">
			<Header />
			<div className="flex-1 min-h-0">
				{children}
			</div>
		</div>
	)
}
