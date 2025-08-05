# Available Tools

The Hedera Agent Kit provides a comprehensive set of tools organized into **plugins** by the type of Hedera service they interact with. These tools can be used both by the conversational agent and when you are building with the SDK.

## Plugin Architecture

The tools are now organized into plugins, each containing related functionality:

- **Core Account Plugin**: Tools for Hedera Account Service operations
- **Core Consensus Plugin**: Tools for Hedera Consensus Service (HCS) operations  
- **Core HTS Plugin**: Tools for Hedera Token Service operations
- **Core Queries Plugin**: Tools for querying Hedera network data

Plugins can be found in [typescript/src/plugins](../typescript/src/plugins)

Want additional Hedera tools? [Open an issue](https://github.com/hedera-dev/hedera-agent-kit/issues/new?template=toolkit_feature_request.yml&labels=feature-request).

### Core Account Plugin Tools (core-account-plugin)
Usiung the plugin for Hedera Account Service operations

| Tool Name                                       | Description                                        |  Usage                                             |
| ----------------------------------------------- | -------------------------------------------------- | --------------------------------------------------------- |
| `TRANSFER_HBAR_TOOL| Transfer HBAR between accounts | Provide the amount of of HBAR to transfer, the account to transfer to, and optionally, a transaction memo.|

### Core Hedera COnsensus Service Plugin Tools (core-consensus-plugin)

| Tool Name                                       | Description                                        |  Usage                                             |
| ----------------------------------------------- | -------------------------------------------------- | --------------------------------------------------------- |
| `CREATE_TOPIC_TOOL`| Create a new topic on the Hedera network | How to use| 
| `SUBMIT_TOPIC_MESSAGE_TOOL`| Submit a message to a topic on the Hedera network | How to use| 

### Core Hedera Token Service Plugin Tools (core-hts-plugin)
A plugin for the Hedera Token Service (HTS), enabling you to create and manage fungible and non-funglible tokens on the Hedera network

| Tool Name                                       | Description                                        |  Usage                                             |
| ----------------------------------------------- | -------------------------------------------------- | --------------------------------------------------------- |
| `CREATE_FUNGIBLE_TOKEN_TOOL`| Description of what Tool Does | How to use|
| `CREATE_NON_FUNGIBLE_TOKEN_TOOL`| Description of what Tool Does | How to use|
| `AIRDROP_FUNGIBLE_TOKEN_TOOL`| Description of what Tool Does | How to use|
| `MINT_NON_FUNGIBLE_TOKEN_TOOL`| Description of what Tool Does | How to use|
| `AIRDROP_FUNGIBLE_TOKEN_TOOL`| Description of what Tool Does | How to use|

### Core Hedera Queries Plugin Tools (core-queries-plugin)
These tools provided by the toolkit enable you to complete (free) queries against mirror nodes on the Hedera network.

| Tool Name                      | Description                           | Usage                                       |
| ------------------------------ | ------------------------------------- | --------------------------------------------------- |
| `get-account-query`| Returns comprehensive account information for a given Hedera account | Provide an account ID to query |
| `get-hbar-balance-query`| Returns the HBAR balance for a given Hedera account | Requires a Hedera account ID to query (uses context operator account if not specified)|
| `get-account-token-balances-query`| Returns token balances for a Hedera acocunt | rovide the account ID to query (optional - uses context account if not provided). Optionally, provide a specific token ID to query|
| `get-topic-messages-query`| Returns messages for a given Hedera Consensus Service (HCS) topic | Provide the topic ID to query (required). Optionally, provide start time, end time, and limit for message filtering|
<!-- | `tool-name`| Description of what Tool Does | How to use| -->

