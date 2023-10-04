import { ethers, network } from 'hardhat'
import { devChains, networkConfig } from '../helper-hardhat-config'
import { DeployFunction } from 'hardhat-deploy/dist/types'
import { VRFCoordinatorV2Mock } from '../typechain-types'
import verify from '../utils/verify'
import { storeImages, storeTokenURIMetadata } from '../utils/uploadToPinata'

const FUND_AMOUNT = '1000000000000000000000'
const imagesLocation = './images/randomNFT/'
const metadataTemplate = {
    name: '',
    description: '',
    image: '',
    attributes: [
        {
            trait_type: 'Cuteness',
            value: 100,
        },
    ],
}

const deployRandomIPFSNFT: DeployFunction = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log, get } = deployments
    const { deployer } = await getNamedAccounts()

    let vrfCoordinatorV2Address: string | undefined
    let vrfCoordinatorV2Mock: VRFCoordinatorV2Mock
    let subscriptionId: string | undefined
    let tokenURIs = [
        'ipsf://QmaVkBn2tKmjbhphU7eyztbvSQU5EXDdqRyXZtRhSGgJGo',
        'ipsf://QmYQC5aGZu2PTH8XzbJrbDnvhj3gVs7ya33H9mqUNvST3d',
        'ipsf://QmZYmH5iDbD6v3U2ixoVAjioSzvWJszDzYdbeCLquGSpVm',
    ]

    if (process.env.UPLOAD_TO_PINATA == 'true') {
        tokenURIs = await handleTokenURIs()
    }

    if (devChains.includes(network.name)) {
        const vrfCoordinatorV2MockDeployment = await get('VRFCoordinatorV2Mock')
        vrfCoordinatorV2Address = vrfCoordinatorV2MockDeployment.address
        vrfCoordinatorV2Mock = await ethers.getContractAt(
            'VRFCoordinatorV2Mock',
            vrfCoordinatorV2Address
        )
        const tx = await vrfCoordinatorV2Mock.createSubscription()
        const txReceipt = await tx.wait()
        subscriptionId = txReceipt!.logs[0].topics[1]
        await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, FUND_AMOUNT)
    } else {
        vrfCoordinatorV2Address = networkConfig[network.name]['vrfCoordinatorV2']
        subscriptionId = networkConfig[network.name]['subscriptionId']
    }

    const args: any[] = [
        vrfCoordinatorV2Address,
        networkConfig[network.name]['keyHash'],
        subscriptionId,
        networkConfig[network.name]['callbackGasLimit'],
        tokenURIs,
        networkConfig[network.name]['mintFee'],
    ]

    const randomIPFSNFT = await deploy('RandomIPFSNFT', {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: networkConfig[network.name].blockConfirmations || 1,
    })

    if (devChains.includes(network.name)) {
        await vrfCoordinatorV2Mock!.addConsumer(subscriptionId as string, randomIPFSNFT.address)
    }

    if (!devChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log('Verifying...')
        await verify(randomIPFSNFT.address, args)
    }
    log('-------------------------')
}

const handleTokenURIs = async () => {
    const tokenURIs: Array<any> = []
    const { responses: imageUploadResponses, files } = await storeImages(imagesLocation)
    for (const imageUploadResponseIndex in imageUploadResponses) {
        let tokenURIMetadata = { ...metadataTemplate }
        tokenURIMetadata.name = files[imageUploadResponseIndex].replace('.png', '')
        tokenURIMetadata.description = `An adorable ${tokenURIMetadata.name} pup!`
        tokenURIMetadata.image = `ipfs://${imageUploadResponses[imageUploadResponseIndex].IpfsHash}`
        console.log(`Uploading ${tokenURIMetadata.name}...`)
        const metadataUploadResponse = await storeTokenURIMetadata(tokenURIMetadata)
        tokenURIs.push(`ipfs://${metadataUploadResponse?.IpfsHash}`)
    }
    console.log('Token URIs uploaded! They are:')
    console.log(tokenURIs)
    return tokenURIs
}

export default deployRandomIPFSNFT
deployRandomIPFSNFT.tags = ['all', 'randomIPFS']
