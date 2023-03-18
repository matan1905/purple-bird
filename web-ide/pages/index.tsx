import {DirectoryStructure, DirectoryTree} from "@/lib/components/DirectoryTree";
import CodeViewer from "@/lib/components/CodeViewer";

const ELEMENT_MAP: { [viewId: string]: JSX.Element } = {
    a: <div>Left Window</div>,
    b: <div>Top Right Window</div>,
    c: <div>Bottom Right Window</div>,
};

export default function Home() {
    return (
        <div className={"flex flex-row w-full h-full"}>
            <div className={"w-2/5 overflow-y-auto h-screen"}>
                <DirectoryTree
                    directoryStructure={{
                    "name": "src",
                    "children": [{
                        "name": "example",
                        "children": [{"name": "index.ts"}, {"name": "todo-server.ts"}]
                    }, {
                        "name": "lib",
                        "children": [{
                            "name": "Bird",
                            "children": [{"name": "Bird.ts"}, {"name": "BirdCommunicator.ts"}, {"name": "BirdMessage.ts"}, {"name": "DefaultBirdCommunicator.ts"}, {"name": "utils.ts"}]
                        }]
                    }]
                } as DirectoryStructure}/>
            </div>


            <div className={"w-full h-screen overflow-y-auto bg-gray-100"}>
                <CodeViewer/>
            </div>
        </div>)
}
