'use client'
import React from 'react'
import { Box, Text } from '@chakra-ui/react';
import { useAccount } from "wagmi";



export default function YourInfoContent() {
  const { address, isConnected } = useAccount();


  const formatAddress = (address) => {
    // Affiche les 6 premiers caractères, suivi de '...', suivi des 4 derniers caractères
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };


  return (
    <Box boxShadow="md">
      {isConnected ? (
        <Text>Adresse connectée : {formatAddress(address)}</Text>
      ) : (
        <Text>Aucun utilisateur connecté</Text>
      )}
    </Box>
  )
}
