'use client'
// Redirect to the dashboard page if logged in, otherwhise redirecto to /login
import { redirect } from "next/navigation";
import { useEffect } from "react";
import { createClientComponentSupabaseClient } from "@/lib/supabase";	
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function Page() {
	const supabase = createClientComponentSupabaseClient();

	useEffect(() => {
		const checkSession = async () => {
			const { data: { session } } = await supabase.auth.getSession();
			if (session) {
				redirect("/admin/dashboard");
			} else {
				redirect("/admin/login");
			}
		};

		checkSession();
	}, [supabase]);

	return <LoadingSpinner size="lg" />;
}
