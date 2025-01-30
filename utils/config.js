import { Keypair, Connection } from '@solana/web3.js';
import * as dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

export function loadKeypair() {
    const rawData = fs.readFileSync('keypair.json');
    const keypairData = JSON.parse(rawData);
    return Keypair.fromSecretKey(new Uint8Array(keypairData));
}

export function getConnection() {
    return new Connection(process.env.SOLANA_RPC_URL, {
        commitment: 'confirmed',
        confirmTransactionInitialTimeout: 60000,
    });
}

export const CONSTANTS = {
    PRIORITY_FEE: parseInt(process.env.PRIORITY_FEE || '100000'),
    MIN_PROFIT_THRESHOLD: parseFloat(process.env.MIN_PROFIT_THRESHOLD || '0.01'),
    PROFIT_SAFETY_MARGIN: parseFloat(process.env.PROFIT_SAFETY_MARGIN || '1.5'),
};