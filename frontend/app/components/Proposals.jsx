'use client'
import React, { useContext, useEffect, useState } from 'react';
import ProposalDetails from './ProposalDetails';
import { ContractContext } from '../context/GovernorContractProvider';


const Proposals = () => {
  const { combinedProposals } = useContext(ContractContext);  


  return (
    <div>
      {combinedProposals.map(event => (
        <ProposalDetails key={event.proposalId} proposalId={event.proposalId} description={event.description}/>
      ))}
    </div>
  );
};

export default Proposals;
