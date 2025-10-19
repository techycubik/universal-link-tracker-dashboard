#!/usr/bin/env node

const bcrypt = require("bcryptjs");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("🚀 Universal Link Tracker Dashboard Setup");
console.log("==========================================\n");

// Generate password hash
rl.question("Enter dashboard password: ", (password) => {
  const hash = bcrypt.hashSync(password, 10);

  console.log("\n✅ Setup Complete!");
  console.log("==================");
  console.log("\n📋 Next Steps:");
  console.log("1. Copy the following to your .env.local file:");
  console.log("\n   DASHBOARD_PASSWORD_HASH=" + hash);
  console.log(
    "   JWT_SECRET=" + require("crypto").randomBytes(32).toString("hex")
  );
  console.log("\n2. Fill in the remaining environment variables in .env.local");
  console.log("3. Run: npm run dev");
  console.log("4. Open: http://localhost:3000");
  console.log("\n📚 Documentation:");
  console.log("- README.md - Complete setup guide");
  console.log("- DEPLOYMENT.md - Deployment instructions");
  console.log("- env.example - Environment variables template");

  rl.close();
});
