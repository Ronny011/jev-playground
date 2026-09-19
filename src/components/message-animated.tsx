import { cn } from "@/lib/utils";

interface MessageAnimatedProps {
  message: {
    id: string;
    role: "user" | "assistant";
    content?: string;
  };
  scrollAnchor?: boolean;
  className?: string;
  isPending?: boolean;
}

function MessageAnimated({
  message,
  className,
  isPending = false,
}: MessageAnimatedProps) {
  const isUser = message.role === "user";

  return (
    <div
      data-slot="message-animated"
      className={cn(
        "flex w-full animate-in fade-in slide-in-from-bottom-4 duration-300",
        isUser ? "justify-end" : "justify-start",
        className,
      )}
    >
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isUser
            ? "rounded-br-sm bg-primary text-primary-foreground shadow-sm"
            : "rounded-bl-sm border border-border bg-secondary text-secondary-foreground",
        )}
      >
        {isPending ? (
          <span
            role="status"
            aria-label="Routing request"
            className="flex items-center gap-1.5 py-1"
          >
            <span
              aria-hidden="true"
              className="flex size-2 shrink-0 animate-bounce rounded-full border border-primary bg-primary/20 [animation-delay:-300ms]"
            />
            <span
              aria-hidden="true"
              className="flex size-2 shrink-0 animate-bounce rounded-full border border-primary bg-primary/20 [animation-delay:-150ms]"
            />
            <span
              aria-hidden="true"
              className="flex size-2 shrink-0 animate-bounce rounded-full border border-primary bg-primary/20"
            />
            <span className="ml-1 font-mono text-[0.65rem] font-medium tracking-widest text-muted-foreground">
              Routing
            </span>
          </span>
        ) : (
          message.content
        )}
      </div>
    </div>
  );
}

export { MessageAnimated };
