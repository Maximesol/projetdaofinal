'use client'
import React from 'react';
import { Flex, Box, Button, useDisclosure } from '@chakra-ui/react';
import Nav from '../components/Nav';
import Proposals from '../components/Proposals';
import UserInfo from '../components/UserInfo';
import CreateProposalModal from '../components/CreateProposalModal';
import ProposalForm from '../components/ProposalForm'

export default function Governance() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Flex direction="column" minHeight="100vh" bg='gray.700' color="white">
      <Nav />
      <Flex flex="1" direction={{ base: 'column', md: 'row' }} px={4} py={5}>
        <Box flex={3} mr={{ md: 4 }}>
          <Proposals />
        </Box>
        <Box flex={1}>
          <UserInfo />
          <Button colorScheme="blue" my={4} onClick={onOpen}>
            Make a Proposal
          </Button>
          <CreateProposalModal isOpen={isOpen} onClose={onClose}>
            <ProposalForm  isOpen={isOpen} onClose={onClose}/>
          </CreateProposalModal>
        </Box>
      </Flex>
    </Flex>
  );
}
