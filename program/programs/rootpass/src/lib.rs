use anchor_lang::prelude::*;

declare_id!("11111111111111111111111111111111");

/// RootPass on-chain program.
/// Stores a Merkle root per issuer. The full credential data lives off-chain.
#[program]
pub mod rootpass {
    use super::*;

    /// Initialize an issuer account on-chain.
    pub fn initialize_issuer(
        ctx: Context<InitializeIssuer>,
        issuer_id: String,
        name: String,
    ) -> Result<()> {
        let issuer = &mut ctx.accounts.issuer;
        issuer.authority  = ctx.accounts.authority.key();
        issuer.issuer_id  = issuer_id;
        issuer.name       = name;
        issuer.merkle_root = [0u8; 32];
        issuer.root_version = 0;
        issuer.created_at  = Clock::get()?.unix_timestamp;
        issuer.updated_at  = Clock::get()?.unix_timestamp;
        Ok(())
    }

    /// Update the Merkle root for an issuer.
    /// Only the issuer's authority may call this.
    pub fn update_merkle_root(
        ctx: Context<UpdateMerkleRoot>,
        new_root: [u8; 32],
    ) -> Result<()> {
        let issuer = &mut ctx.accounts.issuer;
        require!(
            issuer.authority == ctx.accounts.authority.key(),
            RootPassError::Unauthorized
        );
        issuer.merkle_root   = new_root;
        issuer.root_version += 1;
        issuer.updated_at    = Clock::get()?.unix_timestamp;
        emit!(RootUpdated {
            issuer_id:    issuer.issuer_id.clone(),
            root_version: issuer.root_version,
            updated_at:   issuer.updated_at,
        });
        Ok(())
    }
}

// ─── Accounts ─────────────────────────────────────────────────────────────────

#[derive(Accounts)]
#[instruction(issuer_id: String)]
pub struct InitializeIssuer<'info> {
    #[account(
        init,
        payer = authority,
        space = IssuerAccount::LEN,
        seeds = [b"issuer", issuer_id.as_bytes()],
        bump
    )]
    pub issuer: Account<'info, IssuerAccount>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateMerkleRoot<'info> {
    #[account(
        mut,
        seeds = [b"issuer", issuer.issuer_id.as_bytes()],
        bump
    )]
    pub issuer: Account<'info, IssuerAccount>,

    pub authority: Signer<'info>,
}

// ─── State ────────────────────────────────────────────────────────────────────

#[account]
pub struct IssuerAccount {
    pub authority:    Pubkey,   // 32
    pub issuer_id:    String,   // 4 + 64
    pub name:         String,   // 4 + 64
    pub merkle_root:  [u8; 32], // 32
    pub root_version: u64,      // 8
    pub created_at:   i64,      // 8
    pub updated_at:   i64,      // 8
}

impl IssuerAccount {
    pub const LEN: usize = 8 + 32 + (4 + 64) + (4 + 64) + 32 + 8 + 8 + 8;
}

// ─── Events ───────────────────────────────────────────────────────────────────

#[event]
pub struct RootUpdated {
    pub issuer_id:    String,
    pub root_version: u64,
    pub updated_at:   i64,
}

// ─── Errors ───────────────────────────────────────────────────────────────────

#[error_code]
pub enum RootPassError {
    #[msg("Only the issuer authority may update the Merkle root")]
    Unauthorized,
}
