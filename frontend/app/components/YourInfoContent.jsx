'use client'
import React from 'react'
import { Box, Text, Button, Flex, RadioGroup,
  Stack,
  Radio,
  Input } from '@chakra-ui/react';
import { useAccount } from "wagmi";
import { useState } from 'react';
import { abiTokenGouv, contractAddressTokenGouv} from "../constants/constantTokenGouv"
import { useEffect } from 'react';
import { getWalletClient, readContract } from '@wagmi/core';




export default function YourInfoContent() {
  const { address, isConnected } = useAccount();
  const [balance, setBalance] = useState(0)
  const [votingPower, setVotingPower] = useState(0);

  const [showDelegateForm, setShowDelegateForm] = useState(false);
  const [delegateOption, setDelegateOption] = useState('self');
  const [delegateAddress, setDelegateAddress] = useState('');
  


  // appeler la fonction balanceOf the ERC20 contract
  const getBalanceOf = async (address) => {
    const walletClient = await getWalletClient();
    try {
      const data = await readContract({
        address: contractAddressTokenGouv,
        abi: abiTokenGouv,
        functionName: "balanceOf",
        args: [address],
        account: walletClient.account,
      });
      setBalance(data);
    } catch (error) {
      console.error("Erreur lors de la récupération de la proposal:", error);
      throw error;
    }
  };

  useEffect(() => {
    if (isConnected) {
      getBalanceOf(address);
    }
  }, [isConnected, address]);



  // appeler la fonction pour voir le pouvoir de vote

  const getVotesOfAddressConnected = async (address) => {
    const walletClient = await getWalletClient();
    try {
      const data = await readContract({
        address: contractAddressTokenGouv,
        abi: abiTokenGouv,
        functionName: "getVotes",
        args: [address],
        account: walletClient.account,
      });
      setVotingPower(data);
    } catch (error) {
      console.error("Erreur lors de la récupération de la proposal:", error);
      throw error;
    }
  };

  useEffect(() => {
    if (isConnected) {
      getVotesOfAddressConnected(address);
    }
  }, [isConnected, address]);



  const handleDelegateSubmit = () => {
    if (delegateOption === 'self') {
      // Logique pour se déléguer à soi-même
    } else {
      // Logique pour déléguer à l'adresse spécifiée
    }
  };



  const formatAddress = (address) => {
    // Affiche les 6 premiers caractères, suivi de '...', suivi des 4 derniers caractères
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };


  return (
    <Box boxShadow="md" p="4" borderRadius="md">
      {isConnected ? (
        <Flex direction="column" gap="4">
          <Text>Adresse connectée : {formatAddress(address)}</Text>
          <Text>Balance DCP token: {balance.toString() / 1e18}</Text>
          <Text>Pouvoir de vote: {votingPower.toString() / 1e18 }</Text>
          <Button colorScheme="blue" onClick={() => setShowDelegateForm(!showDelegateForm)}>
            Déléguer mes Tokens
          </Button>
          {showDelegateForm && (
            <Box mt="4">
              <RadioGroup onChange={setDelegateOption} value={delegateOption}>
                <Stack direction="row">
                  <Radio value="self">Se déléguer à soi-même</Radio>
                  <Radio value="other">Déléguer à une autre adresse</Radio>
                </Stack>
              </RadioGroup>
              {delegateOption === 'other' && (
                <Input 
                  placeholder="Entrer l'adresse de délégation" 
                  mt="2"
                  value={delegateAddress}
                  onChange={(e) => setDelegateAddress(e.target.value)}
                />
              )}
              <Button mt="4" colorScheme="green" onClick={handleDelegateSubmit}>
                Confirmer la délégation
              </Button>
            </Box>
          )}
        </Flex>
      ) : (
        <Text>Aucun utilisateur connecté</Text>
      )}
    </Box>
  );
}
