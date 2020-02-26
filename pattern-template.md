# Short title

Private Data Collections on Hyperledger Fabric

# Long title

Follow a pill through the medical supply chain using private data collections for data privacy between organizations

# Author

* Ashutosh Nath Agarwal <ashutosh.nath.agarwal@ibm.com>

# URLs

### Github repo

* https://github.com/IBM/private-data-collections-on-fabric

# Summary

This code pattern was built using the IBM Blockchain Platform connected to the IBM Kebernetes Service. The application showcases using these services in the healthcare industry to follow a pill through the medical supply chain from the manufacturer of the pill to the patient. The pattern showcases the flow of the application from the point of view of the Manufacturer, Wholesaler, Pharmacy and Patient.

# Technologies

* [Nodejs](https://www.nodejs.org/) is an open-source, cross-platform JavaScript run-time environment that executes JavaScript code server-side.
* [Vuejs](https://vuejs.org/) is a progressive framework for building user interfaces.

# Description

In the Medical Supply Chain, there are multiple entities such as the drug manufacturers, wholesellers, pharmacies and patients. These entities share data about the pill as it moves through the chain. However, there are cases where entities want to keep some data about the pill hidden from the other entities. Consider the instance where a manufacturer have negotiated different price rates with the wholesellers. They wouldn't want the different wholesellers to be able to see the various drug rates negotiated. Having all entities on the same channel of the blockchain would inherently make every transaction between any two entities, visible to every other entity. With the introduction of private data collections, certain data parts associated with a given transaction, can be kept private from other entities.

In this pattern, we showcase 1 manufacturer, 2 wholesalers, 1 pharmacy and 1 patient connected on the same channel on a blockchain ledger. The manufacturer generates a new drug pill, and sells it at different prices to the two wholesellers. Only the manufacturer and the patient have visibility to the two negotiated prices for this example.

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
1. The React UI uses the Node.js application API to interact and submit transactions to the network.
1. The user interacts with the supply chain application web interface to update and query the blockchain ledger and state.

# Components and services

+ [IBM Blockchain Platform](https://console.bluemix.net/docs/services/blockchain/howto/ibp-v2-deploy-iks.html#ibp-v2-deploy-iks) gives you total control of your blockchain network with a user interface that can simplify and accelerate your journey to deploy and manage blockchain components on the IBM Cloud Kubernetes Service.
+ [IBM Cloud Kubernetes Service](https://www.ibm.com/cloud/container-service) creates a cluster of compute hosts and deploys highly available containers. A Kubernetes cluster lets you securely manage the resources that you need to quickly deploy, update, and scale applications.