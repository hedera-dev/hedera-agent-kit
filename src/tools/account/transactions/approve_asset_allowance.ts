import {
    AccountAllowanceApproveTransaction,
    AccountId,
    Client, TokenId,
} from "@hashgraph/sdk";
import { AssetAllowanceResult } from "../../../types";

export const approve_asset_allowance = async (
    spenderAccount: AccountId,
    tokenId: TokenId | undefined,
    amount: number,
    client: Client,
): Promise<AssetAllowanceResult> => {
    const tx = await new AccountAllowanceApproveTransaction()
    if (tokenId) {
        tx.approveTokenAllowance(tokenId, client.operatorAccountId!, spenderAccount, amount)
    } else {
        tx.approveHbarAllowance(client.operatorAccountId!, spenderAccount, amount)
    }
    const txResponse = await tx.freezeWith(client).execute(client);

    const receipt = await txResponse.getReceipt(client);
    const hash = txResponse.transactionId.toString();

    return {
        status: receipt.status.toString(),
        txHash: hash || 'error',
    }
}
