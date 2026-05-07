import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { parseEther } from "viem";

export default buildModule("JToken", (m) => {
  const module = m.contract("JToken", [parseEther("100", "gwei")]);

  return { module };
});
