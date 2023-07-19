import weaviate from 'weaviate-ts-client';

const client = weaviate.client({
    scheme: 'https',
    host: 'image-search-engine.onrender.com/',
});

const schemaRes = await client.schema.getter().do();

console.log(schemaRes)