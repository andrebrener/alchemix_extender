// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.11;

import "../interfaces/IWhitelist.sol";
import "../interfaces/IERC20.sol";
import "../interfaces/IAlchemistV2.sol";
import "../interfaces/ICurveMetapool.sol";

import "@openzeppelin/contracts/access/Ownable.sol";

contract Extender is Ownable {
    IWhitelist constant whitelist =
        IWhitelist(0x78537a6CeBa16f412E123a90472C6E0e9A8F1132);

    address ALCHEMIST_ADDRESS = 0x5C6374a2ac4EBC38DeA0Fc1F8716e5Ea1AdD94dd;

    address public yieldTokenAddress =
        0xdA816459F1AB5631232FE5e97a05BBBb94970c95;

    /// The address of the curve pool to swap on
    address public curvePool = 0x43b4FdFD4Ff969587185cDB6f0BD875c5Fc83f8c;
    /// The `i` param for the curve swap
    int128 public poolInputIndex = 0;
    /// The `j` param for the curve swap
    int128 public poolOutputIndex = 1;

    /// @notice When the msg.sender is not whitelisted
    error Unauthorized(address sender);

    /// @notice When we're passed invalid parameters
    error IllegalArgument(string reason);

    /// @notice When the yieldToken has no underlyingToken in the alchemist
    error UnsupportedYieldToken(address yieldToken);

    /// @notice When the collateral is insufficient to mint targetDebt
    error MintFailure();

    /// @notice Approve a contract to spend tokens
    function approve(address token, address spender) internal {
        IERC20(token).approve(spender, type(uint256).max);
    }

    function getUnderlyingToken() public view returns (address) {
        // Get underlying token from alchemist
        address underlyingToken = IAlchemistV2(ALCHEMIST_ADDRESS)
            .getYieldTokenParameters(yieldTokenAddress)
            .underlyingToken;
        if (underlyingToken == address(0))
            revert UnsupportedYieldToken(yieldTokenAddress);

        return underlyingToken;
    }

    /// @notice Executes whole operation
    /// @param collateralValue The value of the collateral to deposit on Alchemix
    /// @param targetDebt The amount of debt that the user will incur
    /// @param finalRecipient Address that will receive the final borrowed amount
    /// @param maxSlippage Maximum slippage for curve swap
    /// @return success Always true unless reverts
    function executeOperation(
        uint256 collateralValue,
        uint256 targetDebt,
        address finalRecipient,
        uint128 maxSlippage
    ) external payable returns (bool) {
        address underlyingToken = getUnderlyingToken();
        address recipient = msg.sender;

        // Gate on EOA or whitelisted
        if (!(tx.origin == recipient || whitelist.isWhitelisted(msg.sender)))
            revert Unauthorized(msg.sender);

        // Check if user has that balance
        require(
            IERC20(underlyingToken).balanceOf(recipient) >= collateralValue,
            "Not enough balance"
        );

        // Check targetDebt < 0.5 * collateralValue
        require(
            targetDebt <= collateralValue / 2,
            "Debt greater than collateral value / 2"
        );

        _transferTokensToSelf(underlyingToken, collateralValue);

        // Deposit into recipient's account
        approve(underlyingToken, ALCHEMIST_ADDRESS);

        IAlchemistV2(ALCHEMIST_ADDRESS).depositUnderlying(
            yieldTokenAddress,
            collateralValue,
            recipient,
            0
        );

        // Mint from recipient's account
        try
            IAlchemistV2(ALCHEMIST_ADDRESS).mintFrom(
                recipient,
                targetDebt,
                address(this)
            )
        {} catch {
            revert MintFailure();
        }

        address debtToken = IAlchemistV2(ALCHEMIST_ADDRESS).debtToken();

        uint256 minAmountOut = (targetDebt * (100 - maxSlippage)) / 100;

        uint256 amountOut = _curveSwap(
            curvePool,
            debtToken,
            poolInputIndex,
            poolOutputIndex,
            minAmountOut
        );

        // Send funds back to recipient
        _transferTokensToRecipient(underlyingToken, amountOut, finalRecipient);

        return true;
    }

    /// @notice Either convert received eth to weth, or transfer ERC20 from the msg.sender to this contract
    /// @param underlyingToken The ERC20 desired to transfer
    /// @param collateralInitial The amount of tokens taken from the user

    function _transferTokensToSelf(
        address underlyingToken,
        uint256 collateralInitial
    ) internal {
        if (msg.value > 0) revert IllegalArgument("msg.value should be 0");
        IERC20(underlyingToken).transferFrom(
            msg.sender,
            address(this),
            collateralInitial
        );
    }

    /// @notice Either convert received eth to weth, or transfer ERC20 from the msg.sender to this contract
    /// @param underlyingToken The ERC20 desired to transfer
    /// @param swapAmount The amount of tokens after swap
    /// @param recipient Address that will receive the final tokens

    function _transferTokensToRecipient(
        address underlyingToken,
        uint256 swapAmount,
        address recipient
    ) internal {
        if (msg.value > 0) revert IllegalArgument("msg.value should be 0");
        IERC20(underlyingToken).transferFrom(
            address(this),
            recipient,
            swapAmount
        );
    }

    /// @notice Swap on curve using the supplied params
    /// @param poolAddress Curve pool address
    /// @param debtToken The alAsset debt token address
    /// @param i Curve swap param
    /// @param j Curve swap param
    /// @param minAmountOut Minimum amount received from swap
    /// @return amountOut The actual amount received from swap
    function _curveSwap(
        address poolAddress,
        address debtToken,
        int128 i,
        int128 j,
        uint256 minAmountOut
    ) internal returns (uint256 amountOut) {
        // Curve swap
        uint256 debtTokenBalance = IERC20(debtToken).balanceOf(address(this));
        approve(debtToken, poolAddress);
        return
            ICurveMetapool(poolAddress).exchange_underlying(
                i,
                j,
                debtTokenBalance,
                minAmountOut
            );
    }

    // ONLY OWNER SET PARAMS

    /// @notice Set new token
    /// @param newYieldTokenAddress ERC20 token contract address
    function setYieldTokenAddress(address newYieldTokenAddress)
        public
        onlyOwner
    {
        require(
            IAlchemistV2(ALCHEMIST_ADDRESS).isSupportedYieldToken(
                newYieldTokenAddress
            ),
            "Yield Token not supported by Alchemix"
        );

        yieldTokenAddress = newYieldTokenAddress;
    }

    /// @notice Set new curve pool
    /// @param newCurvePool new ERC20 token contract address
    function setCurvePool(address newCurvePool) public onlyOwner {
        curvePool = newCurvePool;
    }

    /// @notice Set new curve pool parameters
    /// @param newPoolInputIndex new curve input index
    /// @param newPoolOutputIndex new curve output index
    function setCurveIndexes(
        int128 newPoolInputIndex,
        int128 newPoolOutputIndex
    ) public onlyOwner {
        poolInputIndex = newPoolInputIndex;
        poolOutputIndex = newPoolOutputIndex;
    }

    /// Extra functions for testing

    function ERC20BalanceOf() public view returns (uint256) {
        address recipient = msg.sender;
        address underlyingToken = getUnderlyingToken();

        uint256 balance = IERC20(underlyingToken).balanceOf(recipient);

        return balance;
    }

    function contractDebtTokenBalance() public view returns (uint256) {
        address debtToken = IAlchemistV2(ALCHEMIST_ADDRESS).debtToken();

        uint256 balance = IERC20(debtToken).balanceOf(address(this));

        return balance;
    }
}
