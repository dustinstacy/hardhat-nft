import { AddressLike } from 'ethers'
import { BasicNFT } from '../typechain-types'
import { expect } from 'chai'
import { deployments, ethers } from 'hardhat'
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers'

describe('BasicNFT', () => {
    let deployer: SignerWithAddress
    let basicNFTAddress: AddressLike
    let basicNFT: BasicNFT

    beforeEach(async () => {
        await deployments.fixture()
        basicNFTAddress = (await deployments.get('BasicNFT')).address
        basicNFT = await ethers.getContractAt('BasicNFT', basicNFTAddress)
    })

    describe('constructor', async () => {
        it('Accurately sets all constructor variables', async () => {
            const name = await basicNFT.name()
            const symbol = await basicNFT.symbol()
            const tokenCounter = await basicNFT.getTokenCounter()
            expect(name).to.equal('Pups')
            expect(symbol).to.equal('PUPS')
            expect(tokenCounter).to.equal(0)
        })
    })
    describe('mintNFT', async () => {
        beforeEach(async () => {
            const accounts = await ethers.getSigners()
            deployer = accounts[0]
            const txResponse = await basicNFT.mintNFT()
            await txResponse.wait(1)
        })

        it('Mints an NFT', async () => {
            const tokenURI = await basicNFT.tokenURI(0)
            const tokenCounter = await basicNFT.getTokenCounter()
            expect(tokenURI).to.equal(await basicNFT.TOKEN_URI())
            expect(tokenCounter).to.equal(1)
        })

        it('Shows the correct balance and owner of an NFT', async () => {
            const deployerAddress = deployer.address
            const deployerBalance = await basicNFT.balanceOf(deployerAddress)
            const owner = await basicNFT.ownerOf('0')
            expect(deployerBalance).to.equal(1)
            expect(owner).to.equal(deployerAddress)
        })
    })
})
