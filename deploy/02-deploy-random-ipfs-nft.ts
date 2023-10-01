import { ethers, network } from 'hardhat'
import { devChains, networkConfig } from '../helper-hardhat-config'
import { DeployFunction } from 'hardhat-deploy/dist/types'
import { VRFCoordinatorV2Mock } from '../typechain-types'
import verify from '../utils/verify'
import storeImages from '../utils/uploadToPinata'

const imagesLocation = './images/randomNFT'

const deployRandomIPFSNFT: DeployFunction = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log, get } = deployments
    const { deployer } = await getNamedAccounts()

    let vrfCoordinatorV2Address: string | undefined
    let vrfCoordinatorV2Mock: VRFCoordinatorV2Mock
    let subscriptionId: string | undefined
    let tokenURIs

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
    } else {
        vrfCoordinatorV2Address = networkConfig[network.name]['vrfCoordinatorV2']
        subscriptionId = networkConfig[network.name]['subscriptionId']
    }

    await storeImages(imagesLocation)
    const args: any[] = [
        // vrfCoordinatorV2Address,
        // networkConfig[network.name]['gasLane'],
        // subscriptionId,
        // networkConfig[network.name]['callbackGasLimit'],
        // networkConfig[network.name]['dogTokenURIs'],
        // networkConfig[network.name]['mintFee'],
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
    return tokenURIs
}

export default deployRandomIPFSNFT
deployRandomIPFSNFT.tags = ['all', 'randomIPFS']
