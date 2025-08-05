import { AgentMode, Context } from 'hedera-agent-kit';
import { Client, ContractId } from '@hashgraph/sdk';
import {
  MJClient,
  createAdapter,
  NativeAdapter,
  getChain,
  CONTRACT_DEPLOYMENTS,
} from '@buidlerlabs/memejob-sdk-js';

/**
 * Supported Memejob network types.
 */
type MemejobNetwork = 'mainnet' | 'testnet';

/**
 * Singleton instance of the Memejob client to avoid multiple initializations.
 */
let memejob: MJClient;

/**
 * Creates and configures a Memejob client instance for interacting with the memejob platform.
 * @returns A configured MJClient instance ready for any supported platform operations
 */
export const createMemejob = (client: Client, context: Context) => {
  if (!memejob) {
    const network = client.ledgerId?.toString() as MemejobNetwork;
    const operationalMode = context.mode === AgentMode.AUTONOMOUS ? 'returnResult' : 'returnBytes';

    memejob = new MJClient(
      createAdapter(NativeAdapter, {
        hederaClient: client,
        operationalMode,
      }),
      {
        chain: getChain(network),
        contractId: ContractId.fromString(CONTRACT_DEPLOYMENTS[network].contractId),
      },
    );
  }

  return memejob;
};
