import {NodeProps} from "@xyflow/react";
import NodeSelector from "@/components/NodeSelector";
import {Button} from "@/components/ui/button";
import {PlusIcon} from "lucide-react";
import React from "react";

const InitialNode = ({ data }: NodeProps) => {
    return (
        <NodeSelector open={data.open} onOpenChange={data.onOpenChange}>
            <Button variant="outline" size="sm">
                <PlusIcon />
            </Button>
        </NodeSelector>
    );
};export default InitialNode