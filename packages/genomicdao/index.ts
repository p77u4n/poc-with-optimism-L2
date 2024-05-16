import { Controller__factory, GeneNFT__factory, PostCovidStrokePrevention__factory } from "./typechain-types";

export * from "./typechain-types";

// const abi = [controllerContractMeta, tokenContractMeta, nftContractMeta].reduce(
//   (acc, meta) => ({ ...acc, [meta.contractName]: meta.abi }),
//   {},
// ); -> not good for type inferencing
//
export const abi = {
  Controller: Controller__factory.abi,
  Token: PostCovidStrokePrevention__factory.abi,
  NFT: GeneNFT__factory.abi,
};
