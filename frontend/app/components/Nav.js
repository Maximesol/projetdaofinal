import React from 'react';
import { Box, Flex, Link, Spacer } from '@chakra-ui/react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Navigation() {
  return (
    <Flex as="nav" bg="gray.100" p="4" align="center" width="100vw" height="80px">
      <Box fontWeight="bold" fontSize="lg">
        DeFi Capital Partner
      </Box>
      <Spacer />
      <Box>
        <Link href="/" mx="2">Home</Link>
        <Link href="/governance" mx="2">Governance</Link>
        <Link href="/forum" mx="2">Forum</Link>
      </Box>
      <Spacer />
      <ConnectButton />
    </Flex>
  );
}
