import React, { FC, useState } from "react";
import styled from "styled-components"
import ControlledTextInput from "../ControlledTextInput";

const NodeHolder = styled.button`
background: transparent;
border-radius: 3px;
border: 2px solid turquoise;
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

const FilterEdgeComponent = ({applyFilter}) => {
    const [value, setValue ] = useState("")
    const [key, setKey] = useState("")
  
    const Connect = (key, value) => {
        return applyFilter(
          key,
          value
        )
    }
    return (
      <MiscHolder>
      <NodeHolder onClick={() => Connect(key, value)}>
      Filter
      </NodeHolder>
        Key:
        <ControlledTextInput onChange={setKey}/>
        Value
        <ControlledTextInput onChange={setValue}/>
      </MiscHolder>
    )
  }
  
  export default FilterEdgeComponent