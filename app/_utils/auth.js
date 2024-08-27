import { useUser } from "@clerk/nextjs";

export function useIsUserLoggedIn() {
  const { user } = useUser();
  return {
    isLoggedIn: Boolean(user),
    userId: user?.id || null,
    user: user || null,
  };
}
