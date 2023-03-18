import React, {useEffect, useState} from 'react';
import {useAtom} from "jotai";
import {selectedFileAtom} from "@/lib/components/DirectoryTree";
import SyntaxHighlighter from 'react-syntax-highlighter';
import {bointsReachedAtom} from "@/lib/components/BointsDisplay";

let socket

function CodeViewer() {
    const [selectedFile, _] = useAtom(selectedFileAtom)
    const [loading, setLoading] = useState(false)
    const [code, setCode] = useState(undefined)
    const [debuggedLines, setDebuggedLines] = useState({})
    const [bointsReached, setBointsReached] = useAtom(bointsReachedAtom)
    const bointExtractor = (ref) => parseInt(ref?.split?.(':')?.[1])
    useEffect(() => {
        if (selectedFile) {
            setLoading(true)
            fetch('/api/file?path=' + selectedFile).then((result) => {
                result.json().then(data => {
                    setCode(data?.content)
                    setLoading(false)
                })
            })

        }
    }, [selectedFile])

    const [webSocket, setWebSocket] = useState(null as WebSocket);
    useEffect(() => {
        const ws = new WebSocket('ws://localhost:3001');
        ws.onopen = () => {
            setWebSocket(ws);
        };
        ws.onclose = () => {
            setWebSocket(null);
        };

        return () => {
            if (webSocket) {
                webSocket.close();
            }
        };
    }, []);
    useEffect(() => {
        if (!webSocket) return
        webSocket.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data)
                const payload = msg.payload
                switch (msg.type) {
                    case 'addedBoint':
                        if (debuggedLines[bointExtractor(payload.ref)]) {
                            debuggedLines[bointExtractor(payload.ref)].pending = false
                            setDebuggedLines(JSON.parse(JSON.stringify(debuggedLines)))
                        }
                        break;
                    case 'removedBoint':
                        if (debuggedLines[bointExtractor(payload.ref)]) {
                            delete debuggedLines[bointExtractor(payload.ref)]
                            setDebuggedLines(JSON.parse(JSON.stringify(debuggedLines)))
                        }
                        break;
                    case 'bointReached':
                        if (debuggedLines[bointExtractor(payload.ref)]) {
                            setBointsReached([...bointsReached, payload])
                        }
                        break;
                }
            } catch (e) {
            }
        };
    }, [debuggedLines])


    if (loading) return 'loading your file...'
    if (!webSocket) return 'loading server connection...'
    return (<div className={"flex flex-col w-full "}>
            <div
                className={"bg-gray-800 text-white p-4 py-2 font-bold w-full text-center"}>{selectedFile || 'Pick a file to start debugging'}</div>
            {code && <SyntaxHighlighter showLineNumbers={true}
                                        wrapLines={true}
                                        lineProps={lineNumber => {
                                            return {
                                                style: {
                                                    display: 'block', background: debuggedLines[lineNumber] ? (
                                                        debuggedLines[lineNumber].pending ? '#ff8baa' : '#f83c6e'
                                                    ) : undefined
                                                },
                                                onClick() {
                                                    if (debuggedLines[lineNumber]) {
                                                        debuggedLines[lineNumber].pending = true
                                                        webSocket.send(JSON.stringify({
                                                            type: 'removeBoint',
                                                            payload: debuggedLines[lineNumber].ref
                                                        }))
                                                        setDebuggedLines(JSON.parse(JSON.stringify(debuggedLines)))
                                                    } else {
                                                        debuggedLines[lineNumber] = {
                                                            ref: `${selectedFile}:${lineNumber}`,
                                                            pending: true
                                                        }
                                                        setDebuggedLines(JSON.parse(JSON.stringify(debuggedLines)))
                                                        webSocket.send(JSON.stringify({
                                                            type: 'addBoint',
                                                            payload: {
                                                                line: lineNumber,
                                                                fileName: selectedFile,
                                                                ref: debuggedLines[lineNumber].ref
                                                            }
                                                        }))

                                                    }

                                                }
                                            }
                                        }}
                                        language="javascript"
            >
                {
                    code
                }
            </SyntaxHighlighter>}
        </div>
    );
}

export default CodeViewer;