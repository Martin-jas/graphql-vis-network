import React from "react";
import { Network, Node, Edge } from 'react-vis-network';
import styled from "styled-components"
import Vertex from "../../schemas/Vertex";
import {intensityColor} from "../../util.ts"
const shapes = [
    "box",
    "triangleDown",
    "text",
    "diamond",
    "box",
    "star",
    "database",
    "ellipse",
    "dot",
    "triangle",
    "hexagon",
    "square"
]
export const RestaurantToSymbol = {
    cook: 0,
    waiter: 1,
    load: 2,
    table: 3,
    hostess: 4,
    etc: 5
}
export const RestaurantCapacity = {
    cook: 10,
    waiter: 5,
    load: 1,
    table: 5,
    hostess: 10,
    etc: 5
}

export const ResourceMaxParallel = {
  cook: 6,
  waiter: 4,
  load: 1,
  table: 1,
  hostess: 1,
  etc: 1
}

export const RunningString = {
  cook: "Cooking",
  waiter: "Processing Orders",
  load: "error",
  table: "Eating",
  hostess: "Receiving Guests",
  etc: "Sending"
}

export const colors = {
  running: "#89c6f8",
  waitingNotBlocked: "#ebd68f",
  idle: "#a6ffb1",
  blocked:"#a8313d"
}
export const getWorkStateString = (vertex) => {
  let inputWaiting = 0
  let ongoingJob = 0
  let outputWaiting = 0
  let eating = 0
  let waitingForFood = 0
  vertex.currentLoad && vertex.currentLoad.forEach(load => {
    if(load.type === "output"){
      outputWaiting++;
    }else if(load.type === "pre-output"){
      ongoingJob++;
    }else if(load.type === "pre-eat"){
      eating++;
    }else if(load.type === "hold"){
      waitingForFood++;
    }else{
      inputWaiting++;
    }
  })

  if(eating){
    return "Eating..."
  }

  if(waitingForFood){
    if (outputWaiting){
      return "Waiting to order..."
    }
    if (inputWaiting){
      return "Choosing..."
    }
    return "Waiting for Food..."
  }

  if(ongoingJob){
    return "running"
  }

  if(outputWaiting && inputWaiting ){
    // Locked
    return "blocked"
  }

  if(outputWaiting > 1 || (outputWaiting && !inputWaiting)){
    return RunningString[vertex.resourceType]
  }

  if(inputWaiting > 0){
    return  RunningString[vertex.resourceType]
  }

  return "idle"
}

export const getWorkState = (vertex) => {
  let inputWaiting = 0
  let ongoingJob = 0
  let outputWaiting = 0
  vertex.currentLoad && vertex.currentLoad.forEach(load => {
    if(load.type === "output"){
      outputWaiting++;
    }else if(load.type === "pre-output"){
      ongoingJob++;
    }else{
      inputWaiting++;
    }
  })
  if(ongoingJob){
    return "running"
  }
  if(outputWaiting && inputWaiting ){
    // Locked
    return "blocked"
  }
  if(outputWaiting > 1 || (outputWaiting && !inputWaiting)){
    return "waitingNotBlocked"
  }
  if(inputWaiting > 0){
    return "running"
  }
  return "idle"
}

const NodeHolder = styled.button`
  background: transparent;
  border-radius: 3px;
  border: 2px solid turquoise;
  color: turquoise;
  margin: 0 1em;
  padding: 0.25em 1em;
`;

const sumCurrentLoad = (currentLoad) => {
  return currentLoad.reduce((acc, c) => {
    return acc + (c.type !== "output" ? c.intensity : 0 )
  }, 0)
}


class GraphNode extends React.Component implements Node {
    id : string
    shape: string
    resourceType: string
    vertex: Vertex
    
    constructor(props){
        super(props)
        this.id = props.id
        this.vertex = props.vertex
        this.resourceType = props.resourceType
        this.shape = this.resourceType && RestaurantToSymbol[this.resourceType] !== undefined && shapes[RestaurantToSymbol[this.resourceType]] || shapes[Math.round(Math.random()*(shapes.length - 1))]
    }

    getColor(vertex){
      return colors[getWorkState(vertex)]
    }
    getLabel(vertex){
      return  vertex.name + " - " + getWorkStateString(vertex)
    }

    customNode = ({label, id, onClick, isOpen, hideAll}) => () => {
        if (hideAll){
          return <></>
        }
        return (
        <NodeHolder className={label} onClick={() => onClick(id)}>
          {(!hideAll || isOpen) && <p>{label}</p>}
          {isOpen && <p>ID: {id}</p>}
        </NodeHolder>)
      }
    render(){
        return (
            <Node 
                id={this.id} 
                key={this.id}
                shape={this.shape}
                physics={false}
                color={this.getColor(this.props.vertex)}
                // decorator={
                //   CustomNode({
                //     label: v.name,
                //     id: v.id, 
                //     onClick: onClickNode, 
                //     isOpen: openIds.findIndex(a => a == v.id)!== -1,
                //     hideAll:false
                //   })
                // } 
                vis={{nodes:{size:5}}}
                label={this.getLabel(this.props.vertex)}
                {...this.props}
                />
        )
    }
}
export default GraphNode