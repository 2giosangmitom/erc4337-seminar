import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("SmartAccount", (m) => {
  const module = m.contract("SmartAccount");

  return { module };
});
