// "SPDX-License-Identifier: UNLICENSED"
pragma solidity ^0.6.10;

import {GelatoActionsStandard} from "@gelatonetwork/core/contracts/actions/GelatoActionsStandard.sol";
import {SafeERC20} from "@gelatonetwork/core/contracts/external/SafeERC20.sol";
import {SafeMath} from "@gelatonetwork/core/contracts/external/SafeMath.sol";
import {IERC20} from "@gelatonetwork/core/contracts/external/IERC20.sol";

import "@chainlink/contracts/src/v0.6/interfaces/AggregatorV3Interface.sol";


contract ActionStablecoinFee is GelatoActionsStandard {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    address public immutable gasProviderCollector;
    AggregatorV3Interface public immutable priceOracle;
    //AggregatorV3Interface public immutable gasOracle;
    IERC20 public immutable token;
    uint256 public immutable gasLimit;
    uint256 public immutable gasPrice;

    constructor(address _gasProviderCollector, address _tradePriceAgg, address _token, uint256 _gasLimit, uint256 _gasPriceLimit) public {
        gasProviderCollector = _gasProviderCollector;
        priceOracle = AggregatorV3Interface(_tradePriceAgg);
        // gasOracle = AggregatorV3Interface(_gasPriceAgg);
        token = IERC20(_token);
        gasLimit = _gasLimit;
        // instead of gas oracle
        gasPrice = _gasPriceLimit;
    }

    function action(
        address _sender
    )
        public
        virtual
        delegatecallOnly("ActionStablecoinFee.action")
        returns (uint256)
    {
        (uint80 _a, int price, uint _b, uint _c, uint80 _d) = priceOracle.latestRoundData();

        uint256 newPrice = uint256(price);
        // !! gasOracle disabled on testnet
        // (uint80 _1, int p, uint _2, uint _3, uint80 _4) = gasOracle.latestRoundData();
        // uint256 gasPrice = uint256(p);
        uint256 gasConstant = gasLimit.mul(gasPrice);

        uint256 totalRewardDai = gasConstant.mul(newPrice).mul(100).div(100000000).div(90);
        token.transferFrom(_sender, gasProviderCollector, totalRewardDai);
        return totalRewardDai;
    }
}