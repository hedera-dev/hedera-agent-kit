# Hedera Agent Kit Roadmap

This document outlines our **high-level goals** and **major milestones**. The roadmap is subject to change based on community feedback and evolving project needs.

---

## 1. Native Hedera Token Service

**Goal**: Provide minimal functionality for creating and managing tokens.

- [x] **Fungible Token Creation** (core attributes only: name, symbol, decimals, supply)
- [ ] **Non-Fungible Token Creation** (core attributes only: name, symbol, decimals, supply)
- [x] **Mint Token**
- [x] **Basic Token Transfer** (simple transfer from client to another user)
- [x] **Fetch Token Info** (optional: retrieving metadata)

**Milestone**: `v0.1`

---

## 2. Native Hedera Consensus Service

**Goal**: Enable simple messaging/consensus features.

- [x] **Create Topic** (basic setup)
- [x] **Publish Messages** to a topic

**Milestone**: `v0.2`

---

## 3. Swapping on DEXs

**Goal**: Introduce basic token swap functionality.

- [ ] **Swap** a token pair (e.g., HBAR for your new token)

**Milestone**: `v0.3`

---

## 4. Future Extensions (Ideas)

- **Expanding Token Functionality**: Advanced native token configuration, Token Airdrop APIs
- **Hedera Smart Contract Service**: Functionality via the SDK as well as EVM tooling
- **Security & Governance**: Multi-sig, advanced role-based permissions
- **Performance Optimization**: Caching of network calls, concurrency improvements
- **UI/CLI Tools**: Possibly a CLI to interact with the kit quickly

---

## How to Contribute

- Pick an open Issue from GitHub or open a new one if you have a fresh idea.
- Check out our [CONTRIBUTING.md](./CONTRIBUTING.md) for details on how to DCO-sign commits and submit a PR.
