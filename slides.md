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

# Account Abstraction với ERC-4337 & EIP-7702

---
transition: fade-out
layout: two-cols-header
---

# Các loại tài khoản trong Ethereum

::left::

<div class="bg-green-300 rounded-xl p-6 border-3 border-green-500 border-opacity-40">

### 🔑 EOA

**Externally Owned Account**

- Tài khoản do người dùng kiểm soát
- Có private key (MetaMask, Ledger,...)
- Xác thực bằng chữ ký ECDSA
- Giao dịch phải trả ETH làm gas

</div>

::right::

<div class="bg-blue-300 rounded-xl p-6 border-3 border-blue-500 border-opacity-40">

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

<div class="grid grid-cols-2 gap-6 mt-4">
<div>

### ❌ Hạn chế hiện tại

- Chỉ dùng **private key** để xác thực giao dịch
- Mất key → mất tất cả — **không thể recovery**
- Không hỗ trợ 2FA, multisig tích hợp sẵn
- Không tùy biến được logic xác thực
- **Luôn phải có ETH** để trả gas
- Không thể tự động hóa giao dịch
- Mỗi hành động = 1 giao dịch riêng lẻ

</div>
<div class="flex flex-col gap-3 mt-2">

```
❌ User ký tx với private key
❌ Gửi trực tiếp lên mempool
❌ Phải tự trả gas bằng ETH
❌ Chỉ một chữ ký ECDSA duy nhất
❌ Không thể batch nhiều tx
```

<div class="bg-red-900 bg-opacity-20 border border-red-500 border-opacity-30 rounded-lg p-4 mt-2 text-sm">
💡 <strong>Kết quả:</strong> UX phức tạp, onboarding khó khăn, bảo mật hạn chế — rào cản lớn nhất cho người dùng mới.
</div>

</div>
</div>

---
transition: fade-out
---

# Account Abstraction

**Account Abstraction** là ý tưởng biến wallet thành một smart contract có logic tùy biến.

<div class="grid grid-cols-3 gap-4 mt-6">
<div class="bg-green-900 bg-opacity-20 border border-green-500 border-opacity-30 rounded-xl p-4">

#### 🔐 Bảo mật nâng cao
- Passkey / FaceID
- Multisig linh hoạt
- Social recovery
- Spending limits

</div>
<div class="bg-blue-900 bg-opacity-20 border border-blue-500 border-opacity-30 rounded-xl p-4">

#### ⛽ Gas linh hoạt
- Pay gas bằng ERC-20
- Gasless onboarding
- Paymaster tài trợ gas
- Không cần ETH sẵn

</div>
<div class="bg-purple-900 bg-opacity-20 border border-purple-500 border-opacity-30 rounded-xl p-4">

#### ⚡ UX mượt mà
- Batch transaction
- Session keys
- Automation
- One-click flows

</div>
</div>

---
transition: fade-out
layout: center
class: text-center
---

# ERC-4337

Account Abstraction mà không cần thay đổi protocol Ethereum

---
transition: fade-out
---

# ERC-4337 — Tổng quan

ERC-4337 cho phép **Account Abstraction (AA)** trên Ethereum mà **không cần thay đổi giao thức**.

<div class="grid grid-cols-2 gap-6 mt-4">
<div>

### Thay vì sửa protocol...

ERC-4337 giới thiệu một luồng mới hoàn toàn:

- 📋 **UserOperation** — đối tượng giao dịch mới
- 🌐 **Alt-mempool** — mempool phi tập trung riêng
- 🏛️ **EntryPoint Contract** — hợp đồng điều phối trung tâm
- 📦 **Bundlers** — node gom và gửi UserOps
- 💰 **Paymasters** — hợp đồng tài trợ gas

</div>
<div class="bg-gray-800 bg-opacity-50 rounded-xl p-4 font-mono text-sm">

```
User
  │
  ▼ UserOperation
Alt-mempool
  │
  ▼ bundle
Bundler
  │
  ▼ handleOps()
EntryPoint
  ├── validateUserOp()
  ├── validatePaymasterUserOp()
  └── execute()
```

</div>
</div>

---
transition: fade-out
---

# UserOperation

**UserOperation** là đối tượng thay thế giao dịch thông thường trong ERC-4337.

<div class="grid grid-cols-2 gap-6 mt-4">
<div>

| Field | Mô tả |
|-------|-------|
| `sender` | Địa chỉ smart account |
| `nonce` | Nonce chống replay |
| `initCode` | Tạo account mới nếu chưa có |
| `callData` | Hành động cần thực thi |
| `callGasLimit` | Gas cho execution |
| `verificationGasLimit` | Gas cho validation |
| `paymasterAndData` | Thông tin paymaster |
| `signature` | Chữ ký (có thể tùy biến) |

</div>
<div>

