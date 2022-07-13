
# XXX DAO NFT 

本项目由两个合约组成
* ERC721 NFT Token合约
* 销售合约（可以扩展成多个不同销售策略的合约）

基本思想参照了```cyberbrokers``` NFT的模式，通过赋予销售合约mint的权限，来实现mint逻辑和nft合约本身的分离。

**基本逻辑概述**：
>  NFT合约设置了三种持有人角色，无论那种销售策略，都必须通过白名单mint，白名单在设置过程中，指定了用户（钱包地址）mint时候的角色。
    
>  TokenURI有两种显示模式，默认情况下，每种角色会显示这个角色对应的默认metadata（对应三种ipfs的json数据），为了潜在的可定制性，允许用户可以显示一个定制的metadata(需要合约owner设置)。

> NFT目前设定为不可以被转移（无法销售），因为只是一个持有证明。

**ERC721合约实现的功能有**：
 * 设置允许mint的合约数组
 * 设置角色<=>tokenURI的mapping
 * 允许合约管理员（owner）销毁某个NFT
 * 提取ETH
 * mint一个包含角色参数的nft（来自销售合约调用）

**销售合约功能**:
 * 设置用户白名单(包含mint的角色，地址，销售价格)默认情况下价格都是0，只是为了方便扩展。
 * 一个开关控制是否可以mint
 * 用户mint
 * 管理员批量mint一组自定义角色的nft


# How to use
1. deploy **xxxDAONFT**
2. use **step 1** contract address as parameter to deploy **XXXDAOGenesisMint**
3. call **setMintContract** on xxxDAONFT address with **XXXDAOGenesisMint** address.
4. call **setWhiteList** on **XXXDAOGenesisMint** to set whitelist address
5. set mint open and use address in WL to mint.


**this idea that separate sale logic from main nft contract was borrowed from cyberbroker.**