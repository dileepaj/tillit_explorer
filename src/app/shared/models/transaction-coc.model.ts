export interface ITransactionCoc {
    proofStatus: string;
    txnHash: string;
    txnUrl: string;
    identifier: string;
    blockchain: string;
    timestamp: Date;
    quantity: number;
    assetCode: string;    
    sender: string;
    receiver: string;
    senderSigned: boolean;
    receiverSigned: boolean;
    cocStatus: string;
    fee: string;
    sequence: string;
    inputData: string;  
    transferType: string;    
    availableProofs: string[];
    ledger: string;
    
    
}