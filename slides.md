---
theme: seriph
background: https://cover.sli.dev
title: ERC-4337 & EIP-7702
class: text-center
drawings:
  persist: false
transition: slide-left
mdc: true
---

# Account Abstraction với<br>ERC-4337 & EIP-7702

---
transition: fade-out
layout: two-cols-header
---

# Các loại tài khoản trong Ethereum

::left::

<div class="bg-green-100 rounded-xl p-6 border border-green-500 border-opacity-40">

### 🔑 EOA

**Externally Owned Account**

- Tài khoản do người dùng kiểm soát
- Có private key (MetaMask, Ledger,...)
- Xác thực bằng chữ ký ECDSA
- Giao dịch phải trả ETH làm gas

</div>

::right::

<div class="bg-blue-100 rounded-xl p-6 border border-blue-500 border-opacity-40">

### 📜 Smart Contract Account

**Contract-based Account**

- Tài khoản do hợp đồng thông minh kiểm soát
- Không có private key
- Logic xác thực tùy biến (Safe, Gnosis,...)
- Hành vi được lập trình hoàn toàn

</div>

<style>
.two-cols-header {
  column-gap: 50px;
}
</style>

---
transition: fade-out
---

# Vấn đề của EOA

## Hạn chế hiện tại

- Chỉ dùng **private key** để xác thực giao dịch
- Mất key là mất tất cả - **không thể recovery**
- Không hỗ trợ 2FA, multisig tích hợp sẵn
- Không tùy biến được logic xác thực
- **Luôn phải có ETH** để trả gas
- Không thể tự động hóa giao dịch
- Mỗi hành động = 1 giao dịch riêng lẻ

<div class="bg-red-100 border border-red-500 border-opacity-40 rounded-lg p-4 mt-6">
💡 <strong>Kết quả:</strong> UX phức tạp, onboarding khó khăn, bảo mật hạn chế - rào cản lớn nhất cho người dùng mới.
</div>

---
transition: fade-out
---

# Account Abstraction

#### **Account Abstraction** là ý tưởng biến wallet thành một smart contract có logic tùy biến.

<div class="grid grid-cols-3 gap-4 mt-6">
<div class="bg-green-100 bg-opacity-20 border border-green-500 border-opacity-30 rounded-xl p-4">

#### **🔐 Bảo mật nâng cao**

- Passkey / FaceID
- Multisig linh hoạt
- Social recovery
- Spending limits

</div>
<div class="bg-blue-100 bg-opacity-20 border border-blue-500 border-opacity-30 rounded-xl p-4">

#### **⛽ Gas linh hoạt**

- Pay gas bằng ERC-20
- Gasless onboarding
- Paymaster tài trợ gas
- Không cần ETH sẵn

</div>
<div class="bg-purple-100 bg-opacity-20 border border-purple-500 border-opacity-30 rounded-xl p-4">

#### **⚡ UX mượt mà**

- Batch transaction
- Session keys
- Automation
- One-click flows

</div>
</div>

---
transition: fade-out
---

# ERC-4337

#### ERC-4337 cho phép **Account Abstraction (AA)** trên Ethereum mà **không cần thay đổi protocol**.

### **Các thành phần chính**

- 📋 **UserOperation**: đối tượng giao dịch mới
- 🏛️ **EntryPoint Contract**: hợp đồng điều phối trung tâm
- 📦 **Bundlers**: node gom và gửi UserOps
- 💰 **Paymasters**: hợp đồng tài trợ gas (không bắt buộc)

---
transition: fade-out
---

<div class="h-full flex items-center justify-center">

```mermaid {scale: 0.75}
sequenceDiagram
    participant User
    participant Wallet as Wallet App
    participant Bundler
    participant EntryPoint
    participant Paymaster
    participant Account as Smart Account

    User->>Wallet: Sign UserOperation
    Wallet->>Bundler: Send UserOperation

    Bundler->>EntryPoint: handleOps()

    EntryPoint->>Account: validateUserOp()
    Account-->>EntryPoint: OK

    opt Gas Sponsored
        EntryPoint->>Paymaster: validatePaymasterUserOp()
        Paymaster-->>EntryPoint: Approve sponsorship
    end

    EntryPoint->>Account: execute()
    Account-->>EntryPoint: Success
```

</div>

---
transition: fade-out
---

# UserOperation

#### **UserOperation** là đối tượng thay thế giao dịch thông thường trong ERC-4337.

<div class="grid grid-cols-2 gap-6 mt-4">
<div>

| Field              | Ý nghĩa                         |
| ------------------ | ------------------------------- |
| `sender`           | Smart Account                   |
| `nonce`            | Chống replay                    |
| `callData`         | Hành động cần thực hiện         |
| `signature`        | Chữ ký của user                 |
| `initCode`         | Deploy account nếu chưa tồn tại |
| `paymasterAndData` | Thông tin sponsor gas           |

</div>
<div>

<div class="bg-yellow-100 bg-opacity-20 border border-yellow-500 border-opacity-30 rounded-xl p-4 mb-4">

