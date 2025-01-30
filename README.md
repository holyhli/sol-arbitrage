# SOL-USDC Arbitrage Bot for Meteora DLMM

A sophisticated arbitrage bot designed to identify and execute profitable trading opportunities between SOL-USDC pools on Meteora's Dynamic Liquidity Market Maker (DLMM) protocol.

## Overview

This bot utilizes advanced algorithms to monitor multiple SOL-USDC pools on Meteora, analyzing their bin steps, liquidity distribution, and price differences to find arbitrage opportunities. It incorporates network condition monitoring and transaction simulation to ensure profitable and successful execution.

## Features

- Real-time pool analysis and monitoring
- Network-aware priority fee optimization
- Transaction simulation and validation
- Advanced LP optimization for route finding
- Risk management and profitability validation
- Configurable parameters and thresholds

## Project Structure

```
src/arbitrage/
  ├── index.js           # Main orchestrator
  ├── optimizer.js       # LP optimization implementation
  ├── poolAnalyzer.js    # Pool analysis and metrics
  ├── simulator.js       # Transaction simulation
  ├── networkMonitor.js  # Network conditions monitoring
  └── utils/
      ├── constants.js   # Configuration constants
      └── types.js       # TypeScript-like type definitions
```

### Module Description

1. **index.js (ArbitrageManager)**
    - Main entry point for arbitrage operations
    - Orchestrates pool analysis, optimization, and execution
    - Manages continuous monitoring and opportunity detection

2. **poolAnalyzer.js**
    - Analyzes SOL-USDC pools on Meteora
    - Calculates pool metrics (TVL, liquidity, fees)
    - Monitors active bins and liquidity distribution

3. **optimizer.js**
    - Implements Linear Programming optimization
    - Finds optimal arbitrage routes
    - Calculates expected profits and optimal trade sizes

4. **simulator.js**
    - Simulates arbitrage transactions
    - Validates routes and estimates gas costs
    - Verifies expected outputs

5. **networkMonitor.js**
    - Monitors Solana network conditions
    - Optimizes priority fees
    - Tracks network congestion and performance

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd sol-rebalancer
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables in .env:
```env
# Required Environment Variables
SOLANA_RPC_URL=           # Your Solana RPC URL
MONGODB_URI=              # MongoDB connection URI
PRIVATE_KEY=              # Base58 encoded private key or path to keypair.json
TELEGRAM_BOT_TOKEN=       # Telegram bot token for notifications
TELEGRAM_CHAT_ID=         # Telegram chat ID for notifications

# Optional Configuration
MIN_PROFIT_THRESHOLD=10   # Minimum profit threshold in USD
MAX_SLIPPAGE=0.005       # Maximum allowed slippage (0.5%)
CHECK_INTERVAL=1000      # Monitoring interval in milliseconds
```

## Usage

1. Start the arbitrage bot:
```bash
npm start
```

2. Monitor logs in console or configured notification channels.

## Configuration

Key parameters can be adjusted in `src/arbitrage/utils/constants.js`:

```javascript
export const ARBITRAGE_CONSTANTS = {
    MIN_PROFIT_THRESHOLD: 10,     // Minimum profit in USD
    MAX_SLIPPAGE: 0.005,         // Maximum slippage tolerance
    MIN_POOL_TVL: 10000,         // Minimum pool TVL in USD
    PROFIT_SAFETY_MARGIN: 0.8,    // 20% safety margin on profits
    // ... other constants
};
```

## Monitoring and Notifications

The bot provides several monitoring options:

1. Console logs for:
    - Found opportunities
    - Network conditions
    - Transaction status
    - Error reports

2. Telegram notifications for:
    - Profitable opportunities
    - Successful executions
    - Error alerts
    - Daily performance reports

## How It Works

1. **Pool Discovery and Analysis**
    - Continuously monitors SOL-USDC pools
    - Analyzes liquidity distribution in bins
    - Calculates effective prices and spreads

2. **Opportunity Detection**
    - Compares prices across pools
    - Considers fees and price impact
    - Validates profitability thresholds

3. **Route Optimization**
    - Uses LP optimization for route finding
    - Calculates optimal trade sizes
    - Considers network conditions

4. **Execution and Validation**
    - Simulates transactions before execution
    - Optimizes priority fees
    - Validates expected outputs

## Safety Features

1. **Transaction Simulation**
    - All routes are simulated before execution
    - Validates expected outputs
    - Estimates gas costs

2. **Network Monitoring**
    - Tracks network congestion
    - Optimizes priority fees
    - Avoids high congestion periods

3. **Risk Management**
    - Implements safety margins on profits
    - Validates liquidity availability
    - Monitors slippage thresholds

## Development

1. Running tests:
```bash
npm test
```

2. Running linter:
```bash
npm run lint
```

3. Building for production:
```bash
npm run build
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see LICENSE file for details