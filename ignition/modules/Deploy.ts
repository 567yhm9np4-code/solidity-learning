import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("MyTokenDeploy", (m) => {
  const myTokenC = m.contract("MyToken", ["MyToken", "MT", 18, 100]);

  const managers = [
    "0xfC9E6972A16F94ce7d15F7692A22694504A7f731",
    "0xfC9E6972A16F94ce7d15F7692A22694504A7f731",
    "0xfC9E6972A16F94ce7d15F7692A22694504A7f731",
    "0xfC9E6972A16F94ce7d15F7692A22694504A7f731",
    "0xfC9E6972A16F94ce7d15F7692A22694504A7f731",
  ];

  const tinyBankC = m.contract("TinyBank", [myTokenC, managers]);

  m.call(myTokenC, "setManager", [tinyBankC]);

  return { myTokenC, tinyBankC };
});
