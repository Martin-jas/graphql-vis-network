  
import React, { FC, useEffect, useState } from "react";
import styled from "styled-components"
import { ApolloProvider, useQuery, useMutation } from "react-apollo";
import ApolloClient, { gql } from "apollo-boost";
import { Network, Edge } from 'react-vis-network';
import VertexD from "../schemas/Vertex"
import EdgeD from "../schemas/Edge"
import ControlledTextInput from "./ControlledTextInput";
import CreateVertexComponent from "./components/CreateVertexComponent";
import EdgePropertiesVisualizer from "./components/EdgePropertiesVisualizer";
import FilterEdgeComponent from "./components/FilterEdgeComponent"
import GraphNode, {RestaurantCapacity, ResourceMaxParallel} from "./components/GraphNode"
import { asyncForEach, intensityColor } from "../util";

let done = false;

const networkRef = React.createRef();
const GET_VERTICES = gql`
query {
  listVertices{
    id
    name
    resourceType
    currentLoad {
          id
          type
          intensity
    }
    in{
      id
    }
    out{
      id
    }
  }
}
`

const GET_PARENTS = gql`
query GetParentVertexes($id: String!){
  getVertex(id: $id){
    id
    name
    resourceType
    currentLoad {
      id
      type
      intensity
    }
    in{
      id
      name
      from{
        id
        name
        resourceType
        currentLoad {
          id
          type
          intensity
        }
        in {
          id
        }
        out {
          id
        }
      }
    }
    out{
      id
    }
  }
}
`

const GET_EDGES = gql`
query {
  listEdges{
    id
    name
    from{
      id
    }
    to{
      id
    }
  }
}
`

const CONNECT = gql`
mutation Connect($edgeName: String!, $fromVertex: String!, $toVertex: String!){
connect(edgeName: $edgeName, fromVertex: $fromVertex, toVertex:$toVertex){
    id
    name
    from{
      id
    }
    to{
      id
    }
  }
}
`



const DELETE = gql`
mutation Delete($id: String!){
  delete(id: $id){
    id
  }
}
`

const CREATE = gql`
  mutation CreateVertex($name: String!, $resourceType: String!){
    createVertex(name: $name, resourceType: $resourceType){
      id
      name
      resourceType
    }
}
`

const UPDATE = gql`
  mutation updateVertex($v: VertexInput!){
    updateVertex(v: $v){
      id
      name
      resourceType
    }
}
`

const Container = styled.div`
  background: transparent;
  padding: 3px;
  display: flex;
`;
 
const Container2 = styled.div`
  background: transparent;
  padding: 3px;
  display: flex;
  height: 100%;
  width: 100%;
`;
const VisuHolder = styled.div`
  background: transparent;
  padding: 3px;
  flex-grow: 0;
`;
const NetworkHolder = styled.div`
  background: transparent;
  padding: 3px;
  flex-grow: 1;
`;

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

const TimeCounter = ({onTimeChange, currentTime, loading}) => {
  const min = (2*currentTime)%60;
  const hour = Math.floor(currentTime/4);
  const time = (17+hour)%25 + ":" + (min < 10 ? "0" + min : min);
  return (
    <div>
      {time}
      {!loading && <button onClick={() => onTimeChange(currentTime+1)}>Time++</button> || (<div>Loading...</div>)}
    </div>
  )
}



const Save = async () => {
  await fetch("http://localhost:4000/save",{
    method: 'GET',
  }).catch(e => {
    console.log(e)
  })
}
const CustomNode = ({label, id, onClick, isOpen, hideAll}) => () => {
  if (hideAll){
    return <></>
  }
  return (
  <NodeHolder className={label} onClick={() => onClick(id)}>
    {(!hideAll || isOpen) && <p>{label}</p>}
    {isOpen && <p>ID: {id}</p>}
  </NodeHolder>)
}

