export interface ITransactionGenesis {
        status: string;
        txnHash: string;
        txnUrl: string;
        txnLabUrl: string;
        identifier: string;
        timestamp: Date;
        blockchainName: string;
        transferType: string;
        sequence: string;
        publicKey: string;
        ledger: string;
        fee: string;
        availableProofs: string[];
        productId: string;
        productName: string;
}