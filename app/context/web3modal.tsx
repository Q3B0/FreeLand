'use client'

import { createWeb3Modal, defaultConfig } from '@web3modal/ethers/react'

// 1. Get projectId from https://cloud.walletconnect.com
const projectId = 'd2f7fc8eaeb0bd135815051f06014abd'

// 2. Set chains
const mainnet = {
    chainId: 59141,
    name: 'Linea',
    currency: 'ETH',
    explorerUrl: 'https://sepolia.lineascan.build',
    rpcUrl: 'https://linea-sepolia.infura.io/v3/e9faea6cab0546e39922b4ee8c80aa25'
}

// 3. Create a metadata object
const metadata = {
    name: 'FREE LAND',
    description: 'My Website description',
    url: 'https://mywebsite.com', // origin must match your domain & subdomain
    icons: ['https://avatars.mywebsite.com/']
}
// 4. Create Ethers config
const ethersConfig = defaultConfig({
    /*Required*/
    metadata,

    /*Optional*/
    enableEIP6963: true, // true by default
    enableInjected: true, // true by default
    enableCoinbase: true, // true by default
    rpcUrl: '...', // used for the Coinbase SDK
    defaultChainId: 1 // used for the Coinbase SDK
})

// 5. Create a Web3Modal instance
createWeb3Modal({
    ethersConfig,
    chains: [mainnet],
    projectId,
    enableAnalytics: true, // Optional - defaults to your Cloud configuration
    enableOnramp: true // Optional - false as default
})

export function Web3Modal({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return children
}