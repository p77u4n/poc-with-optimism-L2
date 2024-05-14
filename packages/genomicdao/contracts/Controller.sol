// SPDX-License-Identifier: MIT

pragma solidity ^0.8.25;

import "./NFT.sol" as nft;
import "./Token.sol" as token;
contract Controller {
	//
	// STATE VARIABLES
	//
	uint256 private _sessionIdCounter;
	nft.GeneNFT public geneNFT;
	token.PostCovidStrokePrevention public pcspToken;

	struct UploadSession {
		uint256 id;
		address user;
		string proof;
		bool confirmed;
		string docId;
	}

	struct DataDoc {
		string id;
		string hashContent;
	}

	mapping(uint256 => UploadSession) sessions;
	mapping(string => DataDoc) docs;
	mapping(string => bool) docSubmits;
	mapping(uint256 => string) nftDocs;

	error AlreadySubmitted(string docId);
	error ProofInvalid(string proof);
	//
	// EVENTS
	//
	event UploadData(string docId, uint256 sessionId);

	constructor(address nftAddress, address pcspAddress) {
		geneNFT = nft.GeneNFT(nftAddress);
		pcspToken = token.PostCovidStrokePrevention(pcspAddress);
	}

	function _initDoc(string memory docId) private {
		docSubmits[docId] = true;
		docs[docId] = DataDoc(docId, "");
	}

	function uploadData(string memory docId) public returns (uint256) {
		// TODO: Implement this method: to start an uploading gene data session.
		// The doc id is used to identify a unique gene profile. Also should check
		// if the doc id has been submited to the system before. This method return the session id
		if (docSubmits[docId] == false) {
			revert AlreadySubmitted(docId);
		} else {
			_initDoc(docId);
			uint256 newSessionId = _sessionIdCounter;
			sessions[newSessionId] = UploadSession(
				newSessionId,
				msg.sender,
				"",
				false,
				docId
			);
			_sessionIdCounter += 1;
			return newSessionId;
		}
	}

	function verifyProof(string memory proof) private pure returns (bool) {
		// mock verifying prof
		if (bytes(proof).length > 0) {
			return true;
		}
		return false;
	}

	function confirm(
		string memory docId,
		string memory contentHash,
		string memory proof,
		uint256 sessionId,
		uint256 riskScore
	) public {
		// TODO: Implement this method: The proof here is used to verify that the result is returned from a valid computation on the gene data.
		// For simplicity, we will skip the proof verification in this implementation. The gene data's owner will receive a NFT as a ownership
		//certicate for his/her gene profile.
		// TODO: Verify proof, we can skip this step
		if (bytes(sessions[sessionId].docId).length == 0) {
			revert("session is not exist");
		}
		if (sessions[sessionId].user != msg.sender) {
			revert("unauthorized");
		}
		if (sessions[sessionId].confirmed) {
			revert("session already closed");
		}
		bytes memory refDocIdBytes = bytes(sessions[sessionId].docId);
		bytes memory passingDocIdBytes = bytes(docId);
		if (
			refDocIdBytes.length == passingDocIdBytes.length &&
			keccak256(refDocIdBytes) == keccak256(passingDocIdBytes)
		) {
			revert("docId and sessionId not belong to each other");
		}
		if (verifyProof(proof) == false) {
			revert ProofInvalid(proof);
		} else {
			docs[docId].hashContent = contentHash;
			sessions[sessionId].proof = proof;
			uint256 newNFTId = geneNFT.safeMint(msg.sender);
			nftDocs[newNFTId] = docId;
			pcspToken.reward(
				msg.sender,
				token.PostCovidStrokePrevention.RiskLevel(riskScore)
			);
			sessions[sessionId].confirmed = true;
		}
		// TODO: Update doc content
		// TODO: Mint NFT
		// TODO: Reward PCSP token based on risk stroke
		// TODO: Close session
	}

	function getSession(
		uint256 sessionId
	) public view returns (UploadSession memory) {
		return sessions[sessionId];
	}

	function getDoc(string memory docId) public view returns (DataDoc memory) {
		return docs[docId];
	}
}
