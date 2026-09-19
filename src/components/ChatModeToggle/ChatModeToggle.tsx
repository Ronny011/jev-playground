import { IconTicket, IconTool } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

export type ChatMode = "tickets" | "tools";

interface ChatModeToggleProps {
  mode: ChatMode;
  onModeChange: (mode: ChatMode) => void;
  disabled?: boolean;
}

export function ChatModeToggle({
  mode,
  onModeChange,
  disabled = false,
}: ChatModeToggleProps) {
  return (
    <div
      role="group"
      aria-label="Chat mode"
      className="flex items-center rounded-md border border-border bg-muted/40 p-0.5"
    >
      <Button
        type="button"
        variant={mode === "tickets" ? "secondary" : "ghost"}
        size="sm"
        aria-pressed={mode === "tickets"}
        disabled={disabled}
        onClick={() => onModeChange("tickets")}
        className="rounded-sm px-2.5"
      >
        <IconTicket data-icon="inline-start" />
        Tickets
      </Button>
      <Button
        type="button"
        variant={mode === "tools" ? "secondary" : "ghost"}
        size="sm"
        aria-pressed={mode === "tools"}
        disabled={disabled}
        onClick={() => onModeChange("tools")}
        className="rounded-sm px-2.5"
      >
        <IconTool data-icon="inline-start" />
        Tools
      </Button>
    </div>
  );
}
