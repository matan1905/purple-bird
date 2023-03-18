import React, {useEffect, useState} from 'react';
import {useAtom} from "jotai";
import {selectedFileAtom} from "@/lib/components/DirectoryTree";
import SyntaxHighlighter from 'react-syntax-highlighter';

let socket
function CodeViewer() {
    const [selectedFile,_] = useAtom(selectedFileAtom)
    const [loading,setLoading] = useState(false)
    const [code,setCode] = useState(undefined)
    const [debuggedLines,setDebuggedLines] = useState({})
    useEffect(()=>{
        if(selectedFile){
            setLoading(true)
            fetch('/api/file?path='+selectedFile).then((result)=>{
                result.json().then(data=>{
                    setCode(data?.content)
                    setLoading(false)
                })
            })

        }
    },[selectedFile])

    const [webSocket, setWebSocket] = useState(null as WebSocket);
    useEffect(() => {
        const ws = new WebSocket('ws://localhost:3001');

        ws.onopen = () => {
            console.log('WebSocket connected');
            setWebSocket(ws);
        };

        ws.onmessage = (event) => {
            console.log(`Received message: ${event.data}`);
        };

        ws.onclose = () => {
            console.log('WebSocket disconnected');
            setWebSocket(null);
        };

        return () => {
            if (webSocket) {
                webSocket.close();
            }
        };
    }, []);


    if(loading) return 'loading your file...'
    if(!webSocket) return 'loading server connection...'
    return (<div className={"flex flex-col w-full "}>
        <div className={"bg-gray-800 text-white p-4 py-2 font-bold w-full text-center"}>{selectedFile || 'Pick a file to start debugging'}</div>
            {code && <SyntaxHighlighter  showLineNumbers={true}
                                         wrapLines={true}
                                         lineProps={lineNumber => {
                                             return {
                                                 style: {display: 'block',background:debuggedLines[lineNumber]?'red':undefined},
                                                 onClick() {
                                                     if( debuggedLines[lineNumber]){
                                                         delete  debuggedLines[lineNumber]
                                                     }
                                                     else {
                                                         debuggedLines[lineNumber] = {
                                                             ref: `${selectedFile}:${lineNumber}`
                                                         }
                                                         webSocket.send(JSON.stringify({
                                                             type:'addBoint',
                                                             payload: {
                                                                 line: lineNumber,
                                                                 fileName: selectedFile,
                                                                 ref: debuggedLines[lineNumber].ref
                                                             }
                                                         }))
                                                     }
                                                     setDebuggedLines({...debuggedLines})
                                                 }
                                             }}}
                                         language="typescript"
                                         >
                {
                    code
                }
            </SyntaxHighlighter>}
        </div>
    );
}

export default CodeViewer;