// We import Chai to use its asserting functions here.
const { expect } = require("chai");
// const { ethers } = require("ethers");
// an async function.
describe.only("xxxDAONFT Contract", function () {

  let hardhatToken;
  let erc721HolderContract;
  let owner;
  let testMintAccount;
  let OtherAccount;

  // `beforeEach` will run before each test, re-deploying the contract every
  // time. It receives a callback, which can be async.
  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    Token = await ethers.getContractFactory("XXXDaoNFT");
    Holder = await ethers.getContractFactory("xxxDAONFTHolder");
    [owner, testMintAccount, OtherAccount] = await ethers.getSigners();

    // To deploy our contract, we just have to call Token.deploy() and await
    // for it to be deployed(), which happens onces its transaction has been
    // mined.
    hardhatToken = await Token.deploy();
    erc721HolderContract = await Holder.deploy();
  });

  // You can nest describe calls to create subsections.
  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await hardhatToken.owner()).to.equal(owner.address);
    });

    it("Total minted should be zero", async function () {
      const totalMinted = await hardhatToken.totalMinted();
      expect(totalMinted).to.equal(0);
    });
  });

  describe("Mint", function () {
    it("Should fail if use account not in allow list", async function () {
      await expect(hardhatToken.connect(testMintAccount).mintNFTFromMintContract(0, testMintAccount.address, 0)).to.be.revertedWith("Only mint contract can mint");
    });

    it("Should Mint 1 nft if use allowed account", async function () {
      await hardhatToken.setMintContract(testMintAccount.address, true);
      expect(await hardhatToken.connect(testMintAccount).mintNFTFromMintContract(0, testMintAccount.address, 0)).to.be.ok;
    });
  });

  describe("Metadata", function () {
    it("Should be set correctly", async function () {
      await hardhatToken.setURLRoleMap([0, 1, 2], ["ipfs://QQQQ/1", "ipfs://QQQQ/2", "ipfs://QQQQ/3"]);
      expect(await hardhatToken.urlRoleMap(0)).to.equal("ipfs://QQQQ/1");
    });

    it("Should get correct tokenURI from tokenURI function", async function () {
      await hardhatToken.setMintContract(testMintAccount.address, true);
      await hardhatToken.setURLRoleMap([0, 1, 2], ["ipfs://QQQQ/1", "ipfs://QQQQ/2", "ipfs://QQQQ/3"]);
      const tokenID = 0;
      await hardhatToken.connect(testMintAccount).mintNFTFromMintContract(1, testMintAccount.address, tokenID);
      await expect(hardhatToken.tokenURI(tokenID)).to.eventually.equal("ipfs://QQQQ/2");
    });

    it("Should get right role after mint 1 nft", async function () {
      await hardhatToken.setMintContract(testMintAccount.address, true);
      await hardhatToken.setURLRoleMap([0, 1, 2], ["ipfs://QQQQ/1", "ipfs://QQQQ/2", "ipfs://QQQQ/3"]);
      const tokenID = 0;
      await hardhatToken.connect(testMintAccount).mintNFTFromMintContract(1, testMintAccount.address, tokenID);
      await hardhatToken.connect(testMintAccount).mintNFTFromMintContract(2, testMintAccount.address, tokenID + 1);
      const metadata = await hardhatToken.tokenMetadata(tokenID);
      const metadata2 = await hardhatToken.tokenMetadata(tokenID + 1);
      // const metadata2 = await hardhatToken.getMetadata(tokenID);
      console.log(metadata);
      console.log(metadata2);
      expect(await metadata[2]).to.equal(1);
    });

    it("should failed if call transferFrom after mint", async function () {
      await hardhatToken.setMintContract(testMintAccount.address, true);
      const tokenID = 0;
      await hardhatToken.connect(testMintAccount).mintNFTFromMintContract(1, testMintAccount.address, tokenID);

      await expect(hardhatToken.connect(testMintAccount).transferFrom(testMintAccount.address, OtherAccount.address, tokenID))
        .to.be.revertedWith("token can not be transferred");
    });

    it("should failed if call safetransferFrom after mint", async function () {
      await hardhatToken.setMintContract(testMintAccount.address, true);
      const tokenID = 0;
      await hardhatToken.connect(testMintAccount).mintNFTFromMintContract(1, testMintAccount.address, tokenID);
      await hardhatToken.connect(testMintAccount).approve(owner.address, tokenID)
      // call override function
      await expect(hardhatToken["safeTransferFrom(address,address,uint256)"](testMintAccount.address, erc721HolderContract.address, tokenID))
        .to.be.revertedWith("token can not be transferred");
    });
  });
});