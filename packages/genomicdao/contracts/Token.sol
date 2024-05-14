// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PostCovidStrokePrevention is ERC20, ERC20Burnable, Ownable {
	enum RiskLevel {
		Extremely,
		High,
		SlightlyHight,
		Normal
	}
	mapping(RiskLevel => uint256) riskScoreToAward;
	// using uint192 to prevent number overflow after applying decimal transform on the number
	// of token
	constructor(
		uint192 initialSupply,
		uint192 extremelyLevelAward,
		uint192 hightLevelAward,
		uint192 slightlyHightLevelAward,
		uint192 normalLevelAward,
		address admin
	) ERC20("Post-Covid Stroke Prevention", "PCSP") Ownable(admin) {
		_mint(msg.sender, withDecimal(initialSupply));
		// "extremely high risk"
		riskScoreToAward[RiskLevel.Extremely] = withDecimal(
			extremelyLevelAward
		);
		// "high risk"
		riskScoreToAward[RiskLevel.High] = withDecimal(hightLevelAward);
		// "slightly high risk"
		riskScoreToAward[RiskLevel.SlightlyHight] = withDecimal(
			slightlyHightLevelAward
		);
		//"low risk".
		riskScoreToAward[RiskLevel.Normal] = withDecimal(normalLevelAward);
	}

	function withDecimal(uint192 amount) private view returns (uint256) {
		return amount * 10 ** decimals();
	}

	function mint(address to, uint256 amount) public onlyOwner {
		_mint(to, amount);
	}

	function reward(address to, RiskLevel riskScore) public onlyOwner {
		// TODO: Implement this method: Award PCSP to the user based on his/her risk score
		_transfer(address(0), to, riskScoreToAward[riskScore]);
	}
}
