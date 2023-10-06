// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "base64-sol/base64.sol";

contract DynamicSVGNFT is ERC721 {
    uint256 public _tokenCounter;
    string private i_lowSVG;
    string private i_highSVG;
    string private constant BASE_64_ENCODED_SVG_PREFIX =
        "data:image/svg+xml;base64,";

    constructor(
        string memory lowSVG_,
        string memory highSVG_
    ) ERC721("Dynamic Faces", "FACE") {
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

    function mintNFT() public {
        _safeMint(msg.sender, _tokenCounter);
        _tokenCounter = _tokenCounter + 1;
    }

    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        require(_exists(tokenId), "URI Query for nonexistent token");
        string memory imageURI = "hi!";

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
        );
    }

    // function storeSVGInformation() internal {}

    // function getSVGImage() public pure {}
}
