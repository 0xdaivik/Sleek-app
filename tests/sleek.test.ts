import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import {
    createAssociatedTokenAccountInstruction,
    createMint,
    getAccount,
    getAssociatedTokenAddress,
    mintTo,
    TOKEN_PROGRAM_ID
} from '@solana/spl-token';
import {
    Connection,
    Keypair,
    LAMPORTS_PER_SOL,
    PublicKey,
    sendAndConfirmTransaction,
    Transaction
} from '@solana/web3.js';
import { Sleek } from "../target/types/sleek";

describe("sleek", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Sleek as Program<Sleek>;
  const connection = new Connection("http://localhost:8899", "confirmed");

  // Test accounts
  let user: Keypair;
  let authority: Keypair;
  let bonkMint: PublicKey;
  let userBonkAccount: PublicKey;
  let authorityBonkAccount: PublicKey;

  beforeAll(async () => {
    // Create test keypairs
    user = Keypair.generate();
    authority = Keypair.generate();

    // Airdrop SOL to test accounts
    const airdropUser = await connection.requestAirdrop(user.publicKey, LAMPORTS_PER_SOL);
    const airdropAuthority = await connection.requestAirdrop(authority.publicKey, LAMPORTS_PER_SOL);
    
    await connection.confirmTransaction(airdropUser);
    await connection.confirmTransaction(airdropAuthority);

    // Create BONK mint for testing
    bonkMint = await createMint(
      connection,
      authority,
      authority.publicKey,
      null,
      9 // 9 decimals like BONK
    );

    // Create BONK token accounts
    userBonkAccount = await getAssociatedTokenAddress(bonkMint, user.publicKey);
    authorityBonkAccount = await getAssociatedTokenAddress(bonkMint, authority.publicKey);

    // Create user BONK account
    const createUserAtaIx = createAssociatedTokenAccountInstruction(
      user.publicKey,
      userBonkAccount,
      user.publicKey,
      bonkMint
    );

    const createAuthorityAtaIx = createAssociatedTokenAccountInstruction(
      authority.publicKey,
      authorityBonkAccount,
      authority.publicKey,
      bonkMint
    );

    const tx = new Transaction().add(createUserAtaIx, createAuthorityAtaIx);
    await sendAndConfirmTransaction(connection, tx, [user, authority]);

    // Mint some BONK to authority for testing
    await mintTo(
      connection,
      authority,
      bonkMint,
      authorityBonkAccount,
      authority,
      1000000000 // 1 billion BONK tokens
    );
  });

  it("Initializes the Sleek program", async () => {
    const [sleekStatePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("sleek_state")],
      program.programId
    );

    await program.methods
      .initialize()
      .accounts({
        sleekState: sleekStatePda,
        authority: authority.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([authority])
      .rpc();

    const sleekState = await program.account.sleekState.fetch(sleekStatePda);
    expect(sleekState.authority.toString()).toBe(authority.publicKey.toString());
    expect(sleekState.totalSubscriptions.toNumber()).toBe(0);
    expect(sleekState.totalPayments.toNumber()).toBe(0);
    expect(sleekState.totalCashbackMinted.toNumber()).toBe(0);
  });

  it("Processes subscription payment", async () => {
    const [sleekStatePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("sleek_state")],
      program.programId
    );

    const subscriptionId = 1;
    const amount = 59940; // $599.40 in cents
    const solAmount = 0.1 * LAMPORTS_PER_SOL; // 0.1 SOL

    // Derive PDAs
    const [paymentPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("payment"),
        user.publicKey.toBuffer(),
        new anchor.BN(0).toArrayLike(Buffer, "le", 8)
      ],
      program.programId
    );

    const [subscriptionPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("subscription"),
        user.publicKey.toBuffer(),
        new anchor.BN(subscriptionId).toArrayLike(Buffer, "le", 8)
      ],
      program.programId
    );

    await program.methods
      .processSubscriptionPayment(
        new anchor.BN(subscriptionId),
        new anchor.BN(amount),
        new anchor.BN(solAmount)
      )
      .accounts({
        payment: paymentPda,
        subscription: subscriptionPda,
        sleekState: sleekStatePda,
        user: user.publicKey,
        userTokenAccount: user.publicKey, // Native SOL account
        authorityTokenAccount: authority.publicKey, // Authority SOL account
        userBonkAccount: userBonkAccount,
        bonkMint: bonkMint,
        authority: authority.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([user])
      .rpc();

    // Verify payment was created
    const payment = await program.account.payment.fetch(paymentPda);
    expect(payment.user.toString()).toBe(user.publicKey.toString());
    expect(payment.subscriptionId.toNumber()).toBe(subscriptionId);
    expect(payment.amount.toNumber()).toBe(amount);
    expect(payment.solAmount.toNumber()).toBe(solAmount);
    expect(payment.status).toBe("Completed");

    // Verify subscription was created
    const subscription = await program.account.subscription.fetch(subscriptionPda);
    expect(subscription.user.toString()).toBe(user.publicKey.toString());
    expect(subscription.subscriptionId.toNumber()).toBe(subscriptionId);
    expect(subscription.amount.toNumber()).toBe(amount);
    expect(subscription.status).toBe("Active");

    // Verify cashback was minted (10% of amount)
    const userBonkBalance = await getAccount(connection, userBonkAccount);
    expect(userBonkBalance.amount).toBe(amount * 10 / 100); // 10% cashback

    // Verify global stats were updated
    const sleekState = await program.account.sleekState.fetch(sleekStatePda);
    expect(sleekState.totalPayments.toNumber()).toBe(1);
    expect(sleekState.totalSubscriptions.toNumber()).toBe(1);
    expect(sleekState.totalCashbackMinted.toNumber()).toBe(amount * 10 / 100);
  });

  it("Redeems BONK cashback", async () => {
    const redemptionAmount = 1000; // 1000 BONK tokens

    // Get initial balance
    const initialBalance = await getAccount(connection, userBonkAccount);

    // Derive redemption PDA
    const [redemptionPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("redemption"),
        user.publicKey.toBuffer(),
        new anchor.BN(Date.now() / 1000).toArrayLike(Buffer, "le", 8)
      ],
      program.programId
    );

    await program.methods
      .redeemCashback(new anchor.BN(redemptionAmount))
      .accounts({
        redemption: redemptionPda,
        user: user.publicKey,
        userBonkAccount: userBonkAccount,
        bonkMint: bonkMint,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([user])
      .rpc();

    // Verify redemption was created
    const redemption = await program.account.cashbackRedemption.fetch(redemptionPda);
    expect(redemption.user.toString()).toBe(user.publicKey.toString());
    expect(redemption.amount.toNumber()).toBe(redemptionAmount);

    // Verify BONK tokens were burned
    const finalBalance = await getAccount(connection, userBonkAccount);
    expect(finalBalance.amount).toBe(initialBalance.amount - redemptionAmount);
  });

  it("Cancels subscription", async () => {
    const subscriptionId = 1;

    // Derive subscription PDA
    const [subscriptionPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("subscription"),
        user.publicKey.toBuffer(),
        new anchor.BN(subscriptionId).toArrayLike(Buffer, "le", 8)
      ],
      program.programId
    );

    await program.methods
      .cancelSubscription()
      .accounts({
        subscription: subscriptionPda,
        user: user.publicKey,
      })
      .signers([user])
      .rpc();

    // Verify subscription was cancelled
    const subscription = await program.account.subscription.fetch(subscriptionPda);
    expect(subscription.status).toBe("Cancelled");
    expect(subscription.cancellationDate).toBeDefined();
  });

  it("Gets cashback balance", async () => {
    const balance = await program.methods
      .getCashbackBalance()
      .accounts({
        userBonkAccount: userBonkAccount,
      })
      .view();

    expect(balance.toNumber()).toBeGreaterThanOrEqual(0);
  });
}); 