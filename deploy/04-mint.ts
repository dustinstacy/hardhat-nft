import { ethers, network } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/dist/types'
import { TypedContractEvent } from '../typechain-types/common'
import { devChains } from '../helper-hardhat-config'

const mint: DeployFunction = async ({ getNamedAccounts, deployments }) => {
    const { deployer } = await getNamedAccounts()

    const basicNFTdeployment = await deployments.get('BasicNFT')
    const basicNft = await ethers.getContractAt('BasicNFT', basicNFTdeployment.address)
    const basicMintTx = await basicNft.mintNFT()
    await basicMintTx.wait(1)
    console.log(basicNft)
    console.log(`Basic NFT index 0 tokenURI: ${await basicNft.tokenURI(0)}`)

    // const highValue = ethers.parseEther('4000')
    // const dynamicSVGNFTDeployment = await deployments.get('DynamicSVGNFT')
    // const dynamicSVGNFT = await ethers.getContractAt(
    //     'DynamicSVGNFT',
    //     dynamicSVGNFTDeployment.address
    // )
    // const dynamiceSVGNFTMintTX = await dynamicSVGNFT.mintNFT(highValue)
    // await dynamiceSVGNFTMintTX.wait(1)
    // console.log(dynamicSVGNFT)
    // console.log(`Dynamic SVG NFT index 0 tokenURI: ${await dynamicSVGNFT.tokenURI(0)}`)

    // const randomIPFSNFTDeployment = await deployments.get('RandomIPFSNFT')
    // const randomIPFSNFT = await ethers.getContractAt(
    //     'RandomIPFSNFT',
    //     randomIPFSNFTDeployment.address
    // )
    // const mintFee = await randomIPFSNFT.getMintFee()

    // await new Promise(async (resolve, reject) => {
    //     setTimeout(resolve, 300000)
    //     const nftMintedEvent: TypedContractEvent = randomIPFSNFT.filters['NFTMinted']
    //     randomIPFSNFT.once(nftMintedEvent, async () => {
    //         resolve(null)
    //     })
    //     const randomIPFSMintTx = await randomIPFSNFT.requestNFT({ value: mintFee.toString() })
    //     const randomIPFSMintTxReceipt = await randomIPFSMintTx.wait(1)
    //     if (devChains.includes(network.name)) {
    //         const requestId = randomIPFSMintTxReceipt!.logs[1].topics[1]
    //         const vrfCoordinatorV2Mock = await ethers.getContractAt(
    //             'VRFCoordinatorV2Mock',
    //             deployer
    //         )
    //         await vrfCoordinatorV2Mock.fulfillRandomWords(requestId, randomIPFSNFT.getAddress())
    //     }
    //     console.log(`Random IPFS NFT index 0 tokenURI: ${await randomIPFSNFT.tokenURI(0)}`)
    // })
}

export default mint
mint.tags = ['all', 'mint']
