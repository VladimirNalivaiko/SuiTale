import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { coinWithBalance, Transaction } from '@mysten/sui/transactions';
import { MIST_PER_SUI, parseStructTag } from '@mysten/sui/utils';
import { TESTNET_WALRUS_PACKAGE_CONFIG } from './constants';

export async function getFundedKeypair() {
    const suiClient = new SuiClient({
        url: getFullnodeUrl('testnet'),
    });

    const privateKey = process.env.SUI_PRIVATE_KEY;
    if (!privateKey) {
        throw new Error('SUI_PRIVATE_KEY not set in .env');
    }

    const keypair = Ed25519Keypair.fromSecretKey(privateKey);
    console.log('Sui Address:', keypair.toSuiAddress());

    const walBalance = await suiClient.getBalance({
        owner: keypair.toSuiAddress(),
        coinType: `0x8270feb7375eee355e64fdb69c50abb6b5f9393a722883c1cf45f8e26048810a::wal::WAL`,
    });
    console.log('WAL balance:', walBalance.totalBalance);

    if (Number(walBalance.totalBalance) < Number(MIST_PER_SUI) / 1000) {
        const tx = new Transaction();

        const exchange = await suiClient.getObject({
            id: TESTNET_WALRUS_PACKAGE_CONFIG.exchangeIds[0],
            options: { showType: true },
        });

        const exchangePackageId = parseStructTag(exchange.data?.type!).address;

        const wal = tx.moveCall({
            package: exchangePackageId,
            module: 'wal_exchange',
            function: 'exchange_all_for_wal',
            arguments: [
                tx.object(TESTNET_WALRUS_PACKAGE_CONFIG.exchangeIds[0]),
                coinWithBalance({
                    type: '0x2::sui::SUI',
                    balance: MIST_PER_SUI / 2n,
                }),
            ],
        });

        tx.transferObjects([wal], keypair.toSuiAddress());

        const result = await suiClient.signAndExecuteTransaction({
            transaction: tx,
            signer: keypair,
            options: { showEffects: true },
        });

        console.log('Exchange result:', result.effects);
    }

    return keypair;
}
