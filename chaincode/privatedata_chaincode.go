package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

// SimpleChaincode example simple Chaincode implementation
type SimpleChaincode struct {
}

type pill struct {
	ObjectType string `json:"docType"` //docType is used to distinguish the various types of objects in state database
	UUID       string `json:"uuid"`
	Name       string `json:"name"`
	Wholesaler string `json:"wholesaler"`
	Pharmacy   string `json:"pharmacy"`
}

type pillPrivateDetails struct {
	ObjectType string `json:"docType"` //docType is used to distinguish the various types of objects in state database
	UUID       string `json:"uuid"`
	Price      int    `json:"price"`
}

// ===================================================================================
// Main
// ===================================================================================
func main() {
	err := shim.Start(new(SimpleChaincode))
	if err != nil {
		fmt.Printf("Error starting Simple chaincode: %s", err)
	}
}

// Init initializes chaincode
// ===========================
func (t *SimpleChaincode) Init(stub shim.ChaincodeStubInterface) pb.Response {
	fmt.Println("Ready for sell pills")
	return shim.Success(nil)
}

// Invoke - Our entry point for Invocations
// ========================================
func (t *SimpleChaincode) Invoke(stub shim.ChaincodeStubInterface) pb.Response {
	function, args := stub.GetFunctionAndParameters()
	fmt.Println("invoke is running " + function)

	// Handle different functions
	switch function {
	case "initMarble":
		//create a new marble
		return t.initPill(stub, args)
	case "readMarble":
		//read a marble
		return t.readMarble(stub, args)
	case "readMarblePrivateDetails":
		//read a marble private details
		return t.readMarblePrivateDetails(stub, args)
	/*case "transferMarble":
		//change owner of a specific marble
		return t.transferMarble(stub, args)
	case "delete":
		//delete a marble
		return t.delete(stub, args)
	*/
	case "queryMarblesByOwner":
		//find marbles for owner X using rich query
		return t.queryMarblesByOwner(stub, args)
	case "queryMarbles":
		//find marbles based on an ad hoc rich query
		return t.queryMarbles(stub, args)
	case "getMarblesByRange":
		//get marbles based on range query
		return t.getMarblesByRange(stub, args)
	default:
		//error
		fmt.Println("invoke did not find func: " + function)
		return shim.Error("Received unknown function invocation")
	}
}

// ============================================================
// initPill - create a new marble, store into chaincode state
// ============================================================
func (t *SimpleChaincode) initPill(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var err error

	type pillTransientInput struct {
		UUID       string `json:"uuid"`
		Name       string `json:"name"`
		Wholesaler string `json:"wholesaler"`
		Pharmacy   string `json:"pharmacy"`
		Price      int    `json:"price"`
	}

	// ==== Input sanitation ====
	fmt.Println("- start init pill")

	if len(args) != 0 {
		return shim.Error("Incorrect number of arguments. Private pill data must be passed in transient map.")
	}

	transMap, err := stub.GetTransient()
	if err != nil {
		return shim.Error("Error getting transient: " + err.Error())
	}

	if _, ok := transMap["pill"]; !ok {
		return shim.Error("pill must be a key in the transient map")
	}

	if len(transMap["pill"]) == 0 {
		return shim.Error("pill value in the transient map must be a non-empty JSON string")
	}

	var pillInput pillTransientInput
	err = json.Unmarshal(transMap["pill"], &pillInput)
	if err != nil {
		return shim.Error("Failed to decode JSON of: " + string(transMap["pill"]))
	}

	if len(pillInput.UUID) == 0 {
		return shim.Error("uuid field must be a non-empty string")
	}
	if len(pillInput.Name) == 0 {
		return shim.Error("name field must be a non-empty string")
	}
	if pillInput.Price <= 0 {
		return shim.Error("price field must be a positive integer")
	}

	// ==== Check if pill already exists ====
	pillAsBytes, err := stub.GetPrivateData("collectionPills", pillInput.UUID)
	if err != nil {
		return shim.Error("Failed to get pill: " + err.Error())
	} else if pillAsBytes != nil {
		fmt.Println("This pill already exists: " + pillInput.UUID)
		return shim.Error("This pill already exists: " + pillInput.UUID)
	}

	// ==== Create pill object, marshal to JSON, and save to state ====
	pill := &pill{
		ObjectType: "pill",
		UUID:       pillInput.UUID,
		Name:       pillInput.Name,
		Wholesaler: "",
		Pharmacy:   "",
	}
	pillJSONasBytes, err := json.Marshal(pill)
	if err != nil {
		return shim.Error(err.Error())
	}

	// === Save pill to state ===
	err = stub.PutPrivateData("collectionPills", pillInput.UUID, pillJSONasBytes)
	if err != nil {
		return shim.Error(err.Error())
	}

	// ==== Create pill private details object with price, marshal to JSON, and save to state ====
	pillPrivateDetails := &pillPrivateDetails{
		ObjectType: "pillPrivateDetails",
		UUID:       pillInput.UUID,
		Price:      pillInput.Price,
	}
	pillPrivateDetailsBytes, err := json.Marshal(pillPrivateDetails)
	if err != nil {
		return shim.Error(err.Error())
	}
	err = stub.PutPrivateData("collectionPillPrivateDetails", pillInput.UUID, pillPrivateDetailsBytes)
	if err != nil {
		return shim.Error(err.Error())
	}

	// ==== Pill saved and indexed. Return success ====
	fmt.Println("- end init pill")
	return shim.Success(nil)
}

