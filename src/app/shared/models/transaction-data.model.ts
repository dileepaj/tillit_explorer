export interface TransactionData {

        data: {
          packSize: number,
          packedDateAndTime: string,
          packingMode: string,
          packingType: string,
          photos: [
            {
              description: string,
              geoCode: {
                lat: number,
                long: number
              },
              image: string
              timestamp: string
            }
          ],
          readyToConsume: boolean
        };
        header: {
          identifiers: [
            string
          ],
          item: {
            itemID: string,
            itemName: string
          },
          stageID: number,
          timestamp: string,
          workflowRevision: number
        };

}
