import { ethers } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/dist/types'

const mint: DeployFunction = async ({ getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts()

    const basicNFT = await ethers.getContractAt('BasicNFT', deployer)
    const basicMintTx = await basicNFT.mintNFT()
    await basicMintTx.wait(1)
    console.log(`Basic NFT index 0 has tokenURI: ${await basicNFT.tokenURI(0)}`)
}

export default mint
mint.tags = ['all', 'mint']
