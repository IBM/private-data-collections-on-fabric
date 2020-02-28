# Short title

Private Data Collections on IBM Blockchain Platform

# Long title

Ensure patients and manufacturers can keep negotiated price details private on a healthcare platform consisting
of patients, pharmacies, manufacturers, and wholesalers.

# Author

* Horea Porutiu <horea.porutiu@ibm.com>

# URLs

### Github repo

* https://github.com/IBM/private-data-collections-on-fabric

# Summary

This code pattern was built using the IBM Blockchain Platform connected to the IBM Kubernetes Service. Using
the private data collections released in Hyperledger 1.2, the pattern showcases the use case of needing to hide negotiated price details from competing  
wholesalers, while still using one channel to ensure all data between the manufacturers, wholesalers,
pharmacies, and patients is on one ledger. This keeps certain details of transactions (such as negotiated price) private, while keeping other details publicly available to all network participants.

# Technologies

* [Nodejs](https://www.nodejs.org/) is an open-source, cross-platform JavaScript run-time environment that executes JavaScript code server-side.
* [Vuejs](https://vuejs.org/) is a progressive framework for building user interfaces.

# Description

On a healthcare platform, there are multiple entities such as the drug manufacturers, wholesalers, pharmacies and patients. These entities share data about the creation of the drug. However, there are cases where entities want to keep some data about the drug hidden from the other entities. Consider the instance where a manufacturer has negotiated different price rates with the wholesalers. They wouldn't want the different wholesalers to be able to see the various drug rates negotiated. Having all entities on the same channel of the blockchain would inherently make every transaction between any two entities, visible to every other entity. With the introduction of private data collections, certain data parts associated with a given transaction, can be kept private from other entities.

In this pattern, we showcase 1 manufacturer, 2 wholesalers, 1 pharmacy and 1 patient connected on the same channel on a blockchain ledger. The manufacturer generates a new drug, and sells it at different prices to the two wholesalers. Only the manufacturer and the patient have visibility to the price of the drug for this example.

This code pattern is for developers who want to learn how to use the private data collections feature introduced into Hyperledger Fabric. When you have completed it, you will understand how to:

* Create multiple organizations with the IBM Blockchain Platform.
* Create a VueJS web app that has multiple dashboards on a Single Page Application, which can communicate in realtime with each other.
* Create a NodeJS server that is deployed to Kubernetes on IBM Cloud.
* Use private data collections to enforce data privacy between organizations on the same channel.

# Flow

![Architecture flow](https://github.com/ash7594/private-data-collections-on-fabric/blob/master/docs/doc-images/arch-flow.png?raw=true)

1. The blockchain operator creates a IBM Kubernetes Service cluster and an IBM Blockchain Platform 2.0 service.
1. The IBM Blockchain Platform 2.0 creates a Hyperledger Fabric network on an IBM Kubernetes Service, and the operator installs and instantiates the smart contract on the network.
1. The Node.js application server uses the Fabric SDK to interact with the deployed network on IBM Blockchain Platform 2.0.
1. The Vue.js UI uses the Node.js application API to interact and submit transactions to the network.
1. The user interacts with the healthcare platform web-app to update and query the blockchain ledger and state.

# Components and services

+ [IBM Blockchain Platform](https://console.bluemix.net/docs/services/blockchain/howto/ibp-v2-deploy-iks.html#ibp-v2-deploy-iks) gives you total control of your blockchain network with a user interface that can simplify and accelerate your journey to deploy and manage blockchain components on the IBM Cloud Kubernetes Service.
+ [IBM Cloud Kubernetes Service](https://www.ibm.com/cloud/container-service) creates a cluster of compute hosts and deploys highly available containers. A Kubernetes cluster lets you securely manage the resources that you need to quickly deploy, update, and scale applications.