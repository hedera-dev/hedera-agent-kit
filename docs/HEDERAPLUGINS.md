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

## Hedera Transaction Tools
These tools provided by the toolkit enable you to execute basic transacitons on the Hedera network.

| Tool Name                                       | Description                                        |  Usage                                             |
| ----------------------------------------------- | -------------------------------------------------- | --------------------------------------------------------- |
| `transfer-hbar`| Transfer HBAR between accounts | Provide the amount of of HBAR to transfer, the account to transfer to, and optionally, a transaction memo.|
| `create-topic`| Description of what Tool Does | How to use| 
| `submit-topic-message`| Description of what Tool Does | How to use| 
| `create-fungible-token`| Creates a new Hedera fungible token| Provide the name of the token, and the symbol. Optionally, and initial supply amount for the token, and if it is a treasury account, the treasury account ID. |
| `create-non-fungible-token`| Create NFTs on the Hedera network | Requires a name and symbol for the NFT, and can include a max supply limit and treasury account ID. |
| `airdrop-fungible-token`| Airdrop fungible token(s) to a specific account | Provide the token ID to airdrop, amount of tokens, and recipient account ID. Can inslude a source account and memo.|
<!-- | `transfer_fungible_token`| Transfer Fungible tokens between accounts on Hedera | Provide the token ID to transfter, amount, and recipient account ID. You can also add the source account ID and a memo | -->
<!-- | `tool-name`| Description of what Tool Does | How to use| -->

## Hedera Query Tools
These tools provided by the toolkit enable you to complete (free) queries against mirror nodes on the Hedera network.

| Tool Name                      | Description                           | Usage                                       |
| ------------------------------ | ------------------------------------- | --------------------------------------------------- |
| `get-account-query`| Returns comprehensive account information for a given Hedera account | Provide an account ID to query |
| `get-hbar-balance-query`| Returns the HBAR balance for a given Hedera account | Requires a Hedera account ID to query (uses context operator account if not specified)|
| `get-account-token-balances-query`| Returns token balances for a Hedera acocunt | rovide the account ID to query (optional - uses context account if not provided). Optionally, provide a specific token ID to query|
| `get-topic-messages-query`| Returns messages for a given Hedera Consensus Service (HCS) topic | Provide the topic ID to query (required). Optionally, provide start time, end time, and limit for message filtering|
<!-- | `tool-name`| Description of what Tool Does | How to use| -->