// ===============================================
// readMarble - read a marble from chaincode state
// ===============================================
func (t *SimpleChaincode) readMarble(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var name, jsonResp string
	var err error

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting name of the marble to query")
	}

	name = args[0]
	valAsbytes, err := stub.GetPrivateData("collectionMarbles", name) //get the marble from chaincode state
	if err != nil {
		jsonResp = "{\"Error\":\"Failed to get state for " + name + "\"}"
		return shim.Error(jsonResp)
	} else if valAsbytes == nil {
		jsonResp = "{\"Error\":\"Marble does not exist: " + name + "\"}"
		return shim.Error(jsonResp)
	}

	return shim.Success(valAsbytes)
}

// ===============================================
// readMarblereadMarblePrivateDetails - read a marble private details from chaincode state
// ===============================================
func (t *SimpleChaincode) readMarblePrivateDetails(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var name, jsonResp string
	var err error

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting name of the marble to query")
	}

	name = args[0]
	valAsbytes, err := stub.GetPrivateData("collectionMarblePrivateDetails", name) //get the marble private details from chaincode state
	if err != nil {
		jsonResp = "{\"Error\":\"Failed to get private details for " + name + ": " + err.Error() + "\"}"
		return shim.Error(jsonResp)
	} else if valAsbytes == nil {
		jsonResp = "{\"Error\":\"Marble private details does not exist: " + name + "\"}"
		return shim.Error(jsonResp)
	}

	return shim.Success(valAsbytes)
}

// ==================================================
// delete - remove a marble key/value pair from state
// ==================================================
/*func (t *SimpleChaincode) delete(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	fmt.Println("- start delete marble")

	type marbleDeleteTransientInput struct {
		Name string `json:"name"`
	}

	if len(args) != 0 {
		return shim.Error("Incorrect number of arguments. Private marble name must be passed in transient map.")
	}

	transMap, err := stub.GetTransient()
	if err != nil {
		return shim.Error("Error getting transient: " + err.Error())
	}

	if _, ok := transMap["marble_delete"]; !ok {
		return shim.Error("marble_delete must be a key in the transient map")
	}

	if len(transMap["marble_delete"]) == 0 {
		return shim.Error("marble_delete value in the transient map must be a non-empty JSON string")
	}

	var marbleDeleteInput marbleDeleteTransientInput
	err = json.Unmarshal(transMap["marble_delete"], &marbleDeleteInput)
	if err != nil {
		return shim.Error("Failed to decode JSON of: " + string(transMap["marble_delete"]))
	}

	if len(marbleDeleteInput.Name) == 0 {
		return shim.Error("name field must be a non-empty string")
	}

	// to maintain the color~name index, we need to read the marble first and get its color
	valAsbytes, err := stub.GetPrivateData("collectionMarbles", marbleDeleteInput.Name) //get the marble from chaincode state
	if err != nil {
		return shim.Error("Failed to get state for " + marbleDeleteInput.Name)
	} else if valAsbytes == nil {
		return shim.Error("Marble does not exist: " + marbleDeleteInput.Name)
	}

	var marbleToDelete marble
	err = json.Unmarshal([]byte(valAsbytes), &marbleToDelete)
	if err != nil {
		return shim.Error("Failed to decode JSON of: " + string(valAsbytes))
	}

	// delete the marble from state
	err = stub.DelPrivateData("collectionMarbles", marbleDeleteInput.Name)
	if err != nil {
		return shim.Error("Failed to delete state:" + err.Error())
	}

	// Also delete the marble from the color~name index
	indexName := "color~name"
	colorNameIndexKey, err := stub.CreateCompositeKey(indexName, []string{marbleToDelete.Color, marbleToDelete.Name})
	if err != nil {
		return shim.Error(err.Error())
	}
	err = stub.DelPrivateData("collectionMarbles", colorNameIndexKey)
	if err != nil {
		return shim.Error("Failed to delete state:" + err.Error())
	}

	// Finally, delete private details of marble
	err = stub.DelPrivateData("collectionMarblePrivateDetails", marbleDeleteInput.Name)
	if err != nil {
		return shim.Error(err.Error())
	}

	return shim.Success(nil)
}*/

