// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract RandomIPFSNFT is VRFConsumerBaseV2, ERC721 {
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

    constructor(
        address vrfCoordinatorV2,
        bytes32 keyHash,
        uint64 subId,
        uint32 callbackGasLimit
    ) VRFConsumerBaseV2(vrfCoordinatorV2) ERC721("RandoPups", "RPUP") {
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_keyHash = keyHash;
        i_subId = subId;
        i_callbackGasLimit = callbackGasLimit;
    }

    function requestNFT() public returns (uint256 requestId) {
        requestId = i_vrfCoordinator.requestRandomWords(
            i_keyHash,
            i_subId,
            MIN_REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );
        _requestIdToSender[requestId] = msg.sender;
    }

    function fulfillRandomWords(
        uint256 requestId,
        uint256[] memory /*randomWords*/
    ) internal override {
        address dogOwner = _requestIdToSender[requestId];
        uint256 newTokenId = _tokenCounter;
        _safeMint(dogOwner, newTokenId);
    }

    function tokenURI(uint256) public view override returns (string memory) {}
}
