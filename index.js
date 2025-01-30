import { Connection, Keypair } from '@solana/web3.js';
import pkg from '@meteora-ag/dlmm';
const { DLMM } = pkg;
import { PoolAnalyzer } from './poolAnalyzer.js';
import { NetworkMonitor } from './networkMonitor.js';
import { ArbitrageOptimizer } from './optimizer.js';
import { ArbitrageSimulator } from './simulator.js';
import { ARBITRAGE_CONSTANTS } from './utils/constants.js';

export class ArbitrageManager {
    /**
     * @param {Connection} connection
     * @param {Keypair} keypair
     */
    constructor(connection, keypair) {
        this.connection = connection;
        this.keypair = keypair;
        this.poolAnalyzer = new PoolAnalyzer(connection);
        this.networkMonitor = new NetworkMonitor(connection);
        this.simulator = new ArbitrageSimulator(connection, keypair);
    }

    /**
     * Find and validate arbitrage opportunities
     * @returns {Promise<import('./utils/types.js').ArbitrageRoute | null>}
     */
    async findArbitrageOpportunities() {
        try {
            // Get current network conditions
            const networkConditions = await this.networkMonitor.getCurrentNetworkConditions();

            // Skip if network is too congested
            if (networkConditions.congestion > 0.9) {
                console.log('Network too congested, skipping arbitrage search');
                return null;
            }

            // Analyze pools
            const poolMetrics = await this.poolAnalyzer.analyzePools();

            if (poolMetrics.length < 2) {
                console.log('Not enough pools for arbitrage');
                return null;
            }

            // Initialize optimizer with current data
            const optimizer = new ArbitrageOptimizer(poolMetrics, networkConditions);

            // Find optimal arbitrage route
            const route = await optimizer.findOptimalRoute();

            if (!route) {
                return null;
            }

            // Validate route with simulation
            const isValid = await this.simulator.validateRoute(route);

            if (!isValid) {
                console.log('Route validation failed');
                return null;
            }

            // Final profitability check
            if (this.isRouteProfitable(route, networkConditions)) {
                return route;
            }

            return null;
        } catch (error) {
            console.error('Error finding arbitrage opportunities:', error);
            return null;
        }
    }

    /**
     * Check if route is profitable after all costs
     * @param {import('./utils/types.js').ArbitrageRoute} route
     * @param {import('./utils/types.js').NetworkConditions} networkConditions
     * @returns {boolean}
     */
    isRouteProfitable(route, networkConditions) {
        const expectedProfit = parseFloat(route.expectedProfit);
        const tradingFees = parseFloat(route.fees.tradingFees);
        const networkFees = parseFloat(route.fees.networkFees);
        const priorityFee = networkConditions.recommendedPriorityFee;

        // Calculate total cost including network fees
        const totalCost = tradingFees + networkFees + priorityFee;

        // Apply safety margin
        const profitWithMargin = expectedProfit * ARBITRAGE_CONSTANTS.PROFIT_SAFETY_MARGIN;

        return (
            profitWithMargin > totalCost &&
            profitWithMargin > ARBITRAGE_CONSTANTS.MIN_PROFIT_THRESHOLD
        );
    }

    /**
     * Start monitoring for arbitrage opportunities
     * @param {number} interval - Check interval in milliseconds
     */
    async startMonitoring(interval = 1000) {
        console.log('Starting arbitrage monitoring...');
        console.log('Using wallet:', this.keypair.publicKey.toString());

        while (true) {
            try {
                const opportunity = await this.findArbitrageOpportunities();

                if (opportunity) {
                    console.log('Arbitrage opportunity found:', opportunity);
                    // Here you would execute the trade
                } else {
                    console.log('No profitable opportunities found');
                }

                // Wait for next interval
                await new Promise(resolve => setTimeout(resolve, interval));
            } catch (error) {
                console.error('Error in arbitrage monitoring:', error);
                // Wait before retrying
                await new Promise(resolve => setTimeout(resolve, interval * 2));
            }
        }
    }
}