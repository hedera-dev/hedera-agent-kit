# Hedera Agent Kit Tools

## HBAR
### `transfer_hbar(client, toAccountId, amount)`

This asynchronous function facilitates the transfer of HBAR from the operator account (associated with the provided Hedera `client`) to a specified recipient account.

---

#### Parameters

- **client**: `Client`  
  An instance of the Hedera SDK client that holds the operator account used for initiating the transfer.

- **toAccountId**: `string | AccountId`  
  The target account to which HBAR will be transferred. This can be provided either as a string or as an `AccountId` object.

- **amount**: `string`  
  The amount of HBAR to be transferred. This value is used to debit the operator’s account and credit the recipient’s account. 

---

#### Returns

- **Promise<TransferHBARResult>**  
  A promise that resolves to an object containing:
    - **status**: `string` — The status of the transaction receipt.
    - **txHash**: `string` — The transaction hash (transaction ID) of the executed transfer.

---

#### Behavior & Error Handling

1. **Operator Account Check**:  
   The function first retrieves the operator account ID from the client. If the operator account is not defined, it throws an error with the message `"Invalid operator accountId in client"`.

2. **Transaction Construction**:  
   It creates a `TransferTransaction` that:
    - Debits the operator’s account by the specified amount.
    - Credits the target account by the same amount.

3. **Transaction Execution & Receipt**:  
   The transaction is executed on the network. The function then obtains the receipt and checks the transaction status.

4. **Error on Failure**:  
   If the transaction receipt’s status does not include `"SUCCESS"`, the function throws an error indicating the transfer has failed.

---


## HCS - Hedera Consensus Service

### `submit_topic_message(topicId, message, client)`

This asynchronous function submits a message to a specified topic on the Hedera network using the provided client.

---

#### Parameters

- **topicId**: `TopicId`  
  The identifier of the topic to which the message will be submitted.

- **message**: `string`  
  The content of the message to be submitted to the topic.

- **client**: `Client`  
  An instance of the Hedera SDK client used to execute the transaction.

---

#### Returns

- **Promise<SubmitMessageResult>**  
  A promise that resolves to an object containing:
    - **status**: `string` — The status of the transaction receipt.
    - **txHash**: `string` — The transaction hash (transaction ID) of the executed message submission. If unavailable, returns `'error'`.

---

#### Behavior

1. **Transaction Creation & Execution**:  
   The function creates a new `TopicMessageSubmitTransaction` with the provided `topicId` and `message`, and executes it using the given `client`.

2. **Receipt Query & Execution**:  
   It retrieves a receipt query from the executed transaction via `tx.getReceiptQuery()` and executes the query to obtain the transaction receipt.

3. **Result Formation**:  
   The function extracts the status from the receipt and the transaction ID (as `txHash`) from the receipt query, then returns these values encapsulated in an object.

---

### `create_topic(memo, client, isSubmitKey)`

This asynchronous function creates a new topic on the Hedera network using the provided memo and configuration, and returns details about the newly created topic.

---

#### Parameters

- **memo**: `string`  
  A descriptive memo or note for the topic.

- **client**: `Client`  
  An instance of the Hedera SDK client used to execute the transaction. The client must have the operator's public key set, which is used as the admin key (and optionally the submit key).

- **isSubmitKey**: `boolean`  
  A flag indicating whether to set the submit key for the topic. If `true`, the operator's public key is used as the submit key.

---

#### Returns

- **Promise<CreateTopicResult>**  
  A promise that resolves to an object containing:
    - **txHash**: `string` — The transaction hash (transaction ID) of the topic creation transaction.
    - **status**: `string` — The status of the transaction receipt.
    - **topicId**: `string` — The identifier of the newly created topic.

---

#### Behavior & Error Handling

1. **Transaction Construction**:  
   The function initializes a new `TopicCreateTransaction` and sets:
    - The topic memo to the provided `memo`.
    - The admin key to the operator's public key from the client.
    - The submit key to the operator's public key if `isSubmitKey` is `true`.

2. **Transaction Execution & Receipt**:  
   The transaction is executed on the network, and the function retrieves its receipt to determine the outcome.

3. **Error Handling**:
    - If the receipt's status does not indicate `"SUCCESS"`, the function throws an error with the message `"Topic creation transaction failed"`.
    - If the receipt does not include a `topicId`, it throws an error with the message `"Unknown error occurred during topic creation."`

