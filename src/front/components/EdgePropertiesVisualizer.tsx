
import { isArray } from "class-validator";
import React, { FC, useState } from "react";
import styled from "styled-components"
import ControlledTextInput from "../ControlledTextInput";
import { getWorkState } from "./GraphNode";

const MiscHolder = styled.div`
  width: 100px;
  margin-top: 10px;
  background: transparent;
  border-radius: 3px;
  border-right: 2px solid brown;
  color: brown;
  margin: 0 1em;
  padding: 0.25em 1em;
  font-size: 13px;
  .load-field{
    width: 100%;
  }
  .load-type-field{
    width: 100%;
  }
  .work-state{
    margin-top:5px;
    font-weight: bold;
  }
`;
const getVal = a => {
if ((typeof a) !== "object"){
  return a
}else{
  if(isArray(a)){
    return a.map(b => b.id).join(", ")
  }
  if (a){
    return a.id || ""
  }
}
}


const NodeHolder = styled.button`
  background: transparent;
  border-radius: 3px;
  border: 2px solid turquoise;
  color: turquoise;
  margin: 0 1em;
  padding: 0.25em 1em;
`;

const EdgePropertiesVisualizer = ({edge, onDelete, onUpdate}) => {
  const [load, setLoad] = useState("")
  const [loadType, setLoadType] = useState("")
  let state = "";
  if(edge.__typename == "Vertex") {
    state = getWorkState(edge);
  }
    return (
      <MiscHolder>
        Edge:
        {
            edge && Object.keys(edge).map(key => (<p>{key} : {getVal(edge[key]) }</p>))
        }
        
          WorkState: 
        
        <p key="work-state" className="work-state">{state}</p>
        
        {edge && <NodeHolder onClick={() => onDelete(edge.id)}>
          Delete
        </NodeHolder>}
        {edge && <ControlledTextInput onChange={setLoad} value={load} className="load-field" placeholder="Load Intensity"/>}
        {edge && <ControlledTextInput onChange={setLoadType} value={loadType} className="load-type-field" placeholder="Load Type"/>}
        {edge && <NodeHolder onClick={() => {
          const newLoad = {
            type: loadType !== "" && loadType || "generic",
            intensity: parseInt(load, 10),
          };
          onUpdate({...edge, currentLoad: [...edge.currentLoad.map(a => {if(a.id){delete a.__typename}return a}), newLoad]})}}>
          Submit Load
        </NodeHolder>}
      </MiscHolder>
    )
}

export default EdgePropertiesVisualizer;
  