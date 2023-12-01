import React from 'react';
import { Flex, Button, Stack, Spacer, Divider } from '@chakra-ui/react';
import MainCards from './MainCards';


export default function MainContent() {
  return (
    <Flex direction="column" align="center" justify="space-between" pt="40px" flexGrow={1}>
      <Stack direction={{ base: 'column', md: 'row' }} spacing={4} width="100%" px={4} py={5} flexGrow={1}>
        <MainCards title="Proposal" />
        <MainCards title="Your Info" />
        <MainCards title="DAO Info" />
      </Stack>
      <Spacer />
      <Divider my={4} color="grey" />
      <Button colorScheme="blue" my={4}>Get Funds</Button>
    </Flex>

  );
}
