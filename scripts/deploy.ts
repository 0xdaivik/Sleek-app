import { Connection, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import * as fs from 'fs';
import { SleekClient } from '../src/client/sleek-client';

// BONK token mint address (Devnet)
const BONK_MINT_DEVNET = 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263';

async function main() {
  console.log('🚀 Deploying Sleek Smart Contracts...');

  // Connect to Solana devnet
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  
  // Load wallet keypair
  const walletKeypair = Keypair.fromSecretKey(
    Buffer.from(JSON.parse(fs.readFileSync('~/.config/solana/id.json', 'utf-8')))
  );

  console.log('📡 Connected to Solana Devnet');
  console.log('👛 Wallet:', walletKeypair.publicKey.toString());

  // Check wallet balance
  const balance = await connection.getBalance(walletKeypair.publicKey);
  console.log('💰 Wallet Balance:', balance / LAMPORTS_PER_SOL, 'SOL');

  if (balance < LAMPORTS_PER_SOL) {
    console.log('⚠️  Low balance. Requesting airdrop...');
    const airdropSignature = await connection.requestAirdrop(
      walletKeypair.publicKey,
      LAMPORTS_PER_SOL
    );
    await connection.confirmTransaction(airdropSignature);
    console.log('✅ Airdrop received');
  }

  // Initialize Sleek client
  const sleekClient = new SleekClient(connection, walletKeypair, BONK_MINT_DEVNET);

  try {
    // Initialize the program
    console.log('🔧 Initializing Sleek program...');
    const initTx = await sleekClient.initialize();
    console.log('✅ Program initialized:', initTx);

    // Test subscription payment
    console.log('🧪 Testing subscription payment...');
    const paymentTx = await sleekClient.processSubscriptionPayment(
      1, // subscription ID
      59940, // amount in cents ($599.40)
      0.1 * LAMPORTS_PER_SOL // 0.1 SOL
    );
    console.log('✅ Payment processed:', paymentTx);

    // Test cashback redemption
    console.log('🎁 Testing cashback redemption...');
    const redemptionTx = await sleekClient.redeemCashback(1000); // 1000 BONK tokens
    console.log('✅ Cashback redeemed:', redemptionTx);

    // Get program stats
    console.log('📊 Getting program statistics...');
    const stats = await sleekClient.getProgramStats();
    console.log('📈 Program Stats:', stats);

    console.log('🎉 Deployment completed successfully!');
    
  } catch (error) {
    console.error('❌ Deployment failed:', error);
    throw error;
  }
}

main().catch(console.error); 