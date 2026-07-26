import { AdminLayout } from "@/components/AdminLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InboxTab } from "@/components/admin/communication/InboxTab";
import { ComposeTab } from "@/components/admin/communication/ComposeTab";
import { OutboxTab } from "@/components/admin/communication/OutboxTab";
import { HealthTab } from "@/components/admin/communication/HealthTab";
import { Megaphone } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useUnreadContactCount } from "@/hooks/useUnreadContactCount";

const TABS = ["inbox", "compose", "outbox", "health"] as const;
type TabKey = (typeof TABS)[number];

export default function Communication() {
  const [params, setParams] = useSearchParams();
  const initial = (params.get("tab") as TabKey) ?? "inbox";
  const active = TABS.includes(initial) ? initial : "inbox";
  const unread = useUnreadContactCount();

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <header className="flex items-center gap-3">
          <div className="rounded-2xl bg-primary/10 p-3 text-primary">
            <Megaphone className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-heading font-semibold">Communication</h1>
            <p className="text-sm text-muted-foreground">
              Parent inbox, outbound messages, delivery health, and suppression list.
            </p>
          </div>
        </header>

        <Tabs
          value={active}
          onValueChange={(v) => {
            const next = new URLSearchParams(params);
            next.set("tab", v);
            setParams(next, { replace: true });
          }}
          className="w-full"
        >
          <TabsList className="grid grid-cols-4 w-full max-w-2xl">
            <TabsTrigger value="inbox" className="gap-2">
              Inbox
              {unread > 0 && (
                <span className="inline-flex items-center justify-center rounded-full bg-destructive px-1.5 py-0.5 text-[10px] font-semibold text-destructive-foreground min-w-[18px]">
                  {unread}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="compose">Compose</TabsTrigger>
            <TabsTrigger value="outbox">Outbox</TabsTrigger>
            <TabsTrigger value="health">Health</TabsTrigger>
          </TabsList>

          <TabsContent value="inbox" className="mt-6">
            <InboxTab />
          </TabsContent>
          <TabsContent value="compose" className="mt-6">
            <ComposeTab />
          </TabsContent>
          <TabsContent value="outbox" className="mt-6">
            <OutboxTab />
          </TabsContent>
          <TabsContent value="health" className="mt-6">
            <HealthTab />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
