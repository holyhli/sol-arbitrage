import { ArbitrageManager } from './index.js';
import { loadKeypair, getConnection } from './utils/config.js';

async function main() {
    try {
        const connection = getConnection();
        const keypair = loadKeypair();
        
        console.log('Starting arbitrage bot...');
        console.log('Wallet public key:', keypair.publicKey.toString());
        
        const arbitrageManager = new ArbitrageManager(connection, keypair);
        
        // Start monitoring with 1 second interval
        await arbitrageManager.startMonitoring(1000);
    } catch (error) {
        console.error('Error starting arbitrage bot:', error);
        process.exit(1);
    }
}

main();