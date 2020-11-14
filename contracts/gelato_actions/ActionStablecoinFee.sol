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

    address public receiver;
    AggregatorV3Interface internal priceOracle;
    AggregatorV3Interface internal gasOracle;
    IERC20 internal token;
    uint256 public gas;

    constructor(address _receiver, address _tradePriceAgg, address _gasPriceAgg, address _token, uint256 _gas) public {
        receiver = _receiver;
        priceOracle = AggregatorV3Interface(_tradePriceAgg);
        gasOracle = AggregatorV3Interface(_gasPriceAgg);
        token = IERC20(_token);
        gas = _gas;
    }

    // ======= DEV HELPERS =========
    /// @dev use this function to encode the data off-chain for the action data field
    function getActionData(
        address _sender
    )
        public
        pure
        virtual
        returns(bytes memory)
    {
        return abi.encodeWithSelector(
            this.action.selector,
            _sender
        );
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

        // DISABLED FOR TESTNET: Get gas price from oracle
        // (uint80 _, int gasPrice, uint _, uint _, uint80 _) = gasOracle.latestRoundData();
        // INSTEAD: 80 gwei fixed gas price on testnet
        uint256 gasPrice = 80000000000;

        // totalReward = gasFee*1.25
        uint256 totalRewardDai = gas.mul(uint256(price)).mul(gasPrice).mul(100).div(80);
        token.safeTransferFrom(_sender, receiver, totalRewardDai, "ActionStablecoinFee.action:");
        return totalRewardDai;
    }
}