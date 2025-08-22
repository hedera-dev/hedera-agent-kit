import {
  AccountBalanceQuery,
  AccountCreateTransaction,
  AccountDeleteTransaction,
  AccountId,
  AccountInfoQuery,
  Client,
  Hbar,
  NftId,
  PublicKey,
  Status,
  TokenAssociateTransaction,
  TokenCreateTransaction,
  TokenDeleteTransaction,
  TokenId,
  TokenInfoQuery,
  TokenNftInfoQuery,
  TokenSupplyType,
  TokenType,
  TopicCreateTransaction,
  TopicDeleteTransaction,
  TopicId,
  TopicInfoQuery,
  TopicMessageSubmitTransaction,
  TransferTransaction,
} from '@hashgraph/sdk';
import BigNumber from 'bignumber.js';

class HederaOperationsWrapper {
  constructor(private client: Client) {}

  // ACCOUNT OPERATIONS
  async createAccount(params: {
    publicKey: string;
    initialBalance?: number; // in HBAR
    memo?: string;
    maxAutomaticTokenAssociations?: number;
  }): Promise<AccountId> {
    const tx = new AccountCreateTransaction({
      accountMemo: params.memo ?? '',
      maxAutomaticTokenAssociations: params.maxAutomaticTokenAssociations ?? 0,
      initialBalance: params.initialBalance != null ? new Hbar(params.initialBalance) : undefined,
    }).setKeyWithoutAlias(PublicKey.fromString(params.publicKey));

    const response = await tx.execute(this.client);
    const receipt = await response.getReceipt(this.client);

    return receipt.accountId!;
  }

  async deleteAccount(params: {
    accountId: string;
    transferAccountId: string; // where remaining HBAR should go
    privateKeyDer?: string;
    memo?: string;
  }): Promise<Status> {
    const { accountId, transferAccountId } = params;
    const tx = new AccountDeleteTransaction({
      accountId: AccountId.fromString(accountId),
      transferAccountId: AccountId.fromString(transferAccountId),
    });

    const resp = await tx.execute(this.client);
    const receipt = await resp.getReceipt(this.client);
    return receipt.status;
  }

  // TOKEN OPERATIONS
  async createFungibleToken(
    name: string,
    symbol?: string,
    decimals?: number,
    initialSupply?: number, // in base units
    maxSupply?: number,
    treasuryAccountId?: string, // defaults operator
    adminKey?: string,
    kycKey?: string,
    freezeKey?: string,
    wipeKey?: string,
    supplyKey?: string,
    pauseKey?: string,
    metadataKey?: string,
    memo?: string,
    supplyType?: 'finite' | 'infinite',
  ): Promise<TokenId> {
    const tx = new TokenCreateTransaction({
      tokenName: name,
      tokenSymbol: symbol,
      tokenMemo: memo,
      decimals,
      initialSupply,
      maxSupply,
      supplyType: supplyType === 'infinite' ? TokenSupplyType.Infinite : TokenSupplyType.Finite,
      tokenType: TokenType.FungibleCommon,
      treasuryAccountId: treasuryAccountId ? AccountId.fromString(treasuryAccountId) : undefined,
    });

    if (adminKey) tx.setAdminKey(PublicKey.fromString(adminKey));
    if (kycKey) tx.setKycKey(PublicKey.fromString(kycKey));
    if (freezeKey) tx.setFreezeKey(PublicKey.fromString(freezeKey));
    if (wipeKey) tx.setWipeKey(PublicKey.fromString(wipeKey));
    if (supplyKey) tx.setSupplyKey(PublicKey.fromString(supplyKey));
    if (pauseKey) tx.setPauseKey(PublicKey.fromString(pauseKey));
    if (metadataKey) tx.setMetadataKey(PublicKey.fromString(metadataKey));

    const resp = await tx.execute(this.client);
    const receipt = await resp.getReceipt(this.client);
    return receipt.tokenId!;
  }

  async createNonFungibleToken(
    name: string,
    symbol?: string,
    treasuryAccountId?: string,
    adminKey?: string,
    kycKey?: string,
    freezeKey?: string,
    wipeKey?: string,
    supplyKey?: string, // required for minting
    pauseKey?: string,
    memo?: string,
  ): Promise<TokenId> {
    const tx = new TokenCreateTransaction({
      tokenName: name,
      tokenSymbol: symbol,
      tokenMemo: memo,
      tokenType: TokenType.NonFungibleUnique,
      treasuryAccountId: treasuryAccountId ? AccountId.fromString(treasuryAccountId) : undefined,
    });

    if (adminKey) tx.setAdminKey(PublicKey.fromString(adminKey));
    if (kycKey) tx.setKycKey(PublicKey.fromString(kycKey));
    if (freezeKey) tx.setFreezeKey(PublicKey.fromString(freezeKey));
    if (wipeKey) tx.setWipeKey(PublicKey.fromString(wipeKey));
    if (supplyKey) tx.setSupplyKey(PublicKey.fromString(supplyKey));
    if (pauseKey) tx.setPauseKey(PublicKey.fromString(pauseKey));

    const resp = await tx.execute(this.client);
    const receipt = await resp.getReceipt(this.client);
    return receipt.tokenId!;
  }

