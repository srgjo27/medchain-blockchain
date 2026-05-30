// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract MedicalRecord is Ownable {
    struct HashEntry {
        string  hash;
        uint256 storedAt;
        bool    revoked;
        uint256 revokedAt;
    }

    mapping(string => mapping(string => HashEntry)) private _entries;
    mapping(string => uint256) private _docCount;

    event HashStored(string indexed userId, string indexed docId, string hash, uint256 timestamp);
    event HashRevoked(string indexed userId, string indexed docId, uint256 timestamp);

    error HashAlreadyExists(string userId, string docId);
    error HashNotFound(string userId, string docId);
    error HashAlreadyRevoked(string userId, string docId);
    error InvalidHash();

    constructor() Ownable(msg.sender) {}

    function storeHash(string calldata userId, string calldata docId, string calldata hash) external onlyOwner {
        if (bytes(hash).length != 64) revert InvalidHash();
        if (bytes(_entries[userId][docId].hash).length > 0) revert HashAlreadyExists(userId, docId);
        _entries[userId][docId] = HashEntry({ hash: hash, storedAt: block.timestamp, revoked: false, revokedAt: 0 });
        _docCount[userId] += 1;
        emit HashStored(userId, docId, hash, block.timestamp);
    }

    function revokeHash(string calldata userId, string calldata docId) external onlyOwner {
        HashEntry storage entry = _entries[userId][docId];
        if (bytes(entry.hash).length == 0) revert HashNotFound(userId, docId);
        if (entry.revoked) revert HashAlreadyRevoked(userId, docId);
        entry.revoked = true;
        entry.revokedAt = block.timestamp;
        emit HashRevoked(userId, docId, block.timestamp);
    }

    function getHash(string calldata userId, string calldata docId) external view returns (string memory) {
        return _entries[userId][docId].hash;
    }

    function verifyHash(string calldata userId, string calldata docId, string calldata hash) external view returns (bool) {
        HashEntry storage entry = _entries[userId][docId];
        if (bytes(entry.hash).length == 0) return false;
        if (entry.revoked) return false;
        return keccak256(bytes(entry.hash)) == keccak256(bytes(hash));
    }

    function getEntry(string calldata userId, string calldata docId) external view returns (string memory hash, uint256 storedAt, bool revoked, uint256 revokedAt) {
        HashEntry storage entry = _entries[userId][docId];
        return (entry.hash, entry.storedAt, entry.revoked, entry.revokedAt);
    }

    function isRevoked(string calldata userId, string calldata docId) external view returns (bool) {
        return _entries[userId][docId].revoked;
    }

    function getDocumentCount(string calldata userId) external view returns (uint256) {
        return _docCount[userId];
    }
}
