import { Connection } from '@solana/web3.js';

export class NetworkMonitor {
    /**
     * @param {Connection} connection
     */
    constructor(connection) {
        this.connection = connection;
    }

    /**
     * Get current network conditions
     * @returns {Promise<import('./utils/types.js').NetworkConditions>}
     */
    async getCurrentNetworkConditions() {
        try {
            // Get recent performance samples
            const samples = await this.connection.getRecentPerformanceSamples(10);
            
            // Calculate average transactions per slot
            const avgTxPerSlot = samples.reduce((sum, sample) => 
                sum + sample.numTransactions / sample.numSlots, 0
            ) / samples.length;
            
            // Normalize to get congestion level (assuming 5000 tx/slot is high load)
            const congestion = Math.min(avgTxPerSlot / 5000, 1);
            
            // Calculate recommended priority fee based on congestion
            const basePriorityFee = parseInt(process.env.PRIORITY_FEE || '100000');
            const recommendedPriorityFee = Math.floor(
                basePriorityFee * (1 + congestion)
            );

            return {
                congestion,
                recommendedPriorityFee
            };
        } catch (error) {
            console.error('Error getting network conditions:', error);
            // Return default values if there's an error
            return {
                congestion: 0,
                recommendedPriorityFee: parseInt(process.env.PRIORITY_FEE || '100000')
            };
        }
    }
}