import { Tool, ToolRunnableConfig } from "@langchain/core/tools";
import HederaAgentKit from "../../../agent";
import { CallbackManagerForToolRun } from "@langchain/core/callbacks/manager";
import { ExecutorAccountDetails } from "../../../types";

export class HederaCreateFungibleTokenTool extends Tool {
    name = 'hedera_create_fungible_token';

    description = `Create a fungible token on Hedera
Inputs (input is a JSON string):
name: string, the name of the token e.g. My Token,
symbol: string, the symbol of the token e.g. MT,
decimals: number, the amount of decimals of the token,
initialSupply: number, optional, the initial supply of the token, given in display unit, if not passed set to undefined
isSupplyKey: boolean, decides whether supply key should be set, false if not passed
isMetadataKey: boolean, decides whether metadata key should be set, false if not passed
isAdminKey: boolean, decides whether admin key should be set, false if not passed
memo: string, containing memo associated with this token, empty string if not passed
tokenMetadata: string, containing metadata associated with this token, empty string if not passed`;

    constructor(private hederaKit: HederaAgentKit) {
        super();
    }

    protected override async _call(input: any, _runManager?: CallbackManagerForToolRun, config?: ToolRunnableConfig): Promise<string> {
        try {
           const isCustodial = config?.configurable?.isCustodial === true;
           const executorAccountDetails: ExecutorAccountDetails = config?.configurable?.executorAccountDetails;

           console.log(`hedera_create_fungible_token tool has been called (${isCustodial ? 'custodial' : 'non-custodial'})`);

           const parsedInput = JSON.parse(input);
           const options = {
               name: parsedInput.name,
               symbol: parsedInput.symbol,
               decimals: parsedInput.decimals,
               initialSupply: parsedInput.initialSupply ? (parsedInput.initialSupply * Math.pow(10, parsedInput.decimals)) : undefined, // parsed to base unit
               isSupplyKey: parsedInput.isSupplyKey,
               isAdminKey: parsedInput.isAdminKey,
               isMetadataKey: parsedInput.isMetadataKey,
               memo: parsedInput.memo,
               tokenMetadata: new TextEncoder().encode(parsedInput.tokenMetadata), // encoding to Uint8Array
           }
           return await this.hederaKit
               .createFT(options, isCustodial, executorAccountDetails)
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
