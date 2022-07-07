# how to use
1. deploy **xxxDAONFT**
2. use **step 1** contract address as parameter to deploy **XXXDAOGenesisMint**
3. call **setMintContract** on xxxDAONFT address with **XXXDAOGenesisMint** address.
4. call **setWhiteList** on **XXXDAOGenesisMint** to set whitelist address
5. set mint open and use address in WL to mint.


**this idea that separate sale logic from main nft contract was borrowed from cyberbroker.**