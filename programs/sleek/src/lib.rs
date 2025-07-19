use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod sleek {
    use super::*;

    /// Initialize the Sleek program
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let sleek_state = &mut ctx.accounts.sleek_state;
        sleek_state.authority = ctx.accounts.authority.key();
        sleek_state.bump = *ctx.bumps.get("sleek_state").unwrap();
        sleek_state.total_subscriptions = 0;
        sleek_state.total_payments = 0;
        sleek_state.total_cashback_minted = 0;
        Ok(())
    }

    /// Process subscription payment
    pub fn process_subscription_payment(
        ctx: Context<ProcessPayment>,
        subscription_id: u64,
        amount: u64,
        sol_amount: u64,
    ) -> Result<()> {
        let payment = &mut ctx.accounts.payment;
        let sleek_state = &mut ctx.accounts.sleek_state;
        
        // Set payment details
        payment.user = ctx.accounts.user.key();
        payment.subscription_id = subscription_id;
        payment.amount = amount;
        payment.sol_amount = sol_amount;
        payment.status = PaymentStatus::Completed;
        payment.timestamp = Clock::get()?.unix_timestamp;
        payment.bump = *ctx.bumps.get("payment").unwrap();

        // Transfer SOL from user to authority
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.user_token_account.to_account_info(),
                to: ctx.accounts.authority_token_account.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            },
        );
        token::transfer(transfer_ctx, sol_amount)?;

        // Calculate and mint cashback (10% of payment)
        let cashback_amount = amount * 10 / 100; // 10% cashback
        
        // Mint BONK tokens to user
        let mint_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            token::MintTo {
                mint: ctx.accounts.bonk_mint.to_account_info(),
                to: ctx.accounts.user_bonk_account.to_account_info(),
                authority: ctx.accounts.authority.to_account_info(),
            },
        );
        token::mint_to(mint_ctx, cashback_amount)?;

        // Update global stats
        sleek_state.total_payments += 1;
        sleek_state.total_cashback_minted += cashback_amount;

        // Create subscription NFT
        let subscription = &mut ctx.accounts.subscription;
        subscription.user = ctx.accounts.user.key();
        subscription.subscription_id = subscription_id;
        subscription.amount = amount;
        subscription.status = SubscriptionStatus::Active;
        subscription.activation_date = Clock::get()?.unix_timestamp;
        subscription.expiration_date = Clock::get()?.unix_timestamp + (30 * 24 * 60 * 60); // 30 days
        subscription.bump = *ctx.bumps.get("subscription").unwrap();

        sleek_state.total_subscriptions += 1;

        emit!(PaymentProcessed {
            user: ctx.accounts.user.key(),
            subscription_id,
            amount,
            cashback_amount,
        });

        Ok(())
    }

    /// Redeem BONK cashback
    pub fn redeem_cashback(
        ctx: Context<RedeemCashback>,
        amount: u64,
    ) -> Result<()> {
        let redemption = &mut ctx.accounts.redemption;
        
        // Set redemption details
        redemption.user = ctx.accounts.user.key();
        redemption.amount = amount;
        redemption.timestamp = Clock::get()?.unix_timestamp;
        redemption.bump = *ctx.bumps.get("redemption").unwrap();

        // Burn BONK tokens from user
        let burn_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            token::Burn {
                mint: ctx.accounts.bonk_mint.to_account_info(),
                from: ctx.accounts.user_bonk_account.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            },
        );
        token::burn(burn_ctx, amount)?;

        emit!(CashbackRedeemed {
            user: ctx.accounts.user.key(),
            amount,
        });

        Ok(())
    }

    /// Cancel subscription
    pub fn cancel_subscription(
        ctx: Context<CancelSubscription>,
    ) -> Result<()> {
        let subscription = &mut ctx.accounts.subscription;
        
        require!(
            subscription.user == ctx.accounts.user.key(),
            SleekError::Unauthorized
        );
        
        require!(
            subscription.status == SubscriptionStatus::Active,
            SleekError::SubscriptionNotActive
        );

        subscription.status = SubscriptionStatus::Cancelled;
        subscription.cancellation_date = Clock::get()?.unix_timestamp;

        emit!(SubscriptionCancelled {
            user: ctx.accounts.user.key(),
            subscription_id: subscription.subscription_id,
        });

        Ok(())
    }

    /// Get user's cashback balance
    pub fn get_cashback_balance(ctx: Context<GetCashbackBalance>) -> Result<u64> {
        let user_bonk_account = &ctx.accounts.user_bonk_account;
        Ok(user_bonk_account.amount)
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + SleekState::INIT_SPACE,
        seeds = [b"sleek_state"],
        bump
    )]
    pub sleek_state: Account<'info, SleekState>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ProcessPayment<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + Payment::INIT_SPACE,
        seeds = [b"payment", user.key().as_ref(), &sleek_state.total_payments.to_le_bytes()],
        bump
    )]
    pub payment: Account<'info, Payment>,
    
    #[account(
        init,
        payer = user,
        space = 8 + Subscription::INIT_SPACE,
        seeds = [b"subscription", user.key().as_ref(), &subscription_id.to_le_bytes()],
        bump
    )]
    pub subscription: Account<'info, Subscription>,
    
    #[account(
        mut,
        seeds = [b"sleek_state"],
        bump = sleek_state.bump
    )]
    pub sleek_state: Account<'info, SleekState>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub authority_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub user_bonk_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub bonk_mint: Account<'info, Mint>,
    
    pub authority: Signer<'info>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RedeemCashback<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + CashbackRedemption::INIT_SPACE,
        seeds = [b"redemption", user.key().as_ref(), &Clock::get()?.unix_timestamp.to_le_bytes()],
        bump
    )]
    pub redemption: Account<'info, CashbackRedemption>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(mut)]
    pub user_bonk_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub bonk_mint: Account<'info, Mint>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CancelSubscription<'info> {
    #[account(
        mut,
        seeds = [b"subscription", user.key().as_ref(), &subscription.subscription_id.to_le_bytes()],
        bump = subscription.bump
    )]
    pub subscription: Account<'info, Subscription>,
    
    pub user: Signer<'info>,
}

