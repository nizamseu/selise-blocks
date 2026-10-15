import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Mail, UserMinus, UserPlus, Users } from "lucide-react";
import { useBrand } from "../domain/BrandProvider";
import { FREE_PLAN } from "../domain/plan";
import { blocksClient } from "../../lib/blocks/client";
import { ALREADY_INVITED_MESSAGE, displayStaffName, inviteStaff, listStaff, setStaffState } from "./staffApi";
import type { Staff, StaffRole } from "../domain/types";
import { Alert } from "../../shared/ui/Alert";
import { EmptyState } from "../../shared/ui/EmptyState";
import { FormField } from "../../shared/ui/FormField";
import { LoadingScreen } from "../../shared/ui/LoadingScreen";
import { Modal } from "../../shared/ui/Modal";
import { SelectField } from "../../shared/ui/Select";
import { StatusPill } from "../../shared/ui/StatusPill";

export function StaffPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { activeBrand, isOwner, staffEntry } = useBrand();
  const brandId = activeBrand?.itemId;
  const [inviting, setInviting] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<StaffRole>("Brand editor");
  const [error, setError] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);

  const staffQuery = useQuery({
    enabled: Boolean(brandId),
    queryFn: () => listStaff(brandId as string),
    queryKey: ["staff", brandId]
  });

  if (!activeBrand) return null;
  const brandName = activeBrand.name;

  if (!isOwner) {
    return (
      <section>
        <header className="page-header"><div><h2>Staff</h2><p>Only the brand owner can manage staff.</p></div></header>
        <Alert tone="warn">Only the brand owner can invite or deactivate staff.</Alert>
        <button className="icon-button" onClick={() => onNavigate("/app")}>Back to dashboard</button>
      </section>
    );
  }

  if (staffQuery.isLoading) return <LoadingScreen />;
  const staff = staffQuery.data ?? [];
  const seatsUsed = staff.filter((entry) => entry.state !== "Deactivated").length;

  async function submitInvite(event: React.FormEvent) {
    event.preventDefault();
    setError(undefined);
    const address = email.trim();
    if (!address || !address.includes("@")) {
      setError("Enter an email address to invite.");
      return;
    }
    const existing = staff.find((entry) => entry.email.toLowerCase() === address.toLowerCase() && entry.state !== "Deactivated");
    if (existing) {
      setError(ALREADY_INVITED_MESSAGE((address.split("@")[0] ?? address).replace(/^\w/, (char) => char.toUpperCase())));
      return;
    }
    if (seatsUsed >= FREE_PLAN.staffSeats) {
      setError("The free plan includes 2 staff seats.");
      return;
    }
    setBusy(true);
    try {
      await inviteStaff({ brandId: brandId as string, email: address, role });
      await sendInviteEmail(address, brandName);
      setEmail("");
      setInviting(false);
      await staffQuery.refetch();
    } catch (caught) {
      setError((caught as Error).message || "The invite could not be sent.");
    } finally {
      setBusy(false);
    }
  }

  async function deactivate(entry: Staff) {
    if (entry.itemId === staffEntry?.itemId) return;
    await setStaffState(entry, "Deactivated");
    await staffQuery.refetch();
  }

  async function reactivate(entry: Staff) {
    if (entry.state === "Deactivated" && seatsUsed >= FREE_PLAN.staffSeats) {
      setError("The free plan includes 2 staff seats.");
      return;
    }
    await setStaffState(entry, "Active");
    await staffQuery.refetch();
  }

  return (
    <section>
      <header className="page-header">
        <div><h2>Staff</h2><p>{seatsUsed} of {FREE_PLAN.staffSeats} seats used on the free plan.</p></div>
        <div className="page-actions">
          <button className="primary-button" onClick={() => { setError(undefined); setInviting(true); }}>
            <UserPlus size={18} /> Invite staff
          </button>
        </div>
      </header>

      {error ? <Alert tone="error">{error}</Alert> : null}
      {seatsUsed >= FREE_PLAN.staffSeats ? <Alert tone="warn">The free plan includes 2 staff seats.</Alert> : null}

      {staff.length === 0 ? (
        <EmptyState
          icon={<Users size={22} />}
          title="No staff yet"
          description="Invite someone to help keep the catalog current."
          action={<button className="primary-button" onClick={() => setInviting(true)}>Invite staff</button>}
        />
      ) : (
        <div className="table-shell">
          <table>
            <thead><tr><th>Person</th><th>Role</th><th>State</th><th>Invited</th><th className="cell-right">Actions</th></tr></thead>
            <tbody>
              {staff.map((entry) => {
                const tone = entry.state === "Active" ? "good" : entry.state === "Invited" ? "neutral" : "warn";
                return (
                  <tr key={entry.itemId}>
                    <td>
                      <div className="product-cell">
                        <span className="avatar avatar-sm">{(displayStaffName(entry)[0] ?? "?").toUpperCase()}</span>
                        <div>
                          <strong>{displayStaffName(entry)}</strong>
                          {entry.email !== displayStaffName(entry) ? <small className="muted">{entry.email}</small> : null}
                        </div>
                      </div>
                    </td>
                    <td>{entry.role}</td>
                    <td><StatusPill tone={tone}>{entry.state}</StatusPill></td>
                    <td>{new Date(entry.invitedOn).toLocaleDateString()}</td>
                    <td className="cell-right">
                      {entry.state === "Deactivated" ? (
                        <button className="icon-button" onClick={() => reactivate(entry)} title="Reactivate">Reactivate</button>
                      ) : entry.itemId === staffEntry?.itemId ? (
                        <span className="muted">You</span>
                      ) : (
                        <button className="icon-button" onClick={() => deactivate(entry)} title="Deactivate"><UserMinus size={16} /></button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {inviting ? (
        <Modal title="Invite staff" onClose={() => setInviting(false)}>
          <form onSubmit={submitInvite} className="auth-form">
            <FormField
              label="Email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="maria@loom-thread.com"
            />
            <SelectField
              label="Role"
              value={role}
              onChange={(event) => setRole(event.target.value as StaffRole)}
              options={[
                { label: "Brand editor", value: "Brand editor" },
                { label: "Brand owner", value: "Brand owner" }
              ]}
            />
            <div className="modal-actions">
              <button type="button" className="icon-button" onClick={() => setInviting(false)}>Cancel</button>
              <button type="submit" className="primary-button" disabled={busy}>
                <Mail size={16} /> {busy ? "Sending…" : "Send invite"}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}
    </section>
  );
}

async function sendInviteEmail(email: string, brandName: string): Promise<void> {
  await blocksClient.mail
    .send({
      bodyDataContext: { brandName, inviteLink: window.location.origin + "/login" },
      subjectDataContext: { brandName },
      to: [email]
    })
    .catch(() => undefined);
}
