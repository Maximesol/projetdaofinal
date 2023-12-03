import { getPublicClient } from '@wagmi/core'
import { formatEther } from 'viem'

export async function getContractBalance(contractAddress) {
  const publicClient = getPublicClient()
  try {
    const balance = await publicClient.getBalance({ address: contractAddress });
    return formatEther(balance);
  } catch (error) {
    console.error("Erreur lors de la récupération de la balance:", error);
    return null;
  }
}