
import { storage } from "./storage";
import { hashPassword } from "./auth";

async function seed() {
  const email = "azizfrd@gmail.com";
  const existingUser = await storage.getUserByUsername(email);
  if (!existingUser) {
    const password = await hashPassword("aziz123");
    const user = await storage.createUser({
      email,
      password,
      fullName: "Aziz PFE",
      role: "user",
      isVerified: true,
      kycStatus: "approved",
      phoneNumber: "+1234567890"
    });

    const account = await storage.createAccount({
      userId: user.id,
      accountNumber: "AC123456789",
      type: "checking",
      currency: "TND",
      balance: "5000.000",
      isActive: true
    });

    await storage.createCard({
      accountId: account.id,
      cardNumber: "4532 **** **** 8899",
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