<div class="bg-yellow-900 bg-opacity-20 border border-yellow-500 border-opacity-30 rounded-xl p-4 mb-4">

💡 **Điểm khác biệt**: UserOperation **không phải là giao dịch Ethereum**. Nó được gom lại bởi Bundler và gửi lên chain qua `handleOps()`.

</div>

<div class="bg-blue-900 bg-opacity-20 border border-blue-500 border-opacity-30 rounded-xl p-4">

✅ `initCode` cho phép **tạo ví không cần EOA hay ETH trả trước** — chỉ cần tạo và dùng ngay.

</div>

</div>
</div>

---
transition: fade-out
---

# EntryPoint Contract

**EntryPoint** là hợp đồng trung tâm của ERC-4337 — điều phối toàn bộ quá trình validation và execution.

<div class="grid grid-cols-2 gap-6 mt-4">
<div>

### Các chức năng chính

**`handleOps(ops[], beneficiary)`**
- Lặp qua từng UserOp
- Gọi `validateUserOp()` trên wallet
- Thực thi nếu hợp lệ
- Tính và chuyển gas cho bundler

**`simulateValidation(op)`**
- Chạy off-chain trước khi gửi lên chain
- Bundler dùng để kiểm tra op hợp lệ
- Revert có chủ ý — mang theo dữ liệu trạng thái

**`depositTo()` / `balanceOf()`**
- Wallet và Paymaster nạp ETH vào EntryPoint
- EntryPoint giữ số dư để thanh toán gas

</div>
<div class="bg-gray-800 bg-opacity-40 rounded-xl p-4">

### Luồng thực thi

```
Bundler gọi handleOps()
       │
       ├─ 1. Validation Phase
       │     ├── validateUserOp() [account]
       │     └── validatePaymasterUserOp() [paymaster]
       │
       ├─ 2. Execution Phase
       │     └── execute callData
       │
       └─ 3. Post-Op Phase
             └── postOp() [paymaster]
```

<div class="mt-3 text-sm text-gray-400">

⚡ Chỉ **1 EntryPoint** được deploy mỗi chain, dùng địa chỉ cố định — đảm bảo tương thích.

</div>
</div>
</div>

---
transition: fade-out
---

# Bundlers

**Bundler** là node gom các UserOperation từ alt-mempool và submit lên chain.

<div class="grid grid-cols-2 gap-6 mt-4">
<div>

### Bundler làm gì?

1. 👀 **Monitor** alt-mempool lấy UserOps mới
2. 🧪 **Simulate** từng op qua `simulateValidation()`
3. 📦 **Group** các op hợp lệ thành bundle
4. 📤 **Submit** bằng `handleOps()` lên EntryPoint
5. 💸 **Thu phí** — giống như miner

### Tại sao cần Bundler?

- Ethereum base layer không hiểu UserOperation
- Bundler là "miner cho smart wallet"
- Hoạt động phi tập trung, không cần cấp phép
- Cạnh tranh để gom op và kiếm phí

</div>
<div>

<div class="bg-orange-900 bg-opacity-20 border border-orange-500 border-opacity-30 rounded-xl p-4 mb-4">

### ⚠️ Rủi ro Bundler

Một UserOp xấu có thể revert **cả bundle** → Bundler phải simulate kỹ trước khi gộp

</div>

<div class="bg-gray-800 bg-opacity-40 rounded-xl p-4 text-sm">

**Bundler phải tuân thủ:**
- Luật lệ ERC-7562 về storage access
- Hạn chế opcode trong validation
- Anti-griefing rules

</div>
</div>
</div>

---
transition: fade-out
---

# Paymasters

**Paymaster** là hợp đồng thông minh có thể **tài trợ gas** cho người dùng.

<div class="grid grid-cols-3 gap-4 mt-4">
<div class="bg-green-900 bg-opacity-20 border border-green-500 border-opacity-30 rounded-xl p-4">

### 🆓 Sponsoring Paymaster

Dự án trả gas thay cho user

**Use case:**
- Gasless onboarding
- Free first transaction
- Marketing campaigns

</div>
<div class="bg-blue-900 bg-opacity-20 border border-blue-500 border-opacity-30 rounded-xl p-4">

### 💱 ERC-20 Paymaster

User trả gas bằng token thay vì ETH

**Use case:**
- USDC gas payment
- Native token gas
- Không cần giữ ETH

</div>
<div class="bg-purple-900 bg-opacity-20 border border-purple-500 border-opacity-30 rounded-xl p-4">

### 🔒 Conditional Paymaster

Tài trợ theo điều kiện logic

**Use case:**
- Whitelist address
- NFT holder benefit
- Subscription model

</div>
</div>

<div class="mt-6 bg-gray-800 bg-opacity-40 rounded-xl p-4">

