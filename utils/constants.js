export const ARBITRAGE_CONSTANTS = {
    MIN_POOL_TVL: 1000, // Minimum TVL in USD for a pool to be considered
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
    PROFIT_SAFETY_MARGIN: 1.5, // 50% safety margin on expected profits
    MIN_PROFIT_THRESHOLD: 0.01 // Minimum profit in USD to execute trade
};