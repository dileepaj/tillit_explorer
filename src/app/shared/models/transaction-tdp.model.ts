export interface ITransactionTDP {
    status: string;
    txnHash: string;
    txnUrl: string;
    identifier: string;
    timestamp: Date;
    blockchain: string;
    transferType: string;
    sequence: string;
    publickKey: string;
    ledger: string;
    fee: string;
    dbHash: string;
    bcHash: string;
    tdpId: string;
    productId: string;
    productName: string;
    stageId: string;
    images: string[];
    availableProofs: string[]; 
}