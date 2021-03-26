
import React, { useState } from "react";
import styled from "styled-components"
import ControlledTextInput from "../ControlledTextInput";
import {RestaurantToSymbol} from "./GraphNode"

const NodeHolder = styled.button`
  background: transparent;
  border-radius: 3px;
  border: 1px solid turquoise;
  color: turquoise;
  margin: 0 1em;
  padding: 0.25em 1em;
`;
const MiscHolder = styled.div`
  background: transparent;
  border-radius: 3px;
  border: 1px solid brown;
  color: brown;
  margin: 0 1em;
  padding: 0.25em 1em;
`;

export default ({createFunction}) => {
    const [name, setName] = useState("")
    const [resourceType, setRT] = useState("")
    const Create = (name) => {
      if (name !== ""){
        console.log("sending")
        return createFunction({
          variables:{
            name,
            resourceType
          }
        })
      }
      console.log("not possible to create node with: ", {
        name, 
      })
    }
  
    return (
      <MiscHolder>
      <NodeHolder onClick={() => Create(name)}>
      Create Vertex
      </NodeHolder>
        Name:
        <ControlledTextInput onChange={setName}/>
        <select onChange={e => {console.log(e.target.value);setRT(e.target.value)}}>
        {
          Object.keys(RestaurantToSymbol).map(k => {
            return <option value={k}> {k} </option>
          })
        }
        </select>
      </MiscHolder>
    )
}
  