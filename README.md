# Private Data Collections on Hyperledger Fabric 🚧🚧🚧🚧WORK IN PROGRESS🚧🚧🚧🚧
🚧🚧🚧🚧In the Medical Supply Chain, there are multiple entities such as the drug manufacturers, wholesellers, pharmacies and patients. These entities share data about the pill as it moves through the chain. However, there are cases where entities want to keep some data about the pill hidden from the other entities. Consider the instance where a manufacturer have negotiated different price rates with the wholesellers. They wouldn't want the different wholesellers to be able to see the various drug rates negotiated. Having all entities on the same channel of the blockchain would inherently make every transaction between any two entities, visible to every other entity. With the introduction of private data collections, certain data parts associated with a given transaction, can be kept private from other entities.

## Intro to private data collections
A transaction with private data is different than a typical Fabric transaction in three main ways.
* The data is stored on a private database on the authorized peers (the peers which are listed in the 
collection definition). If you want to learn more about defining a private data collection, see the 
collection definition section below.
* The data is sent peer-to-peer, via the [gossip protocol](https://hyperledger-fabric.readthedocs.io/en/release-1.4/gossip.html). Note that because the gossip protocol is involved, this means that you must set up anchor peers 
on the channel, and ensure that the `CORE_PEER_GOSSIP_EXTERNALENDPOINT` is configured on each peer. 
* The hash of the data is sent to all peers, whether they are authorized to see the actual private data, 
so that it can be used as evidence that the transaction did occur. The hash of the data is displayed in the
diagram below.

![privDataDiagram](https://user-images.githubusercontent.com/10428517/73143942-92a5ee80-4054-11ea-9902-a544c0c82329.png)


To learn more about when private data collections, see the Fabric documentation [here](https://hyperledger-fabric.readthedocs.io/en/release-1.4/private-data/private-data.html#private-data). To learn a bit more about when
to use a collection within a channel vs. a separate channel, go [here](https://hyperledger-fabric.readthedocs.io/en/release-1.4/private-data/private-data.html#when-to-use-a-collection-within-a-channel-vs-a-separate-channel). 

## Using private data collections

To use a private data collection within your Hyperledger Fabric application, you must define a private data 
[collection definition](https://hyperledger-fabric.readthedocs.io/en/release-1.4/private-data-arch.html#private-data-collection-definition). The collection contains one or more private data
collections and properties such as which organizations are allowed to access the collection, and how many 
peers the private data must be disseminated to. 

Note that the syntax for the collection definition is slightly different if you are using the Fabric SDK 
versus the Fabric CLI. We will be using the Fabric SDK syntax. Take, for example, the collection definition 
below:

```
[
    {
        "name": "collectionMarbles",
        "policy": {
            "identities": [
                {
                    "role": {
                        "name": "member",
                        "mspId": "Org1MSP"
                    }
                },
                {
                    "role": {
                        "name": "member",
                        "mspId": "Org2MSP"
                    }
                }
            ],
            "policy": {
                "1-of": [
                    {
                        "signed-by": 0
                    },
                    {
                        "signed-by": 1
                    }
                ]
            }
        },
        "requiredPeerCount": 1,
        "maxPeerCount": 2,
        "blockToLive": 100
    },
    {
        "name": "collectionMarblePrivateDetails",
        "policy": {
            "identities": [
                {
                    "role": {
                        "name": "member",
                        "mspId": "Org1MSP"
                    }
                }
            ],
            "policy": {
                "1-of": [
                    {
                        "signed-by": 0
                    }
                ]
            }
        },
        "requiredPeerCount": 1,
        "maxPeerCount": 1,
        "blockToLive": 100
    }
]
```

In the above example, `collectionMarbles` allows **both Org1 and Org2** members of the channel to have this private data in their
private database. 
This is because the mspId of both Org1 and Org2 are listed in the policy property. 

```
"policy": {
    "1-of": [
        {
            "signed-by": 0
        },
        {
            "signed-by": 1
        }
    ]
}
```

The nested 
policy property in the above code specifies the `minimum peers required` to disseminate the private data as part of endorsement of 
the chaincode.  This means unless the minimum number of peers are met, only then the chaincode will be endorsed. In the  
example above, this means that only 1 peer is required, and it shows signed-by 0 and 1, this means that either Org1 or
Org2 can disseminate the data, and the chaincode will be endorsed.
`CollectionMarblesPrivateDetails` on the other hand, allows only members of Org1 to have the private data 
in their private database. 

## Writing chaincode with private data collections
The last piece of using private data in Hyperledger Fabric is writing chaincode that will write data to the private 
databases on the peers. This is done by using the [putPrivateData](https://hyperledger.github.io/fabric-chaincode-node/release-2.0/api/fabric-shim.ChaincodeStub.html#putPrivateData__anchor) method from the Hyperledger Fabric Node SDK. 

The method is similar to the [putState]https://hyperledger.github.io/fabric-chaincode-node/release-2.0/api/fabric-shim.ChaincodeStub.html#putState__anchor) method that is commonly used in Fabric chaincode, except that 
this method expects an argument which specifies which private collection to write  
the key-value pair to.

Similarly, for querying the state of a private data collection, you can use the [getPrivateData](https://hyperledger.github.io/fabric-chaincode-node/release-2.0/api/fabric-shim.ChaincodeStub.html#getPrivateData__anchor) method. 


## Private data in healthcare

In this pattern, we showcase 1 manufacturer, 2 wholesalers, 1 pharmacy and 1 patient connected on the same channel on a blockchain ledger. The manufacturer generates a new drug pill, and sells it at different prices to the two wholesellers. Only the manufacturer and the patient have visibility to the two negotiated prices for this example.

This code pattern is for developers who want to learn how to use the private data collections feature introduced into Hyperledger Fabric. When you have completed it, you will understand how to:

* Create multiple organizations with the IBM Blockchain Platform.
* Create a VueJS web app that has multiple dashboards on a Single Page Application, which can communicate in realtime with each other.
* Create a NodeJS server that is deployed to Kubernetes on IBM Cloud.
* Use private data collections to enforce data privacy between organizations on the same channel.

# Architecture flow

![Architecture flow](docs/doc-images/updated-arch-flow.png?raw=true)

1. The blockchain operator creates a IBM Kubernetes Service cluster and an IBM Blockchain Platform 2.0 service.
1. The IBM Blockchain Platform 2.0 creates a Hyperledger Fabric network on an IBM Kubernetes Service, and the operator installs and instantiates the smart contract on the network.
1. The Node.js application server uses the Fabric SDK to interact with the deployed network on IBM Blockchain Platform 2.0.
1. The React UI uses the Node.js application API to interact and submit transactions to the network.
1. The user interacts with the supply chain application web interface to update and query the blockchain ledger and state.

# Included components

+ [IBM Blockchain Platform](https://console.bluemix.net/docs/services/blockchain/howto/ibp-v2-deploy-iks.html#ibp-v2-deploy-iks) gives you total control of your blockchain network with a user interface that can simplify and accelerate your journey to deploy and manage blockchain components on the IBM Cloud Kubernetes Service.
+ [IBM Cloud Kubernetes Service](https://www.ibm.com/cloud/container-service) creates a cluster of compute hosts and deploys highly available containers. A Kubernetes cluster lets you securely manage the resources that you need to quickly deploy, update, and scale applications.

## Featured technologies

* [Nodejs](https://www.nodejs.org/) is an open-source, cross-platform JavaScript run-time environment that executes JavaScript code server-side.
* [Vuejs](https://vuejs.org/) is a progressive framework for building user interfaces.
* [Bootstrap](https://getbootstrap.com/) is a free and open-source front-end Web framework. It contains HTML and CSS-based design templates for typography, forms, buttons, navigation and other interface components, as well as optional JavaScript extensions.
* [Docker](https://www.docker.com/) is a computer program that performs operating-system-level virtualization, also known as Containerization.

## Prerequisites

* [IBM Cloud account](https://cloud.ibm.com/registration/?target=%2Fdashboard%2Fapps)
* [Docker](https://www.docker.com/products) - latest
* [Docker Compose](https://docs.docker.com/compose/overview/) - latest
* [NPM](https://www.npmjs.com/get-npm) - latest
* [nvm]() - latest
* [Node.js](https://nodejs.org/en/download/) - Node v8.9.x
* [Git client](https://git-scm.com/downloads) - latest

# Steps (Cloud Network)

1. [Create IBM Cloud services](#step-1-Create-IBM-Cloud-services)
2. [Build a network - Certificate Authority](#step-2-Build-a-network---Certificate-Authority)
3. [Build a network - Create MSP Definitions](#step-3-Build-a-network---Create-MSP-Definitions)
4. [Build a network - Create Peers](#step-4-build-a-network---Create-Peers)
5. [Build a network - Create Orderer](#step-5-Build-a-network---Create-Orderer)
6. [Build a network - Create and Join Channel](#step-6-Build-a-network---Create-and-Join-Channel)
7. [Deploy Smart Contract on the network](#step-7-Deploy-Smart-Contract-on-the-network)
8. [Connect application to the network](#step-8-Connect-application-to-the-network)
9. [Enroll App Admin Identities](#step-9-Enroll-App-Admin-Identities)
10. [Run the application](#step-10-Run-the-application)

**Important Note:** This pattern is more advanced because it uses four organizations. For this reason, you will likely
have to get a paid kubernetes cluster to run this pattern on the cloud, since a free cluster will not have the CPU/storage 
necessary to deploy all of the pods that we need to run this pattern. There are other patterns that leverage a free
Kubernetes cluster (and only two organizations), so if you want to try that one out first, go [here](https://github.com/IBM/blockchainbean2). 

## Step 1. Create IBM Cloud services

* Create the [IBM Cloud Kubernetes Service](https://cloud.ibm.com/catalog/infrastructure/containers-kubernetes).  You can 
find the service in the `Catalog`.

* Once you reach the <b> create a new cluster page </b> you will need to do the following:
  - Choose <b>standard</b> cluster type
  - Fill out cluster name
  - choose Geography: <b>North America</b>
  - Choose Location and availability: <b>Multizone</b>
  - Choose Metro: <b>Dallas</b>
  - Choose Worker nodes: <b>Dallas 10 only</b>
  - Choose Master service endpoint: <b>Both private & public endpoints</b>
  - Choose Default worker pool
  - Choose Flavor
  - Choose Encrypt local disk <b>Yes</b>
  - Choose Worker nodes <b>3</b>
  - Click on <b>create cluster. </b>
<b>The cluster takes around 15-20
minutes to provision, so please be patient!</b>


<br>
<p align="center">
  <img src="docs/doc-gifs/createCluster.gif">
</p>
<br>

* After your kubernetes cluster is up and running, you can deploy your IBM Blockchain Platform V2 Beta on the cluster. Again - wait for the Kubernetes service to indicate it was deployed. The service walks through few steps and finds your cluster on the IBM Cloud to deploy the service on.

<br>
<p align="center">
  <img src="docs/doc-gifs/create-ibm-blockchain-2-service.gif">
</p>
<br>



* Once the Blockchain Platform is deployed on the Kubernetes cluster, you can launch the console to start operating on your blockchain network.

<br>
<p align="center">
  <img src="docs/doc-gifs/deploy-blockchain-on-cluster.gif">
</p>
<br>

## Step 2. Build a network - Certificate Authority

We will build a network as provided by the IBM Blockchain Platform [documentation](https://console.bluemix.net/docs/services/blockchain/howto/ibp-console-build-network.html#ibp-console-build-network).  This will include creating a channel with a single peer organization with its own MSP and CA (Certificate Authority), and an orderer organization with its own MSP and CA. We will create the respective identities to deploy peers and operate nodes.

![patientCA](https://user-images.githubusercontent.com/10428517/71632119-99f6eb00-2bc1-11ea-83ff-e725c47a2d86.gif)

* #### Create your patient organization CA 
  - Click <b>Add Certificate Authority</b>.
  - Click <b>IBM Cloud</b> under <b>Create Certificate Authority</b> and <b>Next</b>.
  - Give it a <b>Display name</b> of `Patient CA`.  
  - Specify an <b>Admin ID</b> of `admin` and <b>Admin Secret</b> of `adminpw`.

* #### Create your manufacturer organization CA (process is same as shown in gif above)
  - Click <b>Add Certificate Authority</b>.
  - Click <b>IBM Cloud</b> under <b>Create Certificate Authority</b> and <b>Next</b>.
  - Give it a <b>Display name</b> of `Manufacturer CA`.  
  - Specify an <b>Admin ID</b> of `admin` and <b>Admin Secret</b> of `adminpw`.

* #### Create your wholesaler1 organization CA (process is same as shown in gif above)
  - Click <b>Add Certificate Authority</b>.
  - Click <b>IBM Cloud</b> under <b>Create Certificate Authority</b> and <b>Next</b>.
  - Give it a <b>Display name</b> of `W1 CA`.  
  - Specify an <b>Admin ID</b> of `admin` and <b>Admin Secret</b> of `adminpw`.

* #### Create your wholesaler2 organization CA (process is same as shown in gif above)
  - Click <b>Add Certificate Authority</b>.
  - Click <b>IBM Cloud</b> under <b>Create Certificate Authority</b> and <b>Next</b>.
  - Give it a <b>Display name</b> of `W2 CA`.  
  - Specify an <b>Admin ID</b> of `admin` and <b>Admin Secret</b> of `adminpw`.

* #### Create your pharmacy organization CA (process is same as shown in gif above)
  - Click <b>Add Certificate Authority</b>.
  - Click <b>IBM Cloud</b> under <b>Create Certificate Authority</b> and <b>Next</b>.
  - Give it a <b>Display name</b> of `Pharmacy CA`.  
  - Specify an <b>Admin ID</b> of `admin` and <b>Admin Secret</b> of `adminpw`.

![registerUserPatientCA](https://user-images.githubusercontent.com/10428517/71632197-1689c980-2bc2-11ea-9c44-fa5a472b6cc2.gif)

* #### Use your CA to associate and register patient identities 
  - Select the <b>Patient CA</b> Certificate Authority that we created.
  First you need to associate the CA, click <b>Associate identity</b>
  - Give an <b>Enroll ID</b> of `admin`, and <b>Enroll Secret</b> of `adminpw`.  Note that this is the same as the id and secret you gave in the creation step. Then give the <b>Identity Display Name</b> of <b>Patient CA Admin</b> Click <b>Associate Identity</b>.
  - First, we will register an admin for our Patient Organization. Click on the <b>Register User</b> button.  Give an <b>Enroll ID</b> of `patientAdmin`, and <b>Enroll Secret</b> of `patientAdminpw`. Set the <b>Type</b> for this identity as `client` We will leave the <b>Maximum enrollments</b> and <b>Add Attributes</b> fields alone. Click <b>Next</b> and then Click <b>Register User</b>.
  - We will repeat the process to create an identity of the peer. Click on the <b>Register User</b> button.  Give an <b>Enroll ID</b> of `patientPeer`, and <b>Enroll Secret</b> of `patientPeerpw`.   Set the <b>Type</b> for this identity as `peer` We will leave the <b>Maximum enrollments</b> and <b>Add Attributes</b> fields blank. Click <b>Next</b> and then Click <b>Register User</b>.


* #### Use your CA to associate and register manufacturer identities (process is same as shown in gif above)
  - Select the <b>Manufacturer CA</b> Certificate Authority that we created.
  - First you need to associate the CA, click <b>Associate identity</b>
  - Give an <b>Enroll ID</b> of `admin`, and <b>Enroll Secret</b> of `adminpw`.  Note that this is the same as the id and secret you gave in the creation step. Then give the <b>Identity Display Name</b> of <b>Manufacturer CA Admin</b>  Click <b>Associate Identity</b>.
  - Then, we will register an admin for our Organization. Again, select the <b>Manufacturer CA Certificate Authority</b>. Click on the <b>Register User</b> button.  Give an <b>Enroll ID</b> of `manufacturerAdmin`, and <b>Enroll Secret</b> of `manufacturerAdminpw`.  Set the <b>Type</b> for this identity as `client`. We will leave the <b>root affliation</b> and <b>Add Attributes</b> alone. Click <b>Next</b> and then Click <b>Register User</b>
  - We will repeat the process to create an identity of the peer. Click on the <b>Register User</b> button.  Give an <b>Enroll ID</b> of `manufacturerPeer`, and <b>Enroll Secret</b> of `manufacturerPeerpw`.  Set the <b>Type</b> for this identity as `peer`. We will leave everything else <b>Maximum enrollments</b> and <b>Add Attributes</b> fields alone. Click <b>Next</b> and then Click <b>Register User</b>.

* #### Use your CA to associate and register w1 identities (process is same as shown in gif above)
  - Select the <b>W1 CA</b> Certificate Authority that we created.
  - First you need to associate the CA, click <b>Associate identity</b>
  - Give an <b>Enroll ID</b> of `admin`, and <b>Enroll Secret</b> of `adminpw`.  Note that this is the same as the id and secret you gave in the creation step. Then give the <b>Identity Display Name</b> of <b>W1 CA Admin</b> Click <b>Associate Identity</b>.
  - Then, we will register an admin for our W1 Organization. Click on the <b>Register User</b> button.  Give an <b>Enroll ID</b> of `w1Admin`, and <b>Enroll Secret</b> of `w1Adminpw`.  Set the <b>Type</b> for this identity as `client`. We will leave the <b>Maximum enrollments</b> and <b>Add Attributes</b> fields alone. Click <b>Next</b> and then Click <b>Register User</b>.
  - We will repeat the process to create an identity of the peer. Click on the <b>Register User</b> button.  Give an <b>Enroll ID</b> of `w1Peer`, and <b>Enroll Secret</b> of `w1Peerpw`. Set the <b>Type</b> for this identity as `peer`. We will leave everything else <b>Maximum enrollments</b> and <b>Add Attributes</b> fields alone. Click <b>Next</b> and then Click <b>Register User</b>.
  
* #### Use your CA to associate and register w2 identities (process is same as shown in gif above)
  - Select the <b>W2 CA</b> Certificate Authority that we created.
  - First you need to associate the CA, click <b>Associate identity</b>
  - Give an <b>Enroll ID</b> of `admin`, and <b>Enroll Secret</b> of `adminpw`.  Note that this is the same as the id and secret you gave in the creation step. Then give the <b>Identity Display Name</b> of <b>W2 CA Admin</b> Click <b>Associate Identity</b>.
  - Next, we will register an admin for our W2 Organization. Click on the <b>Register User</b> button.  Give an <b>Enroll ID</b> of `w2Admin`, and <b>Enroll Secret</b> of `w2Adminpw`.  Set the <b>Type</b> for this identity as `client`. We will leave the <b>Maximum enrollments</b> and <b>Add Attributes</b> fields blank. Click <b>Next</b> and then Click <b>Register User</b>.
  - We will repeat the process to create an identity of the peer. Click on the <b>Register User</b> button.  Give an <b>Enroll ID</b> of `w2Peer`, and <b>Enroll Secret</b> of `w2Peerpw`.  Set the <b>Type</b> for this identity as `peer`.  We will leave the <b>Maximum enrollments</b> and <b>Add Attributes</b> fields blank. Click <b>Next</b> and then Click <b>Register User</b>.

* #### Use your CA to associate and register pharmacy identities (process is same as shown in gif above)
  - Select the <b>Pharmacy CA</b> Certificate Authority that we created.
  - First you need to associate the CA, click <b>Associate identity</b>
  - Give an <b>Enroll ID</b> of `admin`, and <b>Enroll Secret</b> of `adminpw`.  Note that this is the same as the id and secret you gave in the creation step. Then give the <b>Identity Display Name</b> of <b>Pharmacy CA Admin</b> Click <b>Associate Identity</b>.
  - Next, we will register an admin for our Pharmacy Organization. Click on the <b>Register User</b> button.  Give an <b>Enroll ID</b> of `pharmacyAdmin`, and <b>Enroll Secret</b> of `pharmacyAdminpw`. Set the <b>Type</b> for this identity as `client`. We will leave the <b>Maximum enrollments</b> and <b>Add Attributes</b> fields alone. Click <b>Next</b> and then Click <b>Register User</b>.
  - We will repeat the process to create an identity of the peer. Click on the <b>Register User</b> button.  Give an <b>Enroll ID</b> of `pharmacyPeer`, and <b>Enroll Secret</b> of `pharmacyPeerpw`.  Set the <b>Type</b> for this identity as `peer` We will leave the <b>Maximum enrollments</b> and <b>Add Attributes</b> fields blank. Click <b>Next</b> and then Click <b>Register User</b>.

## Step 3. Build a network - Create MSP Definitions

* #### Create the manufacturer MSP definition
  - Navigate to the <b>Organizations</b> tab in the left navigation and click <b>Create MSP definition</b>.
  - Enter the <b>MSP Display name</b> as `Manufacturer MSP` and an <b>MSP ID</b> of `manufacturermsp`.
  - Under <b>Root Certificate Authority</b> details, specify the peer CA that we created `Manufacturer CA` as the root CA for the organization.
  - Give the <b>Enroll ID</b> and <b>Enroll secret</b> for your organization admin, `manufacturerAdmin` and `manufacturerAdminpw`. Then, give the Identity name, `Manufacturer MSP Admin`.
  - Click the <b>Generate</b> button to enroll this identity as the admin of your organization and export the identity to the wallet. Click <b>Export</b> to export the admin certificates to your file system. Finally click <b>Create MSP definition</b>.

* #### Create the W1 MSP definition
  - Navigate to the <b>Organizations</b> tab in the left navigation and click <b>Create MSP definition</b>.
  - Enter the <b>MSP Display name</b> as `W1 MSP` and an <b>MSP ID</b> of `w1msp`.
  - Under <b>Root Certificate Authority</b> details, specify the peer CA that we created `W1 CA` as the root CA for the organization.
  - Give the <b>Enroll ID</b> and <b>Enroll secret</b> for your organization admin, `w1Admin` and `w1Adminpw`. Then, give the Identity name, `W1 MSP Admin`.
  - Click the <b>Generate</b> button to enroll this identity as the admin of your organization and export the identity to the wallet. Click <b>Export</b> to export the admin certificates to your file system. Finally click <b>Create MSP definition</b>.

* #### Create the W2 MSP definition
  - Navigate to the <b>Organizations</b> tab in the left navigation and click <b>Create MSP definition</b>.
  - Enter the <b>MSP Display name</b> as `W2 MSP` and an <b>MSP ID</b> of `w2msp`.
  - Under <b>Root Certificate Authority</b> details, specify the peer CA that we created `W2 CA` as the root CA for the organization.
  - Give the <b>Enroll ID</b> and <b>Enroll secret</b> for your organization admin, `w2Admin` and `w2Adminpw`. Then, give the Identity name, `W2 MSP Admin`.
  - Click the <b>Generate</b> button to enroll this identity as the admin of your organization and export the identity to the wallet. Click <b>Export</b> to export the admin certificates to your file system. Finally click <b>Create MSP definition</b>.

* #### Create the Pharmacy MSP definition
  - Navigate to the <b>Organizations</b> tab in the left navigation and click <b>Create MSP definition</b>.
  - Enter the <b>MSP Display name</b> as `Pharmacy MSP` and an <b>MSP ID</b> of `pharmacymsp`.
  - Under <b>Root Certificate Authority</b> details, specify the peer CA that we created `Pharmacy CA` as the root CA for the organization.
  - Give the <b>Enroll ID</b> and <b>Enroll secret</b> for your organization admin, `pharmacyAdmin` and `pharmacyAdminpw`. Then, give the Identity name, `Pharmacy MSP Admin`.
  - Click the <b>Generate</b> button to enroll this identity as the admin of your organization and export the identity to the wallet. Click <b>Export</b> to export the admin certificates to your file system. Finally click <b>Create MSP definition</b>.

  * #### Create the Patient MSP definition
  - Navigate to the <b>Organizations</b> tab in the left navigation and click <b>Create MSP definition</b>.
  - Enter the <b>MSP Display name</b> as `Patient MSP` and an <b>MSP ID</b> of `patientmsp`.
  - Under <b>Root Certificate Authority</b> details, specify the peer CA that we created `Patient CA` as the root CA for the organization.
  - Give the <b>Enroll ID</b> and <b>Enroll secret</b> for your organization admin, `patientAdmin` and `patientAdminpw`. Then, give the Identity name, `Patientß MSP Admin`.
  - Click the <b>Generate</b> button to enroll this identity as the admin of your organization and export the identity to the wallet. Click <b>Export</b> to export the admin certificates to your file system. Finally click <b>Create MSP definition</b>.


## Step 4. Build a network - Create Peers

* Create an manufacturer peer
  - On the <b>Nodes</b> page, click <b>Add peer</b>.
  - Click <b>IBM Cloud</b> under Create a new peer and <b>Next</b>.
  - Give your peer a <b>Display name</b> of `Manufacturer Peer`.
  - On the next screen, select `Manufacturer CA` as your <b>Certificate Authority</b>. Then, give the <b>Enroll ID</b> and <b>Enroll secret</b> for the peer identity that you created for your peer, `manufacturerPeer`, and `manufacturerPeerpw`. Then, select the <b>Administrator Certificate (from MSP)</b>, `Manufacturer MSP`, from the drop-down list and click <b>Next</b>.
  - The last side panel will ask you to <b>Associate an identity</b> and make it the admin of your peer. Select your peer admin identity `Manufacturer MSP Admin`. Click <b>Next</b>.
  - Review the summary and click <b>Add Peer</b>.
 
* Create an W1 peer
  - On the <b>Nodes</b> page, click <b>Add peer</b>.
  - Click <b>IBM Cloud</b> under Create a new peer and <b>Next</b>.
  - Give your peer a <b>Display name</b> of `W1 Peer`.
  - On the next screen, select `W1 CA` as your <b>Certificate Authority</b>. Then, give the <b>Enroll ID</b> and <b>Enroll secret</b> for the peer identity that you created for your peer, `W1Peer`, and `W1Peerpw`. Then, select the <b>Administrator Certificate (from MSP)</b>, `W1 MSP`, from the drop-down list and click <b>Next</b>.
  - The last side panel will ask you to <b>Associate an identity</b> and make it the admin of your peer. Select your peer admin identity `W1 MSP Admin`. Click <b>Next</b>.
  - Review the summary and click <b>Add Peer</b>.

* Create an W2 peer
  - On the <b>Nodes</b> page, click <b>Add peer</b>.
  - Click <b>IBM Cloud</b> under Create a new peer and <b>Next</b>.
  - Give your peer a <b>Display name</b> of `W2 Peer`.
  - On the next screen, select `W2 CA` as your <b>Certificate Authority</b>. Then, give the <b>Enroll ID</b> and <b>Enroll secret</b> for the peer identity that you created for your peer, `W2Peer`, and `W2Peerpw`. Then, select the <b>Administrator Certificate (from MSP)</b>, `W2 MSP`, from the drop-down list and click <b>Next</b>.
  - The last side panel will ask you to <b>Associate an identity</b> and make it the admin of your peer. Select your peer admin identity `W2 MSP Admin`. Click <b>Next</b>.
  - Review the summary and click <b>Add Peer</b>.

* Create an Pharmacy peer
  - On the <b>Nodes</b> page, click <b>Add peer</b>.
  - Click <b>IBM Cloud</b> under Create a new peer and <b>Next</b>.
  - Give your peer a <b>Display name</b> of `Pharmacy Peer`.
  - On the next screen, select `Pharmacy CA` as your <b>Certificate Authority</b>. Then, give the <b>Enroll ID</b> and <b>Enroll secret</b> for the peer identity that you created for your peer, `PharmacyPeer`, and `pharmacyPeerpw`. Then, select the <b>Administrator Certificate (from MSP)</b>, `Pharmacy MSP`, from the drop-down list and click <b>Next</b>.
  - The last side panel will ask you to <b>Associate an identity</b> and make it the admin of your peer. Select your peer admin identity `Pharmacy MSP Admin`. Click <b>Next</b>.
  - Review the summary and click <b>Add Peer</b>.

* Create an Patient peer
  - On the <b>Nodes</b> page, click <b>Add peer</b>.
  - Click <b>IBM Cloud</b> under Create a new peer and <b>Next</b>.
  - Give your peer a <b>Display name</b> of `Patient Peer`.
  - On the next screen, select `Patient CA` as your <b>Certificate Authority</b>. Then, give the <b>Enroll ID</b> and <b>Enroll secret</b> for the peer identity that you created for your peer, `patientPeer`, and `patientPeerpw`. Then, select the <b>Administrator Certificate (from MSP)</b>, `Patient MSP`, from the drop-down list and click <b>Next</b>.
  - The last side panel will ask you to <b>Associate an identity</b> and make it the admin of your peer. Select your peer admin identity `Patient MSP Admin`. Click <b>Next</b>.
  - Review the summary and click <b>Add Peer</b>.

## Step 5. Build a network - Create Orderer

Go to the Nodes tab.

* #### Create your orderer organization CA
  - Click <b>Add Certificate Authority</b>.
  - Click <b>IBM Cloud</b> under <b>Create Certificate Authority</b> and <b>Next</b>.
  - Give it a unique <b>Display name</b> of `Orderer CA`.  
  - Specify an <b>Admin ID</b> of `admin` and <b>Admin Secret</b> of `adminpw`.

* #### Use your CA to register orderer and orderer admin identities
  - In the <b>Nodes</b> tab, select the <b>Orderer CA</b> Certificate Authority that we created.
  - First you need to associate the CA, click <b>Associate identity</b>
  - Give an <b>Enroll ID</b> of `admin`, and <b>Enroll Secret</b> of `adminpw`.  Note that this is the same as the id and secret you gave in the creation step. Then give the <b>Identity Display Name</b> of <b>Orderer CA Admin</b> Click <b>Associate Identity</b>.
  - First, we will register an admin for our organization. Click on the <b>Register User</b> button.  Give an <b>Enroll ID</b> of `ordereradmin`, and <b>Enroll Secret</b> of `ordereradminpw`.  Set the <b>Type</b> for this identity as `client`. We will leave the <b>Maximum enrollments</b> and <b>Add Attributes</b> fields alone. Click <b>Next</b> and then Click <b>Register User</b>.
  - We will repeat the process to create an identity of the orderer. Click on the <b>Register User</b> button.  Give an <b>Enroll ID</b> of `orderer1`, and <b>Enroll Secret</b> of `orderer1pw`.  Set the <b>Type</b> for this identity as `peer`. We will leave the <b>Maximum enrollments</b> and <b>Add Attributes</b> fields alone. Click <b>Next</b> and then Click <b>Register User</b>.

* #### Create the orderer organization MSP definition
  - Navigate to the <b>Organizations</b> tab in the left navigation and click <b>Create MSP definition</b>.
  - Enter the <b>MSP Display name</b> as `Orderer MSP` and an <b>MSP ID</b> of `orderermsp`.
  - Under <b>Root Certificate Authority</b> details, specify the peer CA that we created `Orderer CA` as the root CA for the organization.
  - Give the <b>Enroll ID</b> and <b>Enroll secret</b> for your organization admin, `ordereradmin` and `ordereradminpw`. Then, give the <b>Identity name</b>, `Orderer MSP Admin`.
  - Click the <b>Generate</b> button to enroll this identity as the admin of your organization and export the identity to the wallet. Click <b>Export</b> to export the admin certificates to your file system. Finally click <b>Create MSP definition</b>.

* #### Create an orderer
  - On the <b>Nodes</b> page, click <b>Add orderering service</b>.
  - Click <b>IBM Cloud</b> and proceed with <b>Next</b>.
  - Give your peer a <b>Display name</b> of `Orderer`.
  - On the next screen, select `Orderer CA` as your <b>Certificate Authority</b>. Then, give the <b>Enroll ID</b> and <b>Enroll secret</b> for the peer identity that you created for your orderer, `orderer1`, and `orderer1pw`. Then, select the <b>Administrator Certificate (from MSP)</b>, `Orderer MSP`, from the drop-down list and click <b>Next</b>.
  - Give the <b>TLS Enroll ID</b>, `admin`, and <b>TLS Enroll secret</b>, `adminpw`, the same values are the Enroll ID and Enroll secret that you gave when creating the CA.  Leave the <b>TLS CSR hostname</b> blank.
  - The last side panel will ask to <b>Associate an identity</b> and make it the admin of your peer. Select your peer admin identity `Orderer MSP Admin`.
  - Click <b>Next</b>, Review the summary and click <b>Add Ordering Service</b>.

* #### Add organizations as Consortium Member on the orderer to transact
  - Navigate to the <b>Nodes</b> tab, and click on the <b>Orderer</b> that we created.
  - Under <b>Consortium Members</b>, click <b>Add organization</b>.
  - From the drop-down list, select `Manufacturer MSP`.
  - Click <b>Add Organization</b>.
  - Repeat the same steps, but add `W1 MSP`, `W2 MSP`, `Pharmacy MSP` and `Patient MSP` as well.

## Step 6. Build a network - Create and Join Channel

* #### Create the channel
  - Navigate to the <b>Channels</b> tab in the left navigation.
  - Click <b>Create channel</b>.
  - Give the channel a name, `mychannel`.
  - Select the orderer you created, `Orderer` from the orderers drop-down list.
  - Select the channel member. This should be `Manufacturer MSP (manufacturermsp)`. 
  - Select the MSP identifying the organization of the channel creator from the drop-down list. This should be `Manufacturer MSP (manufacturermsp)`.
  - Click <b>Add</b> next to the manufacturer organization. Make the organization an <b>Operator</b>.
  - Do the same for the other organizations:
  - Click <b>Add</b> next to the w1 organization. Make the organization an <b>Operator</b>.
  - Click <b>Add</b> next to the w2 organization. Make the organization an <b>Operator</b>.
  - Click <b>Add</b> next to the pharmacy organization. Make the organization an <b>Operator</b>.
  - Click <b>Add</b> next to the patient organization. Make the organization an <b>Operator</b>.
  - Under <b>Channel update policy</b>, Select <b>1 out of 5</b>.
  - Under <b>Creator organization</b> Select <b>Manufacturer MSP</b> under Channel creator MSP. And then select Associate available identity as `Manufacturer MSP Admin`.
  - Click <b>Create channel</b>.

* #### Join your peer to the channel
  - Click <b>Join channel</b> to launch the side panels.
  - Select your `Orderer` and click <b>Next</b>.
  - Enter the name of the channel you just created. `mychannel` and click <b>Next</b>.
  - Select which peers you want to join the channel, click all peers.
  - Ensure all peers are anchor peers.
  - Click <b>Join channel</b>.


## Step 7. Deploy Smart Contract on the network

* #### Install a smart contract
* Clone the repository:
  ```bash
  git clone https://github.com/IBM/private-data-collections-on-fabric
  ```
  - Click the <b>Smart contracts</b> tab to install the smart contract.
  - Click <b>Install smart contract</b> to upload the medrec smart contract package file.
  - Click on <b>Add file</b> and find your packaged smart contract <b>private-data-collection.cds</b> . It is the file in the `private-data-collections-on-fabric/chaincodePackage` directory. 
  - Select all peers - we need to install the contract on each peer.
  - Once the contract is uploaded, click <b>Install smart contract</b>.

* #### Instantiate smart contract
  - On the smart contracts tab, find the smart contract from the list installed on your peers and click <b>Instantiate</b> from the overflow menu on the right side of the row.
  - On the side panel that opens, select the channel, `mychannel` to instantiate the smart contract on. Click <b>Next</b>.
  - Select the organization members to be included in the policy, `manufacturermsp`, `w1msp`, `w2msp`, `pharmacymsp, patientmsp`.  Click <b>Next</b>.
  - Select the peer to approve proposals for instantiating the smart contract. Select <b>Manufacturer Peer</b> from the drop down.
  - Setup private data collection. Click on <b>Add file</b> and find your private data `.json` file <b>. To learn more about private data collection go to the following site [ibp-console-smart-contracts-private-data](https://cloud.ibm.com/docs/services/blockchain?topic=blockchain-ibp-console-smart-contracts#ibp-console-smart-contracts-private-data).private-data-collection.cds</b>. It is the file called `collections_config.json` in the `private-data-collections-on-fabric/private-data-collections-on-fabric/server` directory. 
  - Give <b>Function name</b> of `Init` and leave <b>Arguments</b> blank.
  - Click <b>Instantiate</b>.

## Step 8. Connect application to the network

* #### Connect with sdk through connection profile
  - Under the Instantiated Smart Contract, click on `Connect with SDK` from the overflow menu on the right side of the row.
  - Choose from the dropdown for <b>MSP for connection</b>, `manufacturermsp`.
  - Choose from <b>Certificate Authority</b> dropdown, `Manufacturer CA`.
  - Download the connection profile by scrolling down and clicking <b>Download Connection Profile</b>.  This will download the connection json which we will use soon to establish connection.
  - You can click <b>Close</b> once the download completes.
  - Copy and paste the contents of the downloaded file into `web-app/server/ibpConnection.json`. Our config files will use this file to communicate with the 
  CA nodes to be able to register users to transact on the network.
  - Go into `private-data-collections-on-fabric/web-app/server/config` and then change each of the
  five files to include the CAURL from the IBM Blockchain Platform. This will help us enroll an 
  admin user to each of the respective Certificate Authorities we created on the IBM Blockchain Platform. You can find the CaUrl by clicking on each of the CA nodes, and then by clicking on the 
  gear icon. 
  ![caUrl](https://user-images.githubusercontent.com/10428517/75277614-305c1d00-57bd-11ea-99f1-1921e202f674.png)
  - Once completed, each of the five files in the `private-data-collections-on-fabric/web-app/server/config` directory will look like the following, taking configPatient.json as an example:

  ```
  {
  "connection_file": "ibpConnection.json",
  "appAdmin": "admin",
  "appAdminSecret": "adminpw",
  "orgMSPID": "patientmsp",
  "caUrl": "https://********.us-south.containers.appdomain.cloud:7054",
  "userName": "patientAdmin",
  "gatewayDiscovery": { "enabled": true, "asLocalhost": false }
  }
  ``` 
  Note that my containers are located in us-south, so your URL will look different based on location. 
  

## Step 9. Register Org Admin Users
  - go into `private-data-collections-on-fabric/web-app/server` and then run the `./enrollAllAdmin.sh` script. Your output should look like the following:

  ```
  server$ ./enrollAllAdmin.sh 
  msg: Successfully enrolled admin user manufacturerAdmin and imported it into the wallet
  msg: Successfully enrolled admin user w1Admin and imported it into the wallet
  msg: Successfully enrolled admin user w2Admin and imported it into the wallet
  msg: Successfully enrolled admin user patientAdmin and imported it into the wallet
  msg: Successfully enrolled admin user pharmacyAdmin and imported it into the wallet
  ```
  - Nice job! You now have admin identities for each of your organizations, and you can start 
  adding registering more users.
  - You're now ready to start the application!

  
## Step 10. Run the application

- In a terminal window, navigate to the directory private-data-collections-on-fabric

- Install the dependencies 

  ```bash
  cd server
  npm install
  ```

  - Start the application

  ```bash
  npm start
  ```
  
# License

This code pattern is licensed under the Apache Software License, Version 2.  Separate third-party code objects invoked within this code pattern are licensed by their respective providers pursuant to their own separate licenses. Contributions are subject to the [Developer Certificate of Origin, Version 1.1 (DCO)](https://developercertificate.org/) and the [Apache Software License, Version 2](http://www.apache.org/licenses/LICENSE-2.0.txt).

[Apache Software License (ASL) FAQ](http://www.apache.org/foundation/license-faq.html#WhatDoesItMEAN)

<!-- 
* #### Create manufacturer application admin
  - Go to the <b>Nodes</b> tab on the left bar, and under <b>Certificate Authorities</b>, choose your <b>Manufacturer CA</b>.
  - Click on <b>Register user</b>.
  - Give an <b>Enroll ID</b> and <b>Enroll Secret</b> to administer your application users, `manufacturerApp-admin` and `manufacturerApp-adminpw`.
  - Choose `client` as <b>Type</b>.
  - You can leave the <b>Use root affiliation</b> box checked.
  - You can leave the <b>Maximum enrollments</b> blank.
  - Under <b>Attributes</b>, click on <b>Add attribute</b>.  Give attribute as `hf.Registrar.Roles` = `*`.  This will allow this identity to act as registrar and issues identities for our app.  Click <b>Add-attribute</b>.
  - Click <b>Register User</b>.

* #### Create w1 application admin
  - Go to the <b>Nodes</b> tab on the left bar, and under <b>Certificate Authorities</b>, choose your <b>W1 CA</b>.
  - Click on <b>Register user</b>.
  - Give an <b>Enroll ID</b> and <b>Enroll Secret</b> to administer your application users, `w1App-admin` and `w1App-adminpw`.
  - Choose `client` as <b>Type</b>.
  - You can leave the <b>Use root affiliation</b> box checked.
  - You can leave the <b>Maximum enrollments</b> blank.
  - Under <b>Attributes</b>, click on <b>Add attribute</b>.  Give attribute as `hf.Registrar.Roles` = `*`.  This will allow this identity to act as registrar and issues identities for our app.  Click <b>Add-attribute</b>.
  - Click <b>Register User</b>. -->
<!-- 
* #### Create w2 application admin 
  - Go to the <b>Nodes</b> tab on the left bar, and under <b>Certificate Authorities</b>, choose your <b>w2 CA</b>.
  - Click on <b>Register user</b>.
  - Give an <b>Enroll ID</b> and <b>Enroll Secret</b> to administer your application users, `w2App-admin` and `w2App-adminpw`.
  - Choose `client` as <b>Type</b>.
  - You can leave the <b>Use root affiliation</b> box checked.
  - You can leave the <b>Maximum enrollments</b> blank.
  - Under <b>Attributes</b>, click on <b>Add attribute</b>.  Give attribute as `hf.Registrar.Roles` = `*`.  This will allow this identity to act as registrar and issues identities for our app.  Click <b>Add-attribute</b>.
  - Click <b>Register User</b>.

* #### Create pharmacy application admin
  - Go to the <b>Nodes</b> tab on the left bar, and under <b>Certificate Authorities</b>, choose your <b>Pharmacy CA</b>.
  - Click on <b>Register user</b>.
  - Give an <b>Enroll ID</b> and <b>Enroll Secret</b> to administer your application users, `pharmacyApp-admin` and `pharmacyApp-adminpw`.
  - Choose `client` as <b>Type</b>.
  - You can leave the <b>Use root affiliation</b> box checked.
  - You can leave the <b>Maximum enrollments</b> blank.
  - Under <b>Attributes</b>, click on <b>Add attribute</b>.  Give attribute as `hf.Registrar.Roles` = `*`.  This will allow this identity to act as registrar and issues identities for our app.  Click <b>Add-attribute</b>.
  - Click <b>Register User</b>.

  * #### Create patient application admin
  - Go to the <b>Nodes</b> tab on the left bar, and under <b>Certificate Authorities</b>, choose your <b>Patient CA</b>.
  - Click on <b>Register user</b>.
  - Give an <b>Enroll ID</b> and <b>Enroll Secret</b> to administer your application users, `patientApp-admin` and `patientApp-adminpw`.
  - Choose `client` as <b>Type</b>.
  - You can leave the <b>Use root affiliation</b> box checked.
  - You can leave the <b>Maximum enrollments</b> blank.
  - Under <b>Attributes</b>, click on <b>Add attribute</b>.  Give attribute as `hf.Registrar.Roles` = `*`.  This will allow this identity to act as registrar and issues identities for our app.  Click <b>Add-attribute</b>.
  - Click <b>Register User</b>.
 -->
<!-- 
 #### Update application connection
  - Copy the connection profile (connection.json) file into the <b>private-data-coollectins-on-fabric/server</b> directory. This is going to tell our client app which identities are submitting transactions, and where our nodes are physically hosted 

## Step 9. Enroll App Admin Identities -->
<!-- 
* #### Enroll manufacturerApp-admin
  - First, navigate to the `server` directory.
    ```bash
    cd server/
    ```
  - Open the `config.json` file, and update the caName with the URL 
    of the <b>manufacturer</b> certificate authority from your `ibpConnection.json` file. Save the file.  
  
  - Run the `enrollAdmin.js` script
    ```bash
    node enrollAdmin.js
    ```

  - You should see the following in the terminal:
    ```bash
    msg: Successfully enrolled admin user manufacturerApp-admin and imported it into the wallet

* Enroll w1App-admin
  - First, change the appAdmin, appAdminSecret, and caName properties in your `config.json` file, 
  so that it looks something like this (your caName should be different than mine):

    ```js
    {
        "connection_file": "ibpConnection.json",
        "appAdmin": "w1App-admin",
        "appAdminSecret": "w1App-adminpw",
        "orgMSPID": "w1msp",
        "caName": "https://fa707c454921423c80ec3c3c38d7545c-caf2e287.horeamanprivate-datatest.us-south.containers.appdomain.cloud:7054",
        "userName": "w1User",
        "gatewayDiscovery": { "enabled": true, "asLocalhost": false }
    }
    ```
  - To find the other CA urls, you will need to click on the `Nodes` tab in IBM Blockchain Platform, then on 
    the W1 CA, and on the settings cog icon at the top of the page. That will take you to the certificate 
    authority settings, as shown in the picture below, and you can copy that endpoint URL into your `config.json` **caName**
    field. 

  - Run the `enrollAdmin.js` script
    
    ```bash
    node enrollAdmin.js
    ```

  - You should see the following in the terminal:

    ```bash
    msg: Successfully enrolled admin user w1App-admin and imported it into the wallet
    ```

* Enroll w2App-admin
  - Follow the same process you did for W1. 
  - First, change the appAdmin, appAdminSecret, and caName properties in your `config.json` file, 
  so that it looks something like this:

    ```js
    {
        "connection_file": "ibpConnection.json",
        "appAdmin": "w2App-admin",
        "appAdminSecret": "w2App-adminpw",
        "orgMSPID": "w2msp",
        "caName": "https://fa707c454921423c80ec3c3c38d7545c-caf2e287.horeamanprivate-datatest.us-south.containers.appdomain.cloud:7054",
        "userName": "w2User",
        "gatewayDiscovery": { "enabled": true, "asLocalhost": false }
    }
    ```


  - Run the `enrollAdmin.js` script
    
    ```bash
    node enrollAdmin.js
    ```

  - You should see the following in the terminal:

    ```bash
    msg: Successfully enrolled admin user w2App-admin and imported it into the wallet
    ```

* Enroll PharmacyApp-admin
  - First, change the appAdmin, appAdminSecret, and caName properties in your `config.json` file, 
  so that it looks something like this:

    ```js
    {
        "connection_file": "ibpConnection.json",
        "appAdmin": "pharmacyApp-admin",
        "appAdminSecret": "pharmacyApp-adminpw",
        "orgMSPID": "pharmacymsp",
        "caName": "https://fa707c454921423c80ec3c3c38d7545c-caf2e287.horeamanprivate-datatest.us-south.containers.appdomain.cloud:7054",
        "userName": "pharmacyUser",
        "gatewayDiscovery": { "enabled": true, "asLocalhost": false }
    }
    ```


  - Run the `enrollAdmin.js` script
    
    ```bash
    node enrollAdmin.js
    ```

  - You should see the following in the terminal:

    ```bash
    msg: Successfully enrolled admin user pharmacyApp-admin and imported it into the wallet


* Enroll PatientApp-admin
  - First, change the appAdmin, appAdminSecret, and caName properties in your `config.json` file, 
  so that it looks something like this:

    ```js
    {
        "connection_file": "ibpConnection.json",
        "appAdmin": "patientApp-admin",
        "appAdminSecret": "patientApp-adminpw",
        "orgMSPID": "patientmsp",
        "caName": "https://fa707c454921423c80ec3c3c38d7545c-caf2e287.horeamanprivate-datatest.us-south.containers.appdomain.cloud:7054",
        "userName": "patientUser",
        "gatewayDiscovery": { "enabled": true, "asLocalhost": false }
    }
    ```

  - Run the `enrollAdmin.js` script
    
    ```bash
    node enrollAdmin.js
    ```

  - You should see the following in the terminal:

    ```bash
    msg: Successfully enrolled admin user patientApp-admin and imported it into the wallet -->