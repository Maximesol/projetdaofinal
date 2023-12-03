"use client";
import { useState, useEffect } from "react";
import { useContractEvent, useAccount } from "wagmi";

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
  const [isLoading, setIsLoading] = useState(true); 
  const { isConnected } = useAccount();


  const getNumberOfProposals = async () => {
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

  return {
    numberOfProposals,
    getNumberOfProposals,
    isLoading, // Renvoyer isLoading
  };
};

export default useGovernorContract;
