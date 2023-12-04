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
import {
  readContract,
  prepareWriteContract,
  writeContract,
  getWalletClient,
  waitForTransaction,
} from "@wagmi/core";
import { useToast } from '@chakra-ui/react';




export default function YourInfoContent() {
  const { address, isConnected } = useAccount();
  const [balance, setBalance] = useState(0)
  const [votingPower, setVotingPower] = useState(0);

  const [showDelegateForm, setShowDelegateForm] = useState(false);
  const [delegateOption, setDelegateOption] = useState('self');
  const [delegateAddress, setDelegateAddress] = useState('');
  const [delegateStatus, setDelegateStatus] = useState(false);

  
  // ::::::::::: TOAST :::::::::::::::::::::
  const toast = useToast();

  const showSuccessToast = () => {
    toast({
      title: 'Délégation réussie',
      description: "Les tokens ont été délégués avec succès.",
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
  };

  const showErrorToast = (error) => {
  toast({
    title: 'Erreur de délégation',
    description: `Un problème est survenu lors de la délagation`,
    status: 'error',
    duration: 5000,
    isClosable: true,
  });
}
  


  // appeler la fonction balanceOf the ERC20 contract
  const getBalanceOf = async (address, walletClient) => {

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

  // appeler la fonction pour voir le pouvoir de vote

  const getVotesOfAddressConnected = async (address, walletClient) => {
  
    try {
      const data = await readContract({
        address: contractAddressTokenGouv,
        abi: abiTokenGouv,
        functionName: "getVotes",
        args: [address],
        account: walletClient.account,
      });
      //setVotingPower(data);
      if (data !== "0x") {
        setVotingPower(data);
      } else {
        console.log("Pas encore de votes délégués pour cette adresse");
        setVotingPower(0);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de la proposal:", error);
    }
  };

  useEffect(() => {
    const init = async () => {
      if (!isConnected || !address) return;

      try {
        const walletClient = await getWalletClient();
        if (!walletClient) {
          console.error("walletClient n'est pas initialisé");
          return;
        }
        await getBalanceOf(address, walletClient);
        await getVotesOfAddressConnected(address, walletClient);
      } catch (error) {
        console.error("Erreur lors de l'initialisation :", error);
      }
    };

    init();
  }, [isConnected, address, delegateStatus]);


  // appeler la fonction pour se déléguer ses tokens
  const selfDelegate = async () => {
  console.log("Délégation à soi-même");
  const walletClient = await getWalletClient();
  try {
    const { request } = await prepareWriteContract({
      address: contractAddressTokenGouv,
      abi: abiTokenGouv,
      functionName: "delegate",
      args: [address], // Adresse de l'utilisateur connecté
      account: walletClient.account,
    });
    const { hash } = await writeContract(request);
    await waitForTransaction({ hash });
    setDelegateStatus(!delegateStatus);
    showSuccessToast();
  } catch (error) {
    showErrorToast()
    console.error("Erreur lors de la délégation à soi-même:", error);
  }
};


  // appeler la fonction pour déléguer ses tokens à une autre adresse

  const delegateToAddress = async (delegateAddress) => {
  console.log("Délégation à l'adresse:", delegateAddress);
  const walletClient = await getWalletClient();
  try {
    const { request } = await prepareWriteContract({
      address: contractAddressTokenGouv,
      abi: abiTokenGouv,
      functionName: "delegate",
      args: [delegateAddress],
      account: walletClient.account,
    });
    const { hash } = await writeContract(request);
    await waitForTransaction({ hash });
    setDelegateStatus(!delegateStatus);
    setDelegateAddress(''); 
    showSuccessToast();
  } catch (error) {
    console.error("Erreur lors de la délégation à une autre adresse:", error);
    showErrorToast()

  }
};

  const handleDelegateSubmit = async () => {
  if (delegateOption === 'self') {
    await selfDelegate();
  } else {
    await delegateToAddress(delegateAddress);
  }
};



  const formatAddress = (address) => {
    // Affiche les 6 premiers caractères, suivi de '...', suivi des 4 derniers caractères
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };


  return (
    <Box as="div" boxShadow="md" p="4" borderRadius="md">
      {isConnected ? (
        <Flex as="div" direction="column" gap="4">
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
