import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router";

import { ethers } from "ethers";
import { useAccount } from "wagmi";
const Moralis = require("moralis").default;
const { EvmChain } = require("@moralisweb3/common-evm-utils");

const Proposal = () => {
    const { state: proposalDetails } = useLocation();
    const [latestVote, setLatestVote] = useState();
    const [percUp, setPercUp] = useState(0);
    const [percDown, setPercDown] = useState(0);
    const [votes, setVotes] = useState([]);
  
    // * User Voting status
    const [hasVoted, setHasVoted] = useState(false);
  
    // * Proposal Status
    const [countDone, setCountDone] = useState(false);
  
    // * Voting Status
    const [sub, setSub] = useState(false);
  
    // * Counting Status
    const [counting, setCounting] = useState(false);
  
    // * Loading Data
    const [loading, setLoading] = useState(false);
  
    // ** TOASTER
    // * Polygon Scan URL
    const [polygonScan, setPolygonScan] = useState("");
  
    const CloseButton = ({ closeToast }) => (
      <button
        style={{
          borderRadius: "20px",
          backgroundColor: "green",
          border: "solid 2px black",
        }}
      >
        {" "}
        <a
          style={{ color: "white", textDecoration: "none" }}
          href={polygonScan}
          onClick={closeToast}
        >
          Watch on Scan
        </a>{" "}
      </button>
    );
  
    const BaseUrl = "https://mumbai.polygonscan.com/tx/";
  
    // * Check if isOwner
    const [isOwner, setIsOwner] = useState(false);
  
    // * Check if isMember
    const [isMember, setIsMember] = useState(false);
  
    // * Deadline of the Proposal
    const [deadline, setDeadline] = useState(false);
  
    const [status, setStatus] = useState({});
  
    // * Get Current User
    const { isConnected, isDisconnected, address: userAddress } = useAccount();
  
    // * CONTRACT ABI
    const ContractABI = [
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "address",
            name: "previousOwner",
            type: "address",
          },
          {
            indexed: true,
            internalType: "address",
            name: "newOwner",
            type: "address",
          },
        ],
        name: "OwnershipTransferred",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: false,
            internalType: "uint256",
            name: "votesUp",
            type: "uint256",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "votesDown",
            type: "uint256",
          },
          {
            indexed: false,
            internalType: "address",
            name: "voter",
            type: "address",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "proposal",
            type: "uint256",
          },
          {
            indexed: false,
            internalType: "bool",
            name: "votedFor",
            type: "bool",
          },
        ],
        name: "newVote",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: false,
            internalType: "uint256",
            name: "id",
            type: "uint256",
          },
          { indexed: false, internalType: "bool", name: "passed", type: "bool" },
        ],
        name: "proposalCount",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: false,
            internalType: "uint256",
            name: "id",
            type: "uint256",
          },
          {
            indexed: false,
            internalType: "string",
            name: "description",
            type: "string",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "requiredAmount",
            type: "uint256",
          },
          {
            indexed: false,
            internalType: "address",
            name: "proposer",
            type: "address",
          },
        ],
        name: "proposalCreated",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: false,
            internalType: "uint256",
            name: "userPID",
            type: "uint256",
          },
          {
            indexed: false,
            internalType: "address",
            name: "userAddress",
            type: "address",
          },
          { indexed: false, internalType: "bool", name: "added", type: "bool" },
          { indexed: false, internalType: "bool", name: "removed", type: "bool" },
        ],
        name: "userRegistered",
        type: "event",
      },
      {
        inputs: [],
        name: "DAOowner",
        outputs: [{ internalType: "address", name: "", type: "address" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "Donate",
        outputs: [],
        stateMutability: "payable",
        type: "function",
      },
      {
        inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        name: "IdToAddress",
        outputs: [{ internalType: "address", name: "", type: "address" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        name: "IdToRegistered",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "MEMBER_REQUEST_ID",
        outputs: [{ internalType: "uint64", name: "", type: "uint64" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "OWNER_REQUEST_ID",
        outputs: [{ internalType: "uint64", name: "", type: "uint64" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        name: "Proposals",
        outputs: [
          { internalType: "uint256", name: "id", type: "uint256" },
          { internalType: "bool", name: "exists", type: "bool" },
          { internalType: "string", name: "description", type: "string" },
          { internalType: "uint256", name: "RequiredAmount", type: "uint256" },
          { internalType: "address", name: "proposer", type: "address" },
          { internalType: "uint256", name: "deadline", type: "uint256" },
          { internalType: "uint256", name: "votesUp", type: "uint256" },
          { internalType: "uint256", name: "votesDown", type: "uint256" },
          { internalType: "bool", name: "countConducted", type: "bool" },
          { internalType: "bool", name: "passed", type: "bool" },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [{ internalType: "address", name: "", type: "address" }],
        name: "addressToDonation",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [{ internalType: "address", name: "", type: "address" }],
        name: "addressToId",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [{ internalType: "uint256", name: "_id", type: "uint256" }],
        name: "countVotes",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "string", name: "_description", type: "string" },
          { internalType: "uint256", name: "_requiredAmount", type: "uint256" },
        ],
        name: "createProposal",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [],
        name: "getDaoBalance",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "getSupportedRequests",
        outputs: [{ internalType: "uint64[]", name: "arr", type: "uint64[]" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [{ internalType: "uint64", name: "requestId", type: "uint64" }],
        name: "getZKPRequest",
        outputs: [
          {
            components: [
              { internalType: "uint256", name: "schema", type: "uint256" },
              { internalType: "uint256", name: "slotIndex", type: "uint256" },
              { internalType: "uint256", name: "operator", type: "uint256" },
              { internalType: "uint256[]", name: "value", type: "uint256[]" },
              { internalType: "string", name: "circuitId", type: "string" },
            ],
            internalType: "struct ICircuitValidator.CircuitQuery",
            name: "",
            type: "tuple",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [{ internalType: "address", name: "", type: "address" }],
        name: "isMember",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [{ internalType: "uint256", name: "_userPID", type: "uint256" }],
        name: "newMembership",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [],
        name: "owner",
        outputs: [{ internalType: "address", name: "", type: "address" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "", type: "address" },
          { internalType: "uint64", name: "", type: "uint64" },
        ],
        name: "proofs",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "proposalId",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "renounceOwnership",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [{ internalType: "uint64", name: "", type: "uint64" }],
        name: "requestQueries",
        outputs: [
          { internalType: "uint256", name: "schema", type: "uint256" },
          { internalType: "uint256", name: "slotIndex", type: "uint256" },
          { internalType: "uint256", name: "operator", type: "uint256" },
          { internalType: "string", name: "circuitId", type: "string" },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [{ internalType: "uint64", name: "", type: "uint64" }],
        name: "requestValidators",
        outputs: [
          {
            internalType: "contract ICircuitValidator",
            name: "",
            type: "address",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "_memberAddress", type: "address" },
        ],
        name: "revokeMembership",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "uint64", name: "requestId", type: "uint64" },
          {
            internalType: "contract ICircuitValidator",
            name: "validator",
            type: "address",
          },
          {
            components: [
              { internalType: "uint256", name: "schema", type: "uint256" },
              { internalType: "uint256", name: "slotIndex", type: "uint256" },
              { internalType: "uint256", name: "operator", type: "uint256" },
              { internalType: "uint256[]", name: "value", type: "uint256[]" },
              { internalType: "string", name: "circuitId", type: "string" },
            ],
            internalType: "struct ICircuitValidator.CircuitQuery",
            name: "query",
            type: "tuple",
          },
        ],
        name: "setZKPRequest",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "uint64", name: "requestId", type: "uint64" },
          { internalType: "uint256[]", name: "inputs", type: "uint256[]" },
          { internalType: "uint256[2]", name: "a", type: "uint256[2]" },
          { internalType: "uint256[2][2]", name: "b", type: "uint256[2][2]" },
          { internalType: "uint256[2]", name: "c", type: "uint256[2]" },
        ],
        name: "submitZKPResponse",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        name: "supportedRequests",
        outputs: [{ internalType: "uint64", name: "", type: "uint64" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
        name: "transferOwnership",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "uint256", name: "_id", type: "uint256" },
          { internalType: "bool", name: "_vote", type: "bool" },
        ],
        name: "voteOnProposal",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [],
        name: "withdrawAll",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
    ];
  
    // * Setup Chain & Contract Address
    const address = "0x80A6B117511c6527E57F25D04D9adfee23Ae1B0E";
    const chain = EvmChain.MUMBAI;
  
    return (
        <div>
            Proposal Page
        </div>
    )
}

export default Proposal;