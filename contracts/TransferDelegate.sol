// SPDX-License-Identifier: MIT
pragma solidity ^0.8.35;

contract TransferDelegate {
    /// @notice Simple pure function used as a call target for EIP-7702 demos.
    function add(uint256 a, uint256 b) public pure returns (uint256) {
        return a + b;
    }
}
