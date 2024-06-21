import { useWeb3ModalProvider, useWeb3ModalAccount } from '@web3modal/ethers/react'
import { BrowserProvider, Contract, formatUnits } from 'ethers'

export const FreeLanAddress = "0xe5FECbe62A845B598C85533A80B6eA69D458B837";

export const FreeLandAbi = [
    "function getRegion() public view returns(uint256)",
    "function resize(uint256 newSize) public onlyOwner returns(bool)",
    "function colorCube(uint256 cubeIndex, string memory _color) public",
    "function getCubeColor(uint256 cubeIndex) public view returns (string memory)",
    "function isCubeColored(uint256 cubeIndex) public view returns (bool)",
    "function getCubeOwner(uint256 cubeIndex) public view returns (address)",
    "function getUserCubes() public view returns (uint256[] memory)"
]
