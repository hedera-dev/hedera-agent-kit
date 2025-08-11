import { ModelType } from '@elizaos/core';

export const generateResponse = async (data: any, toolName: string, runtime: any) => {
  const prompt = `
You are a summarization engine for outputs of Hedera SDK tools.

The current tool is: "${toolName}"

Your task is to extract only the most relevant, human-readable information from the following raw JSON data. Do not include any markdown, explanations, or field names that are not relevant to the user.

Use plain text. All identifiers (account IDs, transaction IDs, token IDs) should be formatted in Hedera-style, e.g., 0.0.123@1234567890.123456789.

Data:
${JSON.stringify(data, null, 2)}

-- Output Rules --
1. Include the following **whenever present**:
  - Transaction ID (with timestamp if available)
  - Token ID, Name, Type (fungible/NFT), Decimals, Supply, Set Fields
  - Account IDs involved
  - Message timestamps, sequence numbers, and **full message body**
  - Transfer amounts and target accounts
  - Topic ID and related metadata
  - Status: SUCCESS / FAILED / PENDING
  - Any base64-encoded message body: try to decode if possible, or show as-is

2. Do **not** show raw JSON keys or internal fields (e.g., 'consensusTimestampNanos', etc.)

3. If multiple items are returned (e.g., messages or balances), format each block separately but consistently.

4. Your output should be clean, readable, and minimal — just the useful details, nothing else.

Begin.
`;

  return await runtime.useModel(ModelType.TEXT_LARGE, { prompt });
};