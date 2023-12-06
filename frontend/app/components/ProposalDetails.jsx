import {useState, useContext, useEffect} from 'react';
import { Box, Badge, Button, Progress, Text, VStack, HStack, useToast, Collapse } from '@chakra-ui/react';
import { ContractContext } from '../context/GovernorContractProvider';
import { readContract, getWalletClient } from "@wagmi/core";
import { abiGovernorContract, contractAddressGovernorContract } from '../constants/constantGovernorContract'
import { CheckCircleIcon, WarningIcon } from '@chakra-ui/icons';
import { useAccount, useContractEvent } from "wagmi";



const getProposalStateDetails = (state) => {
  const states = {
    0: { name: "Pending", color: "gray" },
    1: { name: "Active", color: "green" },
    2: { name: "Canceled", color: "red" },
    3: { name: "Defeated", color: "orange" },
    4: { name: "Succeeded", color: "blue" },
    5: { name: "Queued", color: "purple" },
    6: { name: "Expired", color: "yellow" },
    7: { name: "Executed", color: "pink" },
  };
  return states[state] || { name: "Unknown", color: "gray" };
};

const ProposalDetails = ({ proposalId }) => {         
  const toast = useToast();
  const { getState, voteFor, voteAgainst, voteAbstain, accountHasVoted, hasVoted } = useContext(ContractContext);
  const [state, setState] = useState(null);
  const {address} = useAccount();
  const [dataVoteFor, setDataVoteFor] = useState(0);
  const [dataVoteAgainst, setDataVoteAgainst] = useState(0);
  const [dataVoteAbstain, setDataVoteAbstain] = useState(0);
  const [forPercentage, setForPercentage] = useState(0);
  const [againstPercentage, setAgainstPercentage] = useState(0);
  const [abstainPercentage, setAbstainPercentage] = useState(0);

  const [showDetails, setShowDetails] = useState(false);
  const toggleShowDetails = () => setShowDetails(!showDetails);

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
      console.log("proposal vote : ", data)
      setDataVoteFor(Number(data[1]));
      setDataVoteAgainst(Number(data[0]));  
      setDataVoteAbstain(Number(data[2]));
    } catch (error) {
      console.error("Erreur lors de la récupération de l'état du contrat:", error);
    }
  };


  const quorumReached = false;


  useEffect(() => {
    if (proposalId) {
      proposalVotes(proposalId)
        .then(data => {
          if (data) {
            setDataVoteFor(Number(data[1])); // Accès direct à la valeur
            setDataVoteAgainst(Number(data[0]));
            setDataVoteAbstain(Number(data[2]));
          }
        })
        .catch(error => {
          console.error("Erreur lors de la récupération des votes de la proposition:", error);
        });
    }
  }, [proposalId]);

  useEffect(() => {
    if (proposalId && address) {
      getState(proposalId).then(response => {
        const stateDetails = getProposalStateDetails(response);
        setState(stateDetails);
      });
  
      accountHasVoted(proposalId, address); // Cette fonction met à jour hasVoted dans le contexte
    }
  }, [proposalId, address, getState, accountHasVoted, hasVoted]);

  useEffect(() => {
    console.log(`Mise à jour des pourcentages - For: ${dataVoteFor}, Against: ${dataVoteAgainst}, Abstain: ${dataVoteAbstain}`);
    const totalVotes = dataVoteFor + dataVoteAgainst + dataVoteAbstain;
    const newForPercentage = totalVotes ? (dataVoteFor / totalVotes) * 100 : 0;
    const newAgainstPercentage = totalVotes ? (dataVoteAgainst / totalVotes) * 100 : 0;
    const newAbstainPercentage = totalVotes ? (dataVoteAbstain / totalVotes) * 100 : 0;

    setForPercentage(newForPercentage);
    setAgainstPercentage(newAgainstPercentage);
    setAbstainPercentage(newAbstainPercentage);
  }, [dataVoteFor, dataVoteAgainst, dataVoteAbstain]);



  // useEffect(() => {
  //   console.log('Proposal ID:', proposalId);
  //   if (proposalId) {
  //     getState(proposalId).then(response => {
  //       const stateDetails = getProposalStateDetails(response);
  //       setState(stateDetails);
  //     });
  //   }
  // }, [proposalId, getState]);

  useContractEvent({
    address: contractAddressGovernorContract, 
    abi: abiGovernorContract,
    eventName: "VoteCast",
    listener: (events) => {
      const newVote = events[events.length - 1];
      const { proposalId: votedProposalId } = newVote.args;
      if (votedProposalId.toString() === proposalId) {
        // Appeler proposalVotes pour obtenir les nouveaux totaux de vote
        proposalVotes(votedProposalId.toString())
        .then(data => {
          if (data) {
            setDataVoteFor(Number(data[1])); // Accès direct à la valeur
            setDataVoteAgainst(Number(data[0]));
            setDataVoteAbstain(Number(data[2]));
          }
        })
        .catch(error => {
          console.error("Erreur lors de la récupération des votes de la proposition:", error);
        });
      }
    },
  });
  

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" bg="gray.800" boxShadow="sm" mb={3} borderColor="gray.600">
  <VStack spacing={3} align="stretch">
    <HStack justify="space-between">
      <VStack align="start">
        <Text fontSize="md" fontWeight="semibold" color="gray.100">Proposal ID: {proposalId}</Text>
        <HStack>
          {state && (
            <Badge colorScheme={state.color} px={2} py={1} borderRadius="full">
              {state.name}
            </Badge>
          )}
          {quorumReached ? (
            <Badge colorScheme="green" ml={2} px={2} py={1} borderRadius="full">
              Quorum Reached <CheckCircleIcon color="green.500" />
            </Badge>
          ) : (
            <Badge colorScheme="red" ml={2} px={2} py={1} borderRadius="full">
              Quorum Not Reached <WarningIcon color="red.500" />
            </Badge>
          )}
        </HStack>
      </VStack>
      <VStack align="end" spacing={1} flex={1}>
        <HStack w="full" justify="space-between">
          <Text fontSize="xs" color="gray.100">For</Text>
          <Progress value={forPercentage} size="sm" colorScheme="green" w="80%" />
          <Text fontSize="xs" color="gray.100" minWidth="4ch" textAlign="right">{forPercentage.toFixed(0)}%</Text>
        </HStack>
        <HStack w="full" justify="space-between">
          <Text fontSize="xs" color="gray.100">Against</Text>
          <Progress value={againstPercentage} size="sm" colorScheme="red" w="80%" />
          <Text fontSize="xs" color="gray.100" minWidth="4ch" textAlign="right">{againstPercentage.toFixed(0)}%</Text>
        </HStack>
        <HStack w="full" justify="space-between">
          <Text fontSize="xs" color="gray.100">Abstain</Text>
          <Progress value={abstainPercentage} size="sm" colorScheme="gray" w="80%" />
          <Text fontSize="xs" color="gray.100" minWidth="4ch" textAlign="right">{abstainPercentage.toFixed(0)}%</Text>
        </HStack>
      </VStack>
    </HStack>
    <HStack justify="end" spacing={3} pt={2}>
      <Button size="sm" colorScheme="green" onClick={() => voteFor(proposalId, address)} 
      isDisabled={hasVoted}>For</Button>
      <Button size="sm" colorScheme="red" onClick={() => voteAgainst(proposalId, address)} isDisabled={hasVoted}>Against</Button>
      <Button size="sm" colorScheme="gray" onClick={() => voteAbstain(proposalId, address)} isDisabled={hasVoted}>Abstain</Button>
    </HStack>
    <Button mt={2} size="sm" colorScheme="blue" onClick={toggleShowDetails}>
      {showDetails ? 'Hide Details' : 'Show More'}
    </Button>
    <Collapse in={showDetails} animateOpacity>
      <Box p={2} color="gray.300" mt={2} bg="gray.700" borderRadius="md" boxShadow="sm">
        <Text fontSize="sm">Description de la proposition...</Text>
        {/* Vous pouvez inclure plus de détails ici */}
      </Box>
    </Collapse>
  </VStack>
</Box>
  );
};

export default ProposalDetails;
