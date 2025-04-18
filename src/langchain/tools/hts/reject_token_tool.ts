import { Tool, ToolRunnableConfig } from "@langchain/core/tools";
import HederaAgentKit from "../../../agent";
import { TokenId } from "@hashgraph/sdk";
import { CallbackManagerForToolRun } from "@langchain/core/callbacks/manager";
import { ExecutorAccountDetails } from "../../../types";

export class HederaRejectTokenTool extends Tool {
    name = 'hedera_reject_token';

    description = `Reject a token from an account on Hedera
Inputs (input is a JSON string):
tokenId: string, the ID of the token to reject e.g. 0.0.123456,
Example usage:
1. Reject token 0.0.123456:
  '{
    "tokenId": "0.0.123456"
  }'
`;

    constructor(private hederaKit: HederaAgentKit) {
        super();
    }

    protected override async _call(input: any, _runManager?: CallbackManagerForToolRun, config?: ToolRunnableConfig): Promise<string> {
        try {
            const isCustodial = config?.configurable?.isCustodial === true;
            const executorAccountDetails: ExecutorAccountDetails = config?.configurable?.executorAccountDetails;

            console.log(`hedera_reject_token tool has been called (${isCustodial ? 'custodial' : 'non-custodial'})`);

            const parsedInput = JSON.parse(input);
            const tokenId = TokenId.fromString(parsedInput.tokenId);
            return this.hederaKit
                .rejectToken(tokenId, isCustodial, executorAccountDetails)
                .then(response => response.getStringifiedResponse());

        } catch (error: any) {
            return JSON.stringify({
                status: "error",
                message: error.message,
                code: error.code || "UNKNOWN_ERROR",
            });
        }
    }
}
