// a hook to get the current user
import { useEffect, useState } from "react";
import { createClientComponentClient, User } from "@supabase/auth-helpers-nextjs";

export default function useGetUser() {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const supabase = createClientComponentClient();

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
