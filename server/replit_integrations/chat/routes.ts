import type { Express, Request, Response } from "express";
import OpenAI from "openai";
import { chatStorage } from "./storage";
import { db } from "../../db";
import { accounts, transactions, cards, loans, savingsGoals } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

let openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
      baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
    });
  }
  return openai;
}

async function buildSystemPrompt(userId: number | null): Promise<string> {
  let userContext = "";

  if (userId) {
    try {
      const userAccounts = await db.select().from(accounts).where(eq(accounts.userId, userId));
      const userCards = await db.select().from(cards);
      const userLoans = await db.select().from(loans).where(eq(loans.userId, userId));
      const userGoals = await db.select().from(savingsGoals).where(eq(savingsGoals.userId, userId));
      const recentTx = await db.select().from(transactions).orderBy(desc(transactions.createdAt)).limit(10);

      const accountsSummary = userAccounts.map(a =>
        `- ${a.type} account (${a.accountNumber}): ${parseFloat(a.balance).toFixed(3)} ${a.currency}`
      ).join("\n");

      const loansSummary = userLoans.map(l =>
        `- ${l.type} loan: ${parseFloat(l.remainingBalance).toFixed(3)} TND remaining of ${parseFloat(l.amount).toFixed(3)} TND, status: ${l.status}, monthly installment: ${parseFloat(l.monthlyInstallment).toFixed(3)} TND`
      ).join("\n");

      const goalsSummary = userGoals.map(g =>
        `- "${g.title}": saved ${parseFloat(g.currentAmount).toFixed(3)} / ${parseFloat(g.targetAmount).toFixed(3)} TND`
      ).join("\n");

      const txSummary = recentTx.map(t =>
        `- ${t.type} of ${parseFloat(t.amount).toFixed(3)} TND: ${t.description || "no description"} (${t.status})`
      ).join("\n");

      userContext = `
## USER'S CURRENT FINANCIAL DATA
You have access to this user's real account data. Use it to give personalized, specific answers.

**Accounts:**
${accountsSummary || "No accounts found."}

**Active Loans:**
${loansSummary || "No loans found."}

**Savings Goals:**
${goalsSummary || "No savings goals found."}

**Recent Transactions (last 10):**
${txSummary || "No recent transactions."}
`;
    } catch (e) {
      userContext = "\n(Could not load user financial data at this time.)\n";
    }
  }

  return `You are TunBot, the intelligent AI banking assistant for TunBank — a modern Tunisian digital bank. You are knowledgeable, warm, and professional. You always write in complete sentences and well-structured paragraphs. Never use bullet points alone — always explain things in flowing prose with context.

## YOUR PERSONALITY
You are like a personal banker who genuinely cares about the user's financial wellbeing. You explain things clearly without jargon, give step-by-step guidance when needed, and proactively suggest features the user might find helpful. When a user asks a question, you answer it fully, then often add a useful tip or next step they might not have thought of.

## LANGUAGE RULE
Detect the language the user writes in (English, French, Arabic, or Tunisian Darija) and always respond in the exact same language. Do not switch languages.

## WHAT YOU CAN HELP WITH

**Accounts & Balances:** You can tell the user their account balances, account numbers, and account types based on their real data. Explain what checking vs savings accounts mean in practical terms.

**Transfers:** TunBank supports two types of transfers. Local TND transfers let you send money instantly between TunBank accounts using an account number — go to Transfers > Local Transfer, choose your source account, enter the destination account number and amount, then confirm. International transfers support currency conversion with live exchange rates — go to Transfers > International, choose a currency, enter the amount, and the system will show you the converted total before confirming.

**Cards:** Users can create virtual or physical cards linked to their accounts. Cards can be frozen and unfrozen at any time from the Cards page — this is useful if a card is lost or suspicious activity is noticed. Each card shows its number, expiry date, and current status.

**Loans:** TunBank offers six loan types: Personal, Mortgage, Auto, Education, Business, and Micro loans. Users can apply from the Loans page by selecting a type, amount, and duration. The system calculates monthly installments automatically. Repayment can be done at any time from the Loans page using the "Repay" button on any active loan.

**Mobile Recharge:** Users can recharge Tunisian phone numbers (Ooredoo, Orange, Tunisie Telecom) from the Services page. Just enter the phone number, choose a provider, select an amount, and pick the account to debit.

**Bill Payments (Smart Facture):** Pay utility bills, internet, and other invoices from the Services page. Enter the biller reference and amount, and the payment is processed instantly.

**Savings Goals:** Users can create savings goals (for travel, a car, emergencies, etc.) with a target amount and optional target date. Each goal has a progress ring showing how close they are. They contribute by clicking "Add Funds" on any goal, choosing an account, and entering an amount. Each contribution earns 15 reward points.

**Rewards:** TunBank has a point-based rewards system. Users earn points on every action: 10 pts for local transfers, 30 pts for international transfers, 20 pts for recharges, 50 pts for bill payments, 100 pts for loan repayments, 15 pts per savings contribution, and 0.5 pts per dinar spent in the Shop. Points can be viewed on the Rewards page.

**Smart Spending Analyzer:** The Analytics page shows spending breakdowns by category with charts, trends over time, and an AI-powered spending score. It helps users understand where their money goes.

**Shopping Hub:** The Shop page lets users browse and buy from 8 stores: Amazon, AliExpress, Alibaba, Carrefour, MyTek, Jumia, and Aziza. Payment is deducted directly from the chosen bank account.

**AI Assistant (that's you!):** Users can ask you anything about their finances, get guidance on features, or ask general financial advice questions.

## WHAT YOU CANNOT DO
You cannot execute transactions, move money, or change account settings on behalf of the user. If a user asks you to transfer money or freeze a card, explain that you cannot do that directly, and give them the precise step-by-step instructions to do it themselves in the app.

## RESPONSE FORMAT
Always write in proper paragraphs. When giving instructions, number the steps clearly within your paragraph. Be warm but professional. End financial advice with a helpful tip when appropriate. Aim for responses that are thorough but not overwhelming — typically 2 to 4 paragraphs for complex questions, 1 paragraph for simple ones.
${userContext}`;
}

