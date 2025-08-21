import { z } from 'zod';
import { AgentMode, coreAccountPlugin, coreHTSPlugin, type Context } from 'hedera-agent-kit';
import { Client, AccountId, PrivateKey } from '@hashgraph/sdk';
import { coreQueriesPlugin, coreConsensusPlugin } from 'hedera-agent-kit';
import type { Configuration } from 'hedera-agent-kit';

export type AppMode = 'autonomous' | 'human';
export type HederaNetwork = 'testnet' | 'mainnet';

const EnvSchema = z.object({
    NEXT_PUBLIC_AGENT_MODE: z.enum(['autonomous', 'human']).default('human'),
    NEXT_PUBLIC_NETWORK: z.enum(['testnet', 'mainnet']).default('testnet'),
    // Server-only (optional for now; required for autonomous mode in 2.2)
    HEDERA_OPERATOR_ID: z.string().optional(),
    HEDERA_OPERATOR_KEY: z.string().optional(),
});

export type AgentEnv = z.infer<typeof EnvSchema>;

export const readAgentEnv = (): AgentEnv => {
    return EnvSchema.parse({
        NEXT_PUBLIC_AGENT_MODE: process.env.NEXT_PUBLIC_AGENT_MODE,
        NEXT_PUBLIC_NETWORK: process.env.NEXT_PUBLIC_NETWORK,
        HEDERA_OPERATOR_ID: process.env.HEDERA_OPERATOR_ID,
        HEDERA_OPERATOR_KEY: process.env.HEDERA_OPERATOR_KEY,
    });
};

const mapModeToAgentKit = (mode: AppMode): AgentMode => {
    return mode === 'human' ? AgentMode.RETURN_BYTES : AgentMode.AUTONOMOUS;
};

export type AgentBootstrap = {
    mode: AppMode;
    network: HederaNetwork;
    context: Context;
};

/**
 * Creates a minimal bootstrap object for wiring the Agent Kit.
 * - Does not instantiate a Hedera Client (done in 2.2)
 * - Contains a Context with the appropriate mode set
 */
export function createAgentBootstrap(): AgentBootstrap {
    const env = readAgentEnv();
    const mode: AppMode = env.NEXT_PUBLIC_AGENT_MODE;
    const network: HederaNetwork = env.NEXT_PUBLIC_NETWORK;

    const context: Context = {
        mode: mapModeToAgentKit(mode),
    };

    return { mode, network, context };
}

export function createHederaClient(bootstrap: AgentBootstrap): Client {
    const client = bootstrap.network === 'mainnet' ? Client.forMainnet() : Client.forTestnet();
    if (bootstrap.mode === 'autonomous') {
        const { HEDERA_OPERATOR_ID, HEDERA_OPERATOR_KEY } = readAgentEnv();
        if (!HEDERA_OPERATOR_ID || !HEDERA_OPERATOR_KEY) {
            throw new Error('HEDERA_OPERATOR_ID and HEDERA_OPERATOR_KEY are required in autonomous mode');
        }
        client.setOperator(
            AccountId.fromString(HEDERA_OPERATOR_ID),
            PrivateKey.fromStringECDSA(HEDERA_OPERATOR_KEY),
        );
    }
    return client;
}

export function createToolkitConfiguration(bootstrap: AgentBootstrap): Configuration {
    return {
        context: bootstrap.context,
        plugins: [coreQueriesPlugin, coreConsensusPlugin, coreHTSPlugin, coreAccountPlugin],
    };
}


