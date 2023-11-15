
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

contract MyToken is ERC20, ERC20Permit, ERC20Votes, Ownable {
    constructor(string memory _name, string memory _symbol) ERC20(_name, _symbol) ERC20Permit("MyToken") Ownable(msg.sender){}

    // The following functions are overrides required by Solidity.

    function _update(address from, address to, uint256 value)
        internal
        override(ERC20, ERC20Votes)
    {
        super._update(from, to, value);
    }

    function mint(address _to, uint256 _value) external onlyOwner{
        _mint(_to,_value);
    }

    function batchMint(address[] memory _addresses, uint256[] memory _value) external onlyOwner {
        require(_addresses.length == _value.length, "Array size should be equal");
        for(uint i = 0; i < _addresses.length; i++) {
            _mint(_addresses[i], _value[i]);
        }
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
