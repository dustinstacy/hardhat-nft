// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "base64-sol/base64.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract DynamicSVGNFT is ERC721 {
    AggregatorV3Interface internal immutable i_priceFeed;
    string private i_lowSVG;
    string private i_highSVG;
    uint256 public _tokenCounter;
    string private constant BASE_64_ENCODED_SVG_PREFIX =
        "data:image/svg+xml;base64,";

    mapping(uint256 => int256) public _tokenIdToHighValue;

    constructor(
        address priceFeedAddress,
        string memory lowSVG_,
        string memory highSVG_
    ) ERC721("Dynamic Faces", "FACE") {
        i_priceFeed = AggregatorV3Interface(priceFeedAddress);
        i_lowSVG = svgToImageURI(lowSVG_);
        i_highSVG = svgToImageURI(highSVG_);
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
        _safeMint(msg.sender, _tokenCounter);
        _tokenCounter = _tokenCounter + 1;
    }

    function _baseURI() internal pure override returns (string memory) {
        return "data:application/json;base64,";
    }

    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        require(_exists(tokenId), "URI Query for nonexistent token");

        (, int256 price, , , ) = i_priceFeed.latestRoundData();
        string memory imageURI = i_lowSVG;
        if (price >= _tokenIdToHighValue[tokenId]) {
            imageURI = i_highSVG;
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

    // function storeSVGInformation() internal {}

    // function getSVGImage() public pure {}
}
