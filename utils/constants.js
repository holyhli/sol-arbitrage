export const ARBITRAGE_CONSTANTS = {
    // Minimum profit threshold in USD
    MIN_PROFIT_THRESHOLD: 10,
    
    // Maximum allowed slippage (0.5%)
    MAX_SLIPPAGE: 0.005,
    
    // Minimum pool TVL in USD
    MIN_POOL_TVL: 10000,
    
    // Safety margin for profit calculations (20%)
    PROFIT_SAFETY_MARGIN: 0.8,
    
    // Bin step ranges we're interested in
    BIN_STEPS: {
        LOW: [1, 2, 4], // Low volatility pools
        MEDIUM: [8, 16, 32], // Medium volatility pools
        HIGH: [64, 128, 256] // High volatility pools
    },
    
    // Tokens
    TOKENS: {
        SOL: {
            decimals: 9,
            symbol: 'SOL'
        },
        USDC: {
            decimals: 6,
            symbol: 'USDC'
        }
    },
    
    // Network constants
    NETWORK: {
        MAX_PRIORITY_FEE: 0.000001, // Maximum priority fee in SOL
        MIN_PRIORITY_FEE: 0.0000001, // Minimum priority fee in SOL
        PRIORITY_FEE_MULTIPLIER: 1.2, // Multiplier for priority fee (20% buffer)
        MAX_RETRIES: 3, // Maximum number of retries for failed transactions
        RETRY_DELAY: 1000 // Delay between retries in milliseconds
    }
};