"use client";
import { useState, useEffect } from "react";
import { readContract, getWalletClient } from "@wagmi/core";
import { tokenGouvAbi, tokenGouvAddress } from "../constants/constantTokenGouv"

const useTokenContract = () => {
  const [tokenBalance, setTokenBalance] = useState(0);
  const [votingPower, setVotingPower] = useState(0);
  const [isDelegating, setIsDelegating] = useState(false); //état temporaire pour afficher le spinner de chargement lors de la délégation de votes.

  const getTokenInfo = async () => {
    const walletClient = await getWalletClient();
    try {
      const balance = await readContract({
        client: walletClient,
        address: tokenGouvAddress,
        abi: tokenGouvAbi,
        functionName: "balanceOf",
        args: [walletClient.account],
      });
      setTokenBalance(balance);

      const votes = await readContract({
        client: walletClient,
        address: tokenGouvAddress,
        abi: tokenGouvAbi,
        functionName: "getVotes",
        args: [walletClient.account],
      });
      setVotingPower(votes);
    } catch (error) {
      console.error("Erreur lors de la récupération des informations du token:", error);
    }
  };

  useEffect(() => {
    getTokenInfo();
  }, []);


  //::::::::DELEGATE VOTES to other address ::::::::

  
  const delegateVotes = async (delegateeAddress) => {
    const walletClient = await getWalletClient();
    setIsDelegating(true);
    try {
      const { request } = await prepareWriteContract({
        client: walletClient,
        address: tokenGouvAddress,
        abi: tokenGouvAbi,
        functionName: "delegate",
        args: [delegateeAddress],
      });
      const { hash } = await writeContract(request);
      await waitForTransaction({ hash, client: walletClient });
    } catch (error) {
      console.error("Erreur lors de la délégation des votes:", error);
    } finally {
      setIsDelegating(false);
    }
  };

  //::::::::DELEGATE VOTES to oneself ::::::::

  const delegateVotesToSelf = async () => {
    const walletClient = await getWalletClient();
    setIsDelegating(true);
    try {
      const { request } = await prepareWriteContract({
        client: walletClient,
        address: tokenGouvAddress,
        abi: tokenGouvAbi,
        functionName: "delegate",
        args: [walletClient.account],
      });
      const { hash } = await writeContract(request);
      await waitForTransaction({ hash, client: walletClient });
    } catch (error) {
      console.error("Erreur lors de la délégation des votes:", error);
    } finally {
      setIsDelegating(false);
    }
  };



  return {
    tokenBalance,
    votingPower,
    getTokenInfo,
    delegateVotes,
    isDelegating,
    delegateVotesToSelf,
  };
};

export default useTokenContract;
