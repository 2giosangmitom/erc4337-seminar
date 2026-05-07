// SPDX-License-Identifier: MIT
pragma solidity ^0.8.35;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract JToken is ERC20 {
    constructor(uint256 initialSupply) ERC20("JToken", "J") {
        _mint(msg.sender, initialSupply);
    }
}
