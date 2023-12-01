import React from 'react';
import { Flex } from '@chakra-ui/react';
import Nav from './Nav';
import MainContent from './MainContent';
import MainFooter from './MainFooter';

export default function Main() {
  return (
    <Flex direction="column" minHeight="100vh">
      <Nav />
      <Flex flexGrow={1}>
        <MainContent />
      </Flex>
      <MainFooter />
    </Flex>
  );
}
