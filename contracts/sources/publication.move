module suitale::publication {
    use sui::object::{Self, UID, ID, new};
    use sui::tx_context::{TxContext, sender};
    use sui::transfer::{public_transfer, transfer as sui_transfer};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI; // Import SUI type for coin operations
    use std::string::{String, utf8};

    // Error codes
    const EMaximumCapacityReached: u64 = 1;
    const EIncorrectPaymentAmount: u64 = 2;
    const EPlatformFeeExceedsPrice: u64 = 3;

    /// Represents the template or master copy of a Tale, from which editions can be minted.
    struct Tale has key, store {
        id: UID,
        blob_id: String,            // Identifier for content in Walrus (Walrus)
        title: String,
        author: address,            // Original creator of the tale content
        description: String,
        cover_image_url: String,    // URL for the cover image (e.g., Walrus URL)
        
        mint_price: u64,            // Total price a user pays to mint an edition (in MIST)
        mint_capacity: u64,         // Maximum number of editions that can be minted
        minted_count: u64,          // How many editions have been minted so far
        
        author_mint_beneficiary: address, // Address that receives the author's share from minting
        
        royalty_fee_bps: u16,       // Royalty fee in basis points (0-10000) for secondary sales
        royalty_beneficiary: address // Address that receives royalties
    }

    /// Represents a minted edition of a Tale (NFT).
    struct TaleEditionNFT has key, store {
        id: UID,
        name: String,               // Name of the NFT (e.g., "Tale Title - Edition #1")
        description: String,        // Description (can be taken from Tale.description)
        url: String,                // Link to the image (can be taken from Tale.cover_image_url)
        
        original_tale_id: ID,       // ID of the master Tale object
        edition_number: u64,        // Edition number of this NFT
        // TODO: Add Display object for Sui Kiosk compatibility
    }

    /// Publishes a new Tale template, making it available for minting editions.
    public entry fun publish_tale_template(
        blob_id: vector<u8>,
        title: vector<u8>,
        description: vector<u8>,
        cover_image_url: vector<u8>,
        mint_price: u64,
        mint_capacity: u64,
        author_mint_beneficiary: address, // Can be the same as sender(ctx) or different
        royalty_fee_bps: u16,
        royalty_beneficiary: address,   // Usually the author or author_mint_beneficiary
        ctx: &mut TxContext
    ) {
        let tale_author = sender(ctx);
        sui_transfer(
            Tale {
                id: new(ctx),
                blob_id: utf8(blob_id),
                title: utf8(title),
                author: tale_author,
                description: utf8(description),
                cover_image_url: utf8(cover_image_url),
                mint_price: mint_price,
                mint_capacity: mint_capacity,
                minted_count: 0, // Starts at 0
                author_mint_beneficiary: author_mint_beneficiary,
                royalty_fee_bps: royalty_fee_bps,
                royalty_beneficiary: royalty_beneficiary,
            },
            tale_author
        );
    }

    /// Mints a new edition (NFT) of an existing Tale.
    public entry fun mint_tale_edition(
        tale: &mut Tale,                // Reference to the master Tale object
        platform_fee: u64,              // Platform's cut from the mint_price (in MIST)
        platform_wallet_address: address, // Address where platform fee is sent
        payment: Coin<SUI>,             // Payment from the user (must equal tale.mint_price)
        ctx: &mut TxContext
    ) {
        assert!(tale.minted_count < tale.mint_capacity, EMaximumCapacityReached);
        assert!(coin::value(&payment) == tale.mint_price, EIncorrectPaymentAmount);

        let author_share = tale.mint_price - platform_fee;
        assert!(author_share >= 0, EPlatformFeeExceedsPrice); // platform_fee cannot be > mint_price

        // Increment minted count first
        tale.minted_count = tale.minted_count + 1;

        // Pay platform fee
        let platform_payment_coin = coin::split(&mut payment, platform_fee, ctx);
        public_transfer(platform_payment_coin, platform_wallet_address);
        
        // Pay author's share (the remainder of the payment coin)
        public_transfer(payment, tale.author_mint_beneficiary);

        // Create the TaleEditionNFT
        // let edition_name = tale.title; // Basic name, can be improved
        // TODO: append edition number to name, e.g., using std::format or similar if available/simple
        // For now, keeping it simple. Frontend can construct a more detailed name for display if needed.

        sui_transfer(
            TaleEditionNFT {
                id: new(ctx),
                name: tale.title, // For a real app, you'd likely want "Title - Edition #N"
                description: tale.description,
                url: tale.cover_image_url,
                original_tale_id: object::id(tale),
                edition_number: tale.minted_count, // Current minted_count is the edition number
            },
            sender(ctx) // Transfer the NFT to the minter
        );
    }
    
    // TODO: Function to create and publish Display object for TaleEditionNFT
    // TODO: Getter functions for Tale fields if needed by off-chain services (e.g., get_tale_details(id: ID))
}