#[derive(Accounts)]
pub struct GetCashbackBalance<'info> {
    #[account(mut)]
    pub user_bonk_account: Account<'info, TokenAccount>,
}

#[account]
#[derive(InitSpace)]
pub struct SleekState {
    pub authority: Pubkey,
    pub bump: u8,
    pub total_subscriptions: u64,
    pub total_payments: u64,
    pub total_cashback_minted: u64,
}

#[account]
#[derive(InitSpace)]
pub struct Payment {
    pub user: Pubkey,
    pub subscription_id: u64,
    pub amount: u64,
    pub sol_amount: u64,
    pub status: PaymentStatus,
    pub timestamp: i64,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Subscription {
    pub user: Pubkey,
    pub subscription_id: u64,
    pub amount: u64,
    pub status: SubscriptionStatus,
    pub activation_date: i64,
    pub expiration_date: i64,
    pub cancellation_date: Option<i64>,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct CashbackRedemption {
    pub user: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum PaymentStatus {
    Pending,
    Completed,
    Failed,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum SubscriptionStatus {
    Active,
    Expired,
    Cancelled,
}

#[event]
pub struct PaymentProcessed {
    pub user: Pubkey,
    pub subscription_id: u64,
    pub amount: u64,
    pub cashback_amount: u64,
}

#[event]
pub struct CashbackRedeemed {
    pub user: Pubkey,
    pub amount: u64,
}

#[event]
pub struct SubscriptionCancelled {
    pub user: Pubkey,
    pub subscription_id: u64,
}

#[error_code]
pub enum SleekError {
    #[msg("Unauthorized access")]
    Unauthorized,
    #[msg("Subscription is not active")]
    SubscriptionNotActive,
    #[msg("Insufficient balance")]
    InsufficientBalance,
} 