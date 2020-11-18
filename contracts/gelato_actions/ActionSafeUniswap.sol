// "SPDX-License-Identifier: UNLICENSED"
pragma solidity ^0.6.10;

import {GelatoActionsStandard} from "@gelatonetwork/core/contracts/actions/GelatoActionsStandard.sol";

import {IUniswapV2Router02} from "./dapp_interfaces/IUniswapV2.sol";
import {TokenConversion} from "./TokenConversion.sol";

contract ActionSafeUniswap is GelatoActionsStandard {

    IUniswapV2Router02 public immutable uniswapRouter;
    TokenConversion public immutable tokenConversion;
    uint256 public immutable slippageConstant;

    constructor(address _uniswapRouter, address _tokenConversion, uint256 _slippageConstant) public {
        uniswapRouter=IUniswapV2Router02(_uniswapRouter);
        tokenConversion=TokenConversion(_tokenConversion);
        slippageConstant = _slippageConstant;
    }

    function action(
        uint256 _amountIn,
        address[] memory _path,
        address _receiver,
        uint256 _deadline,
        uint256 _slippageFactor  // MUST be greater than or equal to slippageConstant
    )
        public
        virtual
        delegatecallOnly("ActionSafeUniswap.action")
        returns (uint256)
    {
        require(_path.length>1);
        uint256 minOut = tokenConversion.minimumOut(_amountIn, _path[0], _path[_path.length-1], _slippageFactor, slippageConstant);
        uniswapRouter.swapExactTokensForTokens(_amountIn, minOut, _path, _receiver, _deadline);
        return minOut;
    }
}