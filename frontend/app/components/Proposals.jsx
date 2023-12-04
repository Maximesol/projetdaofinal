'use client'
import { Box, Text, VStack, Button, Progress, Tag, Collapse, useDisclosure } from '@chakra-ui/react';
import { useAccount, useContractEvent, usePublicClient } from "wagmi";
import { parseAbiItem } from "viem";
import { useState, useEffect } from 'react';
import { abiGovernorContract, contractAddressGovernorContract} from "../constants/constantGovernorContract"

// fake data
const fakeProposal = {
  id: 1,
  description: "Expand wstETH liquidity",
  state: "Active", // L'état de la proposition peut être "Active", "Pending", "Canceled", "Defeated", "Succeeded", "Queued", ou "Expired"
  startBlock: 100000,
  endBlock: 110000,
  forVotes: 42000, // Nombre de votes pour
  againstVotes: 8000, // Nombre de votes contre
  quorum: 50000, // Quorum nécessaire
};


export default function Proposals() {
  const { isOpen, onToggle } = useDisclosure();
  const { isConnected } = useAccount();
  const [proposalState, setProposalState] = useState(null);
  const [proposalVotes, setProposalVotes] = useState({ forVotes: 0, againstVotes: 0, abstainVotes: 0 });
  const [quorum, setQuorum] = useState(null);
  const [proposals, setProposals] = useState([]); 
  const viemPublicClient = usePublicClient();


  useContractEvent({
    address: contractAddressGovernorContract,
    abi: abiGovernorContract,
    eventName: 'ProposalCreated',
    listener: (log) => {
      console.log("Événement reçu:", log);
      const { args } = log[0];
      console.log(`Nouvelle proposition enregistrée : ${args.description}, ID: ${args.proposalId}`);
      setProposals(prevProposals => [...prevProposals, { id: args.proposalId, description: args.description }]);
    },
  });

  useEffect(() => {
    const getProposalCreatedLogs = async () => {
      const proposalLogs = await viemPublicClient.getLogs({
        address: contractAddressGovernorContract,
        event: parseAbiItem("event ProposalCreated(uint256 proposalId, address proposer, address[] targets, uint256[] values, string[] signatures, bytes[] calldatas, uint256 voteStart, uint256 voteEnd, string description)"),
        fromBlock: 0n, 
      });
      //const pastProposalIds = proposalLogs.map(log => log.args.proposalId);
      const pastProposals = proposalLogs.map(log => {
        return {
          id: log.args.proposalId.toString(),
          description: log.args.description
        };
      });
      setProposals(pastProposals);
    };
    getProposalCreatedLogs();
  }, []);

  useEffect(() => {
    console.log("Propositions actuelles après mise à jour:", proposals);
    proposals.forEach(proposal => {
      console.log(`ID: ${proposal.id}, Description: ${proposal.description}`);
    });
  }, [proposals, isConnected]);
  

  const calculatePercentage = (value, total) => {
    return total > 0 ? (value / total) * 100 : 0;
  };

  //:::::::FETSCHING DATA:::::::

  // const fetchProposalState = async (proposalId) => {
  //   try {
  //     const state = await readContract({
  //       addressOrName: contractAddressGovernorContract,
  //       contractInterface: abiGovernorContract,
  //       functionName: 'state',
  //       args: [proposalId],
  //     });
  //     setProposalState(state);
  //   } catch (error) {
  //     console.error("Erreur lors de la récupération de l'état de la proposition:", error);
  //   }
  // };


  // const fetchProposalVotes = async () => {
  //   //if (proposalState == 0) return; condition de state à ajouter
  //   try {
  //       const votes = await readContract({
  //         addressOrName: contractAddressGovernorContract,
  //         contractInterface: abiGovernorContract,
  //         functionName: 'proposalVotes',
  //         args: [proposalId],
  //       });
  //       if (votes) {
  //         setProposalVotes({ 
  //           forVotes: votes.forVotes, 
  //           againstVotes: votes.againstVotes, 
  //           abstainVotes: votes.abstainVotes 
  //         });
  //       }
  //     } catch (error) {
  //       console.error("Erreur lors de la récupération des votes de la proposition:", error);
  //     }
  // };


  // const fetchQuorum = async () => {
  //   // Obtenir le timepoint (voteStart) de la proposition
  //   try {
  //     const proposalDetails = await readContract({
  //         addressOrName: contractAddressGovernorContract,
  //         contractInterface: abiGovernorContract,
  //         functionName: 'proposalSnapshot',
  //         args: [proposalId],
  //       });
  
  //       const quorumRequired = await readContract({
  //         addressOrName: contractAddressGovernorContract,
  //         contractInterface: abiGovernorContract,
  //         functionName: 'quorum',
  //         args: [proposalDetails],
  //       });
  //       setQuorum(quorumRequired);
  //   } catch (error) {
  //     console.error("Erreur lors de la récupération du quorum de la proposition:", error);
  //   }  
  // };

 


  const forPercentage = calculatePercentage(proposalVotes.forVotes, quorum);
  const againstPercentage = calculatePercentage(proposalVotes.againstVotes, quorum);
  const quorumReached = proposalVotes.forVotes + proposalVotes.againstVotes >= quorum;


  return (
    <Box p={4} bg="gray.800" color="white">
      <VStack spacing={4} align="stretch">
        <Box p={4} boxShadow="md" borderRadius="lg" bg="gray.700">
          <Text fontSize="lg" fontWeight="bold" isTruncated>
            Proposal #{proposals.id}
          </Text>
          <Tag colorScheme={fakeProposal.state === "Active" ? "green" : "red"} mr={2}>
            {fakeProposal.state}
          </Tag>
          <Text noOfLines={1}>{proposals.description}</Text>
          <Button size="sm" onClick={onToggle} mt={2}>
            {isOpen ? "Show Less" : "Show More"}
          </Button>
          <Collapse in={isOpen}>
            <Text mt={2}>Detailed description of the proposal...</Text>
          </Collapse>
          <Progress colorScheme="green" size="sm" value={forPercentage} mt={2} />
          <Text mt={2}>For Votes: {fakeProposal.forVotes} ({forPercentage.toFixed(2)}%)</Text>
          <Progress colorScheme="red" size="sm" value={againstPercentage} mt={2} />
          <Text mt={2}>Against Votes: {fakeProposal.againstVotes} ({againstPercentage.toFixed(2)}%)</Text>
          <Text mt={2}>Quorum: {quorumReached ? "Reached" : "Not reached"} ({fakeProposal.quorum})</Text>
          {fakeProposal.state === "Active" && (
              <Button colorScheme="blue" mt={2}>Vote</Button>
          )}
        </Box>
      </VStack>
    </Box>
  );
}
