import { encodeAbiParameters, keccak256, stringToHex } from "viem";

export function buildDemoProof(
  escrowId: number,
  contractAddress: string,
  fiatAmount: string,
  recipient: string,
  refId: string,
  paymentRef: string
): `0x${string}` {
  const context = `${escrowId}:${contractAddress.toLowerCase()}`;
  const parameters = `{"amount":"${fiatAmount}","recipient":"${recipient}","reference":"${refId}","memo":"${paymentRef}"}`;
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
