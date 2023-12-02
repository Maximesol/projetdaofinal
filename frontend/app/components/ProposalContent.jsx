import React, { useContext } from 'react'
import { Box } from '@chakra-ui/react';
import ContractContext from '../context/ContractContext';

export default function ProposalContent() {
  const {numberOfProposals, isConnected} = useContext(ContractContext)

  return (
    <Box>
        {isConnected ? 
        `Il y a actuellement ${numberOfProposals} propositions` : 
        "Connectez vous pour voir les propositions"}
        
    </Box>
  )
}
