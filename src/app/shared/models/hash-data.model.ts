export interface HashData {
    txnId: string;
    bcHash: string;
    dbHash: string;
    identifier: number;
    error: {
        code: number,
        message: string
    };
}
