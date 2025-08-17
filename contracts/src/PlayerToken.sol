// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v5.0.2/contracts/token/ERC20/ERC20.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v5.0.2/contracts/access/Ownable.sol";

/**
 * @title PlayerToken
 * @notice Simple ERC20 with owner mint + optional faucet for testnets.
 */
contract PlayerToken is ERC20, Ownable {
    bool public faucetEnabled;
    uint256 public immutable FAUCET_CAP_PER_ADDR;
    mapping(address => uint256) public faucetMinted;

    constructor(
        string memory name_,
        string memory symbol_,
        address owner_,
        uint256 initialSupply, // 18 decimals
        bool faucetEnabled_,
        uint256 faucetCapPerAddr_ // 18 decimals
    ) ERC20(name_, symbol_) Ownable(owner_) {
        if (initialSupply > 0) _mint(owner_, initialSupply);
        faucetEnabled = faucetEnabled_;
        FAUCET_CAP_PER_ADDR = faucetCapPerAddr_;
    }

    /// @notice Owner mint (seed LP, etc.). Remove/lock for production.
    function ownerMint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /// @notice Testnet faucet with per-address cap.
    function faucetMint(uint256 amount) external {
        require(faucetEnabled, "FAUCET_OFF");
        uint256 minted = faucetMinted[msg.sender];
        require(minted + amount <= FAUCET_CAP_PER_ADDR, "FAUCET_CAP");
        faucetMinted[msg.sender] = minted + amount;
        _mint(msg.sender, amount);
    }
}