// ===========================================================
// transfer a marble by setting a new owner name on the marble
// ===========================================================
/*func (t *SimpleChaincode) transferMarble(stub shim.ChaincodeStubInterface, args []string) pb.Response {

	fmt.Println("- start transfer marble")

	type marbleTransferTransientInput struct {
		Name  string `json:"name"`
		Owner string `json:"owner"`
	}

	if len(args) != 0 {
		return shim.Error("Incorrect number of arguments. Private marble data must be passed in transient map.")
	}

	transMap, err := stub.GetTransient()
	if err != nil {
		return shim.Error("Error getting transient: " + err.Error())
	}

	if _, ok := transMap["marble_owner"]; !ok {
		return shim.Error("marble_owner must be a key in the transient map")
	}

	if len(transMap["marble_owner"]) == 0 {
		return shim.Error("marble_owner value in the transient map must be a non-empty JSON string")
	}

	var marbleTransferInput marbleTransferTransientInput
	err = json.Unmarshal(transMap["marble_owner"], &marbleTransferInput)
	if err != nil {
		return shim.Error("Failed to decode JSON of: " + string(transMap["marble_owner"]))
	}

	if len(marbleTransferInput.Name) == 0 {
		return shim.Error("name field must be a non-empty string")
	}
	if len(marbleTransferInput.Owner) == 0 {
		return shim.Error("owner field must be a non-empty string")
	}

	marbleAsBytes, err := stub.GetPrivateData("collectionMarbles", marbleTransferInput.Name)
	if err != nil {
		return shim.Error("Failed to get marble:" + err.Error())
	} else if marbleAsBytes == nil {
		return shim.Error("Marble does not exist: " + marbleTransferInput.Name)
	}

	marbleToTransfer := marble{}
	err = json.Unmarshal(marbleAsBytes, &marbleToTransfer) //unmarshal it aka JSON.parse()
	if err != nil {
		return shim.Error(err.Error())
	}
	marbleToTransfer.Owner = marbleTransferInput.Owner //change the owner

	marbleJSONasBytes, _ := json.Marshal(marbleToTransfer)
	err = stub.PutPrivateData("collectionMarbles", marbleToTransfer.Name, marbleJSONasBytes) //rewrite the marble
	if err != nil {
		return shim.Error(err.Error())
	}

	fmt.Println("- end transferMarble (success)")
	return shim.Success(nil)
}*/

// ===========================================================================================
// getMarblesByRange performs a range query based on the start and end keys provided.

// Read-only function results are not typically submitted to ordering. If the read-only
// results are submitted to ordering, or if the query is used in an update transaction
// and submitted to ordering, then the committing peers will re-execute to guarantee that
// result sets are stable between endorsement time and commit time. The transaction is
// invalidated by the committing peers if the result set has changed between endorsement
// time and commit time.
// Therefore, range queries are a safe option for performing update transactions based on query results.
// ===========================================================================================
func (t *SimpleChaincode) getMarblesByRange(stub shim.ChaincodeStubInterface, args []string) pb.Response {

	if len(args) < 2 {
		return shim.Error("Incorrect number of arguments. Expecting 2")
	}

	startKey := args[0]
	endKey := args[1]

	resultsIterator, err := stub.GetPrivateDataByRange("collectionMarbles", startKey, endKey)
	if err != nil {
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close()

	// buffer is a JSON array containing QueryResults
	var buffer bytes.Buffer
	buffer.WriteString("[")

	bArrayMemberAlreadyWritten := false
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}
		// Add a comma before array members, suppress it for the first array member
		if bArrayMemberAlreadyWritten == true {
			buffer.WriteString(",")
		}
		buffer.WriteString("{\"Key\":")
		buffer.WriteString("\"")
		buffer.WriteString(queryResponse.Key)
		buffer.WriteString("\"")

		buffer.WriteString(", \"Record\":")
		// Record is a JSON object, so we write as-is
		buffer.WriteString(string(queryResponse.Value))
		buffer.WriteString("}")
		bArrayMemberAlreadyWritten = true
	}
	buffer.WriteString("]")

	fmt.Printf("- getMarblesByRange queryResult:\n%s\n", buffer.String())

	return shim.Success(buffer.Bytes())
}

