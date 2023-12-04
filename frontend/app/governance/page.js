'use client'
import React from 'react'
import Nav from '../components/Nav'
import { Flex } from '@chakra-ui/react';

export default function Governance() {
  return (
    <Flex direction="column" minHeight="100vh" bg='gray.700' color="white">
      <Nav />
        <div>Je suis la page governance</div>
    </Flex>
  )
}
