// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "./PlayerToken.sol";

contract PlayerTokenFactory {
    address public owner;

    struct PlayerInfo {
        address tokenAddress;
        string name;
        string symbol;
        uint256 totalSupply;
        bool faucetEnabled;
        uint256 faucetCapPerAddr;
    }

    PlayerInfo[] public players;
    mapping(address => uint256) public tokenIndex;

    event PlayerTokenCreated(
        address indexed token,
        string name,
        string symbol,
        uint256 totalSupply,
        bool faucetEnabled,
        uint256 faucetCapPerAddr
    );

    constructor() {
        owner = msg.sender;
    }

    function createPlayerToken(
        string memory _name,
        string memory _symbol,
        uint256 _supply,
        bool _faucetEnabled,
        uint256 _faucetCapPerAddr
    ) public returns (address) {
        require(msg.sender == owner, "Only owner can create tokens");

        PlayerToken token = new PlayerToken(
            _name,
            _symbol,
            owner, // factory owner is token owner
            _supply,
            _faucetEnabled,
            _faucetCapPerAddr
        );

        players.push(
            PlayerInfo(
                address(token),
                _name,
                _symbol,
                _supply,
                _faucetEnabled,
                _faucetCapPerAddr
            )
        );
        tokenIndex[address(token)] = players.length - 1;

        emit PlayerTokenCreated(
            address(token),
            _name,
            _symbol,
            _supply,
            _faucetEnabled,
            _faucetCapPerAddr
        );

        return address(token);
    }

    /// @notice Batch-create multiple player tokens
    function createBatchPlayerTokens(
        string[] memory _names,
        string[] memory _symbols,
        uint256 _supply,
        bool _faucetEnabled,
        uint256 _faucetCapPerAddr
    ) external {
        require(msg.sender == owner, "Only owner can batch-create");
        require(_names.length == _symbols.length, "Mismatched arrays");
        require(_names.length == 8, "Must create exactly 8 tokens");

        for (uint256 i = 0; i < _names.length; i++) {
            createPlayerToken(
                _names[i],
                _symbols[i],
                _supply,
                _faucetEnabled,
                _faucetCapPerAddr
            );
        }
    }

    function totalPlayers() external view returns (uint256) {
        return players.length;
    }

    function getAllPlayers() external view returns (PlayerInfo[] memory) {
        return players;
    }

    function getPlayer(
        uint256 index
    ) external view returns (PlayerInfo memory) {
        require(index < players.length, "Invalid index");
        return players[index];
    }
}
