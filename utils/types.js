/**
 * @typedef {Object} PoolMetrics
 * @property {string} address - Pool address
 * @property {number} binStep - Bin step size
 * @property {number} tvl - Total value locked in USD
 * @property {Object} activeLiquidity - Active liquidity in both tokens
 * @property {Object} fees - Pool fee structure
 * @property {number} price - Current pool price
 * @property {number} effectiveSpread - Effective spread including fees and bin step
 */

/**
 * @typedef {Object} NetworkConditions
 * @property {number} congestion - Network congestion level (0-1)
 * @property {number} recommendedPriorityFee - Recommended priority fee in lamports
 */

/**
 * @typedef {Object} ArbitrageRoute
 * @property {string} pool1 - First pool address
 * @property {string} pool2 - Second pool address
 * @property {number} expectedProfit - Expected profit in USD
 * @property {Object} fees - Combined fees for the arbitrage
 * @property {number} fees.tradingFees - Total trading fees
 * @property {number} fees.networkFees - Total network fees
 */

export const Types = {}; // Empty export to make it a module