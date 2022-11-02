const fcl = require("@onflow/fcl");

fcl.config({
  "app.detail.title": "5-Multisign", // this adds a custom name to our wallet
  "app.detail.icon": "https://i.imgur.com/nRX6VfZ.png", // this adds a custom image to our wallet
  "accessNode.api": process.env.NEXT_PUBLIC_ACCESS_NODE, // this is for the local emulator
  "discovery.wallet": process.env.NEXT_PUBLIC_WALLET, // this is for the local dev wallet
  "0xDeployer": process.env.NEXT_PUBLIC_CONTRACT_ADDRESS, // this auto configures `0xDeployer` to be replaced by the address in txs and scripts
  "0xStandard": process.env.NEXT_PUBLIC_STANDARD_ADDRESS,
  "0xFlowToken": process.env.NEXT_PUBLIC_FLOW_TOKEN_ADDRESS
})