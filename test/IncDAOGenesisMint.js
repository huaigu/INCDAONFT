// We import Chai to use its asserting functions here.
const { expect } = require("chai");

// an async function.
describe("IncGenesisMint Contract", function () {

    let daoNFTToken;
    let hardhatContract;
    let owner;
    let testMintAccount1;
    let testMintAccount2;
    let testMintAccount3;
    let testMintAccount4;
    let testMintAccount5;
    let testMintAccount6;

    beforeEach(async function () {

        const totalGenesisMintAmount = 5;
        [owner, testMintAccount1, testMintAccount2, testMintAccount3, testMintAccount4, testMintAccount5, testMintAccount6] = await ethers.getSigners();

        NftToken = await ethers.getContractFactory("IncDaoNFT");
        MintContract = await ethers.getContractFactory("IncDAOGenesisMint");

        daoNFTToken = await NftToken.deploy();
        hardhatContract = await MintContract.deploy(daoNFTToken.address, totalGenesisMintAmount);
    });

    // You can nest describe calls to create subsections.
    describe("MintContract Deployment", function () {
        it("Should set the right owner", async function () {
            expect(await hardhatContract.owner()).to.equal(owner.address);
        });

        it("Should be the right daonft address", async function () {
            expect(await hardhatContract.xxxDAONFT()).to.equal(daoNFTToken.address);
        });
    });

    describe.only("Mint", function () {
        it("Should set whitelist correctly", async function () {
            //setup nft contract
            await daoNFTToken.setMintContract(hardhatContract.address, true);

            await hardhatContract.setOpenMint(true);
            // mint option, enable:true,role:VC, price：0
            await hardhatContract.setWhiteList([testMintAccount1.address], [[1, 0, 256]]);
            const whiteListOpt = await hardhatContract.getWhiteListInfo(testMintAccount1.address);

            expect(whiteListOpt.enableMint).to.equal(true);
            expect(whiteListOpt.role).to.equal(ethers.BigNumber.from("0x0"));
            expect(whiteListOpt.mintPrice).to.equal(ethers.BigNumber.from("0x100"));
        });
        it("Should mint 1 nft", async function () {
            //setup nft contract
            await daoNFTToken.setMintContract(hardhatContract.address, true);

            await hardhatContract.setOpenMint(true);
            // mint option, enable:true,role:VC, price：0
            await hardhatContract.setWhiteList([testMintAccount1.address], [[1, 0, 0]]);
            expect(await hardhatContract.connect(testMintAccount1).mint()).to.be.ok;
        });

        it("Should Mint 1 with correct metadata", async function () {

            //setup nft contract
            await daoNFTToken.setURLRoleMap([0, 1, 2], ["ipfs://QQQQ/1", "ipfs://QQQQ/2", "ipfs://QQQQ/3"]);
            await daoNFTToken.setMintContract(hardhatContract.address, true);

            //open mint
            await hardhatContract.setOpenMint(true);
            // mint option, enable:true,role:Team(2), price：0
            await hardhatContract.setWhiteList([testMintAccount1.address], [[1, 2, 0]]);
            // mint => tokenID 0
            expect(await hardhatContract.connect(testMintAccount1).mint()).to.be.ok;

            expect(await daoNFTToken.tokenURI(0)).to.equal("ipfs://QQQQ/3");
        });

        it("Should be fail if address not in WL", async function () {

            //setup nft contract
            await daoNFTToken.setMintContract(hardhatContract.address, true);

            await hardhatContract.setOpenMint(true);
            // mint option, enable:true,role:VC, price：0
            await hardhatContract.setWhiteList([testMintAccount1.address], [[1, 0, 0]]);
            await expect(hardhatContract.connect(testMintAccount2).mint()).to.be.rejectedWith("address is not allowed");
        });

        it("Should be fail if mint more than 1 time with same role", async function () {

            //setup nft contract
            await daoNFTToken.setMintContract(hardhatContract.address, true);

            await hardhatContract.setOpenMint(true);
            // mint option, enable:true,role:VC, price：0
            await hardhatContract.setWhiteList([testMintAccount1.address], [[1, 0, 0]]);
            expect(await hardhatContract.connect(testMintAccount1).mint()).to.be.ok;

            // mint again
            await expect(hardhatContract.connect(testMintAccount1).mint()).to.be.rejectedWith("address is already minted");
        });

        it("Should mint nfts successfully if use different role with same address in WL", async function () {

            //setup nft contract
            await daoNFTToken.setMintContract(hardhatContract.address, true);
            await daoNFTToken.setURLRoleMap([0, 1, 2], ["ipfs://QQQQ/1", "ipfs://QQQQ/2", "ipfs://QQQQ/3"]);

            await hardhatContract.setOpenMint(true);
            // mint option, enable:true,role:VC, price：0
            await hardhatContract.setWhiteList([testMintAccount1.address], [[1, 0, 0]]);
            // mint 1st nft.
            expect(await hardhatContract.connect(testMintAccount1).mint()).to.be.ok;

            // mint again with different role
            await hardhatContract.setWhiteList([testMintAccount1.address], [[1, 1, 0]]);
            // mint 2nd nft with role VC
            expect(await hardhatContract.connect(testMintAccount1).mint()).to.be.ok;

            expect(await daoNFTToken.balanceOf(testMintAccount1.address)).to.equal(2);
            // should be 2 if mint with Moderator(1) role
            expect(await daoNFTToken.tokenURI(1)).to.equal("ipfs://QQQQ/2");
        });

        it("should be failed if not enough ether to cover price", async function () {
            //setup nft contract
            await daoNFTToken.setMintContract(hardhatContract.address, true);

            await hardhatContract.setOpenMint(true);
            // mint option, enable:true,role:VC, price：0
            await hardhatContract.setWhiteList([testMintAccount1.address], [[1, 0, 1000]]);
            await expect(hardhatContract.connect(testMintAccount1).mint()).to.be.rejectedWith("not enough to cover mint fee");
        });

        it("should be failed if contract exceed max supply", async function () {
            //setup nft contract
            await daoNFTToken.setMintContract(hardhatContract.address, true);

            await hardhatContract.setOpenMint(true);
            // mint option, enable:true,role:VC, price：0
            await hardhatContract.setWhiteList([
                testMintAccount1.address,
                testMintAccount2.address,
                testMintAccount3.address,
                testMintAccount4.address,
                testMintAccount5.address,
                testMintAccount6.address,
            ], [[1, 0, 0],[1, 0, 0],[1, 0, 0],[1, 0, 0],[1, 0, 0],[1, 0, 0]]);
            await expect(hardhatContract.connect(testMintAccount1).mint()).to.be.ok;
            await expect(hardhatContract.connect(testMintAccount2).mint()).to.be.ok;
            await expect(hardhatContract.connect(testMintAccount3).mint()).to.be.ok;
            await expect(hardhatContract.connect(testMintAccount4).mint()).to.be.ok;
            await expect(hardhatContract.connect(testMintAccount5).mint()).to.be.ok;

            await expect(hardhatContract.connect(testMintAccount6).mint()).to.be.rejectedWith("Mint request exceeds mint supply");
        });
    });

    //   describe("Metadata", function () { 
    //     it("Should be set correctly", async function () {
    //       await hardhatToken.setURLRoleMap([0,1,2], ["ipfs://QQQQ/1", "ipfs://QQQQ/2", "ipfs://QQQQ/3"]);
    //       expect(await hardhatToken.urlRoleMap(0)).to.equal("ipfs://QQQQ/1");
    //     });

    //     it("Should get correct tokenURI from tokenURI function", async function () {
    //       await hardhatToken.setMintContract(testMintAccount.address, true);
    //       await hardhatToken.setURLRoleMap([0,1,2], ["ipfs://QQQQ/1", "ipfs://QQQQ/2", "ipfs://QQQQ/3"]);
    //       const tokenID = 0;
    //       await hardhatToken.connect(testMintAccount).mintNFTFromMintContract(1, testMintAccount.address, tokenID);
    //       await expect(hardhatToken.tokenURI(tokenID)).to.eventually.equal("ipfs://QQQQ/2");
    //     });
    //   });

});