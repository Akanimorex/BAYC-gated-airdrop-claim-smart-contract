import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre, {ethers} from "hardhat";
const helpers = require("@nomicfoundation/hardhat-network-helpers");


//0x7A9fe22691c811ea339D9B73150e6911a5343DcA
//0xd66F8eAf84b11654a19126a98a3F55B960846Dd8
//0xCA1257Ade6F4fA6c6834fdC42E030bE6C0f5A813







describe("MerkleAirdrop", function () {

  async function deployContractsAndSetVariables(){

    const BAYCNFT = "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D";
    const NFT_HOLDER = "0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB";

  

      await helpers.impersonateAccount(NFT_HOLDER);
      const impersonatedSigner = await ethers.getSigner(NFT_HOLDER);
      const BAYCNFT_CONTRACT = await ethers.getContractAt("IERC721",BAYCNFT,impersonatedSigner);

    const AkanToken = await hre.ethers.getContractFactory("REX");
    const erc20Token = await AkanToken.deploy();


    const [owner, otherAccount] = await hre.ethers.getSigners();
    let amount = ethers.parseUnits('100', 'ether');
    let merkleProof = [
      '0xc7fa9d705743cd99733a59945f5b8a8cace442aa1046af5741478cea5b292db6',
      '0x06520f243871c7edd3c985634bc8170778df8ce64e5c39ded178a1d50ab86309'
    ]; // Replace with actual merkle proof 
    const MerkleAirdrop = await hre.ethers.getContractFactory("MerkleAirdrop");
    const merkleAirdrop = await MerkleAirdrop.deploy(
      '0xD7ACd2a9FD159E69Bb102A1ca21C9a3e3A5F771B', // Replace with actual token address
      '0xaba3fd92118cdc46b2ccb00e2a05a4ede717566cca1ef4ee35d6953a88cb7db6' // Replace with actual merkle root
    );

    await erc20Token.transfer(merkleAirdrop,ethers.parseUnits("1000",8));




    return { merkleAirdrop,owner,amount,otherAccount,merkleProof,erc20Token, impersonatedSigner,BAYCNFT_CONTRACT}; 
  }

  //deploying the contract, passing the parameters

  describe("Deployment",function(){
    it('should deploy and set the owner correctly',async function(){
       const {owner, merkleAirdrop} = await deployContractsAndSetVariables();

       expect(await merkleAirdrop.owner()).to.equal(owner.address);
      })    
  })

  describe("Claiming",function(){

    it('should check if user owns the NFT',async function(){
      const {owner, amount, merkleAirdrop, otherAccount,merkleProof,erc20Token,impersonatedSigner,BAYCNFT_CONTRACT} = await loadFixture(deployContractsAndSetVariables);
      const erc20Tokenamount = ethers.parseUnits("900",18); 

      
      await expect(BAYCNFT_CONTRACT.balanceOf(impersonatedSigner.address)).to.be.gte(1);
      
      // expect(await merkleAirdrop.connect(impersonatedSigner).checkNFT(otherAccount.address)).to.be.true;

    })
    
    it("owner should be able to claim ", async function(){
      const {owner, amount, merkleAirdrop, otherAccount,merkleProof} = await deployContractsAndSetVariables();
      console.log(merkleProof,"merkle proof");

      expect(merkleAirdrop.connect(otherAccount).claimAirdrop(amount,merkleProof));
    })


    it("should check if user has claimed",async function(){
      const {owner, amount, merkleAirdrop, otherAccount,merkleProof} = await deployContractsAndSetVariables();

      await merkleAirdrop.connect(otherAccount).claimAirdrop(amount,merkleProof);
      expect(merkleAirdrop.connect(otherAccount).hasClaimed(otherAccount.address)).to.be.true;

    })
    
  })

   

  
  
});
