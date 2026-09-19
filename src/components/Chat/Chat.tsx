import * as React from "react";
import { choice, TypeSafeClient } from "@typesafe-ai/sdk";
import { IconSend } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageAnimated } from "@/components/message-animated";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";

//? interesting use case - nested choice - a choice wrapper that decides wether to call choice, score or noul

const client = new TypeSafeClient({
  apiKey: import.meta.env.VITE_SYSTEM_ONE_API_KEY,
  baseURL: "/api",
  dangerouslyAllowBrowser: true,
});

async function classifyMessage(document: string) {
  const response = await client.systemOne({
    state: { document },
    questions: {
      category: choice("What tool should I invoke?", {
        billing: null,
        technical: null,
        other: null,
        sales: null,
        accounting: null,
        legal: null,
        logistics: null,
      }),
    },
  });

  return response.answers.category.choice;
}

function responseForCategory(category: string) {
  switch (category) {
    case "billing":
      return "I think this is a **billing** question. I will route you to our billing team.";
    case "technical":
      return "I think this is a **technical** issue. Let me help troubleshoot it.";
    case "sales":
      return "I think this is a **sales** question. I will route you to our sales team.";
    case "accounting":
      return "I think this is a **accounting** question. I will route you to our accounting team.";
    case "legal":
      return "I think this is a **legal** question. I will route you to our legal team.";
    case "logistics":
      return "I think this is a **logistics** question. I will route you to our logistics team.";
    default:
      return "I think this is **other**. Can you tell me a bit more?";
  }
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export const Chat = () => {
  const [inputValue, setInputValue] = React.useState("");
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello, I am JEV! Let's route your request to the correct tool",
    },
  ]);
  const [isPending, setIsPending] = React.useState(false);

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
      const category = await classifyMessage(content);
      const assistantMessage = {
        id: crypto.randomUUID(),
        role: "assistant" as const,
        content: responseForCategory(category),
      };
      setMessages((previous) => [...previous, assistantMessage]);
    } catch (error) {
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
          <h1 className="font-semibold text-white!">Routing node chat</h1>
          <p className="text-xs text-muted-foreground">
            Ask anything, and get routed to the right team
          </p>
        </div>
        <div className="flex h-2 w-2 rounded-full bg-emerald-500" />
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
