
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

contract MyToken is ERC20, ERC20Permit, ERC20Votes, Ownable {
    constructor(string memory _name, string memory _symbol) ERC20(_name, _symbol) ERC20Permit("MyToken") Ownable(msg.sender){}

    mapping(address => Tiers) public employeeTier;
    mapping(address => bool) public isEmployee;
    mapping(uint256 => TierDetails) public tierDetails;

    // The following functions are overrides required by Solidity.

    enum Tiers {
        tier0,
        tier1,
        tier2
    }

    struct TierDetails {
        Tiers  tier;
        uint256 tokenWeightage;
    }

    function _update(address from, address to, uint256 value)
        internal
        override(ERC20, ERC20Votes)
    {
        super._update(from, to, value);
    }

    function mint(address _to, uint256 _value) external onlyOwner{
        _mint(_to,_value);
    }

    function batchMint(address[] memory _addresses) external onlyOwner {
        for(uint i = 0; i < _addresses.length; i++) {
            require(isEmployee[_addresses[i]], "Non employee address");
            uint256 _addressTier = uint256(employeeTier[_addresses[i]]);
            uint256 _tokenWeightage = tierDetails[_addressTier].tokenWeightage;

            _mint(_addresses[i], _tokenWeightage);
        }
    }

    function assignTier(address _address, Tiers _tier) external onlyOwner {
        require(_address != address(0), "Null address");
        employeeTier[_address] = _tier;
        isEmployee[_address] = true;
    }

    function assignTierDetails(Tiers _tier, uint256 _tokenWeightage) external onlyOwner {
        require(_tokenWeightage > 0, "Token weightage must be positive");
        uint256 tierIndex = uint256(_tier);
        tierDetails[tierIndex].tier = _tier;
        tierDetails[tierIndex].tokenWeightage = _tokenWeightage; 
    }

    function burn(uint256 _value) external {
        _burn(address(0), _value);
    }

    function nonces(address owner)
        public
        view
        override(ERC20Permit, Nonces)
        returns (uint256)
    {
        return super.nonces(owner);
    }
}
