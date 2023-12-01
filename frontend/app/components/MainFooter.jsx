'use client'
import {Flex, Icon, Link } from '@chakra-ui/react';
import { FaTwitter, FaFacebook, FaInstagram } from 'react-icons/fa';

export default function MainFooter() {
  return (
    <Flex as="footer" bg="gray.800" color="white" p="4" justify="center" align="center">
      <Link href="https://twitter.com" isExternal mx="2">
        <Icon as={FaTwitter} w={6} h={6} />
      </Link>
      <Link href="https://facebook.com" isExternal mx="2">
        <Icon as={FaFacebook} w={6} h={6} />
      </Link>
      <Link href="https://instagram.com" isExternal mx="2">
        <Icon as={FaInstagram} w={6} h={6} />
      </Link>
    </Flex>
  );
}