4. **Result Formation**:  
   On successful execution, the function returns an object containing the transaction hash, the status of the receipt, and the newly created topic's ID.

### `get_topic_info(topicId, networkType)`

This asynchronous function fetches topic information from the Hedera mirror node API based on the provided topic identifier and network type.

---

#### Parameters

- **topicId**: `TopicId`  
  The identifier of the topic for which to retrieve information.

- **networkType**: `HederaNetworkType`  
  The Hedera network type (e.g., testnet, mainnet) used to construct the base URL for the mirror node API.

---

#### Returns

- **Promise<TopicInfoApiResponse>**  
  A promise that resolves to the topic information retrieved from the mirror node API.

---

#### Behavior & Error Handling

1. **API URL Construction**:  
   The function uses the helper `createBaseMirrorNodeApiUrl` with the provided `networkType` to generate the base URL. It then appends the topic ID to form the full endpoint URL.

2. **Fetching Data**:  
   It performs a GET request to the constructed URL using the `fetch` API, and parses the JSON response into a `TopicInfoApiResponse` object.

3. **Error Handling**:  
   If the response does not contain valid data, the function throws an error with the message `"Could not find or fetch topic info"`.

4. **Result Formation**:  
   On a successful fetch, the function returns the parsed topic information data.

---

### `get_topic_messages(topicId, networkType, lowerTimestamp?, upperTimestamp?)`

This asynchronous function retrieves messages for a given topic from the Hedera mirror node API. It supports optional filtering by timestamps and handles pagination automatically, fetching up to 100 messages per page until all messages are retrieved.

---

#### Parameters

- **topicId**: `TopicId`  
  The identifier of the topic from which messages will be fetched.

- **networkType**: `HederaNetworkType`  
  The network (e.g., testnet, mainnet) where the topic is hosted. This is used to construct the base URL for the mirror node API.

- **lowerTimestamp** *(optional)*: `number`  
  An optional Unix timestamp (in seconds.milliseconds format) serving as a lower bound filter. Only messages with timestamps greater than or equal to this value will be returned.

- **upperTimestamp** *(optional)*: `number`  
  An optional Unix timestamp (in seconds.milliseconds format) serving as an upper bound filter. Only messages with timestamps less than or equal to this value will be returned.

---

#### Returns

- **Promise<Array<HCSMessage>>**  
  A promise that resolves to an array of `HCSMessage` objects containing the messages fetched from the topic.

---

#### Behavior & Error Handling

1. **URL Construction**:
    - Constructs a base URL using `createBaseMirrorNodeApiUrl(networkType)`.
    - Appends the topic ID and query parameters including encoding (set to UTF-8), a limit of 100 messages per page, and order (descending).
    - Optionally adds timestamp filters if `lowerTimestamp` and/or `upperTimestamp` are provided.

2. **Pagination Handling**:
    - The function enters a loop to fetch paginated results.
    - After each fetch, it appends the messages from the current page to an array.
    - It updates the URL using the `data.links.next` value (if present) to fetch the next page of messages.

3. **Error Handling**:
    - Checks if the HTTP response is OK. If not, it throws an error with the HTTP status and status text.
    - Any errors encountered during fetching or JSON parsing are logged and re-thrown.

4. **Result Formation**:
    - Once all pages have been fetched, the function returns the aggregated array of `HCSMessage` objects.

---

### `delete_topic(topicId, client)`

This asynchronous function deletes a specified Hedera Consensus Service (HCS) topic.

---

#### Parameters

- **topicId**: `TopicId`  
  The identifier of the topic to be deleted.

- **client**: `Client`  
  The Hedera client instance used to execute the transaction.

---

#### Returns

- **Promise<DeleteTopicResult>**  
  A promise that resolves to an object containing the transaction hash and status.

---

#### Behavior & Error Handling

1. **Transaction Creation & Execution**:
    - Constructs a `TopicDeleteTransaction` and assigns the `topicId`.
    - Freezes the transaction and submits it to the Hedera network.

2. **Response Handling**:
    - Retrieves the transaction receipt and checks its status.
    - Throws an error if the transaction is not successful.
    - Returns the transaction hash and status.


## HTS - Hedera Token Service

### `airdrop_token(tokenId, recipients, client)`

This asynchronous function performs a token airdrop by transferring tokens from the operator's account to multiple recipient accounts.

---

#### Parameters

