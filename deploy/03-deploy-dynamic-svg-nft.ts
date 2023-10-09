import { network } from 'hardhat'
import { devChains, networkConfig } from '../helper-hardhat-config'
import { DeployFunction } from 'hardhat-deploy/dist/types'
import fs from 'fs'
import verify from '../utils/verify'

const deployDynamicSVGNFT: DeployFunction = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    let ethUSDPriceFeedAddress: string | undefined

    if (devChains.includes(network.name)) {
        const EthUSDAggregatorAddress = (await deployments.get('MockV3Aggregator')).address
        ethUSDPriceFeedAddress = EthUSDAggregatorAddress
    } else {
        ethUSDPriceFeedAddress = networkConfig[network.name].ethUSDPriceFeed
    }

    const lowSVG = fs.readFileSync('./images/dynamicNFT/frown.svg', { encoding: 'utf8' })
    const highSVG = fs.readFileSync('./images/dynamicNFT/happy.svg', { encoding: 'utf8' })
    const args: any[] = [ethUSDPriceFeedAddress, lowSVG, highSVG]

    log('-------------------------')

    const dynamicSVGNFT = await deploy('DynamicSVGNFT', {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: networkConfig[network.name].blockConfirmations,
    })

    if (!devChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log('Verifying...')
        await verify(dynamicSVGNFT.address, args)
    }
}

export default deployDynamicSVGNFT
deployDynamicSVGNFT.tags = ['all', 'dynamicSVG']
