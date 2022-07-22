// SPDX-License-Identifier: GPL-3.0
// Creator: xxx dev team

// idea borrowed from cyberbrokers
// this contract is not audited, please use it at your own risk.
// TODO: gas reduce, for loop, counter

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract IncDAONFTHolder is IERC721Receiver {
  function onERC721Received(
    address,
    address,
    uint256,
    bytes memory
  )
    public
    pure
    returns(bytes4)
  {
    return this.onERC721Received.selector;
  }
}