- **tokenId**: `TokenId`  
  The identifier of the token to be airdropped.

- **recipients**: `AirdropRecipient[]`  
  An array of recipient objects. Each object must include:
    - **accountId**: `string | AccountId` — The recipient's account identifier.
    - **amount**: `number` — The number of tokens to transfer to the recipient.

- **client**: `Client`  
  An instance of the Hedera SDK client used to execute the transaction. The client's operator account is used as the source of tokens.

---

#### Returns

- **Promise<AirdropResult>**  
  A promise that resolves to an object containing:
    - **status**: `string` — The status of the transaction receipt.
    - **txHash**: `string` — The transaction hash (transaction ID) of the executed airdrop.

---

#### Behavior & Error Handling

1. **Transaction Construction**:
    - Initializes a new `TokenAirdropTransaction`.
    - Iterates over each recipient to:
        - Deduct the specified token amount from the operator's account.
        - Credit the same amount to the recipient's account.

2. **Transaction Execution & Receipt**:
    - Freezes and executes the transaction using the provided client.
    - Retrieves the receipt and verifies if the status includes `"SUCCESS"`.

3. **Error Handling**:
    - If the transaction status does not indicate success, an error with the message `"Token Airdrop Transaction failed"` is thrown.

---

### `associate_token(tokenId, client)`

This asynchronous function associates a token with the operator's account, enabling the account to hold the specified token.

---

#### Parameters

- **tokenId**: `TokenId`  
  The identifier of the token to be associated.

- **client**: `Client`  
  An instance of the Hedera SDK client used to execute the transaction. The client's operator account is utilized for the association.

---

#### Returns

- **Promise<AssociateTokenResult>**  
  A promise that resolves to an object containing:
    - **status**: `string` — The status of the transaction receipt.
    - **txHash**: `string` — The transaction hash (transaction ID) of the executed association.

---

#### Behavior & Error Handling

1. **Transaction Construction**:
    - Creates a new `TokenAssociateTransaction`.
    - Sets the account ID (from the operator account) and the token to be associated.

2. **Transaction Execution & Receipt**:
    - Executes the transaction and retrieves its receipt.
    - Validates that the receipt status indicates a successful association.

3. **Error Handling**:
    - Throws an error with the message `"Token Association failed"` if the status does not include `"SUCCESS"`.

---

### `claim_airdrop(client, airdropId)`

This asynchronous function claims a pending token airdrop for the operator's account.

---

#### Parameters

- **client**: `Client`  
  An instance of the Hedera SDK client used to execute the transaction.

- **airdropId**: `PendingAirdropId`  
  The identifier of the pending airdrop to be claimed.

---

#### Returns

- **Promise<ClaimAirdropResult>**  
  A promise that resolves to an object containing:
    - **status**: `string` — The status of the transaction receipt.
    - **txHash**: `string` — The transaction hash (transaction ID) of the executed claim.

---

#### Behavior & Error Handling

1. **Transaction Construction**:
    - Initializes a new `TokenClaimAirdropTransaction`.
    - Adds the provided `airdropId` to the transaction.
    - Freezes the transaction with the client.

2. **Transaction Execution & Receipt**:
    - Executes the transaction, retrieves the receipt, and checks if the status indicates success.

3. **Error Handling**:
    - If the status does not include `"SUCCESS"`, an error with the message `"Token Airdrop Transaction failed"` is thrown.

---

### `create_token(name, symbol, decimals, initialSupply, isSupplyKey, client)`

This asynchronous function creates a new fungible token on the Hedera network with the specified attributes.

---

#### Parameters

- **name**: `string`  
  The name of the token.

- **symbol**: `string`  
  The symbol representing the token.

- **decimals**: `number`  
  The number of decimal places for the token.

- **initialSupply**: `number`  
  The initial supply of tokens given in the smallest unit (meaning: display_unit * 10^token_decimals)

- **isSupplyKey**: `boolean`  
  A flag indicating whether to set the supply key. If `true`, the operator's public key is set as the supply key.

- **client**: `Client`  
  An instance of the Hedera SDK client used to execute the transaction. The client's operator account is used as the treasury account.

---

#### Returns

- **Promise<CreateTokenResult>**  
  A promise that resolves to an object containing:
    - **status**: `string` — The status of the transaction receipt.
    - **txHash**: `string` — The transaction hash (transaction ID) of the token creation.
    - **tokenId**: `TokenId` — The identifier of the newly created token.

