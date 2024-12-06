import inquirer from "inquirer";

export const mainMenuChoices = [
  {
    name: "📱 Create New Device",
    value: "createDevice",
  },
  {
    name: "🔑 Register Device",
    value: "registerDevice",
  },
  {
    name: "🌥️  Get Cloud Profile",
    value: "cloudProfile",
  },
  {
    name: "💰 Check Redeemable Amount",
    value: "redeemableAmount",
  },
  {
    name: "📜 View Redemption History",
    value: "redemptionHistory",
  },
  {
    name: "🎁 Redeem Gift Card",
    value: "redeem",
  },
  {
    name: "🧹 Clear Device Cache",
    value: "clearCache",
  },
  {
    name: "🚪 Exit CLI",
    value: "exit",
  },
  new inquirer.Separator(),
];
