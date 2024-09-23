const { MeiliSearch } = require('meilisearch');
const client = new MeiliSearch({
    host: 'http://127.0.0.1:7700',
    apiKey: '8-hT04AKHH8NSDxSFPWMb2BW2J7fEs-gcHcmv8dMaGw',
});
const index = client.index('files');
index.updateSearchableAttributes(['name']);
index.updateFilterableAttributes(['id', 'user', 'type', 'kind', 'createdAt']);


(async () => {
    try {
        // const documents = [
        //     {
        //         id: 1,
        //         user: 123,
        //         type: 'pdf',
        //         kind: 'report',
        //         createdAt: '2023-08-25T12:34:56Z',
        //         name: 'Annual Report 2023'
        //     },
        //     {
        //         id: 2,
        //         user: 124,
        //         type: 'doc',
        //         kind: 'invoice',
        //         createdAt: '2023-08-26T12:34:56Z',
        //         name: 'Invoice August 2023'
        //     }
        // ];
        // Instead of updateSettings, use the correct method to update the index settings

        // Add documents to the index
        // let response = await index.addDocuments(documents);

        // // Log the taskUid to track the status of this task
        // console.log('Task enqueued with uid:', response.taskUid);

        // const searchResponse = await index.search('report', {
        //     filter: 'user = 123'
        // });

        // console.log('Search results:', searchResponse.hits);
        const index = client.index('files');

        // Delete all documents from the index
        const response = await index.deleteAllDocuments();
        // Optional: Check the task status (polling or directly fetching)
        // const taskStatus = await index.getTask(response.taskUid);
        // console.log('Task status:', taskStatus);
    } catch (error) {
        console.error('An error occurred:', error);
    }
})();
