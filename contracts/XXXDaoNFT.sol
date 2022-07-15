// SPDX-License-Identifier: GPL-3.0
// Creator: xxx dev team

// idea borrowed from cyberbrokers
// this contract is not audited, please use it at your own risk.
// TODO: gas reduce, for loop, counter

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract XXXDaoNFT is ERC721, Ownable {

    event URLRoleMapChanged(uint256 indexed role, string tokenURI);
    event TokenMetadataChanged(uint256 indexed tokenId, bool useCustomizedTokenURI, string tokenURI, uint256 indexed tokenRole);

    enum Role {
        VC,
        Moderator,
        Team
    }

    struct Metadata {
        bool useCustomizedTokenURI;
        string tokenURI;
        Role tokenRole;
    }

    // constants
    uint256 public constant TOTAL_MEMBERS = 42000;

    // track total supply and burned.
    // todo: use Counter library to save gas
    uint256 public totalMinted = 0;
    uint256 public totalUnplugged = 0;

    // if token can be transferred
    // 默认不允许转移NFT
    bool public canTransfer = false;

    // mint contracts
    mapping(address => bool) public mintContracts;

    // nft metadata
    mapping(uint256 => Metadata) public tokenMetadata;
    mapping(Role => string) public urlRoleMap;

    constructor() ERC721("xxx Dao NFT", "xxx") {}

    /**
     * Metadata functionality
     **/

    // 设置角色=>TokenURI 对应关系，三种角色，对应三种默认的token url.
    function setURLRoleMap(Role[] calldata role, string[] calldata tokenURL) external onlyOwner {
        require(role.length == tokenURL.length, "wrong parameters");

        for (uint256 index = 0; index < role.length; index++) {
            urlRoleMap[role[index]] = tokenURL[index];
            emit URLRoleMapChanged(uint(role[index]), tokenURL[index]);
        }
    }

    // 允许合约拥有者设置token的metadata, 主要是为了给某些tokenid设置单独的TokenURL显示
    function updateUserMetadata(uint256[] calldata tokenIds, Metadata[] calldata data) external onlyOwner{
         require(tokenIds.length == data.length, "wrong parameters");

        for (uint256 index = 0; index < tokenIds.length; index++) {
            Metadata memory metadata = data[index];
            tokenMetadata[tokenIds[index]].useCustomizedTokenURI = metadata.useCustomizedTokenURI;
            tokenMetadata[tokenIds[index]].tokenURI = metadata.tokenURI;
            emit TokenMetadataChanged(tokenIds[index], metadata.useCustomizedTokenURI, metadata.tokenURI, uint256(metadata.tokenRole));
        }
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        require(
            _exists(tokenId),
            "ERC721Metadata: URI query for nonexistent token"
        );

        if (tokenMetadata[tokenId].useCustomizedTokenURI) {
            // return customized tokenURI
            // 如果这个token设置了使用自定义token url，就返回自定义的url
            return tokenMetadata[tokenId].tokenURI;
        } else {
            // return normal tokenURI base token role
            // 如果这个token没有设置自定义token url，就按照token的角色返回通用的url
            Role role = tokenMetadata[tokenId].tokenRole;
            return urlRoleMap[role];
        }
    }

    /**
     * Wrapper for Enumerable functions: totalSupply & getTokens
     **/
    function totalSupply() public view returns (uint256) {
        return totalMinted - totalUnplugged;
    }

    /**
     * Minting functionality
     * 使用额外的销售合约来Mint NFT
     **/

    // use separate contract for minting
    function setMintContract(address _mintContract, bool _enable)
        external
        onlyOwner
    {
        mintContracts[_mintContract] = _enable;
    }

    // mint nft需要时需要记录角色类型
    function mintNFTFromMintContract(uint256 role, address to, uint256 tokenId) external {
        require(mintContracts[msg.sender], "Only mint contract can mint");
        require(totalMinted < TOTAL_MEMBERS, "Max NFT minted");
         require(
            !_exists(tokenId),
            "nft already minted"
        );

        _mint(to, tokenId);
        tokenMetadata[tokenId].tokenRole = Role(role);
        totalMinted++;
    }

    /**
     * Admin Burn, 当允许合约所有者（多签钱包）销毁用户的NFT。
     **/
    function adminBurn(uint256 tokenId) external onlyOwner {
        super._burn(tokenId);
        totalUnplugged++;
    }

    /**
     * Withdraw functions
     **/
    function withdraw() public onlyOwner {
        (bool success, ) = msg.sender.call{value: address(this).balance}("");
        require(success, "Transfer failed.");
    }

    /**
     * override functions
     * 禁止转移NFT，目前仅作持有证明
     **/

    function _transfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override {
        require(canTransfer, "token can not be transferred");
        super._transfer(from, to, tokenId);
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory _data
    ) public virtual override {
        require(canTransfer, "token can not be transferred");
        super.safeTransferFrom(from, to, tokenId, _data);
    }

    // 设置是否可以转移NFT
    function setTransfer(bool _canTransfer) public onlyOwner {
        canTransfer = _canTransfer;
    }
}
