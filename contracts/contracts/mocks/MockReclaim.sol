// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract MockReclaim {
    struct ClaimInfo {
        string provider;
        string parameters;
        string context;
    }

    struct Claim {
        bytes32 identifier;
        address owner;
        uint32 timestampS;
        uint32 epoch;
    }

    struct SignedClaim {
        Claim claim;
        bytes[] signatures;
    }

    struct Proof {
        ClaimInfo claimInfo;
        SignedClaim signedClaim;
    }

    bool public shouldFail;

    function setShouldFail(bool _shouldFail) external {
        shouldFail = _shouldFail;
    }

    function verifyProof(Proof calldata) external view {
        if (shouldFail) {
            revert("MockReclaim: Verification failed");
        }
    }
}
