import "dotenv/config";
import { createWalletClient, http } from "viem";
import { sepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

// Relayer account that signs the EIP-7702 authorization.
const relay = privateKeyToAccount(
  process.env.RELAY_PRIVATE_KEY! as `0x${string}`,
);

const walletClient = createWalletClient({
  account: relay,
  chain: sepolia,
  transport: http(),
});

const abi = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "a",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "b",
        type: "uint256",
      },
    ],
    name: "add",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
];

// Deployed TransferDelegate address on Sepolia.
const contractAddress = "0x27233d78f0cf9B6bB0dDa2c8A36D0Bf1d91b1ffF";

// EOA that will send the transaction and use the authorization.
const eoa = privateKeyToAccount(process.env.PRIVATE_KEY! as `0x${string}`);

// Authorization binds the EOA to the target contract for this call.
const authorization = await walletClient.signAuthorization({
  account: eoa,
  contractAddress,
});

// Send a call where the EOA acts like the contract address for this tx.
const hash = await walletClient.writeContract({
  abi,
  address: eoa.address,
  authorizationList: [authorization],
  functionName: "add",
  args: [1, 2],
});

// Send a call where the EOA acts like the contract address for this tx.
const hash2 = await walletClient.writeContract({
  abi,
  address: eoa.address,
  authorizationList: [authorization],
  functionName: "add",
  args: [1, 2],
});

console.log("Transaction hash:", hash);
console.log("Transaction hash 2:", hash2);
