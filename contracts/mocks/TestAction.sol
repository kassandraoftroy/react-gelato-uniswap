// "SPDX-License-Identifier: UNLICENSED"
pragma solidity ^0.6.10;
import {IERC20} from "@gelatonetwork/core/contracts/external/IERC20.sol";

contract TestAction {

    constructor() public {}
    
    function makeDelegatecall(
        address _contract,
        bytes memory _data
    ) public returns (bool) {
        (bool success, bytes memory result) = _contract.delegatecall(_data);
        return success;
    }

    function approveToken(address _token, address _toApprove, uint256 _amount) public returns (bool) {
        require(IERC20(_token).approve(_toApprove, _amount));
        return true;
    }
}