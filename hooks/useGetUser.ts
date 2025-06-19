// a hook to get the current user
import { useEffect, useState } from "react";
import { createClientComponentSupabaseClient } from "@/lib/supabase";

export default function useGetUser() {
	const [user, setUser] = useState<any | null>(null);
	const [loading, setLoading] = useState(true);
	const supabase = createClientComponentSupabaseClient();

	useEffect(() => {
		const fetchUser = async () => {
			const { data: { user } } = await supabase.auth.getUser();
			setUser(user);
			setLoading(false);
		};

		fetchUser();
	}, [supabase]);

	return { user, loading };
}
