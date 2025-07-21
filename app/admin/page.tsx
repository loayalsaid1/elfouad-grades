'use client'
import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useAdminUser } from "@/hooks/useAdminUser";

export default function Page() {
	const [checked, setChecked] = useState(false);
	const { user, loading } = useAdminUser()
	

	useEffect(() => {
		const checkSession = async () => {
			if (!loading) {
				setChecked(true);
				if (user) {
					redirect("/admin/dashboard");
				} else {
					redirect("/admin/login");
				}
			}
		};
		checkSession();
	}, [user, loading]);

	if (!checked) return <LoadingSpinner size="lg" className="border-4 border-cyan-500" />;
	return null;
}
