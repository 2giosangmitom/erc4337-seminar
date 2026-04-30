# EIP-7702 Demo (Hardhat 3 + Viem)

This repo demonstrates a minimal EIP-7702 style flow on Sepolia using Hardhat 3 and Viem. A relay account signs an authorization that lets an EOA temporarily behave like a contract address, then the EOA calls a simple `TransferDelegate` contract.

## What's inside

- `contracts/TransferDelegate.sol`: Tiny example contract with a single pure function.
- `ignition/modules/TransferDelegate.ts`: Ignition module for deploying the contract.
- `scripts/writeContract.ts`: Signs an authorization and submits the EIP-7702-style call using Viem.

## Quick start

1. Install dependencies

```
pnpm install
```

2. Set environment variables

```
export RELAY_PRIVATE_KEY=0x...
export PRIVATE_KEY=0x...
```

3. Deploy the contract (Sepolia)

```
pnpm hardhat ignition deploy ignition/modules/TransferDelegate.ts --network sepolia
```

4. Update the deployed address in `scripts/writeContract.ts` and run

```
node scripts/writeContract.ts
```

## Notes

- `RELAY_PRIVATE_KEY` is the relayer that signs the authorization.
- `PRIVATE_KEY` is the EOA that will send the transaction.
- This example uses Sepolia defaults from Viem; set `VIEM_RPC_URL` if you need a custom RPC endpoint.
