import { Mail, RefreshCw, ShieldCheck, UserRound } from "lucide-react";
import { useAuth } from "../../app/providers/AuthProvider";
import { ActionButton } from "../../shared/ui/ActionButton";
import { ChipList } from "../../shared/ui/Chip";
import { PageHeader } from "../../shared/ui/PageHeader";
import { Skeleton } from "../../shared/ui/Skeleton";
import { StatusPill } from "../../shared/ui/StatusPill";
import { useCurrentUser, userDisplayName, userInitials } from "./useCurrentUser";

export function ProfilePage() {
  const me = useCurrentUser();
  const { claims } = useAuth();
  const profile = me.data?.data;
  const name = userDisplayName(profile);
  const expiresAt = typeof claims?.exp === "number" ? new Date((claims.exp as number) * 1000) : undefined;

  return (
    <section>
      <PageHeader
        title="Profile"
        subtitle="Your account and the brands you can work on."
        actions={<ActionButton variant="icon" onClick={() => me.refetch()} title="Refresh" icon={<RefreshCw size={18} />} />}
      />

      {me.isLoading ? (
        <div className="profile-card">
          <Skeleton className="skeleton-avatar-lg" />
          <div className="profile-heading">
            <Skeleton className="skeleton-line-lg" />
            <Skeleton className="skeleton-line" />
          </div>
        </div>
      ) : (
        <div className="profile-card">
          <span className="avatar avatar-lg">{userInitials(profile)}</span>
          <div className="profile-heading">
            <h3>{name || (me.isError ? "Account unavailable" : "Unknown user")}</h3>
            {profile?.email ? <span className="muted"><Mail size={14} /> {profile.email}</span> : null}
            <StatusPill tone={me.isSuccess ? "good" : "warn"}>
              {me.isSuccess ? "Signed in" : "Session unavailable"}
            </StatusPill>
          </div>
        </div>
      )}

      <div className="grid">
        <div className="panel">
          <div className="panel-title"><UserRound size={16} /><span>Name</span></div>
          <strong>{name || "Not set"}</strong>
        </div>
        <div className="panel">
          <div className="panel-title"><Mail size={16} /><span>Email</span></div>
          <strong>{profile?.email || "Not available"}</strong>
        </div>
        <div className="panel">
          <div className="panel-title"><ShieldCheck size={16} /><span>Roles</span></div>
          <ChipList empty="No roles assigned" items={profile?.roles} />
        </div>
      </div>

      <p className="muted">
        {expiresAt ? `Your session renews automatically. Signed in until ${expiresAt.toLocaleTimeString()}.` : "Your session renews automatically."}
      </p>
    </section>
  );
}
