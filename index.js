import { client } from "./app.js";

import { readFileSync, readdirSync, writeFileSync} from "fs"

// Create a schema that contains an image property.
async function createSchema () {
    const schemaConfig = {
        'class': 'Meme',
        'vectorizer': "img2vec-neural",
        'vectorIndexType': 'hnsw',
        'moduleConfig': {
            'img2vec-neural': {
                'imageFields': [
                    'image'
                ]
            }
        },
        'properties': [
            {
                'name': 'image',
                'dataType': ['blob']
            },
            {
                'name': 'text',
                'dataType': ['string']
            }
        ]
    }

    await client.schema
        .classCreator()
        .withClass(schemaConfig)
        .do();
}

async function deleteSchema () {

    await client.schema
        .classDeleter()
        .withClassName("Meme")
        .do();

}

/*
Images must first be converted to base64. Once converted, 
store it to the cooresponding class in the schema. Weaviate 
will automatically use the neural network in the background 
to vectorize it and update the embedding.
*/
async function trainLocalImage () {
    const img = readFileSync('./img/buzz-ai-ml-meme.png');

    const b64 = Buffer.from(img).toString('base64');

    const object = await client.data
        .creator()
        .withClassName('Meme')
        .withProperties({
            image: b64,
            text: 'buzz ai ml meme'
        })
        .do();

    //console.log(JSON.stringify(object, null, 2));
}

async function trainAllLocalImages () {
    const imgs = readdirSync('./img')

    const promises = imgs.map((async (img) => {
        const b64 = Buffer.from(readFileSync(`./img/${img}`)).toString('base64')
        await client.data
        .creator()
        .withClassName('Meme')
        .withProperties({
            image: b64,
            text: 'buzz ai ml meme'
        })
        .do();
    }))

    await Promise.all(promises)
}


/*
After storing a few images, we can provide an image 
as a query input. The database will use HNSW to quickly 
find similar looking images.
*/

async function test () {
    const test = Buffer.from( readFileSync('./test.png') ).toString('base64');

    const resImage = await client.graphql.get()
        .withClassName('Meme')
        .withFields(['image'])
        .withNearImage({ image: test })
        .withLimit(1)
        .do();

    // Write result to filesystem
    const result = resImage.data.Get.Meme[0].image;
    writeFileSync('./result.jpg', result, 'base64');
}

async function handleErrorInCreateSchema() {
    try {
        await createSchema();
    } catch (error) {
        try {
            await deleteSchema();
            await createSchema();
        } catch (deleteError) {
            process.exit(1); 
        }
    }
}

await handleErrorInCreateSchema();
await trainAllLocalImages()
await test()
