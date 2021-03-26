import React from 'react'
import styled from 'styled-components'

const StyledSearchInput = styled.input`
    padding: 5px;
    display: inline-block;
    color: #9F6164;
    font: 13px menlo, monaco, monospace;
    background-color: white;
    &.small{
        padding: 5px;
        display: inline-block;
        color: #9F6164;
        font: 10px black;
        background-color: #F8DEBD;
        flex:1;
    }
`

const ControlledTextInput = (props) => {
    const handleInputChange = (input) => {
        props.onChange && props.onChange(input.target.value)
    }

  return (
      <StyledSearchInput
      value={props.value}
      onChange={handleInputChange}
      className={`${props.className} ${props.small && "small"}`}
      placeholder={props.placeholder}
      />
  )
}

export default ControlledTextInput