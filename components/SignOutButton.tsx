import { signOut } from "@/lib/auth/actions";
import { Button } from "@/components/ui/Button";

/**
 * Server-action sign out rendered as a plain form — works without client
 * JavaScript and from any server or client context.
 */
export function SignOutButton({
  variant = "secondary",
  label = "Sign out",
}: {
  variant?: "primary" | "secondary" | "ghost";
  label?: string;
}) {
  return (
    <form action={signOut}>
      <Button type="submit" variant={variant}>
        {label}
      </Button>
    </form>
  );
}
