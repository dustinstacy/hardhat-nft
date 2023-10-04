import { AddressLike, BigNumberish } from 'ethers'
import { deployments, ethers, network } from 'hardhat'
import { RandomIPFSNFT, VRFCoordinatorV2Mock } from '../typechain-types'
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers'
import { expect } from 'chai'
import { networkConfig } from '../helper-hardhat-config'
import { doesNotMatch } from 'assert'

describe('RandomIPFSNFT', () => {
    let randomIPFSNFTAddress: AddressLike
    let randomIPFSNFT: RandomIPFSNFT
    let accounts: Array<SignerWithAddress>
    let deployer: SignerWithAddress
    let requester: SignerWithAddress
    let vrfCoordinatorV2Mock: VRFCoordinatorV2Mock
    let vrfCoordinatorV2MockAddress: string
    let mintFee: BigNumberish

    beforeEach(async () => {
        accounts = await ethers.getSigners()
        deployer = accounts[0]
        requester = accounts[1]
        await deployments.fixture(['mocks', 'randomIPFS'])
        randomIPFSNFTAddress = (await deployments.get('RandomIPFSNFT')).address
        randomIPFSNFT = await ethers.getContractAt('RandomIPFSNFT', randomIPFSNFTAddress)
        vrfCoordinatorV2MockAddress = (await deployments.get('VRFCoordinatorV2Mock')).address
        vrfCoordinatorV2Mock = await ethers.getContractAt(
            'VRFCoordinatorV2Mock',
            vrfCoordinatorV2MockAddress
        )
    })

    describe('contstructor', async () => {
        it('initializes the values correctly', async () => {
            const vrfCoordinatorV2Address = await randomIPFSNFT.getVRFCoordinatorV2()
            const keyHash = await randomIPFSNFT.getKeyHash()
            const callbackGasLimit = await randomIPFSNFT.getCallbackGasLimit()
            let subId = await randomIPFSNFT.getSubId()
            subId++ // Calling createSubscription() again increments the indexed _subId so we match that here
            const tx = await vrfCoordinatorV2Mock.createSubscription()
            const receipt = await tx.wait(1)
            const dogTokenURIs = await randomIPFSNFT.getDogTokenURIs(0)
            mintFee = await randomIPFSNFT.getMintFee()
            expect(vrfCoordinatorV2Address).to.equal(vrfCoordinatorV2MockAddress)
            expect(keyHash).to.equal(networkConfig[network.name].keyHash)
            expect(callbackGasLimit).to.equal(networkConfig[network.name].callbackGasLimit)
            expect(subId).to.equal(receipt!.logs[0].topics[1])
            expect(mintFee).to.equal(networkConfig[network.name].mintFee)
            expect(dogTokenURIs).to.include('ipsf://')
        })
    })

    describe('requestNFT', () => {
        it('Reverts the transaction if there is not enough ETH', async () => {
            await expect(randomIPFSNFT.requestNFT()).to.be.revertedWithCustomError(
                randomIPFSNFT,
                'RandomIPFSNFT_NeedMoreEthSent'
            )
        })

        it('Adds entrant to entrants array upon entry!', async () => {
            const requestContract = randomIPFSNFT.connect(requester)
            const tx = await requestContract.requestNFT({ value: mintFee })
            const txReceipt = await tx.wait(1)
            const requestId = txReceipt!.logs[1].topics[1]
            const requestSender = await randomIPFSNFT._requestIdToSender(requestId)
            expect(requestSender).to.equal(requester.address)
        })

        it('Emits a new NFTRequested event for each new request', async () => {
            await expect(randomIPFSNFT.requestNFT({ value: mintFee })).to.emit(
                randomIPFSNFT,
                'NFTRequested'
            )
        })

        it('Increments the token counter correctly', async () => {})
    })
})
