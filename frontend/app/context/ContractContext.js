'use client'
import { createContext } from "react";

const ContractContext = createContext({
  numberOfProposals: 0,
  getProposalCount: () => {},
  isConnected: false,
  address: "",
});

export default ContractContext;