// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DynamicSVGNFT is ERC721, Ownable {
    uint256 public _tokenCounter;

    constructor() ERC721("Dynamic Faces", "FACE") {
        _tokenCounter = 0;
    }

    function mintNFT() public {
        _safeMint(msg.sender, _tokenCounter);
        _tokenCounter = _tokenCounter + 1;
    }

    // function storeSVGInformation() internal {}

    // function getSVGImage() public pure {}
}
