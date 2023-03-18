import React, {useEffect, useRef, useState} from 'react';
import {useAtom} from "jotai";
import {selectedFileAtom} from "@/lib/components/DirectoryTree";
import SyntaxHighlighter from 'react-syntax-highlighter';

let socket
function CodeViewer() {
    const [selectedFile,_] = useAtom(selectedFileAtom)
    const [loading,setLoading] = useState(false)
    const [code,setCode] = useState(undefined)
    const [debuggedLines,setDebuggedLines] = useState({})
    useRef({})

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
    useEffect(()=>{
        if(!webSocket) return
        webSocket.onmessage = (event) => {
            try{
                const msg = JSON.parse(event.data)
                const payload = msg.payload
                console.log(msg)
                switch (msg.type){
                    case 'addedBoint':
                        if(debuggedLines[parseInt(payload?.ref?.split?.(':')?.[1])]){
                            debuggedLines[parseInt(payload.ref.split(':')[1])].pending = false
                            setDebuggedLines(JSON.parse(JSON.stringify(debuggedLines)))
                        }
                        break;
                    case 'removedBoint':
                        if(debuggedLines[parseInt(payload?.ref?.split?.(':')?.[1])]){
                            delete debuggedLines[parseInt(payload.ref.split(':')[1])]
                            setDebuggedLines(JSON.parse(JSON.stringify(debuggedLines)))
                        }
                        break;
                    case 'bointReached':
                        break;
                }
            } catch (e) {}
        };
    },[debuggedLines])


    if(loading) return 'loading your file...'
    if(!webSocket) return 'loading server connection...'
    return (<div className={"flex flex-col w-full "}>
        <div className={"bg-gray-800 text-white p-4 py-2 font-bold w-full text-center"}>{selectedFile || 'Pick a file to start debugging'}</div>
            {code && <SyntaxHighlighter  showLineNumbers={true}
                                         wrapLines={true}
                                         lineProps={lineNumber => {
                                             return {
                                                 style: {display: 'block',background:debuggedLines[lineNumber]?(
                                                         debuggedLines[lineNumber].pending?'#ff8baa':'#f83c6e'
                                                     ):undefined},
                                                 onClick() {
                                                     if( debuggedLines[lineNumber]){
                                                         debuggedLines[lineNumber].pending=true
                                                         webSocket.send(JSON.stringify({
                                                             type:'removeBoint',
                                                             payload: debuggedLines[lineNumber].ref
                                                         }))
                                                         setDebuggedLines(JSON.parse(JSON.stringify(debuggedLines)))
                                                     }
                                                     else {
                                                         debuggedLines[lineNumber] = {
                                                             ref: `${selectedFile}:${lineNumber}`,
                                                             pending:true
                                                         }
                                                         setDebuggedLines(JSON.parse(JSON.stringify(debuggedLines)))
                                                         webSocket.send(JSON.stringify({
                                                             type:'addBoint',
                                                             payload: {
                                                                 line: lineNumber,
                                                                 fileName: selectedFile.replace('.ts','.js').split('/')[3],
                                                                 ref: debuggedLines[lineNumber].ref
                                                             }
                                                         }))
                                                         console.log(selectedFile.replace('.ts','.js').split('/')[3])
                                                     }

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