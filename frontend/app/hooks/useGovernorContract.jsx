"use client";
import { useState, useEffect } from "react";
import {
  readContract,
  prepareWriteContract,
  writeContract,
  getWalletClient,
  waitForTransaction,
} from "@wagmi/core";
import { abiGovernorContract, contractAddressGovernorContract } from "../constants/constantGovernorContract"


const useGovernorContract = () => {
  const [numberOfProposals, setNumberOfProposals] = useState(0);

  const getNumberOfProposals = async () => {
    const walletClient = await getWalletClient();
    try {
      const result = await readContract({
        client: walletClient,
        address: contractAddressGovernorContract,
        abi: abiGovernorContract,
        functionName: "getNumberOfProposals",
      });
      setNumberOfProposals(result);
    } catch (error) {
      console.error("Erreur lors de la récupération du nombre de propositions:", error);
    }
  };

  useEffect(() => {
    getNumberOfProposals();
  }, []);

  return {
    numberOfProposals,
    getNumberOfProposals,
  };
};

export default useGovernorContract;