const ConnectComponent = ({connectFunction, lastSelected}) => {
  const [name, setName] = useState("")
  const [lastFrom, setLastFrom] = useState("");
  const [currentFrom, setCurrentFrom] = useState(""); 

  const Connect = (fromId, toId, name) => {
    if (fromId && toId && (name !== "")){
      console.log("sending")
      return connectFunction({
        variables:{
          edgeName: name,
          fromVertex: fromId,
          toVertex: toId,
        }
      })
    }
    console.log("not possible to create node with: ", {
      fromId,
      toId, 
      name, 
    })
  }

  useEffect(() => {
    if (lastSelected){
      setLastFrom(currentFrom)
      setCurrentFrom(lastSelected.id)
    }
  }, [lastSelected])

  return (
    <MiscHolder>
    <NodeHolder onClick={() => Connect(currentFrom, lastFrom, name)}>
    Connect!
    </NodeHolder>
      Name:
      <ControlledTextInput onChange={setName} />
      From ID:
      <ControlledTextInput value={currentFrom}/>
      To ID:
      <ControlledTextInput value={lastFrom}/>
    </MiscHolder>
  )
}


  const Counter: FC = () => {
    const { data: vData , loading, refetch: refetchV, client } = useQuery<{ listVertices: [VertexD] }>(GET_VERTICES);
    const { data: eData , loading: l , refetch: refetchE} = useQuery<{ listEdges: [EdgeD] }>(GET_EDGES);
    const [Connect] = useMutation(CONNECT, {
      refetchQueries:[{ query: GET_VERTICES }, { query: GET_EDGES }]
    })
    const [Delete] = useMutation(DELETE, {
      refetchQueries:[{ query: GET_VERTICES }, { query: GET_EDGES }]
    })
    const [Create] = useMutation(CREATE, {
      refetchQueries:[{ query: GET_VERTICES }, { query: GET_EDGES }]
    })
    const [Update] = useMutation(UPDATE, {
     /*  refetchQueries:[{ query: GET_VERTICES }, { query: GET_EDGES }] */
    })
    const [selectedStuff, setSelectedStuff] = useState("");
    const [appliedFilter, setAppliedFilter] = useState({
      key: "",
      value: null
    });
    const [moment, setMoment] = useState(0);
    const [lastMoment, setLastMoment] = useState(0);
    const [timeLoading, setLoading] = useState(false);



    if (loading || l ){
      return <>"loading"</>
    }
    
    const refetch = () => {
      refetchV();
      refetchE();
    }
    const applyFilter = (key, value) => {
      if (appliedFilter.key == key){
        setAppliedFilter({
          key: "",
          value: null
        })
      }else{
        setAppliedFilter({
          key,
          value
        })
      }
    }
    
    const selectedEdgesObj = eData && eData.listEdges && eData.listEdges.filter(ed => ed.id === selectedStuff)
    const selectedNodesObj = vData && vData.listVertices && vData.listVertices.filter(ed => ed.id === selectedStuff)
    const finalEdges = eData.listEdges && eData.listEdges.filter(all => {
      if(appliedFilter.key !== ""){
        return all[appliedFilter.key] === appliedFilter.value
      }
      return true
    });

    const saveNode = async (node) => {
      const asVertex = {...node}
      asVertex.in = node.in && node.in.map(e => e.id || e) || [];
      asVertex.out = node.out && node.out.map(e => e.id || e) || [];
      if(asVertex.__typename){
        delete asVertex.__typename
      }
      await Update({variables:{v:asVertex}}).catch(console.log)
    }

    const sumCurrentLoad = (currentLoad) => {
      return currentLoad.reduce((acc, c) => {
        return acc + c.intensity
      }, 0)
    }

    const BackTraverseAndCalculate = async (nodesToPass, passedNodes) => {
      if (!nodesToPass.length){
        return passedNodes
      }
      const currentNode = nodesToPass[0];
      const nodesToPassPopped = nodesToPass.slice(1)
      console.log("BackTraverseAndCalculate: ", currentNode.name)
      try {
        const ourV = await client.query({
          query: GET_PARENTS,
          variables: {id: currentNode.id},
          fetchPolicy: 'network-only'
        })
        if (passedNodes.indexOf(currentNode.id) !== -1 ){
          console.log("Tried to rerun on: ",  currentNode.name)
          if (nodesToPassPopped.length > 0){
            return BackTraverseAndCalculate(nodesToPassPopped, passedNodes)
          }
          return passedNodes;
        }
        passedNodes.push(currentNode.id); // Add to passed Nodes
        // 1. Trabalhamos sempre no primeiro token
        const currentVertex = ourV.data.getVertex
        var leftEnergy = RestaurantCapacity[currentVertex.resourceType]
        leftEnergy += sumCurrentLoad(currentVertex.currentLoad.filter(load => load.type === "pre-output" || load.type === "pre-eat"))
        const currentLoad = currentVertex.currentLoad.filter(load => (load.type !== "pre-output" && load.type !== "pre-eat"))
        // Work to do
        var newCurrentLoad = [...currentLoad];
        const onHoldLoad = [];
        console.log({currentLoad})
        currentLoad.forEach(loadToken => {
          // TODO: Make the pre-output point to the parent token and only can remove they
          if ( loadToken.type !== "output" ) {
            if (leftEnergy > 0 && loadToken.type !== "hold") {
              if ( loadToken.intensity <= leftEnergy) {
                newCurrentLoad = newCurrentLoad.filter(l => l.id !== loadToken.id)
                if(currentVertex.resourceType !== "cook") {
                  if (loadToken.type !== "eat"){
                    // Cooks "finish" the load
                    newCurrentLoad.push({...loadToken, type: "output", owner: loadToken.id});
                  }                  
                }else{
                  newCurrentLoad.push({...loadToken, type: "release", owner: loadToken.id});
                }
                /* const indexOfTheLoad = newCurrentLoad.indexOf(loadToken)
                newCurrentLoad = indexOfTheLoad && [...newCurrentLoad.slice(0, indexOfTheLoad), ...newCurrentLoad.slice(indexOfTheLoad+1)] || [];*/

                leftEnergy -= loadToken.intensity;
              } else {
                const load = {...loadToken, type:  "pre-" + (loadToken.type !== "eat" ? "output" : "eat"), intensity: leftEnergy, owner: loadToken.id};
                if (load.__typename){
                  delete load.__typename
                }
                if (load.id){
                  delete load.id
                }
                load.owner = loadToken.id
                newCurrentLoad.push(load);
                leftEnergy = 0;
              }
            }else if(loadToken.type === "hold"){
              // This token is on hold until something happens, that means it cannot be manipulated - like a person in the table
              onHoldLoad.push(loadToken);
            }
          }
        });

        console.log("Novo calculo: ", {newCurrentLoad})
        const newVertex = {...currentVertex, currentLoad: newCurrentLoad.map(load => {
          if (load.__typename){
            delete load.__typename
          }
          return load
        })}
        var finalParentNode = null;
        // Parents send work - if there is only 1 thing in my output queue (depends on max parallel)
        if (newVertex.currentLoad.filter(l => l.type === "output").length < ResourceMaxParallel[newVertex.resourceType] && !onHoldLoad.length) {
          newVertex.in && newVertex.in.every((parentEdge) => {
            const parentNode = parentEdge.from;
            const parentWorkOutputTokens = parentNode.currentLoad.filter(load => load.type === "output");
            if (parentWorkOutputTokens && parentWorkOutputTokens.length) {
              var workType = "generic"
              if(newVertex.resourceType === "table"){
                newVertex.currentLoad.push({ ...parentWorkOutputTokens[0], type: workType+""}); // The table add the work to it  
                workType = "hold"
              }
              newVertex.currentLoad.push({ ...parentWorkOutputTokens[0], type: workType}); // The table add a hold token in it so it keeps on hold
              const newParentLoad = parentNode.currentLoad.filter(l => l.id !== parentWorkOutputTokens[0].id).map(l => {if(l.__typename){delete l.__typename;} return l}) // Parent loses it's output
              console.log({newParentLoad})
              finalParentNode = {...parentNode, currentLoad: newParentLoad}
              if (finalParentNode.__typename){
                delete finalParentNode.__typename
              }
              return false
            } 
            return true
          });
        }else if(onHoldLoad.length && newVertex.currentLoad.length === 1 ){
          newVertex.in && newVertex.in.every((parentEdge) => {
            const parentNode = parentEdge.from;
            console.log("Try to get release from ParentNode: " + parentNode.name)
            const parentReleaseTokens = parentNode.currentLoad.filter(load => load.type === "release");
            if (parentReleaseTokens && parentReleaseTokens.length) {
              // release
              console.log("ParentNode: " + parentNode.name + " has release tokens. Trying to release")
              const index = newVertex.currentLoad.indexOf(onHoldLoad[0]);
              if (index === -1) {
                console.error("WE TRIED TO RELEASE WITHOUT BEEN ON HOLD, SOMETHING WENT REAALLY WRONG")
              }
              const parentIndex = parentNode.currentLoad.indexOf(parentReleaseTokens[0]);
              if (parentIndex === -1) {
                console.error("WE TRIED TO RELEASE WITHOUT HAVING A RELEASE TOKEN, SOMETHING WENT REAALLY WRONG")
              }
              // remove the hold-token && add a eat token
              newVertex.currentLoad = index && [...newVertex.currentLoad.slice(0, index),...newVertex.currentLoad.slice(index+1) ] || [...newVertex.currentLoad.slice(1)];
              newVertex.currentLoad.push({
                intensity: 3 * onHoldLoad[0].intensity,
                type: "eat"
              })
              // remove the release token
              const newParentLoad = parentIndex && [...parentNode.currentLoad.slice(0, parentIndex),...parentNode.currentLoad.slice(parentIndex+1) ] || parentNode.currentLoad.slice(1);
              finalParentNode = {...parentNode, currentLoad: newParentLoad.map(l => {if(l.__typename){delete l.__typename}return l;})}
              if (finalParentNode.__typename){
                delete finalParentNode.__typename
              }
              return false
            }
            return true
          });
        }
        const finalVertex = {...newVertex, currentLoad: newVertex.currentLoad.map(l => {if(l.__typename){delete l.__typename;} return l})}
        console.log({finalVertex})
        const didChange = finalVertex.currentLoad.length !==currentVertex.currentLoad.length ||  finalVertex.currentLoad.reduce((acc, c) => {
          return acc || !currentVertex.currentLoad.reduce((acc2, c2) => acc2 || c.id === c2.id && c.type === c2.type, false)
        }, false) 
        if (didChange){
          await saveNode(finalVertex)
        }
        if (finalParentNode){
          await saveNode(finalParentNode)
        }
        // let newPassedNodes = passedNodes;
        // await asyncForEach(newVertex.in, async (inEdge) => {newPassedNodes = await BackTraverseAndCalculate(inEdge.from, newPassedNodes)})
        newVertex.in.forEach(inEdge => passedNodes.indexOf(inEdge.from.id) === -1 && nodesToPassPopped.push(inEdge.from))
        return BackTraverseAndCalculate(nodesToPassPopped, passedNodes)
      }catch(e){
        console.log(e)
      }
    }
    // Work calculus
    if(lastMoment !== moment) {
      // Traverse from bellow to top
      const leafs =  vData && vData.listVertices.filter( vert => !vert.out || !vert.out.length)
      console.log({leafs})
      setLastMoment(moment);
      setLoading(true);
      BackTraverseAndCalculate(leafs, []).then(() => {refetch(); setLoading(false);})
      //asyncForEach(leafs, async leaf => await BackTraverseAndCalculate(leaf, [])).then(() => {refetch(); setLoading(false);})
    }


  //
    const nodesComponents = !loading && vData && vData.listVertices && vData.listVertices.map(v => {
      return <GraphNode 
      id={v.id} 
      key={v.id}
      vertex={v}
      load={v.currentLoad}
      resourceType={v.resourceType}
          vis={{nodes:{size:5}}
        }/>
    }) || []

    const edgesComponents = !loading && finalEdges.reduce((acc, e) => {
      const shouldShowEdge = e.name !== "hide";
      return [...acc, (
      <Edge 
        id={e.id} 
        key={e.id}
        from={e.from.id} 
        to={e.to.id} 
        arrows="to"
        color={shouldShowEdge && {inherit: true} || {color: "rgba(0,0,0,0.01)", inherit: false} }
        click={()=> console.log(e.id)}
      />)] || acc
    }, [])
    
    return (
      <div> 
            <Container>
              {loading && "loading"||""}
              {l && "loading"||""}
              <NodeHolder onClick={()=> {refetch(); }}>
                Update
              </NodeHolder>
              <NodeHolder onClick={()=> {Save(); }}>
                Save
              </NodeHolder>
              <ConnectComponent connectFunction={Connect} lastSelected={selectedNodesObj && selectedNodesObj[0]}/>
              <CreateVertexComponent createFunction={Create}/>
              <FilterEdgeComponent applyFilter={applyFilter}/>
              <TimeCounter onTimeChange={setMoment} currentTime={moment} loading={timeLoading}/>
            </Container>
            <Container2>
              <VisuHolder>
                {<EdgePropertiesVisualizer edge={selectedEdgesObj && selectedEdgesObj.length && selectedEdgesObj[0] || selectedNodesObj && selectedNodesObj.length && selectedNodesObj[0]} onDelete={id => Delete({variables:{id:id}})} onUpdate={saveNode}/>}
              </VisuHolder>
            <NetworkHolder>
            <Network 
            ref={networkRef}
            onSelectEdge={(event) => {
                !event.nodes.length && setSelectedStuff(event.edges[0])
            }}
              onSelectNode={(event) => {
                  setSelectedStuff(event.nodes[0])
            }}>
              {[...edgesComponents, ...nodesComponents]}
            </Network>
            </NetworkHolder>
            </Container2>
      </div>
    );
  };

const App: FC<{ client: ApolloClient<any> }> = ({ client }) => (
  <ApolloProvider client={client}>
    <Counter/>
  </ApolloProvider>
);

export default App;