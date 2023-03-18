import React, {useState} from 'react';
import {IoMdArrowDropdown, IoMdArrowDropright} from "react-icons/io";
import {BsDot} from "react-icons/bs";
import {atom, useAtom} from 'jotai'

export type DirectoryStructure = {
    name: string;
    children: DirectoryStructure[] | undefined
}

export const selectedFileAtom = atom(undefined as string)

export function DirectoryTree({directoryStructure, parentPath = ''}: { directoryStructure: DirectoryStructure }) {
    const [expanded, setExpanded] = useState(false)
    const [_, setSelectedFile] = useAtom(selectedFileAtom)
    const path = `${parentPath}/${directoryStructure.name}`
    const isFile = directoryStructure.children === undefined
    return <div className={"pl-4 py-1 w-full flex flex-col"}>
        <div className={" hover:bg-gray-200 w-full flex flex-row items-center"} onClick={() => {
            if (!isFile) {
                setExpanded(!expanded)
            } else {
                setSelectedFile(path)
            }
        }}>
            {expanded ? <IoMdArrowDropdown/> :
                (isFile ? <BsDot/> :
                    <IoMdArrowDropright/>)}
            <span>{directoryStructure.name}</span>
        </div>

        {!isFile && <hr className={"w-full"}/>}
        {!isFile && expanded && directoryStructure.children?.map((child, i) =>
            <DirectoryTree
                parentPath={path}
            key={i}
            directoryStructure={child}/>)}

    </div>

}
