// "SPDX-License-Identifier: UNLICENSED"
pragma solidity ^0.6.10;

import {SafeMath} from "@gelatonetwork/core/contracts/external/SafeMath.sol";
import "@chainlink/contracts/src/v0.6/interfaces/AggregatorV3Interface.sol";

contract TokenConversion {
    using SafeMath for uint256;

    mapping (address => address) tokenOracle;
    address public immutable owner;
    address public immutable weth;

    constructor(address _weth) public {
        owner = msg.sender;
        weth = _weth;
    }

    function addOracle(address _token, address _oracle) public {
        require(msg.sender==owner);
        tokenOracle[_token] = _oracle;
    }

    function ethPrice(address _token) public view returns (uint256) {
        (uint80 _, int price, uint __, uint ___, uint80 ____) = AggregatorV3Interface(tokenOracle[_token]).latestRoundData();
        return uint256(price);
    }

    function convert(uint256 _amount, address _inToken, address _outToken) public view returns (uint256) {
        uint256 inPrice = 1 ether;
        uint256 outPrice = 1 ether;
        if (_inToken != address(0) && _inToken != weth) {
            inPrice = ethPrice(_inToken);
        }
        if (_outToken != address(0) && _outToken != weth) {
            outPrice = ethPrice(_outToken);
        }

        return _amount.mul(inPrice).div(outPrice);
    }

    function minimumOut(uint256 _amountIn, address _inToken, address _outToken, uint256 _slippageFactor, uint256 _slippageConstant) public view returns (uint256) {
        require(_slippageFactor>=_slippageConstant);
        uint256 exactOut = convert(_amountIn, _inToken, _outToken);
        uint256 slippage = exactOut.mul(_slippageConstant).div(_slippageFactor);
        uint256 minOut = exactOut.sub(slippage);
        return minOut;
    }
}