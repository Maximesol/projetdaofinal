import React from 'react';
import { Flex, Button, Stack, Spacer, Divider } from '@chakra-ui/react';
import MainCards from './MainCards';
import ProposalContent from './ProposalContent';
import YourInfoContent from './YourInfoContent';
import DaoInfoContent from './DaoInfoContent';


export default function MainContent() {
  return (
    <Flex direction="column" align="center" justify="space-between" pt="40px" flexGrow={1}>
      <Stack direction={{ base: 'column', md: 'row' }} spacing={4} width="100%" px={4} py={5} flexGrow={1}>
      <MainCards title="Proposal">
          <ProposalContent />
        </MainCards>
        <MainCards title="Your Info">
          <YourInfoContent />
        </MainCards>
        <MainCards title="DAO Info">
          <DaoInfoContent />
        </MainCards>
      </Stack>
      <Spacer />
      <Divider my={4} />
      <Button colorScheme="blue" my={4}>Get Funds</Button>
    </Flex>

  );
}
