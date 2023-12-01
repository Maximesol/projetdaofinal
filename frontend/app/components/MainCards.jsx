'use client'
import { Box, Text } from '@chakra-ui/react';


export default function MainCards({ title }) {
    // Assure-toi que la Box prend toute la largeur disponible avec 'w="full"'
    return (
      <Box w="full" bg="gray.800" p="4" boxShadow="lg" borderRadius="md" minHeight="250px">
        <Text fontSize="xl" fontWeight="bold">{title}</Text>
        {/* Autres informations ici */}
      </Box>
    );
  }
  