import React, { useState, useEffect } from 'react';
import { Box, Text, Flex } from '@chakra-ui/react';
import {contractAddressTokenGouv} from "../constants/constantTokenGouv"
import {contractAddressTargetContract} from "../constants/constantTargetContract"
import { getContractBalance } from '../utils/contractUtils';

export default function DaoInfoContent() {
  const [daoTreasuryBalance, setDaoTreasuryBalance] = useState(0);
  const [investmentContractBalance, setInvestmentContractBalance] = useState(0);

  useEffect(() => {
    getContractBalance(contractAddressTokenGouv).then(balance => {
      setDaoTreasuryBalance(balance); // Passer explicitement la balance retournée
    });
  
    getContractBalance(contractAddressTargetContract).then(balance => {
      setInvestmentContractBalance(balance); // De même ici
    });
  }, []);

  
  return (
    <Box boxShadow="md" p="4" borderRadius="md">
      <Flex direction="column" gap="4">
        <Text>Trésorerie de la DAO: {daoTreasuryBalance} ETH</Text>
        <Text>Balance du contrat d'investissement: {investmentContractBalance} ETH</Text>
      </Flex>
    </Box>
  );
}