---

#### Behavior & Error Handling

1. **Transaction Construction**:
    - Creates a new `TokenCreateTransaction` with the token's name, symbol, decimals, initial supply, and treasury account ID.
    - Optionally sets the supply key if `isSupplyKey` is `true`.

2. **Transaction Execution & Receipt**:
    - Executes the transaction and retrieves the receipt.
    - Checks that a `tokenId` is returned in the receipt.

3. **Error Handling**:
    - Throws an error with the message `"Token Create Transaction failed"` if no `tokenId` is present in the receipt.

---

### `dissociate_token(tokenId, client)`

This asynchronous function dissociates a token from the operator's account, effectively removing the token from the account's holdings.

---

#### Parameters

- **tokenId**: `TokenId`  
  The identifier of the token to be dissociated.

- **client**: `Client`  
  An instance of the Hedera SDK client used to execute the transaction. The client's operator account is used for dissociation.

---

#### Returns

- **Promise<DissociateTokenResult>**  
  A promise that resolves to an object containing:
    - **status**: `string` — The status of the transaction receipt.
    - **txHash**: `string` — The transaction hash (transaction ID) of the executed dissociation.

---

#### Behavior & Error Handling

1. **Transaction Construction**:
    - Creates a new `TokenDissociateTransaction`.
    - Sets the account ID (from the operator account) and specifies the token to be dissociated.

2. **Transaction Execution & Receipt**:
    - Executes the transaction and retrieves its receipt.
    - Checks if the receipt status indicates a successful dissociation.

3. **Error Handling**:
    - Throws an error with the message `"Token dissociation failed"` if the status does not include `"SUCCESS"`.

---

### `mint_token(tokenId, amount, client)`

This asynchronous function mints new tokens for a given token, increasing its total supply.

---

#### Parameters

- **tokenId**: `TokenId`  
  The identifier of the token for which new tokens will be minted.

- **amount**: `number`  
  The number of tokens to mint.

- **client**: `Client`  
  An instance of the Hedera SDK client used to execute the transaction.

---

#### Returns

- **Promise<MintTokenResult>**  
  A promise that resolves to an object containing:
    - **status**: `string` — The status of the transaction receipt.
    - **txHash**: `string` — The transaction hash (transaction ID) of the minting operation.

---

#### Behavior & Error Handling

1. **Transaction Construction**:
    - Initializes a new `TokenMintTransaction` and sets the token ID and amount to mint.
    - Freezes the transaction with the client.

2. **Transaction Execution & Receipt**:
    - Executes the transaction and retrieves the receipt.
    - Validates that the receipt status indicates success.

3. **Error Handling**:
    - If the status does not include `"SUCCESS"`, an error with the message `"Token Minting Transaction failed"` is thrown.

---

### `reject_token(tokenId, client)`

This asynchronous function rejects an incoming token transfer for the operator's account, effectively declining the token.

---

#### Parameters

- **tokenId**: `TokenId`  
  The identifier of the token to be rejected.

- **client**: `Client`  
  An instance of the Hedera SDK client used to execute the transaction. The operator's account is set as the owner for this rejection.

---

#### Returns

- **Promise<RejectTokenResult>**  
  A promise that resolves to an object containing:
    - **status**: `string` — The status of the transaction receipt.
    - **txHash**: `string` — The transaction hash (transaction ID) of the rejection.

---

#### Behavior & Error Handling

1. **Transaction Construction**:
    - Creates a new `TokenRejectTransaction`.
    - Sets the owner ID (from the operator account) and adds the token to be rejected.
    - Freezes the transaction with the client.

2. **Transaction Execution & Receipt**:
    - Executes the transaction and retrieves its receipt.
    - Checks if the receipt status indicates success.

3. **Error Handling**:
    - Throws an error with the message `"Token Rejection Transaction failed"` if the status does not include `"SUCCESS"`.

---

### `transfer_token(tokenId, toAccountId, amount, client)`

This asynchronous function transfers a specified amount of tokens from the operator's account to another account.

---

#### Parameters

- **tokenId**: `TokenId`  
  The identifier of the token to be transferred.

- **toAccountId**: `string | AccountId`  
  The target account identifier that will receive the tokens.

- **amount**: `number`  
  The number of tokens to transfer. Given in the smallest unit.

- **client**: `Client`  
  An instance of the Hedera SDK client used to execute the transaction. The client's operator account is used as the source account.

