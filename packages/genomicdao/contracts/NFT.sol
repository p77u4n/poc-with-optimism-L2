// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GeneNFT is ERC721, ERC721Burnable, Ownable {
	uint256 private _tokenIdCounter;
	constructor(address admin) ERC721("GeneNFT", "GNFT") Ownable(admin) {}

	function safeMint(address to) public onlyOwner returns (uint256) {
		uint256 tokenId = _tokenIdCounter;
		_safeMint(to, tokenId);
		_tokenIdCounter += 1;
		return tokenId;
	}
}
