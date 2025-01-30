import { DLMM } from '@meteora-ag/dlmm';
import { getProgramId } from '@meteora-ag/dlmm/dist/utils';
import { Connection, PublicKey } from '@solana/web3.js';
import Decimal from 'decimal.js';
import { ARBITRAGE_CONSTANTS } from './utils/constants.js';

export class PoolAnalyzer {
    /**
     * @param {Connection} connection - Solana connection
     * @param {PublicKey[]} pools - Array of pool addresses
     */
    constructor(connection) {
        this.connection = connection;
    }

    /**
     * Find all SOL-USDC pools on Meteora
     * @returns {Promise<PublicKey[]>} Array of pool addresses
     */
    async findSolUsdcPools() {
        const programId = getProgramId();
        // Get all program accounts and filter for SOL-USDC pairs
        const accounts = await this.connection.getProgramAccounts(programId, {
            filters: [
                // Add specific filters for SOL-USDC pairs
                // This would depend on Meteora's account structure
            ]
        });

        return accounts.map(acc => acc.pubkey);
    }

    /**
     * Analyze specific pool metrics
     * @param {DLMM} dlmm - DLMM instance
     * @returns {Promise<import('./utils/types.js').PoolMetrics>}
     */
    async analyzePool(dlmm) {
        try {
            const binStep = dlmm.lbPair.binStep;
            const { baseFeeRate, hostFeeRate } = await dlmm.getFeeInfo();
            const activeBins = await dlmm.getActiveBins();

            // Calculate active liquidity
            const activeLiquidity = this.calculateActiveLiquidity(activeBins);

            // Get current price from weighted average of active bins
            const price = this.calculateWeightedPrice(activeBins);

            // Calculate TVL
            const tvl = this.calculateTVL(activeLiquidity, price);

            // Skip pools with insufficient TVL
            if (tvl < ARBITRAGE_CONSTANTS.MIN_POOL_TVL) {
                return null;
            }

            return {
                address: dlmm.lbPair.address.toString(),
                binStep,
                tvl,
                activeLiquidity,
                fees: {
                    baseFee: Number(baseFeeRate),
                    hostFee: Number(hostFeeRate)
                },
                price,
                effectiveSpread: this.calculateEffectiveSpread(baseFeeRate, binStep)
            };
        } catch (error) {
            console.error(`Error analyzing pool ${dlmm.lbPair.address}:`, error);
            return null;
        }
    }

    /**
     * Calculate active liquidity from bins
     * @param {any[]} activeBins - Array of active bin data
     * @returns {Object} Active liquidity in both tokens
     */
    calculateActiveLiquidity(activeBins) {
        return activeBins.reduce((acc, bin) => {
            acc.solAmount += BigInt(bin.amountX);
            acc.usdcAmount += BigInt(bin.amountY);
            return acc;
        }, { solAmount: 0n, usdcAmount: 0n });
    }

    /**
     * Calculate weighted average price from active bins
     * @param {any[]} activeBins - Array of active bin data
     * @returns {number} Weighted average price
     */
    calculateWeightedPrice(activeBins) {
        let totalWeight = new Decimal(0);
        let weightedSum = new Decimal(0);

        for (const bin of activeBins) {
            const binLiquidity = new Decimal(bin.amountY.toString())
                .div(new Decimal(10 ** ARBITRAGE_CONSTANTS.TOKENS.USDC.decimals));
            const binPrice = new Decimal(bin.price.toString());

            weightedSum = weightedSum.plus(binPrice.times(binLiquidity));
            totalWeight = totalWeight.plus(binLiquidity);
        }

        return totalWeight.isZero() ? 0 : weightedSum.div(totalWeight).toNumber();
    }

    /**
     * Calculate pool TVL in USD
     * @param {Object} activeLiquidity - Active liquidity amounts
     * @param {number} price - Current SOL price
     * @returns {number} TVL in USD
     */
    calculateTVL(activeLiquidity, price) {
        const solValue = new Decimal(activeLiquidity.solAmount.toString())
            .div(10 ** ARBITRAGE_CONSTANTS.TOKENS.SOL.decimals)
            .times(price);

        const usdcValue = new Decimal(activeLiquidity.usdcAmount.toString())
            .div(10 ** ARBITRAGE_CONSTANTS.TOKENS.USDC.decimals);

        return solValue.plus(usdcValue).toNumber();
    }

    /**
     * Calculate effective spread based on fees and bin step
     * @param {number} baseFee - Base fee rate
     * @param {number} binStep - Bin step
     * @returns {number} Effective spread
     */
    calculateEffectiveSpread(baseFee, binStep) {
        // Effective spread combines base fee and bin step impact
        return Number(baseFee) + (binStep / 10000); // Simplified approximation
    }

    /**
     * Analyze all SOL-USDC pools
     * @returns {Promise<import('./utils/types.js').PoolMetrics[]>}
     */
    async analyzePools() {
        const pools = await this.findSolUsdcPools();
        const poolMetrics = [];

        for (const poolAddress of pools) {
            try {
                const dlmm = await DLMM.create(this.connection, poolAddress);
                const metrics = await this.analyzePool(dlmm);

                if (metrics) {
                    poolMetrics.push(metrics);
                }
            } catch (error) {
                console.error(`Error analyzing pool ${poolAddress}:`, error);
                continue;
            }
        }

        return poolMetrics;
    }
}