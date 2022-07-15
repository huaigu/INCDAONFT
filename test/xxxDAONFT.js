// We import Chai to use its asserting functions here.
const { expect } = require("chai");
// an async function.
describe("xxxDAONFT Contract", function () {

  let hardhatToken;
  let owner;
  let testMintAccount;

  // `beforeEach` will run before each test, re-deploying the contract every
  // time. It receives a callback, which can be async.
  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    Token = await ethers.getContractFactory("XXXDaoNFT");
    [owner, testMintAccount] = await ethers.getSigners();

    // To deploy our contract, we just have to call Token.deploy() and await
    // for it to be deployed(), which happens onces its transaction has been
    // mined.
    hardhatToken = await Token.deploy();
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
      await hardhatToken.setURLRoleMap([0,1,2], ["ipfs://QQQQ/1", "ipfs://QQQQ/2", "ipfs://QQQQ/3"]);
      expect(await hardhatToken.urlRoleMap(0)).to.equal("ipfs://QQQQ/1");
    });

    it("Should get correct tokenURI from tokenURI function", async function () {
      await hardhatToken.setMintContract(testMintAccount.address, true);
      await hardhatToken.setURLRoleMap([0,1,2], ["ipfs://QQQQ/1", "ipfs://QQQQ/2", "ipfs://QQQQ/3"]);
      const tokenID = 0;
      await hardhatToken.connect(testMintAccount).mintNFTFromMintContract(1, testMintAccount.address, tokenID);
      await expect(hardhatToken.tokenURI(tokenID)).to.eventually.equal("ipfs://QQQQ/2");
    });

    it("Should get right role after mint 1 nft", async function () {
      await hardhatToken.setMintContract(testMintAccount.address, true);
      await hardhatToken.setURLRoleMap([0,1,2], ["ipfs://QQQQ/1", "ipfs://QQQQ/2", "ipfs://QQQQ/3"]);
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
  });
});