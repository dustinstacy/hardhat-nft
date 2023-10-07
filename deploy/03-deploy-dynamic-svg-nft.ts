import { ethers, network } from 'hardhat'
import { devChains, networkConfig } from '../helper-hardhat-config'
import { DeployFunction } from 'hardhat-deploy/dist/types'
import verify from '../utils/verify'
import { AddressLike } from 'ethers'

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

    log('-------------------------')
    const args: any[] = []
    const dynamicSVGNFT = await deploy('DynamicSVGNFT', {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: networkConfig[network.name].blockConfirmations,
    })
}

export default deployDynamicSVGNFT
deployDynamicSVGNFT.tags = ['all', 'dynamicSVG']
