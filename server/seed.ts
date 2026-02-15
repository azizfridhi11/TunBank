
import { storage } from "./storage";
import { hashPassword } from "./auth";

async function seed() {
  const existingUser = await storage.getUserByUsername("demo@bank.com");
  if (!existingUser) {
    const password = await hashPassword("demo123");
    const user = await storage.createUser({
      email: "demo@bank.com",
      password,
      fullName: "Demo User",
      role: "user",
      isVerified: true,
      kycStatus: "approved",
      phoneNumber: "+1234567890"
    });

    const account = await storage.createAccount({
      userId: user.id,
      accountNumber: "AC123456789",
      type: "checking",
      currency: "USD",
      balance: "5000.00",
      isActive: true
    });

    await storage.createCard({
      accountId: account.id,
      cardNumber: "4532 **** **** 8899",
      cardHolderName: "DEMO USER",
      expiryDate: "12/28",
      cvv: "123",
      isFrozen: false
    });

    await storage.createTransaction({
      fromAccountId: null,
      toAccountId: account.id,
      amount: "5000.00",
      type: "deposit",
      status: "completed",
      description: "Initial Deposit"
    });

    console.log("Database seeded successfully!");
  }
}

seed().catch(console.error);
