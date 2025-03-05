import { Pinecone } from '@pinecone-database/pinecone';


if(!process.env.PINECONE_API_KEY) {
    throw new Error('Missing Pinecone API key');
}

const pineconeClient = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY
});

export default pineconeClient;