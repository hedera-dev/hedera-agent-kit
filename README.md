# Hedera Agent Kit

Welcome to the **Hedera Agent Kit**! This project aims to provide a LangChain-compatible toolkit for interacting with the Hedera Network. The focus is on a minimal, easy-to-use set of functions, while staying flexible for future enhancements.

## Overview

- **Agent Interaction**: Make on-chain calls to Hedera (e.g., create tokens, post messages to consensus).
- **Lightweight**: Designed to get you started quickly with a minimal set of features.
- **Community-Driven**: We encourage developers of all skill levels to contribute.

## Current Features

1. **Native Hedera Token Service (HTS)**:
    - Create fungible tokens with minimal parameters (name, symbol, decimals, supply, etc.).
    - Mint additional tokens to existing token accounts.

2. **Token Operations**:
    - **Create Fungible Tokens (FT)**: Easily create and configure new fungible tokens.
    - **Transfer Tokens**: Transfer tokens between accounts.
    - **Associate / Dissociate Tokens**: Associate a token to an account or dissociate it as needed.
    - **Reject Tokens**: Reject a token from an account.

3. **HBAR Transactions**:
    - Transfer HBAR between accounts.

4. **Airdrop Management**:
    - Airdrop tokens to multiple recipients.
    - Claim a pending airdrop.

5. **Token Balance Queries**:
    - Get HBAR balances of an account.
    - Get HTS token balances for a specific token ID.
    - Retrieve all token balances for an account.
    - Get token holders for a specific token.

6. **Topic Management (HCS)**:
    - **Create Topics**: Create new topics for Hedera Consensus Service (HCS).
    - **Delete Topics**: Delete an existing topic.
    - **Submit Topic Messages**: Send messages to a specific topic.
    - **Get Topic Info**: Retrieve information about a specific topic.
    - **Get Topic Messages**: Fetch messages from a specific topic.

7. **Upcoming Features** (Roadmap):
    - Create NFTs.
    - Simple token swapping on DEXs.

### Note
The methods in the HederaAgentKit class are fully implemented and functional for interacting with the Hedera network (e.g., creating tokens, transferring assets, managing airdrops). However, Langchain tools for most of these methods and operations are not implemented by default.

### Details
For further details check [HederaAgentKit Readme](./src/agent/README.md).

## Getting Started

```bash
npm i hedera-agent-kit
```

or

1. **Clone** the repo:

```bash
git clone https://github.com/jaycoolh/hedera-agent-kit.git
```

2. Install dependencies:

```bash
cd hedera-agent-kit
npm install
```

3. Configure environment variables (e.g., `OPENAI_API_KEY`, `HEDERA_ACCOUNT_ID`, `HEDERA_PRIVATE_KEY`) in a `.env` file.

4. Test the kit:

```bash
 npm run test
```

## Contributing

We welcome contributions! Please see our [CONTRIBUTING.md](https://github.com/jaycoolh/hedera-agent-kit/blob/main/CONTRIBUTING.md) for details on our process, how to get started, and how to sign your commits under the DCO.

## Roadmap

For details on upcoming features, check out our [ROADMAP.md](https://github.com/jaycoolh/hedera-agent-kit/blob/main/ROADMAP.md). If you’d like to tackle one of the tasks, look at the open issues on GitHub or create a new one if you don’t see what you’re looking for.

## License

Apache 2.0
