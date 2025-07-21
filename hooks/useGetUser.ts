// a hook to get the current user
import { useAdminUserContext } from "@/contexts/AdminUserContext";

/**
 * Legacy compatibility hook for useGetUser
 * @deprecated Use useAdminUser from hooks/useAdminUser.ts instead
 */
export default function useGetUser() {
	try {
		const { user, profile, schoolAccess, loading } = useAdminUserContext()
		return { user, profile, schoolAccess, loading };
	} catch (error) {
		// Fallback for components not wrapped in AdminUserProvider
		console.warn("useGetUser called outside AdminUserProvider context. Returning default values.");
		return { 
			user: null, 
			profile: null, 
			schoolAccess: [], 
			loading: false 
		};
	}
}