  async deleteToken(tokenId: string): Promise<Status> {
    const tx = new TokenDeleteTransaction({ tokenId: TokenId.fromString(tokenId) });
    const resp = await tx.execute(this.client);
    const receipt = await resp.getReceipt(this.client);
    return receipt.status;
  }

  // TOPIC OPERATIONS
  async createTopic(params?: {
    memo?: string;
    adminKey?: string;
    submitKey?: string;
  }): Promise<TopicId> {
    const tx = new TopicCreateTransaction({
      topicMemo: params?.memo,
    });
    if (params?.adminKey) tx.setAdminKey(PublicKey.fromString(params.adminKey));
    if (params?.submitKey) tx.setSubmitKey(PublicKey.fromString(params.submitKey));
    const resp = await tx.execute(this.client);
    const receipt = await resp.getReceipt(this.client);
    return receipt.topicId!;
  }

  async deleteTopic(topicId: string): Promise<Status> {
    const tx = new TopicDeleteTransaction({ topicId: TopicId.fromString(topicId) });
    const resp = await tx.execute(this.client);
    const receipt = await resp.getReceipt(this.client);
    return receipt.status;
  }

  async submitMessage(params: { topicId: string; message: string }): Promise<Status> {
    const tx = new TopicMessageSubmitTransaction({
      topicId: TopicId.fromString(params.topicId),
      message: params.message,
    });
    const resp = await tx.execute(this.client);
    const receipt = await resp.getReceipt(this.client);

    return receipt.status;
  }

  // TRANSFERS AND AIRDROPS
  async transferHbar(params: {
    from?: string;
    to: string;
    amount: number;
    memo?: string;
  }): Promise<Status> {
    const tx = new TransferTransaction()
      .addHbarTransfer(AccountId.fromString(params.to), new Hbar(params.amount))
      .addHbarTransfer(
        AccountId.fromString(params.from ?? (this.client as any)._operatorAccountId.toString()),
        new Hbar(-params.amount),
      );

    const resp = await tx.execute(this.client);
    const receipt = await resp.getReceipt(this.client);
    return receipt.status;
  }

  async transferFungible(params: {
    tokenId: string;
    from?: string;
    to: string;
    amount: number;
  }): Promise<Status> {
    const tx = new TransferTransaction()
      .addTokenTransfer(
        TokenId.fromString(params.tokenId),
        AccountId.fromString(params.to),
        params.amount,
      )
      .addTokenTransfer(
        TokenId.fromString(params.tokenId),
        AccountId.fromString(params.from ?? (this.client as any)._operatorAccountId.toString()),
        -params.amount,
      );

    const resp = await tx.execute(this.client);
    const receipt = await resp.getReceipt(this.client);
    return receipt.status;
  }

  async transferNft(params: {
    tokenId: string;
    serial: number;
    from?: string;
    to: string;
    memo?: string;
  }): Promise<Status> {
    const nft = new NftId(TokenId.fromString(params.tokenId), params.serial);
    const tx = new TransferTransaction().addNftTransfer(
      nft,
      AccountId.fromString(params.from ?? (this.client as any)._operatorAccountId.toString()),
      AccountId.fromString(params.to),
    );

    const resp = await tx.execute(this.client);
    const receipt = await resp.getReceipt(this.client);
    return receipt.status;
  }

  async associateToken(params: { accountId: string; tokenId: string }): Promise<Status> {
    const tx = new TokenAssociateTransaction({
      accountId: AccountId.fromString(params.accountId),
      tokenIds: [TokenId.fromString(params.tokenId)],
    });
    const resp = await tx.execute(this.client);
    const receipt = await resp.getReceipt(this.client);
    return receipt.status;
  }

  async getAccountBalances(accountId: string) {
    const query = new AccountBalanceQuery().setAccountId(AccountId.fromString(accountId));
    return await query.execute(this.client);
  }

  async getAccountInfo(accountId: string) {
    const query = new AccountInfoQuery().setAccountId(AccountId.fromString(accountId));
    return await query.execute(this.client);
  }

  async getTopicInfo(topicId: string) {
    const query = new TopicInfoQuery().setTopicId(TopicId.fromString(topicId));
    return await query.execute(this.client);
  }

  async getTokenInfo(tokenId: string) {
    const query = new TokenInfoQuery().setTokenId(TokenId.fromString(tokenId));
    return await query.execute(this.client);
  }

  async getNftInfo(tokenId: string, serial: number) {
    const query = new TokenNftInfoQuery({ nftId: new NftId(TokenId.fromString(tokenId), serial) });
    return await query.execute(this.client);
  }

  async getAccountTokenBalances(accountId: string, tokenId: string) {
    const accountTokenBalances = await this.getAccountBalances(accountId);
    const tokenIdObj = TokenId.fromString(tokenId);
    const balance = accountTokenBalances.tokens?.get(tokenIdObj) ?? 0;
    const decimals = accountTokenBalances.tokenDecimals?.get(tokenIdObj) ?? 0;
    return { balance, decimals };
  }

  /**
   * return HBAR balance of an account in tinybars
   *
   * @param accountId
   */
  async getAccountHbarBalance(accountId: string): Promise<BigNumber> {
    const accountInfo = await this.getAccountInfo(accountId);
    const balance = accountInfo.balance;
    return new BigNumber(balance.toTinybars().toNumber());
  }
}

export default HederaOperationsWrapper;
