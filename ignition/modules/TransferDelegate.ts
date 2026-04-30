import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("TransferDelegate", (m) => {
  // Deploy the demo contract used by the EIP-7702 authorization flow.
  const transferDelegate = m.contract("TransferDelegate");

  return { transferDelegate };
});
