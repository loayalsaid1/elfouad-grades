// a hook to get the current user
import { useEffect, useState } from "react";
import { createClientComponentSupabaseClient } from "@/lib/supabase";

export default function useGetUser() {
	const [user, setUser] = useState<any | null>(null);
	const [profile, setProfile] = useState<any | null>(null);
	const [schoolAccess, setSchoolAccess] = useState<number[]>([]);
	const [loading, setLoading] = useState(true);
	const supabase = createClientComponentSupabaseClient();

	useEffect(() => {
		const fetchUser = async () => {
			const { data: { user } } = await supabase.auth.getUser();
			setUser(user);
			if (user) {
				const { data: profile } = await supabase
					.from("users")
					.select("*")
					.eq("id", user.id)
					.single();
				setProfile(profile);
				const { data: access } = await supabase
					.from("user_school_access")
					.select("school_id")
					.eq("user_id", user.id);
				setSchoolAccess((access || []).map((a: any) => a.school_id));
			}
			setLoading(false);
		};

		fetchUser();
	}, [supabase]);

	return { user, profile, schoolAccess, loading };
}
