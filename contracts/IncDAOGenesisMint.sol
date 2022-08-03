// SPDX-License-Identifier: MI
// Creator: INC DAO dev team

// Genesis mint for INC DAO NFT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "./IncDaoNFT.sol";

contract IncDAOGenesisMint is ReentrancyGuard, Ownable {

    struct mintOpt{
        bool enableMint;
        uint256 role;
        uint256 mintPrice;
    }

     // IncubatorDAO NFT contract
    IncDaoNFT public xxxDAONFT;
    uint256 public genesisMintAmount;
    
    uint256 internal _leftToMint;

    //switches
    bool internal _openMint = false;

    // white list
    mapping(address => mintOpt) internal whiteList;
    // minted list
    mapping(address => mapping(uint256 => bool)) internal mintedAddress;

    constructor(address _xxxDAONFTAddress, uint256 totalMintAmount) {
        // Set the XXX DAO NFT token address
        xxxDAONFT = IncDaoNFT(_xxxDAONFTAddress);
        genesisMintAmount = totalMintAmount;
        _leftToMint = totalMintAmount;
    }

    
    function mint() external payable nonReentrant isMintOpen {
        
        mintOpt memory option = whiteList[msg.sender];
        uint256 role = option.role;

        require(option.enableMint, "address is not allowed");
        require(!mintedAddress[msg.sender][role], "address is already minted");
        require(msg.value >= option.mintPrice, "not enough to cover mint fee");

        // Check that there are mints available for purchase
        require(_leftToMint > 0, "Mint request exceeds mint supply");

        uint256 tokenId = xxxDAONFT.totalMinted();

        //Update
        _leftToMint--;

        mintedAddress[msg.sender][role] = true;

        // mint
        xxxDAONFT.mintNFTFromMintContract(role, msg.sender, tokenId);
    }

    // batch mint by admin 
    function adminMint(uint256[] calldata roles, address[] calldata toAddrs) external nonReentrant onlyOwner{
        require(roles.length == toAddrs.length, "length must be equal");
        require(_leftToMint >= roles.length, "Mint request exceeds mint supply");
        
        for (uint256 index = 0; index < roles.length; index++) {
            address to = toAddrs[index];
            uint256 role = roles[index];

            require(!mintedAddress[to][role], "address is already minted");

            //Update
            _leftToMint--;
            mintedAddress[to][role] = true;

            // mint
            uint256 tokenId = xxxDAONFT.totalMinted();
            xxxDAONFT.mintNFTFromMintContract(role, to, tokenId);
        } 
    }

    function setWhiteList(address[] calldata addrs, mintOpt[] calldata opts) external onlyOwner{
        require(addrs.length == opts.length, "length must be equal");
        for (uint256 index = 0; index < addrs.length; index++) {
            whiteList[addrs[index]] = opts[index];
        }
    }

    function getWhiteListInfo(address addr) public view returns (mintOpt memory){
        return whiteList[addr];
    }

    // set switch
    function setOpenMint(bool _setting) external onlyOwner {
        _openMint = _setting;
    }

    // modifiers
    modifier isMintOpen() {
        require(
            _openMint,
            "genesis mint has not started"
        );
        _;
    }

}