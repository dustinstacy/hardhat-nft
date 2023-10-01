import pinataSDK from '@pinata/sdk'
import path from 'path'
import fs from 'fs'

const storeImages = async (imagesFilePath: string) => {
    const fullImagesPath = path.resolve(imagesFilePath)
    const files = fs.readdirSync(fullImagesPath)
    console.log(files)
}

export default storeImages
