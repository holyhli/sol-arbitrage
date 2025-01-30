import pkg from '@meteora-ag/dlmm';
const { DLMM } = pkg;
import { PublicKey } from '@solana/web3.js';
import Decimal from 'decimal.js';
import dotenv from 'dotenv';

dotenv.config();

// Correct Meteora DLMM Program ID on mainnet
const METEORA_PROGRAM_ID = new PublicKey('LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo');

export class PoolAnalyzer {
    /**
     * @param {Connection} connection - Solana connection
     */
    constructor(connection) {
        this.connection = connection;
    }

    // Rest of the code remains the same...
    // (keeping all methods unchanged)