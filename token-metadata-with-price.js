const { 
  Connection, 
  Keypair, 
  PublicKey,
  Transaction,
  sendAndConfirmTransaction
} = require('@solana/web3.js');

const { 
  createCreateMetadataAccountV3Instruction,
  PROGRAM_ID 
} = require('@metaplex-foundation/mpl-token-metadata');

const MINT_ADDRESS = '3oQpCpqcXW8jFwr4EYSmYsrCMb1sPaC6sLMM8yRwswob';

async function main() {
  try {
    // Connection
    const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
    
    // Wallet
    const secretKey = new Uint8Array([
      21, 198, 86, 155, 213, 2, 72, 17, 239, 87, 118, 169, 61, 51, 167, 163,
      95, 237, 49, 70, 15, 17, 51, 231, 248, 164, 48, 194, 53, 58, 224, 138,
      59, 9, 251, 72, 149, 6, 31, 20, 220, 69, 226, 71, 86, 246, 95, 179,
      204, 71, 59, 180, 156, 158, 51, 46, 43, 232, 90, 28, 61, 81, 75, 203
    ]);
    const wallet = Keypair.fromSecretKey(secretKey);
    
    // Mint address
    const mintPubkey = new PublicKey(MINT_ADDRESS);

    // متادیتای جدید که شامل قیمت هم می‌شود
    const metadataContent = {
      name: "Tether USD",
      symbol: "USDT",
      description: "Tether USD (USDT) is a stablecoin pegged to the US Dollar",
      image: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.png",
      external_url: "https://tether.to",
      price: {
        value: 1.00,
        currency: "USD",
        last_updated: new Date().toISOString()
      },
      properties: {
        files: [
          {
            uri: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.png",
            type: "image/png"
          }
        ],
        category: "stablecoin"
      }
    };

    // Get metadata account address
    const [metadataAddress] = await PublicKey.findProgramAddress(
      [
        Buffer.from('metadata'),
        PROGRAM_ID.toBuffer(),
        mintPubkey.toBuffer(),
      ],
      PROGRAM_ID
    );

    // Create metadata
    const createMetadataInstruction = createCreateMetadataAccountV3Instruction(
      {
        metadata: metadataAddress,
        mint: mintPubkey,
        mintAuthority: wallet.publicKey,
        payer: wallet.publicKey,
        updateAuthority: wallet.publicKey,
      },
      {
        createMetadataAccountArgsV3: {
          data: {
            name: "Tether USD",
            symbol: "USDT",
            uri: "https://raw.githubusercontent.com/majid56312/solana-token-list/refs/heads/main/tether-usdt-metadata.json",
            sellerFeeBasisPoints: 0,
            creators: null,
            collection: null,
            uses: null
          },
          isMutable: true,
          collectionDetails: null
        },
      }
    );

    const transaction = new Transaction().add(createMetadataInstruction);
    
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = wallet.publicKey;
    
    const txid = await sendAndConfirmTransaction(
      connection,
      transaction,
      [wallet],
      { commitment: 'confirmed' }
    );

    console.log('Success! Transaction:', txid);
    console.log('Price information added to metadata');

  } catch (error) {
    console.error('Error:', error);
    if (error.logs) {
      console.error('Error logs:', error.logs);
    }
  }
}

main();
