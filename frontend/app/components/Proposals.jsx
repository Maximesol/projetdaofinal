'use client'
import React, { useContext } from 'react';
import ProposalDetails from './ProposalDetails';
import { ContractContext } from '../context/GovernorContractProvider';
import { Box, Text } from '@chakra-ui/react';

const Proposals = () => {
  const { combinedProposals } = useContext(ContractContext);  

  // Vérifie si la liste des propositions est vide
  if (combinedProposals.length === 0) {
    // Affiche un message si aucune proposition n'est disponible
    return (
      <Box textAlign="center" p={4}>
        <Text fontSize="lg" fontWeight="bold" color="gray.300">
          Aucune proposition disponible pour le moment.
        </Text>
      </Box>
    );
  }

  // Sinon, affiche la liste des propositions
  return (
    <div>
      {combinedProposals.map(event => (
        <ProposalDetails key={event.proposalId} proposalId={event.proposalId} description={event.description} />
      ))}
    </div>
  );
};

export default Proposals;
