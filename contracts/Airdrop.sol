// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MerkleAirdrop {
    IERC20 public token;
    address public owner;
    IERC721 public BAYCNFT = IERC721(0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D);
    

    bytes32 public merkleRoot;

    mapping(address => bool) public hasClaimed;

    event AirdropClaimed(address indexed claimant, uint256 amount);
    

    constructor(address _token, bytes32 _merkleRoot) {
        token = IERC20(_token); //token address (token of your choice)
        merkleRoot = _merkleRoot;
        owner = payable(msg.sender);
    }

    function claimAirdrop(
        uint256 amount,
        bytes32[] calldata merkleProof
      //setting  _address if the user inputs an address. if he/she dosent and uses metamask to connect , it's better to use   msg.sender
    ) external {
        
        // IERC721 public constant BAYC = IERC721(0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D);

        // Check if the caller owns a BAYC NFT
        require(BAYCNFT.balanceOf(msg.sender) > 0, "Must own a BAYC NFT to claim");
        
        require(!hasClaimed[msg.sender], "Airdrop already claimed.");
        
        bytes32 leaf = keccak256(bytes.concat(keccak256(abi.encode(msg.sender, amount))));

        /**
         * WHAT'S HAPPENING IN THE ABOVE LINE
         *
         * -encode the data (address and token amount), into 2 different arrays of bytes
            -finds the hash of those 2 arrays of bytes, it's a 32 bytes result
            -the concat finds the round up of the(not really important there, but it helps if there's additional data that needs to be added to the hash)
            -the whole thing is now hashed again one more time

            -the total hash is now assigned to the variable "leaf" which is of the type bytes
         */

        

        require(
            MerkleProof.verify(merkleProof, merkleRoot, leaf),
            "Invalid Merkle proof."
        );

        hasClaimed[msg.sender] = true;

        require(token.transfer(msg.sender, amount), "Token transfer failed.");

        emit AirdropClaimed(msg.sender, amount);
    }
}