💡 **Điểm khác biệt**: UserOperation **không phải là giao dịch Ethereum**. Nó được gom lại bởi Bundler và gửi lên chain qua `handleOps()`.

</div>

<div class="bg-sky-100 bg-opacity-20 border border-blue-500 border-opacity-30 rounded-xl p-4">

✅ `initCode` cho phép **tạo ví không cần EOA hay ETH trả trước** - chỉ cần tạo và dùng ngay.

</div>

</div>
</div>

---
transition: fade-out
---

# EntryPoint Contract

#### Là hợp đồng trung tâm của ERC-4337 điều phối toàn bộ quá trình validation và execution.

**handleOps(ops[], beneficiary)**

- Entry point chính của ERC-4337
- Validate từng UserOperation
- Thực thi các UserOperation hợp lệ
- Tính toán và phân phối phí gas
- Thanh toán cho bundler (`beneficiary`)

**simulateValidation(op)**

- Được bundler gọi bằng `eth_call`
- Mô phỏng toàn bộ validation flow
- Revert có chủ ý để trả về kết quả validation
- Giúp bundler quyết định có đưa UserOp vào bundle hay không

---
transition: fade-out
---

**depositTo() / balanceOf()**

- Account và Paymaster nạp ETH vào EntryPoint
- Deposit được dùng để thanh toán gas
- EntryPoint quản lý số dư thay mặt cho các thực thể này

**addStake() / unlockStake() / withdrawStake()**

- Paymaster phải stake trước khi hoạt động
- Stake bị khóa trong một khoảng thời gian (`unstakeDelaySec`)
- Cung cấp economic security cho hệ thống
- Giảm thiểu các hành vi spam và griefing attacks

---
transition: fade-out
---

# Bundlers

##### **Bundler** là actor của ERC-4337 chịu trách nhiệm thu thập UserOperations, xác thực chúng và submit bundle lên EntryPoint.

#### **Bundler làm gì?**

- Nhận UserOperations từ alt-mempool hoặc RPC
- Simulate validation bằng `simulateValidation()`
- Gom các UserOp hợp lệ thành bundle
- Gọi `handleOps()` trên EntryPoint
- Nhận phí gas thông qua `beneficiary`

#### **Tại sao cần Bundler?**

- Ethereum không xử lý UserOperation một cách native
- Bundler là cầu nối giữa UserOperation và Ethereum transaction
- Hoạt động phi tập trung, không cần cấp phép
- Cạnh tranh để kiếm phí thực thi

---
transition: fade-out
---

# Paymasters

#### **Paymaster** là hợp đồng thông minh có thể **tài trợ gas** cho người dùng.

#### Vai trò

- Tài trợ gas cho người dùng
- Cho phép thanh toán bằng token thay vì ETH
- Áp dụng logic kinh doanh khi xác thực giao dịch

#### **Các mô hình phổ biến**

<div class="grid grid-cols-3 gap-4 mt-2">

<div class="bg-green-200 bg-opacity-20 border border-green-500 border-opacity-30 rounded-xl p-4">

#### 🆓 Sponsored

Dự án trả gas cho người dùng

**Ví dụ**

- Gasless onboarding
- Free first transaction
- Marketing campaign

</div>

<div class="bg-blue-200 bg-opacity-20 border border-blue-500 border-opacity-30 rounded-xl p-4">

#### 💱 Token Paymaster

Người dùng trả gas bằng token

**Ví dụ**

- USDC
- Native token
- Không cần giữ ETH

</div>

<div class="bg-purple-200 bg-opacity-20 border border-purple-500 border-opacity-30 rounded-xl p-4">

#### 🔒 Conditional

Chỉ tài trợ khi thỏa điều kiện

**Ví dụ**

- Whitelist
- NFT holder
- Subscription

</div>

</div>

---
transition: fade-out
---

# EIP-7702

**EIP-7702** (Pectra hardfork, 2025) cho phép **EOA tạm thời hoạt động như Smart Contract** trong một giao dịch.

<div class="grid grid-cols-2 gap-6 mt-4">
<div>

### Cơ chế hoạt động

- EOA ký một **authorization** chỉ định contract code
- Trong thời gian giao dịch, EOA **"mượn" bytecode** từ contract đó
- Sau giao dịch, EOA trở về trạng thái bình thường (hoặc giữ code nếu muốn)

### So sánh với ERC-4337

| | ERC-4337 | EIP-7702 |
|--|----------|----------|
| Account mới | Smart Account | EOA nâng cấp |
| Thay đổi protocol | Không | Có (Pectra) |
| Gas | Cao hơn | Thấp hơn |
| Tương thích | Mọi chain | Post-Pectra |

</div>
<div>

### Use cases

