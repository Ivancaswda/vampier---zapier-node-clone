import {serve} from "inngest/next";
import {inngest} from "@/inngest/client";
import {execute, executeWorkflow, helloWorld} from "@/inngest/functions";

export const {GET, POST, PUT} = serve({
    client: inngest,
    functions: [
        helloWorld,
        execute,
        executeWorkflow
    ]
})