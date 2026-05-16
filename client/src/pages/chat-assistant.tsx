import { LayoutShell } from "@/components/layout-shell";
import { useState, useRef, useEffect, useCallback } from "react";
import { useUser } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { User, RotateCcw, ArrowUp, Bot } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useTranslation } from "react-i18next";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";

function TunBotAvatar({ size = "sm" }: { size?: "sm" | "lg" }) {
  const px = size === "lg" ? "w-12 h-12" : "w-8 h-8";
  return (
    <div className={`${px} rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center flex-shrink-0 shadow-md`}>
      <Bot className={size === "lg" ? "w-6 h-6 text-primary-foreground" : "w-4 h-4 text-primary-foreground"} />
    </div>
  );
}

type Message = {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

const QUICK_PROMPTS = [
  { label: "What's my balance?", icon: "💰" },
  { label: "How do I transfer money?", icon: "↗️" },
  { label: "How do I freeze my card?", icon: "❄️" },
  { label: "Explain my loan repayment", icon: "🏦" },
  { label: "How do I earn reward points?", icon: "⭐" },
  { label: "How do I create a savings goal?", icon: "🎯" },
  { label: "What is Smart Facture?", icon: "📄" },
  { label: "How do I recharge my phone?", icon: "📱" },
];

function renderMessage(text: string) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      elements.push(<div key={i} className="h-2" />);
      i++;
      continue;
    }

    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, ""));
        i++;
      }
      elements.push(
        <ol key={`ol-${i}`} className="list-decimal list-inside space-y-1 my-2 pl-2">
          {items.map((item, j) => (
            <li key={j} className="leading-relaxed">{inlineFormat(item)}</li>
          ))}
        </ol>
      );
      continue;
    }

    if (/^[-•]\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-•]\s/.test(lines[i])) {
        items.push(lines[i].replace(/^[-•]\s/, ""));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="list-disc list-inside space-y-1 my-2 pl-2">
          {items.map((item, j) => (
            <li key={j} className="leading-relaxed">{inlineFormat(item)}</li>
          ))}
        </ul>
      );
      continue;
    }

    if (/^##\s/.test(line)) {
      elements.push(
        <p key={i} className="font-bold text-base mt-3 mb-1 text-foreground">{line.replace(/^##\s/, "")}</p>
      );
      i++;
      continue;
    }

    elements.push(
      <p key={i} className="leading-relaxed">{inlineFormat(line)}</p>
    );
    i++;
  }

  return <div className="space-y-1 text-sm">{elements}</div>;
}

