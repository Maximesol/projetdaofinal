'use client'
import React from 'react';
import { Flex } from '@chakra-ui/react';
import Nav from './Nav';
import MainContent from './MainContent';
import MainFooter from './MainFooter';
import { useAccount } from "wagmi";
import  useGovernorContract  from '../hooks/useGovernorContract';
import ContractContext from "../context/ContractContext";

export default function Main() {
  const { isConnected } = useAccount();

  const {
    numberOfProposals,
    getProposalCount,
  } = useGovernorContract();

  const contextValue = {
    numberOfProposals,
    getProposalCount,
    isConnected,
  };





  return (
    <ContractContext.Provider value={contextValue}>
      <Flex direction="column" minHeight="100vh" bg='gray.700' color="white">
        <Nav />
        <Flex flexGrow={1}>
          <MainContent />
        </Flex>
        <MainFooter />
      </Flex>
    </ContractContext.Provider>
  );
}
