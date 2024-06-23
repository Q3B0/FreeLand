// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

contract FreeLand{

   struct Cube {
        bool isColored;
        address owner;
        string color;
    }

    Cube[] public cubes;
    address public Owner;
    event CubeColored(uint256 indexed cubeIndex, address indexed user, string color);
    uint256 size;
    constructor(uint256 numberOfCubes) {
        Owner = msg.sender;
        size = numberOfCubes;
        for (uint256 i = 0; i < numberOfCubes^2; i++) {
            cubes.push(Cube({ isColored: false, owner: address(0), color: "" }));
        }
    }

    modifier onlyOwner() {
        require(msg.sender == Owner, "Only the contract owner can call this function");
        _;
    }

    function getRegion() public view returns(uint256){
        return size;
    }

    function resize(uint256 newSize) public onlyOwner returns(bool){
        if(size < newSize){
            return false;
        }
        for(uint256 i = cubes.length; i < newSize^2;i++){
            cubes.push(Cube({ isColored: false, owner: address(0), color: "" }));
        }
        return true;
    }

    function colorCube(uint256 cubeIndex, string memory _color) public {
        require(cubeIndex < cubes.length, "Cube index out of range");
        require(!cubes[cubeIndex].isColored, "Cube is already colored");

        cubes[cubeIndex].isColored = true;
        cubes[cubeIndex].owner = msg.sender;
        cubes[cubeIndex].color = _color;

        emit CubeColored(cubeIndex, msg.sender, _color);
    }

    function getCubeColor(uint256 cubeIndex) public view returns (string memory) {
        require(cubeIndex < cubes.length, "Cube index out of range");
        return cubes[cubeIndex].color;
    }

    function isCubeColored(uint256 cubeIndex) public view returns (bool) {
        require(cubeIndex < cubes.length, "Cube index out of range");
        return cubes[cubeIndex].isColored;
    }

    function getCubeOwner(uint256 cubeIndex) public view returns (address) {
        require(cubeIndex < cubes.length, "Cube index out of range");
        return cubes[cubeIndex].owner;
    }

    function getUserCubes() public view returns (uint256[] memory) {
        uint256 count = 0;

        // 先遍历一遍，找出调用者拥有的立方体数量
        for (uint256 i = 0; i < cubes.length; i++) {
            if (cubes[i].owner == msg.sender) {
                count++;
            }
        }

        // 创建结果数组，并填入立方体索引
        uint256[] memory result = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < cubes.length; i++) {
            if (cubes[i].owner == msg.sender) {
                result[index] = i;
                index++;
            }
        }

        return result;
    }
}