---

#### Returns

- **Promise<TransferTokenResult>**  
  A promise that resolves to an object containing:
    - **status**: `string` — The status of the transaction receipt.
    - **txHash**: `string` — The transaction hash (transaction ID) of the token transfer.

---

#### Behavior & Error Handling

1. **Transaction Construction**:
    - Creates a new `TransferTransaction`.
    - Adds a token transfer that deducts the specified amount from the operator's account.
    - Adds a token transfer that credits the specified amount to the target account.

2. **Transaction Execution & Receipt**:
    - Executes the transaction and retrieves its receipt.
    - Validates that the receipt status indicates a successful transfer.

3. **Error Handling**:
    - Throws an error with the message `"Token Transfer Transaction failed"` if the status does not include `"SUCCESS"`.

### `get_hbar_balance(client, accountId)`

This asynchronous function retrieves the HBAR balance of a specified account using the provided Hedera client.

---

#### Parameters

- **client**: `Client`  
  An instance of the Hedera SDK client used to execute the balance query.

- **accountId**: `string | AccountId | null`  
  The account identifier whose HBAR balance is requested. This parameter must be provided.

---

#### Returns

- **Promise<number>**  
  A promise that resolves to the HBAR balance (as a number) of the specified account.

---

#### Behavior & Error Handling

1. **Input Validation**:
    - Throws an error with the message `"accountId must be provided"` if no accountId is supplied.

2. **Query Execution**:
    - Creates an `AccountBalanceQuery` using the provided accountId.
    - Executes the query with the given client and returns the HBAR balance converted to a number.

---

### `get_hts_balance(tokenId, networkType, accountId)`

This asynchronous function fetches the balance of a specific HTS token for a given account from the Hedera mirror node API.

---

#### Parameters

- **tokenId**: `string`  
  The identifier of the HTS token.

- **networkType**: `HederaNetworkType`  
  The network type (e.g., testnet, mainnet) used to construct the mirror node API URL.

- **accountId**: `string`  
  The account identifier for which the token balance is requested.

---

#### Returns

- **Promise<number>**  
  A promise that resolves to the token balance in its base unit. Returns `0` if no balance is found.

---

#### Behavior & Error Handling

1. **URL Construction & Fetching**:
    - Constructs the API URL with the provided `tokenId`, `networkType`, and `accountId`.
    - Performs a GET request to fetch the token balance.

2. **Response Handling**:
    - If the response is not successful, throws an error with the HTTP status.
    - Parses the JSON response and extracts the token balance from the first result.

3. **Result Formation**:
    - Returns the extracted balance or `0` if the balance is undefined.

---

### `get_all_tokens_balances(networkType, accountId)`

This asynchronous function retrieves detailed balances for all tokens held by a given account. It gathers token details (such as name, symbol, decimals) and converts balances into display units.

---

#### Parameters

- **networkType**: `HederaNetworkType`  
  The network type (e.g., testnet, mainnet) used for constructing the mirror node API URL.

- **accountId**: `string`  
  The account identifier whose token balances are to be retrieved.

---

#### Returns

- **Promise<Array<DetailedTokenBalance>>**  
  A promise that resolves to an array of detailed token balance objects. Each object contains:
    - `balance`: The raw token balance.
    - `tokenDecimals`: The token’s decimals.
    - `tokenId`: The token identifier.
    - `tokenName`: The name of the token.
    - `tokenSymbol`: The token symbol.
    - `balanceInDisplayUnit`: The balance formatted for display.

---

#### Behavior & Error Handling

1. **Data Fetching & Pagination**:
    - Constructs the API URL to retrieve token balances for the specified account.
    - Iterates through paginated responses, appending tokens from each page to an array.

2. **Token Details Retrieval**:
    - For each token, fetches additional details using `get_hts_token_details`.
    - Converts the raw balance to a display unit using `toDisplayUnit`.

3. **Error Handling**:
    - Logs and re-throws errors if any API fetch or data processing step fails.

---

### `get_hts_token_details(tokenId, networkType)`

This asynchronous function fetches detailed information about a specific HTS token from the Hedera mirror node API.

---

#### Parameters

- **tokenId**: `string`  
  The identifier of the HTS token.

- **networkType**: `HederaNetworkType`  
  The network type (e.g., testnet, mainnet) used to construct the API URL.

---

#### Returns

