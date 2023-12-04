'use client'
import React, { useContext, useState, useEffect } from 'react';
import { Box } from '@chakra-ui/react';
import { ContractContext } from '../context/GovernorContractProvider';
import { useAccount } from "wagmi";

export default function ProposalContent() {
  const { numberOfProposals } = useContext(ContractContext);
  const { isConnected } = useAccount();
  const [isLoaded, setIsLoaded] = useState(false);

  console.log(numberOfProposals)

  useEffect(() => {
    if (numberOfProposals !== null) {
      setIsLoaded(true);
    }
  }, [numberOfProposals]);

  if (!isLoaded) {
    return <Box>Chargement...</Box>;
  }

  return (
    <Box>
      {isConnected 
        ? `Il y a actuellement ${numberOfProposals} propositions` 
        : "Connectez-vous pour voir les propositions"}
    </Box>
  );
}
