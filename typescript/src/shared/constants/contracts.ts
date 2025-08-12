import { LedgerId } from '@hashgraph/sdk';

const ERC20_FACTORY_ADDRESS = '0.0.6471814';

// ERC20 Factory contract addresses for different networks
export const ERC20_FACTORY_ADDRESSES: Map<string, string> = new Map([
  [LedgerId.TESTNET.toString(), ERC20_FACTORY_ADDRESS], // Current testnet address
]);

// ERC20 Factory contract ABI
export const ERC20_FACTORY_ABI = [
  'function deployToken(string memory name_, string memory symbol_, uint8 decimals_, uint256 initialSupply_) external returns (address)',
];

export const ERC20_TRANSFER_FUNCTION_NAME = 'transfer';
export const ERC20_TRANSFER_FUNCTION_ABI = [
  'function transfer(address to, uint256 amount) external returns (bool)',
];

/**
 * Get the ERC20 factory contract address for the specified network
 * @param ledgerId - The Hedera network ledger ID
 * @returns The factory contract address for the network
 * @throws Error if the network is not supported
 */
export function getERC20FactoryAddress(ledgerId: LedgerId): string {
  const address = ERC20_FACTORY_ADDRESSES.get(ledgerId.toString());
  if (!address) {
    throw new Error(`Network type ${ledgerId} not supported for ERC20 factory`);
  }
  return address;
}
