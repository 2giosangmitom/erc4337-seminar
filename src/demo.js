import "dotenv/config";
import { createWalletClient, createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { readFileSync } from "node:fs";
import path from "node:path";

const DeployedAddresses = JSON.parse(
  readFileSync(
    path.join(
      process.cwd(),
      "ignition",
      "deployments",
      "chain-11155111",
      "deployed_addresses.json",
    ),
    "utf-8",
  ),
);
const JTokenArtifact = JSON.parse(
  readFileSync(
    path.join(
      process.cwd(),
      "ignition",
      "deployments",
      "chain-11155111",
      "artifacts",
      "JToken#JToken.json",
    ),
    "utf-8",
  ),
);
const SmartAccountArtifact = JSON.parse(
  readFileSync(
    path.join(
      process.cwd(),
      "ignition",
      "deployments",
      "chain-11155111",
      "artifacts",
      "SmartAccount#SmartAccount.json",
    ),
    "utf-8",
  ),
);

/** @typedef {`0x${string}`} Address */

// Private keys
const USER_PRIVATE_KEY = /** @type {Address} */ (process.env.USER_PRIVATE_KEY);
const PRIVATE_KEY = /** @type {Address} */ (process.env.PRIVATE_KEY);

// Clients
const userWalletClient = createWalletClient({
  account: USER_PRIVATE_KEY,
  chain: sepolia,
  transport: http(),
});

const systemWalletClient = createWalletClient({
  account: PRIVATE_KEY,
  chain: sepolia,
  transport: http(),
});

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(),
});

const user = privateKeyToAccount(USER_PRIVATE_KEY);

// Sign authorization
const authorization = await userWalletClient.signAuthorization({
  account: user,
  contractAddress: /** @type {Address} */ (
    DeployedAddresses["SmartAccount#SmartAccount"]
  ),
});

