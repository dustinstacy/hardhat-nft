const { expect } = require('chai')
const { deployments, ethers } = require('hardhat')

describe('BasicNFT', () => {
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
        it('Mints an NFT', async () => {})
        it('Increments the _tokenCounter variable', async () => {})
    })
    describe('tokenURI', async () => {
        it('Returns the tokenURI', async () => {})
    })
    describe('getTokenCounter', async () => {
        it('Returns the current _tokenCounter value', async () => {})
    })
})
