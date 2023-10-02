// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

error RandomIPFSNFT_RangeOutOfBounds();
error RandomIPFSNFT_NeedMoreEthSent();
error RandomIPFSNFT_TransferFailed();

contract RandomIPFSNFT is VRFConsumerBaseV2, ERC721URIStorage, Ownable {
    // Type Declaration
    enum Breed {
        PUG,
        SHIBA_INU,
        ST_BERNARD
    }

    // Chainlink VRF variables
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    bytes32 private immutable i_keyHash;
    uint64 private immutable i_subId;
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant MIN_REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;

    // VRF Helpers
    mapping(uint256 => address) public _requestIdToSender;

    // NFT Variables
    uint256 public _tokenCounter;
    string[] internal _dogTokenURIs;
    uint256 internal constant MAX_CHANCE_VALUE = 100;
    uint256 internal i_mintFee;

    //Events
    event NFTRequested(uint256 indexed requestId, address requester);
    event NFTMinted(Breed dogBreed, address minter);

    constructor(
        address vrfCoordinatorV2,
        bytes32 keyHash,
        uint64 subId,
        uint32 callbackGasLimit,
        string[3] memory dogTokenURIs,
        uint256 mintFee
    ) VRFConsumerBaseV2(vrfCoordinatorV2) ERC721("RandoPups", "RPUP") {
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_keyHash = keyHash;
        i_subId = subId;
        i_callbackGasLimit = callbackGasLimit;
        _dogTokenURIs = dogTokenURIs;
        i_mintFee = mintFee;
    }

    function requestNFT() public payable returns (uint256 requestId) {
        if (msg.value < i_mintFee) {
            revert RandomIPFSNFT_NeedMoreEthSent();
        }
        requestId = i_vrfCoordinator.requestRandomWords(
            i_keyHash,
            i_subId,
            MIN_REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );
        _requestIdToSender[requestId] = msg.sender;
        emit NFTRequested(requestId, msg.sender);
        _tokenCounter = _tokenCounter + 1;
    }

    function fulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) internal override {
        address dogOwner = _requestIdToSender[requestId];
        uint256 newTokenId = _tokenCounter;
        uint256 moddedRNG = randomWords[0] % MAX_CHANCE_VALUE;
        Breed dogBreed = getBreedFromModdedRNG(moddedRNG);
        _safeMint(dogOwner, newTokenId);
        _setTokenURI(newTokenId, _dogTokenURIs[uint256(dogBreed)]);
        emit NFTMinted(dogBreed, dogOwner);
    }

    function withdraw() public onlyOwner {
        uint256 amount = address(this).balance;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if (!success) {
            revert RandomIPFSNFT_TransferFailed();
        }
    }

    function getChanceArray() public pure returns (uint256[3] memory) {
        return [10, 30, MAX_CHANCE_VALUE];
    }

    function getBreedFromModdedRNG(
        uint256 moddedRNG
    ) public pure returns (Breed) {
        uint256 cumulativeSum = 0;
        uint256[3] memory chanceArray = getChanceArray();
        for (uint256 i = 0; i < chanceArray.length; i++) {
            if (
                moddedRNG >= cumulativeSum &&
                moddedRNG < cumulativeSum + chanceArray[i]
            ) {
                return Breed(i);
            }
            cumulativeSum += chanceArray[i];
        }
        revert RandomIPFSNFT_RangeOutOfBounds();
    }

    function getMintFee() public view returns (uint256) {
        return i_mintFee;
    }

    function getDogTokenURIs(
        uint256 index
    ) public view returns (string memory) {
        return _dogTokenURIs[index];
    }

    function getTokenCounter() public view returns (uint256) {
        return _tokenCounter;
    }
}
