# @version ^0.3.0
# @license MIT

interface IMyToken:
    def transfer(_amount:uint256, _to:address) : nonpayable
    def transferFrom(_owner: address, _to:address, _amount:uint256) : nonpayable
    def mint(_amount: uint256, _to:address): nonpayable

event Staked:
    _owner: indexed(address)
    _amount: uint256

event Withdraw:
    _owner: uint256
    _to: indexed(address)

staked: public(HashMap[address, uint256])
totalStaked: public(uint256)

stakingToken:IMyToken

@external
def __init__(_stakingToken:IMyToken):
    self.stakingToken = _stakingToken

@external
def stake(_amount: uint256):
    assert _amount > 0, "cannot stake 0 amount"
    self.stakingToken.transferFrom(msg.sender, self, _amount)
    self.staked[msg.sender] += _amount
    self.totalStaked += _amount
    log Staked(msg.sender, _amount)

@external
def withdraw(_amount: uint256):
    assert self.staked[msg.sender] >= _amount, "insufficient staked token"    
    self.stakingToken.transfer(_amount, msg.sender)
    self.staked[msg.sender] -= _amount
    self.totalStaked -= _amount
    log Withdraw(_amount, msg.sender)

    