<div class="space-y-3">
<div class="bg-green-900 bg-opacity-20 border border-green-500 border-opacity-30 rounded-lg p-3">
🔄 <strong>Batch transactions</strong> — gom nhiều hành động trong 1 tx
</div>
<div class="bg-blue-900 bg-opacity-20 border border-blue-500 border-opacity-30 rounded-lg p-3">
⛽ <strong>Gas sponsorship</strong> — kết hợp với Paymaster
</div>
<div class="bg-purple-900 bg-opacity-20 border border-purple-500 border-opacity-30 rounded-lg p-3">
🔑 <strong>Session keys</strong> — ủy quyền giới hạn cho dApp
</div>
<div class="bg-orange-900 bg-opacity-20 border border-orange-500 border-opacity-30 rounded-lg p-3">
🔐 <strong>Multisig nhanh</strong> — không cần migrate wallet
</div>
</div>

</div>
</div>

---
transition: fade-out
---

# ERC-4337 + EIP-7702

<div class="grid grid-cols-2 gap-6 mt-4">
<div>

### EIP-7702 UserOps

Kể từ khi Pectra ra mắt, ERC-4337 **hỗ trợ gửi UserOperation từ EOA đã được 7702 upgrade**.

Đây là bước tiến quan trọng:

- EOA ký authorization → tạm thời có smart account code
- Gửi UserOperation qua EntryPoint như bình thường
- Hưởng toàn bộ tính năng AA: gasless, batch, session key...

### Lợi ích

- ✅ Không cần deploy smart account mới
- ✅ Giữ nguyên địa chỉ ví cũ
- ✅ Chi phí thấp hơn
- ✅ Tương thích ngược với dApp cũ

</div>
<div class="bg-gray-800 bg-opacity-40 rounded-xl p-4 font-mono text-sm">

```typescript
// Tạo bundler client với EIP-7702
import { createFreeBundler } from '@etherspot/free-bundler';
import { mainnet } from "viem/chains";

const bundlerClient = createFreeBundler({
  chain: mainnet
});

// EOA ký authorization + gửi UserOp
const userOp = await bundlerClient
  .prepareUserOperation({
    account: eoaAccount,     // EOA thông thường
    authorization: {
      contractAddress: smartAccountImpl,
    },
    calls: [
      { to: targetContract, data: callData }
    ]
  });

await bundlerClient.sendUserOperation(userOp);
```

</div>
</div>

---
transition: fade-out
---

# Session Keys & Delegation

**Session Keys** cho phép ủy quyền giới hạn cho dApp — không cần ký mỗi giao dịch.

<div class="grid grid-cols-2 gap-6 mt-4">
<div>

### Cách hoạt động

1. User tạo một **session key** tạm thời
2. Cấp quyền hạn chế: thời gian, contract, giá trị tối đa
3. dApp dùng session key để ký UserOp
4. EntryPoint validate qua smart account logic

### Ứng dụng thực tế

- 🎮 **Gaming**: tự động ký move mà không popup liên tục
- 🤖 **DeFi bots**: rebalance tự động trong giới hạn
- 📱 **Mobile**: ký nhanh không cần xác nhận lại
- 🛒 **E-commerce**: thanh toán theo hạn mức

</div>
<div>

```
User tạo Session Key
        │
        ▼
┌──────────────────────────┐
│  Session Key Policy      │
│  - Thời hạn: 24 giờ     │
│  - Contract: Uniswap     │
│  - Max value: 100 USDC   │
│  - Signer: temp_key      │
└────────────┬─────────────┘
             │ lưu vào smart account
             ▼
dApp ký UserOp bằng temp_key
             │
             ▼
Smart Account validate ✅
(không cần user ký lại)
```

</div>
</div>

---
transition: fade-out
---

# Modular Accounts — ERC-6900 & ERC-7579

Smart accounts ngày càng hướng tới kiến trúc **module hóa**, cho phép tùy biến linh hoạt.

<div class="grid grid-cols-2 gap-6 mt-4">
<div>

### Tại sao cần module?

- Logic ví ngày càng phức tạp
- Không muốn audit lại toàn bộ contract khi thêm tính năng
- Upgrade chỉ một phần, không ảnh hưởng phần còn lại
- Chia sẻ module giữa nhiều ví

### Các loại module

| Module | Chức năng |
|--------|-----------|
| **Validator** | Xác thực chữ ký, 2FA |
| **Executor** | Logic thực thi tùy chỉnh |
| **Hook** | Pre/post-execution hooks |
| **Fallback** | Xử lý call không khớp |

</div>
<div class="bg-gray-800 bg-opacity-40 rounded-xl p-4">

```
Modular Smart Account
│
├── [Validator Module]
│     ├── ECDSA Validator
│     ├── Passkey Validator (WebAuthn)
│     └── Multisig Validator
│
├── [Executor Module]
│     ├── Batch Executor
│     └── Auto-pay Executor
│
├── [Hook Module]
│     ├── Spending Limit Hook
│     └── Allowlist Hook
│
└── [Recovery Module]
      ├── Social Recovery
      └── Time-lock Recovery
```

</div>
</div>

---
layout: center
---

# Cảm ơn mọi người!