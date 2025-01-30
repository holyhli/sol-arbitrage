import { Connection } from '@solana/web3.js';
import { ARBITRAGE_CONSTANTS } from './utils/constants.js';

export class NetworkMonitor {
    /**
     * @param {Connection} connection - Solana connection
     */
    constructor(connection) {
        this.connection = connection;
        this.recentPriorityFees = [];
        this.recentBlockTimes = [];
        this.lastBlockTime = Date.now();
    }

    /**
     * Get current network conditions
     * @returns {Promise<import('./utils/types.js').NetworkConditions>}
     */
    async getCurrentNetworkConditions() {
        const [load, priorityFee] = await Promise.all([
            this.getNetworkLoad(),
            this.getOptimalPriorityFee()
        ]);

        const blockTime = await this.getAverageBlockTime();
        const congestion = this.calculateNetworkCongestion(load, blockTime);

        return {
            load,
            recommendedPriorityFee: priorityFee,
            blockTime,
            congestion
        };
    }

    /**
     * Calculate network load based on recent block times and confirmations
     * @returns {Promise<number>} Network load (0-1)
     */
    async getNetworkLoad() {
        const slot = await this.connection.getSlot();
        const blockTime = await this.connection.getBlockTime(slot);
        const blockProduction = await this.connection.getRecentPerformanceSamples(5);

        if (!blockTime || !blockProduction.length) {
            return 0.5; // Default to medium load if data unavailable
        }

        // Calculate average block time from samples
        const avgBlockTime = blockProduction.reduce((sum, sample) =>
            sum + (sample.samplePeriodSecs / sample.numBlocks), 0) / blockProduction.length;

        // Network load increases as block time increases
        const normalizedBlockTime = Math.min(avgBlockTime / 0.4, 1); // 0.4s is ideal block time
        return normalizedBlockTime;
    }

    /**
     * Get optimal priority fee based on recent network activity
     * @returns {Promise<number>} Optimal priority fee in lamports
     */
    async getOptimalPriorityFee() {
        try {
            const feeInfo = await this.connection.getAddressLookupTable(
                this.connection.recentBlockhash
            ).catch(() => null);

            let basePriorityFee;
            if (feeInfo) {
                // Use network provided fee if available
                basePriorityFee = feeInfo.feeCalculator.lamportsPerSignature;
            } else {
                // Fallback to default range
                basePriorityFee = ARBITRAGE_CONSTANTS.NETWORK.MIN_PRIORITY_FEE;
            }

            // Add to recent fees history
            this.recentPriorityFees.push(basePriorityFee);
            if (this.recentPriorityFees.length > 10) {
                this.recentPriorityFees.shift();
            }

            // Calculate optimal fee with safety margin
            const avgFee = this.recentPriorityFees.reduce((a, b) => a + b, 0) /
                          this.recentPriorityFees.length;

            const optimalFee = avgFee * ARBITRAGE_CONSTANTS.NETWORK.PRIORITY_FEE_MULTIPLIER;

            // Ensure fee is within allowed range
            return Math.min(
                Math.max(optimalFee, ARBITRAGE_CONSTANTS.NETWORK.MIN_PRIORITY_FEE),
                ARBITRAGE_CONSTANTS.NETWORK.MAX_PRIORITY_FEE
            );
        } catch (error) {
            console.error('Error calculating priority fee:', error);
            return ARBITRAGE_CONSTANTS.NETWORK.MIN_PRIORITY_FEE;
        }
    }

    /**
     * Get average block time from recent blocks
     * @returns {Promise<number>} Average block time in milliseconds
     */
    async getAverageBlockTime() {
        const currentSlot = await this.connection.getSlot();
        const currentTime = await this.connection.getBlockTime(currentSlot);

        if (!currentTime) return 400; // Default to 400ms if data unavailable

        const timeDiff = (currentTime * 1000) - this.lastBlockTime;
        this.lastBlockTime = currentTime * 1000;

        this.recentBlockTimes.push(timeDiff);
        if (this.recentBlockTimes.length > 10) {
            this.recentBlockTimes.shift();
        }

        return this.recentBlockTimes.reduce((a, b) => a + b, 0) /
               this.recentBlockTimes.length;
    }

    /**
     * Calculate network congestion level
     * @param {number} load - Current network load
     * @param {number} blockTime - Current block time
     * @returns {number} Congestion level (0-1)
     */
    calculateNetworkCongestion(load, blockTime) {
        // Normalize block time (400ms is ideal)
        const blockTimeScore = Math.min(blockTime / 400, 2) - 1;

        // Combine load and block time factors
        return Math.min(Math.max((load + blockTimeScore) / 2, 0), 1);
    }
}