export function registerChatRoutes(app: Express): void {
  app.get("/api/conversations", async (req: Request, res: Response) => {
    try {
      const convs = await chatStorage.getAllConversations();
      res.json(convs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  app.get("/api/conversations/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const conversation = await chatStorage.getConversation(id);
      if (!conversation) return res.status(404).json({ error: "Conversation not found" });
      const msgs = await chatStorage.getMessagesByConversation(id);
      res.json({ ...conversation, messages: msgs });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch conversation" });
    }
  });

  app.post("/api/conversations", async (req: Request, res: Response) => {
    try {
      const { title } = req.body;
      const conversation = await chatStorage.createConversation(title || "New Chat");
      res.status(201).json(conversation);
    } catch (error) {
      res.status(500).json({ error: "Failed to create conversation" });
    }
  });

  app.delete("/api/conversations/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await chatStorage.deleteConversation(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete conversation" });
    }
  });

  app.post("/api/conversations/:id/messages", async (req: Request, res: Response) => {
    try {
      const conversationId = parseInt(req.params.id);
      const { content } = req.body;
      const userId = (req as any).user?.id ?? null;

      await chatStorage.createMessage(conversationId, "user", content);

      const systemPrompt = await buildSystemPrompt(userId);
      const systemContext = { role: "system" as const, content: systemPrompt };

      const msgs = await chatStorage.getMessagesByConversation(conversationId);
      const chatMessages = [
        systemContext,
        ...msgs.map((m) => ({ role: m.role as "user" | "assistant", content: m.content }))
      ];

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const stream = await getOpenAI().chat.completions.create({
        model: "gpt-4.1",
        messages: chatMessages,
        stream: true,
        max_completion_tokens: 8192,
        temperature: 0.7,
      });

      let fullResponse = "";

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content || "";
        if (delta) {
          fullResponse += delta;
          res.write(`data: ${JSON.stringify({ content: delta })}\n\n`);
        }
      }

      await chatStorage.createMessage(conversationId, "assistant", fullResponse);
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (error) {
      console.error("Error sending message:", error);
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ error: "Failed to send message" })}\n\n`);
        res.end();
      } else {
        res.status(500).json({ error: "Failed to send message" });
      }
    }
  });
}

