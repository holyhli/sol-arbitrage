import { ARBITRAGE_CONSTANTS } from './utils/constants.js';

export class ArbitrageOptimizer {
    /**
     * @param {import('./utils/types.js').PoolMetrics[]} poolMetrics
     * @param {import('./utils/types.js').NetworkConditions} networkConditions
     */
    constructor(poolMetrics, networkConditions) {
        this.poolMetrics = poolMetrics;
        this.networkConditions = networkConditions;
    }

    /**
     * Find optimal arbitrage route between pools
     * @returns {Promise<import('./utils/types.js').ArbitrageRoute | null>}
     */
    async findOptimalRoute() {
        let bestRoute = null;
        let maxProfit = 0;

        // Compare all pool pairs
        for (let i = 0; i < this.poolMetrics.length; i++) {
            for (let j = i + 1; j < this.poolMetrics.length; j++) {
                const pool1 = this.poolMetrics[i];
                const pool2 = this.poolMetrics[j];

                const priceDiff = Math.abs(pool1.price - pool2.price);
                if (priceDiff === 0) continue;

                // Calculate potential profit considering fees
                const tradingFees = this.calculateTradingFees(pool1, pool2);
                const networkFees = this.calculateNetworkFees();
                const totalFees = tradingFees + networkFees;

                // Estimate profit based on price difference
                const baseAmount = Math.min(
                    pool1.activeLiquidity.solAmount,
                    pool2.activeLiquidity.solAmount
                );
                const estimatedProfit = (priceDiff * baseAmount) - totalFees;

                if (estimatedProfit > maxProfit && estimatedProfit > ARBITRAGE_CONSTANTS.MIN_PROFIT_THRESHOLD) {
                    maxProfit = estimatedProfit;
                    bestRoute = {
                        pool1: pool1.address,
                        pool2: pool2.address,
                        expectedProfit: estimatedProfit,
                        fees: {
                            tradingFees,
                            networkFees
                        }
                    };
                }
            }
        }

        return bestRoute;
    }

    /**
     * Calculate trading fees for a route
     * @param {import('./utils/types.js').PoolMetrics} pool1
     * @param {import('./utils/types.js').PoolMetrics} pool2
     * @returns {number}
     */
    calculateTradingFees(pool1, pool2) {
        // Combined fees from both pools
        const pool1Fees = pool1.fees.baseFee + pool1.fees.hostFee;
        const pool2Fees = pool2.fees.baseFee + pool2.fees.hostFee;
        return pool1Fees + pool2Fees;
    }

    /**
     * Calculate network fees including priority fees
     * @returns {number}
     */
    calculateNetworkFees() {
        // Base network fee + priority fee based on congestion
        const baseFee = 5000; // Base fee in lamports
        return baseFee + this.networkConditions.recommendedPriorityFee;
    }
}