module suitale::publication {
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use std::string::{Self, String};

    struct Tale has key, store {
        id: UID,
        blob_id: String, // Blob ID из Walrus
        title: String,
        author: address,
    }

    public entry fun publish(blob_id: vector<u8>, title: vector<u8>, ctx: &mut TxContext) {
        let tale = Tale {
            id: object::new(ctx),
            blob_id: string::utf8(blob_id),
            title: string::utf8(title),
            author: tx_context::sender(ctx),
        };
        transfer::transfer(tale, tx_context::sender(ctx));
    }

    public entry fun update_title(tale: &mut Tale, new_title: vector<u8>, ctx: &mut TxContext) {
        assert!(tale.author == tx_context::sender(ctx), 0); // Только автор может обновить
        tale.title = string::utf8(new_title);
    }
}