**Paymaster lifecycle:** `validatePaymasterUserOp()` → kiểm tra điều kiện → trả gas → `postOp()` → hoàn tất kế toán

⛓️ Paymaster phải **stake ETH** vào EntryPoint để ngăn chặn tấn công griefing

</div>

---
transition: fade-out
---

# Smart Accounts

**Smart Account** là nền tảng của Account Abstraction — wallet được xây dựng như một smart contract.

<div class="grid grid-cols-2 gap-6 mt-4">
<div>

### Khả năng vượt trội so với EOA

- ✅ **`validateUserOp()`** — logic xác thực tùy biến
- ✅ Tích hợp với **EntryPoint** để validate & execute  
- ✅ Dùng modules qua ERC-6900 hoặc ERC-7579
- ✅ Hỗ trợ **passkey, biometrics, multisig**
- ✅ Có thể deploy bằng `initCode` + CREATE2 — **counterfactual deployment**

### Mô hình module hóa

</div>
<div>

```
Smart Account
    │
    ├── Validation Module
    │     ├── ECDSA signer
    │     ├── Passkey signer
    │     └── Multisig policy
    │
    ├── Execution Module
    │     ├── Batch executor
    │     └── Delegatecall hook
    │
    └── Recovery Module
          ├── Social recovery
          └── Guardian management
```

</div>
</div>

---
transition: fade-out
---

# Luồng đầy đủ của ERC-4337

```
┌─────────┐    UserOperation     ┌──────────────┐
│  User   │ ──────────────────► │  Alt-Mempool │
└─────────┘                      └──────┬───────┘
                                         │ simulate + bundle
                                         ▼
┌───────────────────────────────────────────────────────────────┐
│                         Bundler                               │
│  1. simulateValidation() off-chain                            │
│  2. Group valid ops                                           │
│  3. Submit bundle                                             │
└────────────────────────────┬──────────────────────────────────┘
                             │ handleOps()
                             ▼
┌───────────────────────────────────────────────────────────────┐
│                      EntryPoint                               │
│                                                               │
│  validateUserOp() ──► validatePaymasterUserOp()               │
│         │                        │                            │
│         └──────────────┬─────────┘                            │
│                        │ execute                              │
│                        ▼                                      │
│              Smart Account callData                           │
└───────────────────────────────────────────────────────────────┘
```

---
transition: fade-out
layout: center
class: text-center
---

# EIP-7702

Nâng cấp EOA thành Smart Account ngay trong một giao dịch

---
transition: fade-out
---

# EIP-7702 — EOA gặp Smart Contract

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

# ERC-4337 + EIP-7702 — Bộ đôi hoàn hảo

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
transition: fade-out
layout: center
class: text-center
---

# Tóm tắt kiến trúc ERC-4337

---
transition: fade-out
---

# Tóm tắt

<div class="grid grid-cols-3 gap-4 mt-4">

<div class="bg-blue-900 bg-opacity-20 border border-blue-500 border-opacity-30 rounded-xl p-4">

### 📋 UserOperation
Đối tượng giao dịch mới thay thế tx thông thường

Chứa đủ thông tin để bundler xử lý và EntryPoint thực thi

</div>

<div class="bg-orange-900 bg-opacity-20 border border-orange-500 border-opacity-30 rounded-xl p-4">

### 📦 Bundler
Gom UserOps từ alt-mempool, simulate, và submit lên chain

Đóng vai "miner" trong hệ sinh thái AA

</div>

<div class="bg-red-900 bg-opacity-20 border border-red-500 border-opacity-30 rounded-xl p-4">

### 🏛️ EntryPoint
Hợp đồng trung tâm điều phối validate + execute

Một địa chỉ cố định mỗi chain

</div>

<div class="bg-green-900 bg-opacity-20 border border-green-500 border-opacity-30 rounded-xl p-4">

### 💰 Paymaster
Tài trợ gas cho user theo điều kiện

Cho phép gasless UX và ERC-20 gas payment

</div>

<div class="bg-purple-900 bg-opacity-20 border border-purple-500 border-opacity-30 rounded-xl p-4">

### 🧠 Smart Account
Wallet dưới dạng smart contract

Logic xác thực tùy biến, module hóa

</div>

<div class="bg-yellow-900 bg-opacity-20 border border-yellow-500 border-opacity-30 rounded-xl p-4">

### ⚡ EIP-7702
Nâng EOA thành smart account tức thì

Không cần migrate, giữ nguyên địa chỉ

</div>

</div>

---
layout: center
class: text-center
---

# Cảm ơn!

<div class="mt-8 text-gray-400">

ERC-4337 · EIP-7702 · Account Abstraction

</div>

<div class="mt-6">

[docs.erc4337.io](https://docs.erc4337.io) · [eips.ethereum.org/EIPS/eip-4337](https://eips.ethereum.org/EIPS/eip-4337)

</div>