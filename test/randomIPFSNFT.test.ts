import { AddressLike } from 'ethers'
import { deployments, ethers } from 'hardhat'
import { RandomIPFSNFT } from '../typechain-types'
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers'

describe('RandomIPFSNFT', () => {
    let randomIPFSNFTAddress: AddressLike
    let randomIPFSNFT: RandomIPFSNFT
    let deployer: SignerWithAddress

    beforeEach(async () => {
        await deployments.fixture()
        randomIPFSNFTAddress = (await deployments.get('RandomIPFSNFT')).address
        randomIPFSNFT = await ethers.getContractAt('RandomIPFSNFT', randomIPFSNFTAddress)
    })
})
