// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DynamicSVGNFT is ERC721URIStorage, Ownable {
    constructor() ERC721("DynamicFaces", "FACE") {}
}
