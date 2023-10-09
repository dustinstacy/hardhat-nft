// We are going to skimp a bit on these tests...
import { deployments, ethers } from 'hardhat'
import { DynamicSVGNFT, MockV3Aggregator } from '../typechain-types'
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers'

describe('Dynamic SVG NFT Unit Tests', function () {
    let dynamicSVGNFTAddress: string
    let dynamicSVGNFT: DynamicSVGNFT
    let deployer: SignerWithAddress
    let mockV3AggregatorAddress: string
    let mockV3Aggregator: MockV3Aggregator

    beforeEach(async () => {
        const accounts = await ethers.getSigners()
        deployer = accounts[0]
        await deployments.fixture(['mocks', 'dynamicsvg'])
        dynamicSVGNFTAddress = (await deployments.get('DynamicSVGNFT')).address
        dynamicSVGNFT = await ethers.getContractAt('DynamicSVGNFT', dynamicSVGNFTAddress)
        mockV3AggregatorAddress = (await deployments.get('MockV3Aggregator')).address
        mockV3Aggregator = await ethers.getContractAt('MockV3Aggregator', mockV3AggregatorAddress)
    })
})