- **Promise<HtsTokenDetails>**  
  A promise that resolves to an object containing detailed token information (such as name, symbol, and decimals).

---

#### Behavior & Error Handling

1. **URL Construction & Fetching**:
    - Constructs the API URL using the provided `tokenId` and `networkType`.
    - Fetches the token details from the mirror node API.

2. **Response Handling**:
    - If the response is not successful, throws an error with the HTTP status and message.
    - Parses and returns the JSON response containing token details.

---

### `get_token_holders(tokenId, networkType, threshold?)`

This asynchronous function retrieves a list of token holders and their balances for a specified token. It supports optional filtering by a minimum balance threshold.

---

#### Parameters

- **tokenId**: `string`  
  The identifier of the token.

- **networkType**: `HederaNetworkType`  
  The network type (e.g., testnet, mainnet) used to construct the mirror node API URL.

- **threshold** *(optional)*: `number`  
  A minimum balance threshold. If provided, only accounts with balances greater than or equal to this threshold are returned. If omitted, only accounts with a balance greater than 0 are considered.

---

#### Returns

- **Promise<Array<TokenBalance>>**  
  A promise that resolves to an array of token balance objects for each token holder.

---

#### Behavior & Error Handling

1. **URL Construction & Pagination**:
    - Builds the API URL based on the provided `tokenId`, `networkType`, and optional `threshold`.
    - Iterates through paginated responses, accumulating token balance data.

2. **Response Handling**:
    - Throws an error if the HTTP response is not successful.
    - Returns the aggregated array of token balances.

---

### `get_pending_airdrops(networkType, accountId)`

This asynchronous function retrieves a list of pending airdrops for a specified Hedera account.

---

#### Parameters

- **networkType**: `HederaNetworkType`  
  The network type (e.g., testnet, mainnet) used to construct the mirror node API URL.

- **accountId**: `string`  
  The Hedera account ID for which to retrieve pending airdrops.

---

#### Returns

- **Promise<Array<Airdrop>>**  
  A promise that resolves to an array of pending airdrops associated with the given account.

---

#### Behavior & Error Handling

1. **URL Construction & Request**:
    - Builds the API URL using the provided `networkType` and `accountId`.
    - Sends a request to the Hedera mirror node API.

2. **Response Handling**:
    - Throws an error if the HTTP response is not successful.
    - Parses the response and returns the list of pending airdrops.  


## Account - Account management

### `approve_asset_allowance(spenderAccount, tokenId, amount, client)`

This asynchronous function approves a specified allowance for an account (spender) to either spend HBAR or a specific token, depending on whether a `tokenId` is provided. The function uses the provided Hedera `client` to execute the approval transaction.

---

#### Parameters

- **spenderAccount**: `AccountId`  
  The account ID of the spender, which will be granted the allowance to transfer the specified amount.

- **tokenId**: `TokenId | undefined`  
  The ID of the token for which the allowance is being granted. If this parameter is `undefined`, the allowance is for HBAR.

- **amount**: `number`  
  The amount of the asset (either HBAR or the specified token) to be approved for spending by the `spenderAccount`.

- **client**: `Client`  
  An instance of the Hedera SDK client that holds the operator account used to authorize the allowance.

---

#### Returns

- **Promise<AssetAllowanceResult>**  
  A promise that resolves to an object containing:
    - **status**: `string` — The status of the transaction receipt (e.g., `"SUCCESS"`).
    - **txHash**: `string` — The transaction hash (transaction ID) of the approval transaction.

---

#### Behavior & Error Handling

1. **Allowance Type Determination**:  
   The function first checks whether a `tokenId` is provided:
    - If `tokenId` is defined, it creates a token allowance approval for the specified token.
    - If `tokenId` is `undefined`, it defaults to approving an HBAR allowance.

2. **Transaction Creation & Execution**:  
   The appropriate `AccountAllowanceApproveTransaction` is constructed:
    - For token allowance, the transaction approves the specified amount of the token to be spent by the spender.
    - For HBAR allowance, the transaction approves the specified amount of HBAR to be spent by the spender.  
      The transaction is then frozen and executed.

3. **Receipt Retrieval & Status Check**:  
   After executing the transaction, the function retrieves the transaction receipt and verifies its status to determine if the approval was successful.

4. **Error Handling**:  
   If the transaction receipt's status does not include `"SUCCESS"`, the function will throw an error, indicating that the approval has failed.

---
