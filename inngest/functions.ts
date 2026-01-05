import {inngest} from "@/inngest/client";
import {db} from "@/configs/db";
import {connectionsTable, credentialTable, executionTable, nodesTable, workflowsTable} from "@/configs/schema";
import {generateText} from "ai";
import {google} from "@ai-sdk/google";
import {NonRetriableError} from "inngest";
import {topologicalSort} from "@/lib/utils";
import {getExecutor} from "@/lib/utils";
import {httpRequestChannel} from "@/inngest/channels/http-request";
import {manualTriggerChannel} from "@/inngest/channels/manual-trigger";
import {googleFormTriggerChannel} from "@/inngest/channels/google-form-trigger";
import {and, eq} from "drizzle-orm";
import {geminiChannel} from "@/inngest/channels/gemini";
import { v4 as uuidv4 } from "uuid";
import getServerUser from "@/lib/auth-server";
import {workflowExecutionChannel} from "@/inngest/channels/workflow";

export const helloWorld = inngest.createFunction(
    { id: 'hello-world' },
    { event: 'text/hello.world' },
    async ({ event, step }) => {
        console.log("Inngest function triggered:", event.data)

        await step.run('create-and-save', async () => {
            console.log("Before inserting into DB...")

            const result = await db.insert(workflowsTable).values({
                name: event.data.name,
                createdBy: event.data.email
            })

            console.log("Inserted:", result)
        })
    }
)


export const execute = inngest.createFunction(
    { id: 'execute-ai'},
    {event: 'text/execute.ai'},
    async ({event, step}) => {
        const {steps} = await step.ai.wrap(
            "gemini-generate-text",
            generateText,
            {
                model: google('gemini-2.5-flash'),
                system: 'you are a helpful assistant',
                prompt: 'Tell me pythagoras theory?',
                experimental_telemetry: {
                    isEnabled: true,
                    recordInputs: true,
                    recordOutputs: true
                }
            }
        )
        return steps
    }

)

export const executeWorkflow = inngest.createFunction(
    { id: "execute-workflow", retries: process.env.NODE_ENV === 'production' ? 3 : 0, onFailure: async ({event, step, publish}) => {

            const error = event.data.error;
            const workflowId = event.data.event.data.workflowId;


            console.log(event.data.event)
            await publish(
                workflowExecutionChannel().status({
                    workflowId,
                    executionId: event.data.event.id,
                    status: "error",
                    message: error.message,
                })
            );

        const updated = await db
                .update(executionTable)
                .set({
                    status: 'error',
                    error: event.data.error.message,
                    errorStack: event.data.error.stack
                })
                .where(and(
                    eq(executionTable.inngestEventId, event.data.event.id),
                    eq(executionTable.createdBy, event.data.event.data.createdBy)
                ))
                .returning();
            return updated!
        } },
    {
        event: "workflow/execute.workflow",
        channels: [httpRequestChannel(), manualTriggerChannel(), googleFormTriggerChannel(), geminiChannel()],
    },
    async ({ event, step, publish }) => {

        const createdBy = event.data.createdBy;

        console.log('createdBy')
        console.log(createdBy)

        const workflowName = event.data.workflowName;

        console.log(workflowName)
        console.log('workflowName')
        const inngestEventId = event.id;

        const workflowId = event.data.workflowId;
        console.log(workflowId)
        console.log('workflowId')


        await step.run('create-execution', async () => {
            await db.insert(executionTable).values({
                executionId: uuidv4(),
                workflowId: workflowId,
                inngestEventId: inngestEventId,
                createdAt: new Date(),
                status: "running",
                createdBy: createdBy,
                name: workflowName

            })
        })

        if (!inngestEventId ) {
            throw  new NonRetriableError('Inngest Event Id is missing');
        }
        if (!workflowId) {
            throw  new NonRetriableError('workflow Id is missing!')
        }
        const workflowResult = await db
            .select()
            .from(workflowsTable)
            .where(eq(workflowsTable.workflowId, workflowId));
        console.log('workflowResult===')
        console.log(workflowResult)
        const workflow = workflowResult[0];
        if (!workflow) {
            throw new NonRetriableError("workflow was not provided!");
        }

        console.log('workflow data:', workflow);


        const nodesResult = await db
            .select()
            .from(nodesTable)
            .where(eq(nodesTable.workflowId, workflowId));

        const connectionsResult = await db
            .select()
            .from(connectionsTable)
            .where(eq(connectionsTable.workflowId, workflowId));


        console.log('nodes from DB:', nodesResult);
        console.log('connections from DB:', connectionsResult);


        const nodes = nodesResult.map((node) => ({
            id: node.nodeId,
            type: node.type,
            position: node.position,
            data: node.data,
        }));

        const connections = connectionsResult.map((connection) => ({
            fromNodeId: connection.fromNodeId,
            toNodeId: connection.toNodeId,
            fromOutput: connection.fromOutput,
            toInput: connection.toInput,
        }));


        if (!Array.isArray(nodes) || nodes.length === 0) {
            throw new NonRetriableError("No nodes found for this workflow.");
        }

        if (!Array.isArray(connections) || connections.length === 0) {
            throw new NonRetriableError("No connections found for this workflow.");
        }

        console.log('nodes after mapping:', nodes);
        console.log('connections after mapping:', connections);

        // Сортируем узлы (топологическая сортировка)
        const sortedNodes = await step.run("prepare-workflow", async () =>
            topologicalSort(nodes, connections)
        );

        if (!Array.isArray(sortedNodes)) {
            throw new NonRetriableError("Failed to topologically sort nodes.");
        }

        console.log('sorted nodes:', sortedNodes);



        let context = event.data.initialData || {};


        for (const node of sortedNodes) {
            const executor = getExecutor(node);
            context = await executor({
                node,
                context,
                step,
                publish,
            });
        }

        await step.run('update-execution', async () => {
            const updated = await db
                .update(executionTable)
                .set({
                    status: 'success',
                    completedAt: new Date(),
                    output: context,
                    createdBy: createdBy,
                    name: workflowName
                })
                .where(
                    and(
                        eq(executionTable.workflowId, workflowId),
                        eq(executionTable.inngestEventId, inngestEventId)
                    )
                )
                .returning();
            return updated!
        })

        return {
            workflowId: workflow.workflowId,
            result: context,
        };

    }
);