import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { getFaucetHost, requestSuiFromFaucetV0 } from '@mysten/sui/faucet';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { coinWithBalance, Transaction } from '@mysten/sui/transactions';
import { MIST_PER_SUI, parseStructTag } from '@mysten/sui/utils';
import { TESTNET_WALRUS_PACKAGE_CONFIG } from './constants';

export async function getFundedKeypair() {
    const suiClient = new SuiClient({
        url: getFullnodeUrl('testnet'),
    });

    let privateKey: string =
        process.env.SUI_PRIVATE_KEY ??
        (() => {
            throw new Error('Private key is missed');
        })();

    const keypair = Ed25519Keypair.fromSecretKey(privateKey);
    console.log(keypair.toSuiAddress());

    const balance = await suiClient.getBalance({
        owner: keypair.toSuiAddress(),
    });

    // if (BigInt(balance.totalBalance) < MIST_PER_SUI) {
    //     await requestSuiFromFaucetV0({
    //         host: getFaucetHost('testnet'),
    //         recipient: keypair.toSuiAddress(),
    //     });
    // }

    const walBalance = await suiClient.getBalance({
        owner: keypair.toSuiAddress(),
        coinType: `0x8270feb7375eee355e64fdb69c50abb6b5f9393a722883c1cf45f8e26048810a::wal::WAL`,
    });
    console.log('wal balance:', walBalance.totalBalance);

    // disable for now. replace 2000 with 2
    if (Number(walBalance.totalBalance) < Number(MIST_PER_SUI) / 2000) {
        const tx = new Transaction();

        const exchange = await suiClient.getObject({
            id: TESTNET_WALRUS_PACKAGE_CONFIG.exchangeIds[0],
            options: {
                showType: true,
            },
        });

        const exchangePackageId = parseStructTag(exchange.data?.type!).address;

        const wal = tx.moveCall({
            package: exchangePackageId,
            module: 'wal_exchange',
            function: 'exchange_all_for_wal',
            arguments: [
                tx.object(TESTNET_WALRUS_PACKAGE_CONFIG.exchangeIds[0]),
                coinWithBalance({
                    balance: MIST_PER_SUI / 2n,
                }),
            ],
        });

        tx.transferObjects([wal], keypair.toSuiAddress());

        const { digest } = await suiClient.signAndExecuteTransaction({
            transaction: tx,
            signer: keypair,
        });

        const { effects } = await suiClient.waitForTransaction({
            digest,
            options: {
                showEffects: true,
            },
        });

        console.log(effects);
    }

    return keypair;
}
