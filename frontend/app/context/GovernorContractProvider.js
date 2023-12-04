import React, { createContext, useState, useEffect } from 'react';
import { useContractEvent, useAccount } from "wagmi";

import {
  readContract,
  getWalletClient,
  waitForTransaction,
} from "@wagmi/core";
import { abiGovernorContract, contractAddressGovernorContract } from "../constants/constantGovernorContract"

export const ContractContext = createContext();

export const GovernorContractProvider = ({ children }) => {
  const [numberOfProposals, setNumberOfProposals] = useState(0);
  const { isConnected } = useAccount();
  const [isLoading, setIsLoading] = useState(false); 

  const getNumberOfProposals = async () => {
    if (!isConnected) return;
    const walletClient = await getWalletClient();
    setIsLoading(true); // Début du chargement
    try {
      const result = await readContract({
        client: walletClient,
        address: contractAddressGovernorContract,
        abi: abiGovernorContract,
        functionName: "getNumberOfProposals",
      });
      if (result !== "0x") {
        setNumberOfProposals(result);
      } else {
        console.log("Le contrat n'est pas encore déployé ou la fonction getNumberOfProposals n'existe pas");
        setNumberOfProposals(0);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération du nombre de propositions:", error);
    } finally {
      setIsLoading(false); // Fin du chargement
    }
  };

  useContractEvent({
    address: contractAddressGovernorContract, 
    abi: abiGovernorContract,
    eventName: "ProposalCreated",
    listener: (events) => {
      for (const event of events) {
        const { proposalId, description } = event.args;
        console.log(`Nouvelle proposition enregistrée : ${description}, ID: ${proposalId}`);
      }
      getNumberOfProposals();
    },
  });


  useEffect(() => {
    if (isConnected) {
      getNumberOfProposals();
    }
  }, [isConnected]);

  const contextValue = {
    numberOfProposals,
    isLoading,
    getNumberOfProposals,


  };

  return (
    <ContractContext.Provider value={contextValue}>
      {children}
    </ContractContext.Provider>
  );
};
