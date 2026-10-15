import { useState } from "react";
import { Store, UserPlus } from "lucide-react";
import { blocksClient } from "../../lib/blocks/client";
import { useAuth } from "../../app/providers/AuthProvider";
import { Alert } from "../../shared/ui/Alert";
import { FormField } from "../../shared/ui/FormField";
import { isLoginConfigured } from "../../lib/blocks/config";

export function SignupPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [pending, setPending] = useState(false);
  const configured = isLoginConfigured();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(undefined);
    if (!email.trim() || !password) {
      setError("Enter an email and a password to continue.");
      return;
    }
    setPending(true);
    try {
      await blocksClient.auth.signup({ email: email.trim(), password });
      await login("/app/setup");
    } catch (caught) {
      const message = (caught as { message?: string }).message ?? "Sign-up failed. Try another email.";
      setError(message);
      setPending(false);
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="brand-mark"><Store size={18} /></span>
          <span>Meridian</span>
        </div>
        <h2>Create your brand</h2>
        <p>Sign-up is free. Next you'll name your brand and pick a starting look.</p>
        {error ? <Alert tone="error">{error}</Alert> : null}
        <form onSubmit={handleSubmit} className="auth-form">
          <FormField
            label="Email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
          />
          <FormField
            label="Password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 8 characters"
          />
          <button className="primary-button auth-submit" type="submit" disabled={!configured || pending}>
            <UserPlus size={18} /> {pending ? "Creating account..." : "Create account"}
          </button>
        </form>
        <p className="auth-foot">
          Already have an account?{" "}
          <button className="link-button" onClick={() => onNavigate("/login")}>Sign in</button>
        </p>
      </div>
    </div>
  );
}
