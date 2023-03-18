import React, {useState} from 'react';
import {atom, useAtom} from "jotai";

export const bointsReachedAtom = atom([])

function BointsDisplay() {
    const [bointsReached, _] = useAtom(bointsReachedAtom)
    const [selectedBoint,setSelectedBoint] = useState(0)
    const [selectedVariable,setSelectedVariable] = useState(undefined as any)
    if (bointsReached.length == 0) return ''
    return (
        <div className={"flex flex-row w-screen h-44 justify-between  bg-gray-200 p-2"}>
            <div className={"flex flex-col w-1/4 overflow-y-auto  h-40"}>
                {bointsReached.map((boint, index) =>
                    <div onClick={()=> {
                        setSelectedBoint(index)
                        setSelectedVariable(undefined)
                    }} className={"w-full hover:bg-gray-400"} key={index}>
                        {boint.ref}
                        <hr/>
                    </div>)}
            </div>
            <div className={"overflow-y-auto h-40 " +selectedVariable?' w-2/4':' w-3/4'}>
                {bointsReached[selectedBoint].scopeVariables.map((scope,index)=>
                <div key={index}>

                    {Object.keys(scope).map(key=><div key={key} onClick={()=>{
                        setSelectedVariable(scope[key])
                    }}>
                        {index} - {key}
                    </div>)}
                </div>)}
            </div>
            { selectedVariable && <div className={"w-1/4 overflow-y-auto h-40"}>
                {JSON.stringify(selectedVariable)}
            </div>}
        </div>
    );
}

export default BointsDisplay;


