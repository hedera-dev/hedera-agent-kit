# HederaAgentKit

HederaAgentKit provides a convenient way to interact with the Hedera Hashgraph network, allowing users to create tokens, transfer assets, manage topics, and more.

## Installation

```sh
npm install hedera-agent-kit
```

## Usage

### Import and Initialize

```ts
import HederaAgentKit from "hedera-agent-kit";
import { TokenId, TopicId, AccountId, PendingAirdropId } from "@hashgraph/sdk";

const accountId = "0.0.123456";
const privateKey = "your-private-key";
const network = "testnet";
const kit = new HederaAgentKit(accountId, privateKey, network);
```

### Token Operations

#### Create a Fungible Token (FT)
```ts
const createFTResult = await kit.createFT("MyToken", "MTK", 2, 1000, true);
console.log(JSON.stringify(createFTResult, null, 2))
```

#### Transfer a Token
```ts
const transferResult = await kit.transferToken(TokenId.fromString("0.0.123"), "0.0.456", 100);
console.log(JSON.stringify(transferResult, null, 2));

```

#### Associate a Token
```ts
const associateResult = await kit.associateToken(TokenId.fromString("0.0.202"));
console.log(JSON.stringify(associateResult, null, 2));
```

#### Dissociate a Token
```ts
const dissociateResult = await kit.dissociateToken(TokenId.fromString("0.0.303"));
console.log(JSON.stringify(dissociateResult, null, 2));
```

#### Reject a Token
```ts
const rejectResult = await kit.rejectToken(TokenId.fromString("0.0.606"));
console.log(JSON.stringify(rejectResult, null, 2));
```

#### Mint Additional Tokens
```ts
const mintResult = await kit.mintToken(TokenId.fromString("0.0.707"), 1000);
console.log(JSON.stringify(mintResult, null, 2));
```

### HBAR Transactions

#### Transfer HBAR
```ts
const transferHbarResult = await kit.transferHbar("0.0.808", "10");
console.log(JSON.stringify(transferHbarResult, null, 2));
```

### Airdrop Management

#### Airdrop Tokens
```ts
const recipients = [{ accountId: "0.0.8008", amount: 100 }];
const airdropResult = await kit.airdropToken(TokenId.fromString("0.0.9009"), recipients);
console.log(JSON.stringify(airdropResult, null, 2));
```

#### Claim Airdrop
```ts
const claimAirdropResult = await kit.claimAirdrop(PendingAirdropId.fromString("0.0.909"));
console.log(JSON.stringify(claimAirdropResult, null, 2));
```

#### Get Pending Airdrops
```ts
const pendingAirdrops = await kit.getPendingAirdrops("0.0.1010", "testnet");
console.log(JSON.stringify(pendingAirdrops, null, 2));
```

### Token Balance Queries

#### Get HBAR Balance
```ts
const hbarBalance = await kit.getHbarBalance();
console.log(JSON.stringify(hbarBalance, null, 2));
```

#### Get HTS Token Balance
```ts
const htsBalance = await kit.getHtsBalance("0.0.789", "testnet");
console.log(JSON.stringify(htsBalance, null, 2));
```

#### Get All Token Balances
```ts
const allBalances = await kit.getAllTokensBalances("testnet");
console.log(JSON.stringify(allBalances, null, 2));
```

#### Get Token Holders
```ts
const tokenHolders = await kit.getTokenHolders("0.0.101", "testnet", 10);
console.log(JSON.stringify(tokenHolders, null, 2));
```

### Topic Management (HCS)

#### Create a Topic
```ts
const createTopicResult = await kit.createTopic("Test Topic", true);
console.log(JSON.stringify(createTopicResult, null, 2));
```

#### Delete a Topic
```ts
const deleteTopicResult = await kit.deleteTopic(TopicId.fromString("0.0.1111"));
console.log(JSON.stringify(deleteTopicResult, null, 2));
```

#### Submit a Topic Message
```ts
const submitMessageResult = await kit.submitTopicMessage(TopicId.fromString("0.0.1313"), "Hello, Hedera!");
console.log(JSON.stringify(submitMessageResult, null, 2));
```

#### Get Topic Info
```ts
const topicInfo = await kit.getTopicInfo(TopicId.fromString("0.0.1212"), "testnet");
console.log(JSON.stringify(topicInfo, null, 2));
```

#### Get Topic Messages
```ts
const topicMessages = await kit.getTopicMessages(TopicId.fromString("0.0.1414"), "testnet");
console.log(JSON.stringify(topicMessages, null, 2));
```

### Account Management

#### Approve Allowance for an asset
##### For HBAR
If no Token Id is passed function defaults to approving allowance for HBAR.
```ts
const approveAllowanceResult = await kit.approveAssetAllowance(AccountId.fromString('0.0.5393196'), 10);
console.log(JSON.stringify(approveAllowanceResult, null, 2));
```

##### For Fungible Token
```ts
const approveAllowanceResult = await kit.approveAssetAllowance(AccountId.fromString('0.0.5393196'), 10, TokenId.fromString('0.0.5445171'));
console.log(JSON.stringify(approveAllowanceResult, null, 2));
```

## Underlying implementation
For underlying implementation of provided functions check [tools documentation](../tools/README.md).

## License
This project is licensed under the MIT License.

