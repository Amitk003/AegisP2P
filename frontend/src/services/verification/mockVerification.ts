import { encodeAbiParameters, keccak256, stringToHex } from "viem";
import type { IVerificationService, ProofParams } from "./types";

export class MockVerificationService implements IVerificationService {
  readonly name = "mock-reclaim";

  private shouldFail = false;

  setShouldFail(v: boolean) {
    this.shouldFail = v;
  }

  async generateProof(params: ProofParams): Promise<`0x${string}`> {
    if (this.shouldFail) {
      throw new Error("MockVerificationService: proof generation failed");
    }

    await delay(300);

    const { escrowId, contractAddress, fiatAmount, recipient, refId, paymentRef } = params;

    const context = `${escrowId}:${contractAddress.toLowerCase()}`;
    const parameters = JSON.stringify({
      amount: fiatAmount,
      recipient,
      reference: refId,
      memo: paymentRef,
    });
    const identifier = keccak256(stringToHex(`${escrowId}-${Date.now()}-${Math.random()}`));

    return encodeAbiParameters(
      [
        {
          type: "tuple",
          components: [
            { type: "string", name: "provider" },
            { type: "string", name: "parameters" },
            { type: "string", name: "context" },
          ],
          name: "claimInfo",
        },
        {
          type: "tuple",
          components: [
            {
              type: "tuple",
              components: [
                { type: "bytes32", name: "identifier" },
                { type: "address", name: "owner" },
                { type: "uint32", name: "timestampS" },
                { type: "uint32", name: "epoch" },
              ],
              name: "claim",
            },
            { type: "bytes[]", name: "signatures" },
          ],
          name: "signedClaim",
        },
      ],
      [
        {
          provider: "stripe",
          parameters,
          context,
        },
        {
          claim: {
            identifier,
            owner: "0x0000000000000000000000000000000000000000",
            timestampS: Math.floor(Date.now() / 1000),
            epoch: 0,
          },
          signatures: [],
        },
      ]
    );
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
