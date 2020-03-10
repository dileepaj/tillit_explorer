export const environment = {
  production: true,

  // Backend API services and Authorization codes
  backend: {
    backendAuth: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb21wYW55IjoiU2FhcmFrZXRoYSBIb2xkaW5ncyIsInVzZXJuYW1lIjoibXV0aHVtaW5pZEA5OXgubGsiLCJsb2NhbGUiOiJTcmkgTGFua2EiLCJwZXJtaXNzaW9ucyI6eyIwIjpbIjciLCI4IiwiOSJdfSwidHlwZSI6IkZpZWxkT2ZmaWNlciIsInRlbmFudElEIjoiMGU1M2NlZTAtNmEwZS0xMWU4LWIyZGItNTVhM2VjMTE2N2M2IiwiYXV0aF90aW1lIjoxNTU0MjkwODU5LCJuYW1lIjoiVHJhY2lmaWVkIFRlc3QiLCJwaG9uZV9udW1iZXIiOiIrOTQ3NzA1MDkwMTgiLCJlbWFpbCI6Im11dGh1bWluaWRAOTl4LmxrIiwidXNlcklEIjoiYWJlZTQwZjAtOTU1Zi0xMWU4LWE5N2EtNTkyZjRlNTdlZmFhIiwiYWRkcmVzcyI6eyJmb3JtYXR0ZWQiOiJub25lIn0sImRvbWFpbiI6IkFncmljdWx0dXJlIiwiZGlzcGxheUltYWdlIjoiaHR0cHM6Ly90cmFjaWZpZWQtcHJvZmlsZS1pbWFnZXMuczMuYXAtc291dGgtMS5hbWF6b25hd3MuY29tL2F6a2FyLm1vdWxhbmElNDBnbWFpbC5jb202OGJkZTBlMC00ZmI1LTExZTktOTkzZi04Yjc5MDdhMjQgICA5MTQuanBlZyIsImFjY2Vzc1Rva2VuIjoiIiwicGlkIjoiIiwiZGV2aWNlSWQiOiI3ZDQ1YWU0MC01NjAzLTExZTktODY1MS1kZGU4Yzc1MTQ1NzciLCJpYXQiOjE1NTQyOTA4NjAsImV4cCI6MjU1NDg5NTY2MH0.YuJR8GDVqmL5yTvOYOss2AAJhV1k7ZV9_H0Quk4gtBA',
    api_backendRaw: 'https://api.tracified.com/api/v2/dataPackets/raw?id=',
  },

  // Blockchain API services and Authorization codes
  blockchain: {
    blockchainAuth: null,
    getTransactionFromPublicKey: 'https://tracified-gateway.herokuapp.com/GetTransactionsForPK/',
    getHashData: 'https://tracified-gateway.herokuapp.com/proof/poe/',
    getPogData: 'https://tracified-gateway.herokuapp.com/proof/pog/',
    getPococData: 'https://tracified-gateway.herokuapp.com/proof/pococ/',
    getPocData: 'https://tracified-gateway.herokuapp.com/proof/poc/',
    getTransactionData: 'https://tracified-gateway.herokuapp.com/GetTransactions/',
    getRecentTransactions: 'https://tracified-gateway.herokuapp.com/RetrievePreviousTranasctions/'
  }
};
