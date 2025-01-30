import Decimal from 'decimal.js';
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
     * Find optimal arbitrage route
     * @returns {Promise<import('./utils/types.js').ArbitrageRoute | null>}
     */
    async findOptimalRoute() {
        // Sort pools by price to find potential arbitrage opportunities
        const sortedPools = [...this.poolMetrics].sort((a, b) => a.price - b.price);

        let bestRoute = null;
        let maxProfit = new Decimal(0);

        // Compare each pool with others to find price differences
        for (let i = 0; i < sortedPools.length; i++) {
            for (let j = i + 1; j < sortedPools.length; j++) {
                const sourcePool = sortedPools[i];
                const destPool = sortedPools[j];

                // Skip if spread is too small
                const priceDiff = new Decimal(destPool.price).minus(sourcePool.price);
                const relativePriceDiff = priceDiff.div(sourcePool.price);

                if (relativePriceDiff.lt(this.getTotalFees(sourcePool, destPool))) {
                    continue;
                }

                // Find optimal amount for the arbitrage
                const route = await this.calculateOptimalTrade(sourcePool, destPool);

                if (route && route.expectedProfit.gt(maxProfit)) {
                    maxProfit = route.expectedProfit;
                    bestRoute = route;
                }
            }
        }

        if (!bestRoute || maxProfit.lt(ARBITRAGE_CONSTANTS.MIN_PROFIT_THRESHOLD)) {
            return null;
        }

        return this.adjustRouteForNetworkConditions(bestRoute);
    }

    /**
     * Calculate total fees for a route
     * @param {import('./utils/types.js').PoolMetrics} sourcePool
     * @param {import('./utils/types.js').PoolMetrics} destPool
     * @returns {Decimal} Total fees as decimal
     */
    getTotalFees(sourcePool, destPool) {
        const sourceFees = new Decimal(sourcePool.fees.baseFee)
            .plus(sourcePool.fees.volatilityFee || 0);
        const destFees = new Decimal(destPool.fees.baseFee)
            .plus(destPool.fees.volatilityFee || 0);

        return sourceFees.plus(destFees)
            .plus(ARBITRAGE_CONSTANTS.MAX_SLIPPAGE) // Add slippage tolerance
            .plus(this.networkConditions.recommendedPriorityFee); // Add network fees
    }

    /**
     * Calculate optimal trade amount and expected profit
     * @param {import('./utils/types.js').PoolMetrics} sourcePool
     * @param {import('./utils/types.js').PoolMetrics} destPool
     * @returns {Promise<Object | null>}
     */
    async calculateOptimalTrade(sourcePool, destPool) {
        try {
            // Use binary search to find optimal trade size
            let left = new Decimal(0.1); // Min trade size in SOL
            let right = new Decimal(Math.min(
                sourcePool.activeLiquidity.solAmount,
                destPool.activeLiquidity.solAmount
            )).div(1e9); // Convert from lamports to SOL

            let bestTrade = null;

            while (left.lt(right)) {
                const mid = left.plus(right).div(2);
                const trade = await this.simulateTrade(sourcePool, destPool, mid);

                if (!trade) {
                    right = mid;
                    continue;
                }

                if (trade.expectedProfit.gt(0)) {
                    bestTrade = trade;
                    // If profit is increasing, try larger size
                    left = mid.plus(new Decimal(0.01));
                } else {
                    right = mid;
                }
            }

            return bestTrade;
        } catch (error) {
            console.error('Error calculating optimal trade:', error);
            return null;
        }
    }

    /**
     * Simulate a trade and calculate expected profit
     * @param {import('./utils/types.js').PoolMetrics} sourcePool
     * @param {import('./utils/types.js').PoolMetrics} destPool
     * @param {Decimal} amount Amount in SOL
     * @returns {Promise<Object | null>}
     */
    async simulateTrade(sourcePool, destPool, amount) {
        try {
            const inputAmount = amount.mul(1e9).round(); // Convert to lamports

            // Calculate expected output considering price impact and fees
            const buyAmount = this.calculateExpectedOutput(
                sourcePool,
                inputAmount.toString(),
                true
            );

            const sellAmount = this.calculateExpectedOutput(
                destPool,
                buyAmount.toString(),
                false
            );

            const profit = sellAmount.minus(inputAmount);
            const profitInUSD = profit.mul(sourcePool.price).div(1e9);

            const totalFees = this.getTotalFees(sourcePool, destPool)
                .mul(inputAmount);

            const netProfit = profitInUSD.minus(totalFees);

            if (netProfit.lte(0)) {
                return null;
            }

            return {
                sourcePool: sourcePool.address,
                destinationPool: destPool.address,
                inputAmount: inputAmount.toString(),
                expectedOutput: sellAmount.toString(),
                expectedProfit: netProfit,
                fees: {
                    tradingFees: totalFees.toString(),
                    networkFees: this.networkConditions.recommendedPriorityFee.toString()
                }
            };
        } catch (error) {
            console.error('Error simulating trade:', error);
            return null;
        }
    }

    /**
     * Calculate expected output amount considering price impact
     * @param {import('./utils/types.js').PoolMetrics} pool
     * @param {string} inputAmount
     * @param {boolean} isBuy
     * @returns {Decimal}
     */
    calculateExpectedOutput(pool, inputAmount, isBuy) {
        const input = new Decimal(inputAmount);
        const price = new Decimal(pool.price);
        const liquidity = new Decimal(isBuy ?
            pool.activeLiquidity.solAmount :
            pool.activeLiquidity.usdcAmount
        );

        // Simple constant product formula with fees
        const k = liquidity.mul(liquidity);
        const fees = new Decimal(1).minus(pool.fees.baseFee);

        if (isBuy) {
            return input.mul(price).mul(fees);
        } else {
            return input.div(price).mul(fees);
        }
    }

    /**
     * Adjust route based on network conditions
     * @param {Object} route
     * @returns {import('./utils/types.js').ArbitrageRoute}
     */
    adjustRouteForNetworkConditions(route) {
        const { congestion } = this.networkConditions;

        // Adjust priority fee based on congestion
        const adjustedPriorityFee = new Decimal(this.networkConditions.recommendedPriorityFee)
            .mul(1 + congestion)
            .toNumber();

        // Determine execution strategy
        const strategy = congestion > 0.8 ? 'aggressive' :
                        congestion > 0.5 ? 'normal' : 'conservative';

        return {
            ...route,
            execution: {
                priorityFee: adjustedPriorityFee,
                strategy
            }
        };
    }
}