function inlineFormat(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (/^\*\*[^*]+\*\*$/.test(part)) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (/^\*[^*]+\*$/.test(part)) return <em key={i}>{part.slice(1, -1)}</em>;
    if (/^`[^`]+`$/.test(part)) return <code key={i} className="bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded text-xs font-mono">{part.slice(1, -1)}</code>;
    return part;
  });
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-0.5">
      {[0, 1, 2].map(i => (
        <div
          key={i}
          className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
          style={{ animationDelay: `${i * 0.15}s`, animationDuration: "0.8s" }}
        />
      ))}
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <div className={cn("flex gap-3 max-w-full", isUser && "flex-row-reverse")}>
      <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden mt-0.5 flex items-center justify-center"
        style={isUser ? {} : {}}>
        {isUser
          ? <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0"><User className="w-4 h-4 text-primary-foreground" /></div>
          : <TunBotAvatar size="sm" />
        }
      </div>

      <div className={cn(
        "max-w-[82%] flex flex-col gap-1",
        isUser && "items-end"
      )}>
        <div className={cn(
          "rounded-2xl px-4 py-3 shadow-sm",
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-none"
            : "bg-card border border-border text-foreground rounded-tl-none"
        )}>
          {isUser
            ? <p className="text-sm leading-relaxed">{message.content}</p>
            : renderMessage(message.content)
          }
        </div>
        <span className="text-xs text-muted-foreground px-1">
          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  );
}

export default function ChatAssistant() {
  const { t } = useTranslation();
  const { data: user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [convId, setConvId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const welcomeMessage: Message = {
    role: "assistant",
    content: `Hello${user ? `, ${user.fullName.split(" ")[0]}` : ""}! I'm **TunBot**, your personal TunBank assistant. I have access to your account information and I'm here to help you with anything banking-related.\n\nYou can ask me about your balances, how to make transfers, manage your cards, understand your loans, set up savings goals, or anything else about TunBank's features. I always explain things clearly in full detail so you know exactly what to do.\n\nWhat can I help you with today?`,
    timestamp: new Date(),
  };

  useEffect(() => {
    setMessages([welcomeMessage]);
    const saved = localStorage.getItem("tunbank_conv_id");
    if (saved) setConvId(saved);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, isLoading]);

  const ensureConversation = async (): Promise<string> => {
    if (convId) return convId;
    const res = await apiRequest("POST", "/api/conversations", { title: "Banking Support" });
    const conv = await res.json();
    const id = conv.id.toString();
    localStorage.setItem("tunbank_conv_id", id);
    setConvId(id);
    return id;
  };

  const handleSend = useCallback(async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || isLoading) return;

    const userMsg: Message = { role: "user", content: msg, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    sounds.click();

    try {
      const id = await ensureConversation();

      const response = await fetch(`/api/conversations/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: msg }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader");

      let assistantText = "";
      const aMsg: Message = { role: "assistant", content: "", timestamp: new Date() };
      setMessages(prev => [...prev, aMsg]);

      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const lines = decoder.decode(value).split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                assistantText += data.content;
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { ...updated[updated.length - 1], content: assistantText };
                  return updated;
                });
              }
            } catch {}
          }
        }
      }
      sounds.ding();
    } catch {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "I'm sorry, I'm having trouble connecting right now. Please check your connection and try again in a moment.",
        timestamp: new Date(),
      }]);
      sounds.error();
    } finally {
      setIsLoading(false);
      textareaRef.current?.focus();
    }
  }, [input, isLoading, convId]);

  const handleNewChat = () => {
    sounds.toggle();
    localStorage.removeItem("tunbank_conv_id");
    setConvId(null);
    setMessages([{ ...welcomeMessage, timestamp: new Date() }]);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const showQuickPrompts = messages.length <= 1 && !isLoading;

  return (
    <LayoutShell>
      <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <TunBotAvatar size="lg" />
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
                TunBot
                <Badge variant="outline" className="text-xs font-normal border-primary/30 text-primary">AI</Badge>
              </h1>
              <p className="text-sm text-muted-foreground">Your personal banking assistant — always ready to help</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleNewChat} className="gap-2 text-muted-foreground hover:text-foreground">
            <RotateCcw className="w-4 h-4" />
            New chat
          </Button>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <ScrollArea className="flex-1 p-5" ref={scrollRef}>
            <div className="space-y-5">
              {messages.map((m, i) => (
                <MessageBubble key={i} message={m} />
              ))}

              {isLoading && (
                <div className="flex gap-3">
                    <TunBotAvatar size="sm" />
                  <div className="bg-card border border-border rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                    <TypingDots />
                  </div>
                </div>
              )}
            </div>

            {/* Quick prompt chips — shown only on fresh chat */}
            {showQuickPrompts && (
              <div className="mt-6">
                <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wider">Try asking me about</p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_PROMPTS.map((p) => (
                    <button
                      key={p.label}
                      onClick={() => handleSend(p.label)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-muted hover:bg-accent hover:text-accent-foreground border border-border rounded-full transition-all duration-150 hover:scale-[1.02] active:scale-95"
                    >
                      <span>{p.icon}</span>
                      <span>{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </ScrollArea>

          {/* Input bar */}
          <div className="p-4 border-t border-border bg-background/50">
            <div className="flex gap-3 items-end">
              <Textarea
                ref={textareaRef}
                placeholder="Ask me anything about your accounts, transfers, cards, loans..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                rows={1}
                className="flex-1 resize-none min-h-[44px] max-h-32 rounded-xl border-border bg-background focus:ring-1 focus:ring-primary/40 text-sm"
                style={{ height: "auto" }}
                onInput={e => {
                  const t = e.currentTarget;
                  t.style.height = "auto";
                  t.style.height = Math.min(t.scrollHeight, 128) + "px";
                }}
              />
              <Button
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
                size="icon"
                className="h-11 w-11 rounded-xl flex-shrink-0 shadow-sm"
              >
                <ArrowUp className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Press Enter to send · Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </LayoutShell>
  );
}
