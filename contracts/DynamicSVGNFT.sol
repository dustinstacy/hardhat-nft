// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "base64-sol/base64.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract DynamicSVGNFT is ERC721 {
    AggregatorV3Interface internal immutable i_priceFeed;
    string private _lowSVG;
    string private _highSVG;
    uint256 public _tokenCounter;
    string private constant BASE_64_ENCODED_SVG_PREFIX =
        "data:image/svg+xml;base64,";

    mapping(uint256 => int256) public _tokenIdToHighValue;

    event CreatedNFT(uint256 indexed tokenId, int256 highValue);

    constructor(
        address priceFeedAddress,
        string memory lowSVG_,
        string memory highSVG_
    ) ERC721("Dynamic Faces", "FACE") {
        i_priceFeed = AggregatorV3Interface(priceFeedAddress);
        _lowSVG = svgToImageURI(lowSVG_);
        _highSVG = svgToImageURI(highSVG_);
        _tokenCounter = 0;
    }

    function svgToImageURI(
        string memory svg
    ) public pure returns (string memory) {
        string memory svgBase64Encoded = Base64.encode(
            bytes(string(abi.encodePacked(svg)))
        );
        return
            string(
                abi.encodePacked(BASE_64_ENCODED_SVG_PREFIX, svgBase64Encoded)
            );
    }

    function mintNFT(int256 highValue) public {
        _tokenIdToHighValue[_tokenCounter] = highValue;
        _tokenCounter = _tokenCounter + 1;
        _safeMint(msg.sender, _tokenCounter);
        emit CreatedNFT(_tokenCounter, highValue);
    }

    function _baseURI() internal pure override returns (string memory) {
        return "data:application/json;base64,";
    }

    function tokenURI(
        uint256 tokenId
    ) public view virtual override returns (string memory) {
        require(_exists(tokenId), "URI Query for nonexistent token");

        (, int256 price, , , ) = i_priceFeed.latestRoundData();
        string memory imageURI = _lowSVG;
        if (price >= _tokenIdToHighValue[tokenId]) {
            imageURI = _highSVG;
        }

        return
            string(
                abi.encodePacked(
                    _baseURI(),
                    Base64.encode(
                        bytes(
                            abi.encodePacked(
                                '{"name":}"',
                                name(),
                                '", "description":"An NFT that changes based on the Chainlink Feed", ',
                                '"attributes":[{"trait_type": "coolness", "value": 100}], "image":"',
                                imageURI,
                                '"}'
                            )
                        )
                    )
                )
            );
    }

    function getLowSVG() public view returns (string memory) {
        return _lowSVG;
    }

    function getHighSVG() public view returns (string memory) {
        return _highSVG;
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return i_priceFeed;
    }

    function getTokenCounter() public view returns (uint256) {
        return _tokenCounter;
    }
}
