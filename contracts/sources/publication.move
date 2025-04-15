module suitale::publication {
    use sui::object::{Self, UID, new};
    use sui::tx_context::{Self, TxContext, sender};
    use sui::transfer::{Self, transfer};
    use std::string::{Self, String, utf8};

    struct Tale has key, store {
        id: UID,
        blob_id: String,
        title: String,
        author: address,
    }

    public entry fun publish(blob_id: vector<u8>, title: vector<u8>, ctx: &mut TxContext) {
        let tale = Tale {
            id: new(ctx),
            blob_id: utf8(blob_id),
            title: utf8(title),
            author: sender(ctx),
        };
        transfer(tale, sender(ctx));
    }
}