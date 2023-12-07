import React, { useState } from 'react';
import { encodeFunctionData } from 'viem'
import { readContract, prepareWriteContract, writeContract, getWalletClient, waitForTransaction } from "@wagmi/core";
import {contractAddressTokenGouv, abiTokenGouv} from "../constants/constantTokenGouv"
import {contractAddressTargetContract} from "../constants/constantTargetContract"
import {abiGovernorContract, contractAddressGovernorContract} from "../constants/constantGovernorContract"
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Button, Textarea, FormControl, FormLabel, Input } from '@chakra-ui/react';
import { useAccount } from "wagmi";
import { useToast } from '@chakra-ui/react';



const ProposalForm = ({ onSubmit, isOpen, onClose }) => {
  const [description, setDescription] = useState('');
  const { address, isConnected } = useAccount();

  // ::::::::::: TOAST :::::::::::::::::::::
  const toast = useToast();

  const showSuccessToast = () => {
    toast({
      title: 'Délégation réussie',
      description: "La proposition a bien été soumise à la dao.",
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
  };

  const showErrorToast = (error) => {
  toast({
    title: 'Erreur de délégation',
    description: `Un problème est survenu lors de la soumission de la proposition`,
    status: 'error',
    duration: 5000,
    isClosable: true,
  });
}

  const amountInEther = "10";
  const amountInWei = (parseFloat(amountInEther) * 1e18).toString();

  
  const functionToCall = 'transferEth';
  const args = [contractAddressTargetContract, amountInWei];
  const contractAbi = abiTokenGouv;


  

    const encodedData = encodeFunctionData({
      abi: contractAbi,
      functionName: functionToCall,
      args: args,
    });

 

  const targets = [contractAddressTokenGouv];
  const values = [0];
  const calldatas = [encodedData];

  // function AddProposal
  const addProposal = async (targets, values, calldatas, description) => {
    const walletClient = await getWalletClient();
    try {
      const { request } = await prepareWriteContract({
        address: contractAddressGovernorContract,
        abi: abiGovernorContract,
        functionName: "propose",
        args: [targets, values, calldatas, description],
        account: walletClient.account,
      });
      const { hash } = await writeContract(request);
      await waitForTransaction({ hash });
      console.log("Proposal added, tx hash:", hash);
      onClose();
      showSuccessToast();
    } catch (error) {
      console.error("Erreur lors de l'ajout de la proposal:", error);
      showErrorToast();
    }
  };




  const handleSubmit = (e) => {
    e.preventDefault();
    addProposal(targets, values, calldatas, description);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create a Proposal</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl>
            <FormLabel>Targets</FormLabel>
            <Input type="text" value={targets} readOnly />
          </FormControl>
          <FormControl mt={4}>
            <FormLabel>Values</FormLabel>
            <Input type="text" value={values} readOnly />
          </FormControl>
          <FormControl mt={4}>
            <FormLabel>Calldata</FormLabel>
            <Input type="text" value={calldatas} readOnly />
          </FormControl>
          <FormControl mt={4}>
            <FormLabel>Description</FormLabel>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter your proposal description"
            />
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={handleSubmit}>
            Submit Proposal
          </Button>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ProposalForm;
