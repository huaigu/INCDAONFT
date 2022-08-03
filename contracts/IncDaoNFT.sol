// SPDX-License-Identifier: MIT
// Creator: INC DAO dev team

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/*
██╗███╗   ██╗ ██████╗██╗   ██╗██████╗  █████╗ ████████╗ ██████╗ ██████╗     ██████╗  █████╗  ██████╗ 
██║████╗  ██║██╔════╝██║   ██║██╔══██╗██╔══██╗╚══██╔══╝██╔═══██╗██╔══██╗    ██╔══██╗██╔══██╗██╔═══██╗
██║██╔██╗ ██║██║     ██║   ██║██████╔╝███████║   ██║   ██║   ██║██████╔╝    ██║  ██║███████║██║   ██║
██║██║╚██╗██║██║     ██║   ██║██╔══██╗██╔══██║   ██║   ██║   ██║██╔══██╗    ██║  ██║██╔══██║██║   ██║
██║██║ ╚████║╚██████╗╚██████╔╝██████╔╝██║  ██║   ██║   ╚██████╔╝██║  ██║    ██████╔╝██║  ██║╚██████╔╝
╚═╝╚═╝  ╚═══╝ ╚═════╝ ╚═════╝ ╚═════╝ ╚═╝  ╚═╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝    ╚═════╝ ╚═╝  ╚═╝ ╚═════╝                                                                                              
*/

contract IncDaoNFT is ERC721, Ownable {

    event URLRoleMapChanged(uint256 indexed role, string tokenURI);
    event TokenMetadataChanged(uint256 indexed tokenId, bool useCustomizedTokenURI, string tokenURI, uint256 indexed tokenRole);

    enum Role {
        Node,
        Mentor,
        Alumnu,
        Reserved1,
        Reserved2,
        Reserved3,
        Reserved4,
        Reserved5
    }

    struct Metadata {
        bool useCustomizedTokenURI;
        string tokenURI;
        Role tokenRole;
    }

    // constants
    uint256 public constant TOTAL_MEMBERS = 42000;

    // track total supply and burned.
    uint256 public totalMinted = 0;
    uint256 public totalUnplugged = 0;

    // if token can be transferred
    bool public canTransfer = false;

    // mint contracts
    mapping(address => bool) public mintContracts;

    // nft metadata
    mapping(uint256 => Metadata) public tokenMetadata;
    mapping(Role => string) public urlRoleMap;

    constructor() ERC721("INC DAO PASS", "INP") {}

    /**
     * Metadata functionality
     **/
    function setURLRoleMap(Role[] calldata role, string[] calldata tokenURL) external onlyOwner {
        require(role.length == tokenURL.length, "wrong parameters");

        for (uint256 index = 0; index < role.length; index++) {
            urlRoleMap[role[index]] = tokenURL[index];
            emit URLRoleMapChanged(uint(role[index]), tokenURL[index]);
        }
    }

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
            return tokenMetadata[tokenId].tokenURI;
        } else {
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
     **/

    // use separate contract for minting
    function setMintContract(address _mintContract, bool _enable)
        external
        onlyOwner
    {
        mintContracts[_mintContract] = _enable;
    }

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
     * Admin Burn
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
     **/

    function _transfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override {
        require(canTransfer, "token can not be transferred");
        super._transfer(from, to, tokenId);
    }

    function setTransfer(bool _canTransfer) public onlyOwner {
        canTransfer = _canTransfer;
    }
}
