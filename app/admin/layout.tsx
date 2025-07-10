export default function AdminLayout({ children }: { children: React.ReactNode }) {
	return <div className="flex-1 max-h-full overflow-y-auto">{children}</div>
}
