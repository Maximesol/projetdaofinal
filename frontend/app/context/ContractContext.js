// ContractContext.js
import { createContext } from "react";

const ContractContext = createContext({
  numberOfProposals: 0,
  getProposalCount: () => {},
  isConnected: false,
});

export default ContractContext;