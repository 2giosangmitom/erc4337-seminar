// SPDX-License-Identifier: MIT
pragma solidity ^0.8.35;

import {Account} from "@openzeppelin/contracts/account/Account.sol";
import {SignerEIP7702} from "@openzeppelin/contracts/utils/cryptography/signers/SignerEIP7702.sol";
import {ERC7821} from "@openzeppelin/contracts/account/extensions/draft-ERC7821.sol";

contract SmartAccount is Account, SignerEIP7702, ERC7821 {
    // ERC-7201 Namespaced Storage
    bytes32 constant STORAGE_SLOT =
        keccak256(abi.encode(uint256(keccak256("SmartAccount")) - 1)) &
            ~bytes32(uint256(0xff));

    struct SessionKey {
        uint256 validUntil;
    }

    struct Storage {
        mapping(address => SessionKey) sessionKeys;
    }

    function _getStorage() internal pure returns (Storage storage s) {
        bytes32 slot = STORAGE_SLOT;
        assembly {
            s.slot := slot
        }
    }

    // Call structure for batch execution
    struct Call {
        address to;
        uint256 value;
        bytes data;
    }

    // Session key management
    function grantSessionKey(address wallet, uint256 validSeconds) external {
        require(
            msg.sender == address(this) || msg.sender == address(entryPoint()),
            "Unauthorized"
        );
        _getStorage().sessionKeys[wallet] = SessionKey({
            validUntil: block.timestamp + validSeconds
        });
    }

    function revokeSessionKey(address wallet) external {
        require(
            msg.sender == address(this) || msg.sender == address(entryPoint()),
            "Unauthorized"
        );
        delete _getStorage().sessionKeys[wallet];
        emit SessionKeyRevoked(wallet);
    }

    // ERC-7821
    function execute(
        bytes32 mode,
        bytes calldata executionData
    ) public payable override {
        SessionKey storage key = _getStorage().sessionKeys[msg.sender];

        if (block.timestamp <= key.validUntil) {
            Call[] memory calls = abi.decode(executionData, (Call[]));
            for (uint256 i = 0; i < calls.length; i++) {
                (bool success, ) = calls[i].to.call{value: calls[i].value}(
                    calls[i].data
                );
                require(success, "Call failed");
            }
        }
    }

    event SessionKeyGranted(address indexed wallet, uint256 validUntil);
    event SessionKeyRevoked(address indexed wallet);
}