// =======Rich queries =========================================================================
// Two examples of rich queries are provided below (parameterized query and ad hoc query).
// Rich queries pass a query string to the state database.
// Rich queries are only supported by state database implementations
//  that support rich query (e.g. CouchDB).
// The query string is in the syntax of the underlying state database.
// With rich queries there is no guarantee that the result set hasn't changed between
//  endorsement time and commit time, aka 'phantom reads'.
// Therefore, rich queries should not be used in update transactions, unless the
// application handles the possibility of result set changes between endorsement and commit time.
// Rich queries can be used for point-in-time queries against a peer.
// ============================================================================================

// ===== Example: Parameterized rich query =================================================
// queryMarblesByOwner queries for marbles based on a passed in owner.
// This is an example of a parameterized query where the query logic is baked into the chaincode,
// and accepting a single query parameter (owner).
// Only available on state databases that support rich query (e.g. CouchDB)
// =========================================================================================
func (t *SimpleChaincode) queryMarblesByOwner(stub shim.ChaincodeStubInterface, args []string) pb.Response {

	//   0
	// "bob"
	if len(args) < 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	owner := strings.ToLower(args[0])

	queryString := fmt.Sprintf("{\"selector\":{\"docType\":\"marble\",\"owner\":\"%s\"}}", owner)

	queryResults, err := getQueryResultForQueryString(stub, queryString)
	if err != nil {
		return shim.Error(err.Error())
	}
	return shim.Success(queryResults)
}

// ===== Example: Ad hoc rich query ========================================================
// queryMarbles uses a query string to perform a query for marbles.
// Query string matching state database syntax is passed in and executed as is.
// Supports ad hoc queries that can be defined at runtime by the client.
// If this is not desired, follow the queryMarblesForOwner example for parameterized queries.
// Only available on state databases that support rich query (e.g. CouchDB)
// =========================================================================================
func (t *SimpleChaincode) queryMarbles(stub shim.ChaincodeStubInterface, args []string) pb.Response {

	//   0
	// "queryString"
	if len(args) < 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	queryString := args[0]

	queryResults, err := getQueryResultForQueryString(stub, queryString)
	if err != nil {
		return shim.Error(err.Error())
	}
	return shim.Success(queryResults)
}

// =========================================================================================
// getQueryResultForQueryString executes the passed in query string.
// Result set is built and returned as a byte array containing the JSON results.
// =========================================================================================
func getQueryResultForQueryString(stub shim.ChaincodeStubInterface, queryString string) ([]byte, error) {

	fmt.Printf("- getQueryResultForQueryString queryString:\n%s\n", queryString)

	resultsIterator, err := stub.GetPrivateDataQueryResult("collectionMarbles", queryString)
	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	// buffer is a JSON array containing QueryRecords
	var buffer bytes.Buffer
	buffer.WriteString("[")

	bArrayMemberAlreadyWritten := false
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}
		// Add a comma before array members, suppress it for the first array member
		if bArrayMemberAlreadyWritten == true {
			buffer.WriteString(",")
		}
		buffer.WriteString("{\"Key\":")
		buffer.WriteString("\"")
		buffer.WriteString(queryResponse.Key)
		buffer.WriteString("\"")

		buffer.WriteString(", \"Record\":")
		// Record is a JSON object, so we write as-is
		buffer.WriteString(string(queryResponse.Value))
		buffer.WriteString("}")
		bArrayMemberAlreadyWritten = true
	}
	buffer.WriteString("]")

	fmt.Printf("- getQueryResultForQueryString queryResult:\n%s\n", buffer.String())

	return buffer.Bytes(), nil
}
