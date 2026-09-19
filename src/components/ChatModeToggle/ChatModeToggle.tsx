import { IconTicket, IconTool } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

export type ChatMode = "tickets" | "tools";

interface ChatModeToggleProps {
  mode: ChatMode;
  onModeChange: (mode: ChatMode) => void;
  disabled?: boolean;
}

const modeOptions = [
  { value: "tickets", label: "Tickets", Icon: IconTicket },
  { value: "tools", label: "Tools", Icon: IconTool },
] as const satisfies ReadonlyArray<{
  value: ChatMode;
  label: string;
  Icon: typeof IconTicket;
}>;

export function ChatModeToggle({
  mode,
  onModeChange,
  disabled = false,
}: ChatModeToggleProps) {
  return (
    <div
      role="group"
      aria-label="Chat mode"
      className="rounded-md border border-border bg-muted/40 p-0.5"
    >
      <div className="relative grid grid-cols-2">
        <div
          aria-hidden="true"
          className={`absolute inset-y-0 left-0 w-1/2 rounded-sm bg-primary transition-transform duration-300 ease-out motion-reduce:transition-none ${
            mode === "tools" ? "translate-x-full" : "translate-x-0"
          }`}
        />
        {modeOptions.map(({ value, label, Icon }) => {
          const isActive = mode === value;

          return (
            <Button
              key={value}
              type="button"
              variant="ghost"
              size="sm"
              aria-pressed={isActive}
              disabled={disabled}
              onClick={() => onModeChange(value)}
              className={`relative z-10 rounded-sm bg-transparent px-2.5 hover:bg-transparent dark:hover:bg-transparent ${
                isActive
                  ? "text-primary-foreground hover:text-primary-foreground"
                  : "text-foreground"
              }`}
            >
              <Icon data-icon="inline-start" />
              {label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
