import * as React from "react";
import { choice, type SystemOneResult } from "@typesafe-ai/sdk";
import { IconSend } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageAnimated } from "@/components/message-animated";
import { ChatModeToggle, type ChatMode } from "@/components/ChatModeToggle";
import { chatConfig } from "@/components/Chat/Chat.config";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";

//? interesting use case - nested choice - a choice wrapper that decides wether to call choice, score or noul

async function classifyMessage(document: string, mode: ChatMode) {
  const categoryChoices = Object.fromEntries(
    chatConfig[mode].categories.map((category) => [category, null]),
  );
  const question =
    mode === "tickets"
      ? "Which support team should handle this request?"
      : "What tool should I invoke?";
  const questions = {
    category: choice(question, categoryChoices),
  };
  const response = await fetch("/api/v1/systemone", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ state: { document }, questions }),
  });

  if (!response.ok) {
    throw new Error("Failed to classify message.");
  }

  const result = (await response.json()) as SystemOneResult<typeof questions>;

  return result.answers.category.choice;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export const Chat = () => {
  const [inputValue, setInputValue] = React.useState("");
  const [mode, setMode] = React.useState<ChatMode>("tools");
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: crypto.randomUUID(),
      role: "assistant",
      content: chatConfig.tools.title,
    },
  ]);
  const [isPending, setIsPending] = React.useState(false);
  const activeConfig = chatConfig[mode];

  const handleModeChange = (nextMode: ChatMode) => {
    setMode(nextMode);
    setInputValue("");
    setMessages([
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content: chatConfig[nextMode].title,
      },
    ]);
  };

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const content = inputValue.trim();
    if (!content) return;

    setInputValue("");
    setIsPending(true);

    const userMessage = {
      id: crypto.randomUUID(),
      role: "user" as const,
      content,
    };

    setMessages((previous) => [...previous, userMessage]);

    try {
      const category = await classifyMessage(content, mode);
      const assistantMessage = {
        id: crypto.randomUUID(),
        role: "assistant" as const,
        content: category,
      };
      setMessages((previous) => [...previous, assistantMessage]);
    } catch {
      const assistantMessage = {
        id: crypto.randomUUID(),
        role: "assistant" as const,
        content:
          "Sorry, I could not process your request right now. Please try again.",
      };
      setMessages((previous) => [...previous, assistantMessage]);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <section className="flex h-[min(600px,calc(100svh-2rem))] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm">
      <header className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
        <div className="text-left">
          <h1 className="font-semibold text-white!">Chat</h1>
          <p className="text-xs text-muted-foreground">
            {activeConfig.subtitle}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ChatModeToggle
            mode={mode}
            onModeChange={handleModeChange}
            disabled={isPending}
          />
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
        </div>
      </header>

      <div className="flex-1 min-h-0">
        <MessageScrollerProvider>
          <MessageScroller className="h-full">
            <MessageScrollerViewport className="bg-background">
              <MessageScrollerContent className="p-4 gap-3">
                {messages.map((message, index) => (
                  <MessageScrollerItem
                    key={message.id}
                    messageId={message.id}
                    scrollAnchor={index === messages.length - 1}
                  >
                    <MessageAnimated message={message} />
                  </MessageScrollerItem>
                ))}
                {isPending && (
                  <MessageScrollerItem messageId="pending">
                    <MessageAnimated
                      isPending
                      message={{
                        id: "pending",
                        role: "assistant",
                      }}
                    />
                  </MessageScrollerItem>
                )}
              </MessageScrollerContent>
            </MessageScrollerViewport>
            <MessageScrollerButton />
          </MessageScroller>
        </MessageScrollerProvider>
      </div>

      <footer className="shrink-0 border-t border-border p-3">
        <form className="flex items-center gap-2" onSubmit={handleSubmit}>
          <Input
            autoFocus
            placeholder="Type a message..."
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            disabled={isPending}
            className="flex-1"
          />
          <Button
            type="submit"
            size="icon"
            disabled={isPending}
            aria-label="Send message"
          >
            <IconSend />
          </Button>
        </form>
      </footer>
    </section>
  );
};
