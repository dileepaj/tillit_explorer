export const environment = {
  production: true,

  // Backend API services and Authorization codes
  backend: {
    backendAuth: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb21wYW55IjoiOTl4IFRlY2hub2xvZ3kiLCJ1c2VySUQiOiI4NTllYzZjMC0xODAxLTExZTktODViNC0zZmRjYTAyOWYwY2MiLCJ1c2VybmFtZSI6InZpbnVzaGFwQDk5eC5sayIsImxvY2FsZSI6IlNyaSBMYW5rYSIsInBlcm1pc3Npb25zIjp7IjAiOlsiNyIsIjgiLCI5Il0sIjAwMjAxIjpbIjEiLCIyIiwiMyIsIjQiLCI1IiwiNiJdLCIwMDIwMiI6WyIxIiwiMiIsIjMiLCI0IiwiNSIsIjYiXSwiMDAyMDMiOlsiMSIsIjIiLCIzIiwiNCIsIjUiLCI2Il0sIjAwMjA0IjpbIjEiLCIyIiwiMyIsIjQiLCI1IiwiNiJdLCIwMDIwNSI6WyIxIiwiMiIsIjMiLCI0IiwiNSIsIjYiXSwiMDAyMDYiOlsiMSIsIjIiLCIzIiwiNCIsIjUiLCI2Il0sIjAwMjA3IjpbIjIiLCIzIiwiMSIsIjQiLCI1IiwiNiJdLCIwMDIwOCI6WyIxIiwiMiIsIjMiLCI0IiwiNSIsIjYiXSwiMDAyMDkiOlsiMSIsIjIiLCIzIiwiNCIsIjUiLCI2Il19LCJ0eXBlIjoiRmVpbGRPZmZpY2VyIiwidGVuYW50SUQiOiJkODdjNGYzMC0wOWE1LTExZTktOTgxZS0yNzI2ZjMwNWJiMjMiLCJhdXRoX3RpbWUiOjE1NDc1MjAyOTAsIm5hbWUiOiJWaW51c2hhIFBlcmVyYSIsInN0YWdlcyI6WyIwMDIwMSIsIjAwMjAyIiwiMDAyMDMiLCIwMDIwMyIsIjAwMjA0IiwiMDAyMDUiLCIwMDIwNiIsIjAwMjA3IiwiMDAyMDgiLCIwMDIwOSJdLCJwaG9uZV9udW1iZXIiOiIrOTQ3MTE4NDA2NzkiLCJlbWFpbCI6InZpbnVzaGFwQDk5eC5sayIsImFkZHJlc3MiOnsiZm9ybWF0dGVkIjoibm9uZSJ9LCJkb21haW4iOiJBZ3JpY3VsdHVyZSIsImRpc3BsYXlJbWFnZSI6Im5vbmUiLCJhY2Nlc3NUb2tlbiI6InBlbmRpbmciLCJpYXQiOjE1NDc1MjAyOTAsImV4cCI6OTY0NzY5MzA5MH0.zM-HtnvEM40KwmriRwthejJPyDPSLpNACatvZM-DglY',
    api_backendRaw: 'https://api.tracified.com/api/v2/dataPackets/raw?id=',
  },

  // Blockchain API services and Authorization codes
  blockchain: {
    blockchainAuth: null,
    getTransactionFromPublicKey: 'https://gateway.tracified.com/GetTransactionsForPK/',
    getHashData: 'https://gateway.tracified.com/proof/poe/',
    getPogData: 'https://gateway.tracified.com/proof/pog/',
    getPococData: 'https://gateway.tracified.com/proof/pococ/',
    getPocData: 'https://gateway.tracified.com/proof/poc/',
    getPocTreeData: 'https://gateway.tracified.com/pocv4/',
    getTransactionData: 'https://gateway.tracified.com/GetTransactions/',
    getRecentTransactions: 'https://gateway.tracified.com/RetrievePreviousTranasctions/',
    getRecentTransactionsCount:'https://gateway.tracified.com/RetrievePreviousTranasctionsCount/',
    proofBot:'https://proofbot.tillit.world'
  }
};
