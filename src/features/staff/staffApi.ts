import { staffApi } from "../domain/api";
import type { Staff, StaffRole } from "../domain/types";
import { blocksClient } from "../../lib/blocks/client";

export const ALREADY_INVITED_MESSAGE = (name: string) => `${name} already has an invite.`;

export async function listStaff(brandId: string): Promise<Staff[]> {
  const result = await staffApi.list({ filter: { brandId }, pageSize: 100 });
  return result.items.sort((a, b) => (a.invitedOn < b.invitedOn ? -1 : 1));
}

export type InviteInput = {
  brandId: string;
  email: string;
  role: StaffRole;
  language?: string;
};

// Invites through the platform's identity service (the account) and records
// the person's place on the brand. Identity rules are enforced for us; the
// Staff record carries the brand role. Provisioning the account is
// best-effort: the brand's own invite record and email must not depend on an
// identity-service permission the owner may not hold.
export async function inviteStaff({ brandId, email, role, language = "en" }: InviteInput): Promise<Staff> {
  const [firstName, ...rest] = (email.split("@")[0] ?? email).split(/[._-]/);
  const lastName = rest.join(" ");

  await blocksClient.iam.users
    .create({
      email,
      firstName: firstName ? firstName.charAt(0).toUpperCase() + firstName.slice(1) : undefined,
      lastName: lastName || undefined
    })
    .catch(() => undefined);

  await staffApi.create({
    brandId,
    email,
    invitedOn: new Date().toISOString(),
    language,
    name: "",
    role,
    state: "Invited"
  } as Partial<Staff>);

  const created = await staffApi.list({ filter: { brandId, email }, pageSize: 1 });
  const staff = created.items[0];
  if (!staff) throw new Error("The invite was sent but the staff record could not be read back.");
  return staff;
}

export async function setStaffState(staff: Staff, state: Staff["state"]): Promise<void> {
  await staffApi.update(staff.itemId, { state });
  if (staff.userId && state === "Deactivated") {
    await blocksClient.iam.users.deactivate({ userId: staff.userId }).catch(() => undefined);
  }
  if (staff.userId && state === "Active") {
    await blocksClient.iam.users.activate({ userId: staff.userId }).catch(() => undefined);
  }
}

export function displayStaffName(staff: Staff): string {
  return staff.name?.trim() || staff.email;
}
