import { Bell, CheckCheck } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../providers/AuthProvider";
import { blocksClient } from "../../lib/blocks/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "../../shared/ui/dropdown-menu";

type Inbox = {
  notifications: Record<string, unknown>[];
  unReadNotificationsCount: number;
};

export function NotificationsMenu() {
  const { status } = useAuth();
  const queryClient = useQueryClient();
  const inbox = useQuery<Inbox>({
    enabled: status === "authenticated",
    queryFn: () => blocksClient.notifier.getNotifications({ page: 1, pageSize: 20 }) as Promise<Inbox>,
    queryKey: ["notifications", "inbox"],
    refetchInterval: 60_000
  });

  const markAll = useMutation({
    mutationFn: () => blocksClient.notifier.markAllNotificationAsRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications", "inbox"] })
  });

  const unread = inbox.data?.unReadNotificationsCount ?? 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="icon-button" aria-label="Notifications">
        <Bell size={18} />
        {unread > 0 ? <span className="notif-badge">{unread}</span> : null}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[320px]">
        <DropdownMenuLabel>Notifications{unread > 0 ? ` (${unread} unread)` : ""}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {inbox.isLoading ? (
          <p className="notif-empty">Loading…</p>
        ) : (inbox.data?.notifications.length ?? 0) === 0 ? (
          <div className="notif-empty">
            <CheckCheck size={22} />
            <p>You're all caught up.</p>
            <small>No new notifications right now.</small>
          </div>
        ) : (
          <>
            <ul className="notif-list">
              {(inbox.data?.notifications ?? []).slice(0, 8).map((notification, index) => (
                <li key={String(notification.id ?? index)}>
                  {payloadText(notification)}
                </li>
              ))}
            </ul>
            {unread > 0 ? (
              <DropdownMenuItem onSelect={() => markAll.mutate()}>
                <CheckCheck size={16} /> Mark all as read
              </DropdownMenuItem>
            ) : null}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function payloadText(notification: Record<string, unknown>): string {
  const payload = notification.denormalizedPayload ?? notification.payload ?? notification.message;
  if (typeof payload === "string" && payload.trim()) return payload;
  return "New notification";
}
