/**
 * @typedef {Object} PoolMetrics
 * @property {string} address - Pool address
 * @property {number} binStep - Pool bin step
 * @property {number} tvl - Total value locked in USD
 * @property {Object} activeLiquidity - Active liquidity in both tokens
 * @property {BigInt} activeLiquidity.solAmount - Active SOL liquidity
 * @property {BigInt} activeLiquidity.usdcAmount - Active USDC liquidity
 * @property {Object} fees - Fee information
 * @property {number} fees.baseFee - Base fee rate
 * @property {number} fees.volatilityFee - Variable fee rate
 * @property {number} price - Current pool price
 * @property {number} effectiveSpread - Effective spread including fees
 */

/**
 * @typedef {Object} NetworkConditions
 * @property {number} load - Current network load (0-1)
 * @property {number} recommendedPriorityFee - Recommended priority fee in SOL
 * @property {number} blockTime - Average block time in milliseconds
 * @property {number} congestion - Network congestion level (0-1)
 */

/**
 * @typedef {Object} ArbitrageRoute
 * @property {string} sourcePool - Source pool address
 * @property {string} destinationPool - Destination pool address
 * @property {BigInt} inputAmount - Input amount in lamports/base units
 * @property {BigInt} expectedOutput - Expected output amount
 * @property {number} expectedProfit - Expected profit in USD
 * @property {Object} fees - Fee breakdown
 * @property {number} fees.tradingFees - Combined trading fees
 * @property {number} fees.networkFees - Network fees including priority fee
 * @property {Object} execution - Execution parameters
 * @property {number} execution.priorityFee - Priority fee to use
 * @property {string} execution.strategy - Execution strategy to use
 */

// Export empty object since we're using JSDoc for types
export default {};