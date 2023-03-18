import {DirectoryStructure, DirectoryTree} from "@/lib/components/DirectoryTree";
import CodeViewer from "@/lib/components/CodeViewer";
import BointsDisplay from "@/lib/components/BointsDisplay";
import React, {useEffect, useState} from "react";

const ELEMENT_MAP: { [viewId: string]: JSX.Element } = {
    a: <div>Left Window</div>,
    b: <div>Top Right Window</div>,
    c: <div>Bottom Right Window</div>,
};

export default function Home() {
    const [directoryStructure,setDirectoryStructure] = useState({})
    const [loading,setLoading] = useState(true)
    useEffect(() => {
            setLoading(true)
            fetch('/api/project').then((result) => {
                result.json().then(data => {
                    setDirectoryStructure(data)
                    setLoading(false)
                })
            })
    }, [])
    if(loading) return "Loading..."
    return (
        <div  className={"flex flex-col w-full h-screen bg-gray-200"}>
            <div className={"overflow-y-scroll h-full"}>
                <div className={"flex flex-row w-full"}>
                    <div className={"w-2/5 overflow-y-auto"}>
                        <DirectoryTree
                            directoryStructure={directoryStructure as DirectoryStructure}/>
                    </div>
                    <div className={"w-full overflow-y-auto bg-gray-100"}>
                        <CodeViewer/>
                    </div>

                </div>
            </div>


            <BointsDisplay/>
        </div>
        )
}
