'use client'
import React, { createContext, useState, useEffect } from 'react';
import { useContractEvent, useAccount, usePublicClient } from "wagmi";
import { parseAbiItem } from "viem";
import { readContract, getWalletClient, waitForTransaction } from "@wagmi/core";
import { abiGovernorContract, contractAddressGovernorContract } from "../constants/constantGovernorContract"

export const ContractContext = createContext();

export const GovernorContractProvider = ({ children }) => {
  const [numberOfProposals, setNumberOfProposals] = useState(0);
  const { isConnected } = useAccount();
  const [isLoading, setIsLoading] = useState(false); 
  const [proposalEvents, setProposalEvents] = useState([]);
  const [pastProposals, setPastProposals] = useState([]);
  const [combinedProposals, setCombinedProposals] = useState([]);
  const viemPublicClient = usePublicClient();


  // combined proposals

  useEffect(() => {
    const allProposals = [
      ...pastProposals.map(p => ({ ...p, proposalId: p.proposalId.toString() })), 
      ...proposalEvents
    ];
    const uniqueProposals = allProposals.reduce((acc, proposal) => {
      if (!acc.some(p => p.proposalId === proposal.proposalId)) {
        acc.push(proposal);
      }
      return acc;
    }, []);
    setCombinedProposals(uniqueProposals);
    console.log("Combined proposals updated:", uniqueProposals);
  }, [pastProposals, proposalEvents]);


  useEffect(() => {
    console.log("Current pastProposals:", pastProposals);
  }, [pastProposals]);

  useEffect(() => {
    console.log("Current proposalEvents:", proposalEvents);
  }, [proposalEvents]);

  useEffect(() => {
    console.log("Current combinedProposals:", combinedProposals);
  }, [combinedProposals]);


  const getState = async (proposalId) => {
    const walletClient = await getWalletClient();
    try {
      const data = await readContract({
        client: walletClient,
        address: contractAddressGovernorContract,
        abi: abiGovernorContract,
        functionName: 'state',
        args: [proposalId],
      })
      console.log("State for proposalId", proposalId, "is", data);
      return data; // Retourner l'état récupéré
    } catch (error) {
      console.error("Erreur lors de la récupération de l'état du contrat:", error);
    }
  };

  //Get past proposal Ids
  useEffect(() => {
    console.log("Component mounted");
    const getProposalIdsLogs = async () => {
      const proposalIdsLogs = await viemPublicClient.getLogs({
        address: contractAddressGovernorContract,
        event: parseAbiItem("event ProposalCreated(uint256 proposalId, address proposer, address[] targets, uint256[] values, string[] signatures, bytes[] calldatas, uint256 voteStart, uint256 voteEnd, string description)"),
        fromBlock: 0n,
      });
      const newPastProposals = [...pastProposals];
      for (const log of proposalIdsLogs) {
        const proposalId = log.args.proposalId;
        const description = log.args.description;
        const isDuplicate = newPastProposals.some((proposal) => proposal.proposalId === proposalId);

        if (!isDuplicate) {
          newPastProposals.push({ proposalId, description });
        }
      }
      setPastProposals(newPastProposals);
      console.log("Past proposals after update:", pastProposals);
    };
    getProposalIdsLogs();
  }, [isConnected]);

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
      setIsLoading(false);
    }
  };


  useContractEvent({
    address: contractAddressGovernorContract, 
    abi: abiGovernorContract,
    eventName: "ProposalCreated",
    listener: (events) => {
      // for (const event of events) {
      //   const { proposalId, description } = event.args;
      //   console.log(`Nouvelle proposition enregistrée : ${description}, ID: ${proposalId}`);
      // }
      const newEvents = events.map(event => ({
        proposalId: event.args.proposalId.toString(),
        description: event.args.description
      }));
      getNumberOfProposals();
      setProposalEvents(prevEvents => [...prevEvents, ...newEvents]);
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
    proposalEvents,
    getState,
    combinedProposals,

  };

  return (
    <ContractContext.Provider value={contextValue}>
      {children}
    </ContractContext.Provider>
  );
};
