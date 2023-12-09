'use client'
import React, { createContext, useState, useEffect } from 'react';
import { useContractEvent, useAccount, usePublicClient } from "wagmi";
import { parseAbiItem } from "viem";
import { readContract, getWalletClient, waitForTransaction, prepareWriteContract, writeContract } from "@wagmi/core";
import { abiGovernorContract, contractAddressGovernorContract } from "../constants/constantGovernorContract"

export const ContractContext = createContext();

export const GovernorContractProvider = ({ children }) => {
  const [numberOfProposals, setNumberOfProposals] = useState(0);
  const { isConnected, address} = useAccount();
  const [isLoading, setIsLoading] = useState(false); 
  const [proposalEvents, setProposalEvents] = useState([]);
  const [pastProposals, setPastProposals] = useState([]);
  const [combinedProposals, setCombinedProposals] = useState([]);
  const viemPublicClient = usePublicClient();
  const [hasVoted, setHasVoted] = useState(false);
  const [queueEvents, setQueueEvents] = useState([]);
  const [executedEvents, setExecutedEvents] = useState([]);


  // function proposalVote
  const proposalVotes = async (proposalId) => {
    const walletClient = await getWalletClient();
    try {
      const data = await readContract({
        client: walletClient,
        address: contractAddressGovernorContract,
        abi: abiGovernorContract,
        functionName: 'proposalVotes',
        args: [proposalId],
      })
      setVotesFor(data.forVotes);
      setVotesAgainst(data.againstVotes);
      setVotesAbstain(data.abstainVotes);
    } catch (error) {
      console.error("Erreur lors de la récupération de l'état du contrat:", error);
    }
  };



  // function has Voted 
  const accountHasVoted = async (proposalId, address) => {
    const walletClient = await getWalletClient();
    try {
      const data = await readContract({
        client: walletClient,
        address: contractAddressGovernorContract,
        abi: abiGovernorContract,
        functionName: 'hasVoted',
        args: [proposalId, address],
      })
      setHasVoted(data);
    } catch (error) {
      console.error("Erreur lors de la récupération de l'état du contrat:", error);
    }
  };


  // function voteFor
  const voteFor = async (proposalId, address) => {
    const support = 1;
    const walletClient = await getWalletClient();
    try{
    const { request } = await prepareWriteContract({
      address: contractAddressGovernorContract,
      abi: abiGovernorContract,
      functionName: 'castVote',
      args: [proposalId, support],
      account: walletClient.account,
    });
    const { hash } = await writeContract(request);
    await waitForTransaction({ hash });
    accountHasVoted(proposalId, address)
  } catch (error) {
    console.error("Erreur lors de la récupération de l'état du contrat:", error);
    
  };
};


  // function voteAgainst
  const voteAgainst = async (proposalId, address) => {
    const support = 0;
    const walletClient = await getWalletClient();
    try{
    const { request } = await prepareWriteContract({
      address: contractAddressGovernorContract,
      abi: abiGovernorContract,
      functionName: 'castVote',
      args: [proposalId, support],
      account: walletClient.account,
    });
    const { hash } = await writeContract(request);
    await waitForTransaction({ hash });
    accountHasVoted(proposalId, address)
  } catch (error) {
    console.error("Erreur lors de la récupération de l'état du contrat:", error);
  };
};


  // function voteAbstain
  const voteAbstain = async (proposalId, address) => {
    const support = 2;
    const walletClient = await getWalletClient();
    try{
    const { request } = await prepareWriteContract({
      address: contractAddressGovernorContract,
      abi: abiGovernorContract,
      functionName: 'castVote',
      args: [proposalId, support],
      account: walletClient.account,
    });
    const { hash } = await writeContract(request);
    await waitForTransaction({ hash });
    accountHasVoted(proposalId, address)
  } catch (error) {
    console.error("Erreur lors de la récupération de l'état du contrat:", error);
    
  };
};


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
  }, [pastProposals, proposalEvents]);

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
      return data; // Retourner l'état récupéré
    } catch (error) {
      console.error("Erreur lors de la récupération de l'état du contrat:", error);
    }
  };

  //Get past proposal Ids
  useEffect(() => {
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
      const newEvents = events.map(event => ({
        proposalId: event.args.proposalId.toString(),
        description: event.args.description
      }));
      getNumberOfProposals();
      setProposalEvents(prevEvents => [...prevEvents, ...newEvents]);
    },
  });

  // listen to the event ProposalQueued(uint256 proposalId, uint256 etaSeconds);
  useContractEvent({
    address: contractAddressGovernorContract,
    abi: abiGovernorContract,
    eventName: "ProposalQueued",
    listener: (events) => {
      const newEvents = events.map(event => ({
        proposalId: event.args.proposalId.toString(),
        etaSeconds: event.args.etaSeconds.toString(),

      }));
      setQueueEvents(prevEvents => [...prevEvents, ...newEvents]);
    },
  });

  // event ProposalExecuted(uint256 proposalId);
  useContractEvent({
    address: contractAddressGovernorContract,
    abi: abiGovernorContract,
    eventName: "ProposalExecuted",
    listener: (event) => {
      const proposalId = event[0].args.proposalId.toString();
      setExecutedEvents(proposalId);
    },
  });


  useEffect(() => {
    if (isConnected) {
      getNumberOfProposals();
    }
  }, [isConnected, queueEvents, executedEvents]);

  const contextValue = {
    numberOfProposals,
    isLoading,
    getNumberOfProposals,
    proposalEvents,
    getState,
    combinedProposals,
    voteFor,
    voteAgainst,
    voteAbstain,
    accountHasVoted,
    hasVoted,
    proposalVotes,
    queueEvents,
    executedEvents
    


  

  };

  return (
    <ContractContext.Provider value={contextValue}>
      {children}
    </ContractContext.Provider>
  );
};
