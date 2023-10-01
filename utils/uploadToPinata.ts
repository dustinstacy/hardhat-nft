import pinataSDK from '@pinata/sdk'
import path from 'path'
import fs from 'fs'

const pinataAPIkey = process.env.PINATA_API_KEY
const pinataAPISecret = process.env.PINATA_API_SECRET
const pinata = new pinataSDK(pinataAPIkey, pinataAPISecret)

const storeImages = async (imagesFilePath: string) => {
    const fullImagesPath = path.resolve(imagesFilePath)
    const files = fs.readdirSync(fullImagesPath)
    let responses = []
    for (let fileIndex in files) {
        const readableStreamForFile = fs.createReadStream(`${fullImagesPath}/${files[fileIndex]}`)
        try {
            const response = await pinata.pinFileToIPFS(readableStreamForFile)
            responses.push(response)
        } catch (e) {
            console.log(e)
        }
    }
    return { responses, files }
}

export default storeImages
