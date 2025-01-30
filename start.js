import { Connection, Keypair } from '@solana/web3.js';
import { ArbitrageManager } from './index.js';
import * as dotenv from 'dotenv';
import fs from 'fs';
import bs58 from 'bs58';

dotenv.config();

async function main() {
    try {
        // Load configuration
        const connection = new Connection(process.env.SOLANA_RPC_URL, {
            commitment: process.env.COMMITMENT_LEVEL || 'confirmed'
        });

        // Load keypair from JSON file
        const keypairData = JSON.parse(fs.readFileSync('keypair.json', 'utf-8'));
        const privateKeyBase58 = keypairData.privateKey;
        const privateKeyBytes = bs58.decode(privateKeyBase58);
        const keypair = Keypair.fromSecretKey(privateKeyBytes);

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