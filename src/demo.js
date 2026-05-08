import "dotenv/config";
import {
  createWalletClient,
  createPublicClient,
  http,
  encodeFunctionData,
  keccak256,
  toHex,
  encodeAbiParameters,
} from "viem";
import { sepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { readFileSync } from "node:fs";
import path from "node:path";

// Deployed contract addresses and ABIs
const DeployedAddresses = JSON.parse(
  readFileSync(
    path.join(
      process.cwd(),
      "ignition/deployments/chain-11155111/deployed_addresses.json",
    ),
    "utf-8",
  ),
);
const JTokenArtifact = JSON.parse(
  readFileSync(
    path.join(
      process.cwd(),
      "ignition/deployments/chain-11155111/artifacts/JToken#JToken.json",
    ),
    "utf-8",
  ),
);
const SmartAccountArtifact = JSON.parse(
  readFileSync(
    path.join(
      process.cwd(),
      "ignition/deployments/chain-11155111/artifacts/SmartAccount#SmartAccount.json",
    ),
    "utf-8",
  ),
);

/** @typedef {`0x${string}`} Address */

// Private keys
const USER_PRIVATE_KEY = /** @type {Address} */ (process.env.USER_PRIVATE_KEY);
const PRIVATE_KEY = /** @type {Address} */ (process.env.PRIVATE_KEY);

const user = privateKeyToAccount(USER_PRIVATE_KEY);
const system = privateKeyToAccount(PRIVATE_KEY);

// Clients
const userWalletClient = createWalletClient({
  account: user,
  chain: sepolia,
  transport: http(),
});

const systemWalletClient = createWalletClient({
  account: system,
  chain: sepolia,
  transport: http(),
});

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(),
});

/**
 * @param {string} name
 * @param {Address} address
 */
async function printBalance(name, address) {
  const balance = await publicClient.readContract({
    abi: JTokenArtifact.abi,
    address: /** @type {Address} */ (DeployedAddresses["JToken#JToken"]),
    functionName: "balanceOf",
    args: [address],
  });
  console.log(`${name}: ${balance}`);
}

// Fund user with some JToken for testing
console.log("Funding user with 100 JToken...");
const fundHash = await systemWalletClient.writeContract({
  abi: JTokenArtifact.abi,
  address: /** @type {Address} */ (DeployedAddresses["JToken#JToken"]),
  functionName: "transfer",
  args: [user.address, 100n],
});
await publicClient.waitForTransactionReceipt({ hash: fundHash });

// Before transfer
console.log("=== BEFORE ===");
await printBalance("User", user.address);
await printBalance("System", system.address);

// Sign authorization
console.log("Signing authorization...");
const authorization = await userWalletClient.signAuthorization({
  account: user,
  contractAddress: /** @type {Address} */ (
    DeployedAddresses["SmartAccount#SmartAccount"]
  ),
});

// Execute transfer with authorization
try {
  console.log("Granting session key...");
  const grantSessionKeyHash = await userWalletClient.writeContract({
    abi: SmartAccountArtifact.abi,
    address: user.address,
    functionName: "grantSessionKey",
    args: [system.address, 60 * 60], // valid for 1 hour
  });
  await publicClient.waitForTransactionReceipt({ hash: grantSessionKeyHash });
  console.log(
    "Session key granted. Now executing transfer with session key...",
  );

  console.log("Transfer 10 JToken from user to system...");
  const calls = [
    {
      to: DeployedAddresses["JToken#JToken"],
      value: 0n,
      data: encodeFunctionData({
        abi: JTokenArtifact.abi,
        functionName: "transfer",
        args: [system.address, 10n],
      }),
    },
  ];
  const hash = await systemWalletClient.writeContract({
    abi: SmartAccountArtifact.abi,
    address: user.address,
    functionName: "execute",
    args: [
      keccak256(toHex("BATCH")),
      encodeAbiParameters(
        [
          {
            type: "tuple[]",
            components: [
              {
                name: "to",
                type: "address",
              },
              {
                name: "value",
                type: "uint256",
              },
              {
                name: "data",
                type: "bytes",
              },
            ],
          },
        ],
        [calls],
      ),
    ],
    authorizationList: [authorization],
  });
  await publicClient.waitForTransactionReceipt({ hash });
} catch (error) {
  console.error(error.shortMessage);
}

// After transfer
console.log("=== AFTER ===");
await printBalance("User", user.address);
await printBalance("System", system.address);
