import {useState, useContext, useEffect} from 'react';
import { Box, Badge, Button, Progress, Text, VStack, HStack, useToast, Divider } from '@chakra-ui/react';
import { ContractContext } from '../context/GovernorContractProvider';


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
  const { getState } = useContext(ContractContext);
  const [state, setState] = useState(null);



  useEffect(() => {
    console.log('Proposal ID:', proposalId);
    if (proposalId) {
      getState(proposalId).then(response => {
        const stateDetails = getProposalStateDetails(response);
        setState(stateDetails);
      });
    }
  }, [proposalId, getState]);


  const handleVote = (voteType) => {
    // a définir
  };

  // Fonctions pour voter Pour, Contre ou S'abstenir
  const voteFor = () => handleVote('FOR');
  const voteAgainst = () => handleVote('AGAINST');
  const abstain = () => handleVote('ABSTAIN');

  return (
    <Box p={5} borderWidth="1px" borderRadius="lg" bg="white" boxShadow="sm">
      <VStack spacing={4} align="stretch">
        <HStack justify="space-between">
          <Text fontSize="xl" fontWeight="semibold" color="black">Proposal ID: {proposalId}</Text>
          {state && <Badge colorScheme={state.color} px={2} py={1} borderRadius="full">
            {state.name}
          </Badge>}
        </HStack>
        <Divider />
        <Progress value={40} size="lg" colorScheme={state && state.color} hasStripe isAnimated />
        <HStack justify="center" spacing={4} mt={4}>
          <Button colorScheme="green" onClick={voteFor}>Vote For</Button>
          <Button colorScheme="red" onClick={voteAgainst}>Vote Against</Button>
          <Button colorScheme="gray" onClick={abstain}>Abstain</Button>
        </HStack>
      </VStack>
    </Box>
  );
};

export default ProposalDetails;
