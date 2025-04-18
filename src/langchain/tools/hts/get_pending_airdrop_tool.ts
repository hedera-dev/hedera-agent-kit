import { Tool, ToolRunnableConfig, } from "@langchain/core/tools";
import HederaAgentKit from "../../../agent";
import { ExecutorAccountDetails, HederaNetworkType } from "../../../types";
import { CallbackManagerForToolRun } from "@langchain/core/callbacks/manager";

export class HederaGetPendingAirdropTool extends Tool {
    name = 'hedera_get_pending_airdrop'

    description = `Get the pending airdrops for the given account on Hedera
Inputs ( input is a JSON string ):
- accountId (*string*, optional): the account ID to get the pending airdrop for e.g. 0.0.789012,
Example usage:
1. Get the pending airdrops for account 0.0.789012:
  '{
    "accountId": "0.0.789012"
  }'
2. Get pending airdrops for the connected account:
   '{}'
`

    constructor(private hederaKit: HederaAgentKit) {
        super()
    }

    protected override async _call(input: any, _runManager?: CallbackManagerForToolRun, config?: ToolRunnableConfig): Promise<string> {
        try {
            const isCustodial = config?.configurable?.isCustodial === true;
            const executorAccountDetails: ExecutorAccountDetails = config?.configurable?.executorAccountDetails;

            console.log(`hedera_get_pending_airdrop tool has been called (${isCustodial ? 'custodial' : 'non-custodial'})`);

            const parsedInput = JSON.parse(input);

            const airdrop = await this.hederaKit.getPendingAirdrops(
              process.env.HEDERA_NETWORK_TYPE as HederaNetworkType,
              parsedInput.accountId,
              isCustodial,
              executorAccountDetails,
            );

            return JSON.stringify({
                status: "success",
                message: "Pending airdrop retrieved",
                airdrop: airdrop
            });
        } catch (error: any) {
            return JSON.stringify({
                status: "error",
                message: error.message,
                code: error.code || "UNKNOWN_ERROR",
            });
        }
    }
}