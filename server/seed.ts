
import { storage } from "./storage";
import { hashPassword } from "./auth";

async function seed() {
  const email = "demo@bank.com";
  const existingUser = await storage.getUserByUsername(email);
  if (!existingUser) {
    const password = await hashPassword("demo123");
    const user = await storage.createUser({
      email,
      password,
      fullName: "Aziz PFE",
      role: "user",
      isVerified: true,
      kycStatus: "approved",
      phoneNumber: "+21698765432"
    });

    const checking = await storage.createAccount({
      userId: user.id,
      accountNumber: "AC123456789",
      type: "checking",
      currency: "TND",
      balance: "5000.000",
      isActive: true
    });

    const savings = await storage.createAccount({
      userId: user.id,
      accountNumber: "AC987654321",
      type: "savings",
      currency: "TND",
      balance: "12500.000",
      isActive: true
    });

    await storage.createCard({
      accountId: checking.id,
      cardNumber: "4532789012348899",
      cardHolderName: "AZIZ PFE",
      expiryDate: "12/28",
      cvv: "123",
      isFrozen: false
    });

    await storage.createLoan({
      userId: user.id,
      amount: "10000.00",
      interestRate: "5.50",
      durationMonths: 24,
      monthlyInstallment: "440.94",
      remainingBalance: "8500.00",
      status: "active"
    });

    await storage.createTransaction({
      fromAccountId: null,
      toAccountId: checking.id,
      amount: "5000.00",
      type: "deposit",
      status: "completed",
      description: "Initial Deposit"
    });

    await storage.createTransaction({
      fromAccountId: null,
      toAccountId: savings.id,
      amount: "12500.00",
      type: "deposit",
      status: "completed",
      description: "Initial Savings Deposit"
    });

    await storage.createTransaction({
      fromAccountId: checking.id,
      toAccountId: null,
      amount: "250.00",
      type: "payment",
      status: "completed",
      description: "Electricity Bill"
    });

    await storage.createTransaction({
      fromAccountId: checking.id,
      toAccountId: null,
      amount: "80.00",
      type: "payment",
      status: "completed",
      description: "Internet Subscription"
    });

    console.log("Demo account seeded successfully!");
    console.log("  Email:    demo@bank.com");
    console.log("  Password: demo123");
  } else {
    console.log("Demo account already exists, skipping seed.");
  }
}

seed().catch(console.error);
