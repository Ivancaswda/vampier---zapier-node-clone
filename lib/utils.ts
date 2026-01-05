
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import toposort from "toposort";
import {NonRetriableError} from "inngest";
import ky from "ky"

import HandleBars from 'handlebars'
import {httpRequestChannel} from "@/inngest/channels/http-request";
import {inngest} from "@/inngest/client";
import {googleFormTriggerChannel} from "@/inngest/channels/google-form-trigger";
import {stripeTriggerChannel} from "@/inngest/channels/stripe-trigger";
import {geminiChannel} from "@/inngest/channels/gemini";
import {manualTriggerChannel} from '@/inngest/channels/manual-trigger'
import {openaiChannel} from '@/inngest/channels/openai'
import {anthropicChannel} from '@/inngest/channels/anthropic'
import {createGoogleGenerativeAI} from "@ai-sdk/google";
import {createOpenAI} from "@ai-sdk/openai";
import {createAnthropic} from "@ai-sdk/anthropic";
import {generateText} from "ai";
import {db} from "@/configs/db";
import {credentialTable} from "@/configs/schema";
import {and, eq} from "drizzle-orm";
import getServerUser from "@/lib/auth-server";
import axios from "axios";
import {slackChannel} from "@/inngest/channels/slack";
import {discordChannel} from "@/inngest/channels/discord";
import {decode} from "html-entities";
import * as handlebars from "handlebars";
import {HiMiniArchiveBoxXMark} from "react-icons/hi2";
import {decrypt} from "@/lib/encryption";
import {telegramChannel} from "@/inngest/channels/telegram";
import {whatsappChannel} from "@/inngest/channels/whatsapp";
import {vkChannel} from "@/inngest/channels/vk";
import {yandexFormTriggerChannel} from "@/inngest/channels/yandex";
import {emailChannel} from "@/inngest/channels/email";

import { Resend } from "resend";
const resend = new Resend("re_RjknKRaf_K2bzP2bdxjng9xzdUdNtbqbi");
HandleBars.registerHelper('json', (context) => {
  const stringified = JSON.stringify(context, null, 2)
  const safeString = new HandleBars.SafeString(stringified)
  return safeString!
});

export  function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const adjectives = [
    "Синий", "Быстрый", "Тихий", "Яркий", "Счастливый",
    "Мгновенный", "Лёгкий", "Мощный", "Весёлый", "Творческий",
    "Невидимый", "Горящий", "Светлый", "Чистый", "Смелый",
    "Звёздный", "Стремительный", "Магический", "Лунный", "Облачный"
];

const nouns = [
    "Тигр", "Воркфлоу", "Ветер", "Поток", "Слон",
    "Медведь", "Свет", "Код", "Мир", "Огонь",
    "Лес", "Ветер", "Путь", "Гром", "Мост",
    "Север", "Юг", "Вулкан", "Самолет", "Кристалл"
];

export function generateRandomName() {
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${adj} ${noun}`;
}
export const topologicalSort = (nodes: any[], connections: any[]) => {
  if (!connections || connections.length === 0) return nodes;

  const validConnections = connections.filter(
      c => c.fromNodeId && c.toNodeId && c.fromNodeId !== c.toNodeId
  );

  const edges = validConnections.map(c => [
    c.fromNodeId,
    c.toNodeId
  ]);

  let sortedIds: string[];

  try {
    sortedIds = toposort(edges);
  } catch {
    throw new Error("Workflow contains a cycle");
  }

  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  return sortedIds.map(id => nodeMap.get(id)).filter(Boolean);
};

export const executorRegistry = {
  stripe_trigger: async ({node, context, step, publish}:any) => {
    try {



      await publish(
          stripeTriggerChannel().status({
            nodeId: node.id,
            status: 'loading'
          })
      )
      return step.run(`stripe_trigger:${node.id}`, async () => {
        await publish(
            stripeTriggerChannel().status({
              nodeId: node.id,
              status: 'success'
            })
        )
        return context;
      });
    } catch (error) {
      await publish(
          stripeTriggerChannel().status({
            nodeId: node.id,
            status: 'error'
          })
      )
    }
  },

  google_form_trigger: async ({node, context, step, publish}:any) => {
    try {



    await publish(
        googleFormTriggerChannel().status({
          nodeId: node.id,
          status: 'loading'
        })
    )
    return step.run(`google_form_trigger:${node.id}`, async () => {
      await publish(
          googleFormTriggerChannel().status({
            nodeId: node.id,
            status: 'success'
          })
      )
      return context;
    });
    } catch (error) {
      await publish(
          googleFormTriggerChannel().status({
            nodeId: node.id,
            status: 'error'
          })
      )
    }
  },
    yandex_form_trigger: async ({node, context, step, publish}:any) => {
        try {



            await publish(
                yandexFormTriggerChannel().status({
                    nodeId: node.id,
                    status: 'loading'
                })
            )
            return step.run(`yandex_form_trigger:${node.id}`, async () => {
                await publish(
                    yandexFormTriggerChannel().status({
                        nodeId: node.id,
                        status: 'success'
                    })
                )
                return context;
            });
        } catch (error) {
            await publish(
                yandexFormTriggerChannel().status({
                    nodeId: node.id,
                    status: 'error'
                })
            )
        }
    },
  manual_trigger: async ({ node, context, step, publish }: any) => {
      await publish(
          manualTriggerChannel().status({
              nodeId: node.id,
              status: 'loading'
          })
      )
      try {
            await publish(
                manualTriggerChannel().status({
                    nodeId: node.id,
                    status: 'success'
                })
            )
            return step.run(`manual_trigger:${node.id}`, async () => {
                return context;
            });
        } catch (error ) {
            await publish(
                manualTriggerChannel().status({
                    nodeId: node.id,
                    status: 'error'
                })
            )
            throw error
        }

  },

  http_request: async ({ node, context, step, publish }: any) => {
    try {



    const method = node?.data?.method
      const options:any = {method}
    const endpoint = HandleBars.compile(node?.data?.endpoint)(context)

    const variableName = node?.data?.variableName

    console.log('endpoint===')
    console.log(endpoint)
    await publish(
        httpRequestChannel().status({
          nodeId: node.id,
          status: 'loading'
        })
    )
    if (!variableName) {
      await publish(
          httpRequestChannel().status({
            nodeId: node.id,
            status: 'error'
          })
      )
      throw new NonRetriableError('HTTP Request node: no variableName configured!')
    }

    if (!endpoint) {
      await publish(
          httpRequestChannel().status({
            nodeId: node.id,
            status: 'error'
          })
      )
      throw new NonRetriableError('HTTP Request node: no endpoint configured!')
    }
    const result = await step.run(`http_request:${node.id}`, async () => {



      console.log("HTTP REQUEST NODE", node.id);




      if (["POST", "PUT", "PATCH"].includes(method)){

            const resolved = HandleBars.compile(node.data.body || "{}")(context);
            JSON.parse(resolved);
            options.body = resolved;
            options.headers = {
              "Content-Type": "application/json"
            }

      }

      const response = await ky(endpoint, options)
      const contentType= response.headers.get('content-type')
      const responseData = contentType?.includes("application/json")
      ? await response.json() : await response.text()




      const responsePayload =   {
        httpResponse: {
          status: response.status,
          statusText: response.statusText,
          data:responseData
        }
      }

      const compiledVariableName = HandleBars.compile(variableName)(context)
      await publish(
          httpRequestChannel().status({
            nodeId: node.id,
            status: 'success'
          })
      )
      return {
        ...context,
        [node.id]: "http response",
        [compiledVariableName]: responsePayload
      };
    });
    return result!
    } catch (error) {

      await publish(
          httpRequestChannel().status({
            nodeId: node.id,
            status: 'error'
          })
      )
    }
  },
    gemini_request: async ({ node, context, step, publish }: any) => {
        try {
        await publish(geminiChannel().status({
            nodeId: node.id,
            status: "loading"
        }))

        const data = node.data


        if (!data.variableName) {
            await publish(
                geminiChannel().status({
                    nodeId: node.id,
                    status: 'error'
                })
            )
            throw new NonRetriableError("Variable Name data is missing!")
        }

        if (!data.userPrompt) {
            await publish(
                geminiChannel().status({
                    nodeId: node.id,
                    status: 'error'
                })
            )

            throw new NonRetriableError("user Prompt data is missing!")

        }


        const systemPrompt = data.systemPrompt ? HandleBars.compile(data.systemPrompt)(context) : "You are helpful assistant";

        const userPrompt = HandleBars.compile(data.userPrompt)(context);

            if (!data.credentialValue) {
                await publish(geminiChannel().status({
                    nodeId: node.id,
                    status: 'error'
                }));
                throw new NonRetriableError("credential is missing!");
            }

            const credentialValue = decrypt(data.credentialValue)
            const google = createGoogleGenerativeAI({
                apiKey: credentialValue
            });


            const {steps} = await step.ai.wrap("gemini-generate-text", generateText, {
                model: google(data.model || "gemini-2.5-flash"),
                system: systemPrompt,
                prompt: userPrompt,
                experimental_telemetry: {
                    isEnabled:true,
                    recordInputs: true,
                    recordOutputs: true
                }
            })

            const text =  steps[0].content[0].type === 'text' ? steps[0].content[0].text : "";

            await publish(geminiChannel().status({
                nodeId:node.id,
                status: "success"
            }))

            return {
                ...context,
                [data.variableName]: {
                    aiResponse: text
                }
            }

        } catch (error) {
            await publish(
                geminiChannel().status({
                    nodeId: node.id,
                    status: 'error'
                })
            )

            throw error
        }

    },
    openai_request: async ({ node, context, step, publish }: any) => {
        try {
        await publish(openaiChannel().status({
            nodeId: node.id,
            status: "loading"
        }))
        const data = node.data
        console.log('DATA===')
        console.log(data)

        if (!data.variableName) {
            await publish(
                openaiChannel().status({
                    nodeId: node.id,
                    status: 'error'
                })
            )
            throw new NonRetriableError("Variable Name data is missing!")
        }

        if (!data.userPrompt) {
            await publish(
                openaiChannel().status({
                    nodeId: node.id,
                    status: 'error'
                })
            )

            throw new NonRetriableError("user Prompt data is missing!")

        }
        const systemPrompt = data.systemPrompt ? HandleBars.compile(data.systemPrompt)(context) : "You are helpful assistant";

        const userPrompt = HandleBars.compile(data.userPrompt)(context);

            if (!data.credentialValue) {
                await publish(geminiChannel().status({
                    nodeId: node.id,
                    status: 'error'
                }));
                throw new NonRetriableError("credential is missing!");
            }

            const credentialValue = decrypt(data.credentialValue)
        const openai = createOpenAI({
            apiKey: credentialValue
        })


            const {steps} = await step.ai.wrap("openai-generate-text", generateText, {
                model: openai(data.model || "gpt-4"),
                system: systemPrompt,
                prompt: userPrompt,
                experimental_telemetry: {
                    isEnabled:true,
                    recordInputs: true,
                    recordOutputs: true
                }
            })

            const text =  steps[0].content[0].type === 'text' ? steps[0].content[0].text : "";

            await publish(openaiChannel().status({
                nodeId:node.id,
                status: "success"
            }))

            return {
                ...context,
                [data.variableName]: {
                    aiResponse: text
                }
            }

        } catch (error) {
            await publish(
                openaiChannel().status({
                    nodeId: node.id,
                    status: 'error'
                })
            )

            throw error
        }

    },
    anthropic_request: async ({ node, context, step, publish }: any) => {
        try {
        await publish(anthropicChannel().status({
            nodeId: node.id,
            status: "loading"
        }))
        const data = node.data
        console.log('DATA===')
        console.log(data)

        if (!data.variableName) {
            await publish(
                anthropicChannel().status({
                    nodeId: node.id,
                    status: 'error'
                })
            )
            throw new NonRetriableError("Variable Name data is missing!")
        }

        if (!data.userPrompt) {
            await publish(
                anthropicChannel().status({
                    nodeId: node.id,
                    status: 'error'
                })
            )

            throw new NonRetriableError("user Prompt data is missing!")

        }
        const systemPrompt = data.systemPrompt ? HandleBars.compile(data.systemPrompt)(context) : "You are helpful assistant";

        const userPrompt = HandleBars.compile(data.userPrompt)(context);
            if (!data.credentialValue) {
                await publish(geminiChannel().status({
                    nodeId: node.id,
                    status: 'error'
                }));
                throw new NonRetriableError("credential is missing!");
            }
        const credentialValue = decrypt(data.credentialValue)
        const anthropic = createAnthropic({
            apiKey: credentialValue
        })


            const {steps} = await step.ai.wrap("anthropic-generate-text", generateText, {
                model: anthropic(data.model || "claude-sonnet-4-5"),
                system: systemPrompt,
                prompt: userPrompt,
                experimental_telemetry: {
                    isEnabled:true,
                    recordInputs: true,
                    recordOutputs: true
                }
            })

            const text =  steps[0].content[0].type === 'text' ? steps[0].content[0].text : "";

            await publish(anthropicChannel().status({
                nodeId:node.id,
                status: "success"
            }))

            return {
                ...context,
                [data.variableName]: {
                    aiResponse: text
                }
            }

        } catch (error) {
            await publish(
                anthropicChannel().status({
                    nodeId: node.id,
                    status: 'error'
                })
            )

            throw error
        }

    },
    discord_request: async ({ node, context, step, publish }: any) => {
        try {
            await publish(discordChannel().status({
                nodeId: node.id,
                status: "loading"
            }))

            const data = node.data


            if (!data.variableName) {
                await publish(
                    discordChannel().status({
                        nodeId: node.id,
                        status: 'error'
                    })
                )
                throw new NonRetriableError("Variable Name data is missing!")
            }

            if (!data.webhookUrl) {
                await publish(
                    discordChannel().status({
                        nodeId: node.id,
                        status: 'error'
                    })
                )
                throw new NonRetriableError("webhookUrl data is missing!")
            }
            if (!data.content) {
                await publish(
                    discordChannel().status({
                        nodeId: node.id,
                        status: 'error'
                    })
                )
                throw new NonRetriableError("content data is missing!")
            }

            const rawContent = HandleBars.compile(data.content)(context)
            const content = decode(rawContent)
            const username = data.username ? decode(HandleBars.compile(data.username)(context)) : undefined
            if (!data.username) {
                await publish(
                    discordChannel().status({
                        nodeId: node.id,
                        status: 'error'
                    })
                )
                throw new NonRetriableError("userName data is missing!")
            }

            const result = await step.run("discord-webhook", async () => {
                await ky.post(data.webhookUrl!, { //sending content
                    json: {
                        content: content.slice(0, 2000),
                        username
                    }
                })

                // returning at the end
                 return {
                     ...context,
                     [data.variableName]: {
                         messageContent: content.slice(0,2000)
                     }
                 }

              })

           await publish(discordChannel().status({
                nodeId:node.id,
                status: "success"
            }))
            // sent

         return result

        } catch (error) {
            await publish(
                discordChannel().status({
                    nodeId: node.id,
                    status: 'error'
                })
            )

            throw error
        }

    },
    slack_request: async ({ node, context, step, publish }: any) => {
        try {
            await publish(slackChannel().status({
                nodeId: node.id,
                status: "loading"
            }))

            const data = node.data


            if (!data.variableName) {
                await publish(
                    slackChannel().status({
                        nodeId: node.id,
                        status: 'error'
                    })
                )
                throw new NonRetriableError("Variable Name data is missing!")
            }
            if (!data.webhookUrl) {
                await publish(
                    slackChannel().status({
                        nodeId: node.id,
                        status: 'error'
                    })
                )
                throw new NonRetriableError("webhookUrl data is missing!")
            }
            if (!data.content) {
                await publish(
                    slackChannel().status({
                        nodeId: node.id,
                        status: 'error'
                    })
                )
                throw new NonRetriableError("content data is missing!")
            }

            const rawContent = HandleBars.compile(data.content)(context)
            const content = decode(rawContent)
            const username = data.username ? decode(HandleBars.compile(data.username)(context)) : undefined
            if (!data.username) {
                await publish(
                    discordChannel().status({
                        nodeId: node.id,
                        status: 'error'
                    })
                )
                throw new NonRetriableError("userName data is missing!")
            }

            const result = await step.run("slack-webhook", async () => {
                await ky.post(data.webhookUrl!, { //sending content
                    json: {
                        content: content.slice(0, 2000),

                    }
                })

                // returning at the end
                return {
                    ...context,
                    [data.variableName]: {
                        messageContent: content.slice(0,2000)
                    }
                }

            })

            await publish(slackChannel().status({
                nodeId:node.id,
                status: "success"
            }))

            return result



        } catch (error) {
            await publish(
                slackChannel().status({
                    nodeId: node.id,
                    status: 'error'
                })
            )

            throw error
        }

    },
    telegram_request: async ({ node, context, step, publish }:any) => {
        try {
            await publish(telegramChannel().status({
                nodeId: node.id,
                status: "loading"
            }))

            const { botToken, chatId, content, variableName } = node.data

            if (!botToken || !chatId || !content) {
                await publish(telegramChannel().status({
                    nodeId: node.id,
                    status: "error"
                }))
                throw new NonRetriableError("Telegram config missing")
            }

            const message = decode(
                HandleBars.compile(content)(context)
            )

            const result = await step.run("telegram-send", async () => {
                await ky.post(
                    `https://api.telegram.org/bot${botToken}/sendMessage`,
                    {
                        json: {
                            chat_id: chatId,
                            text: message
                        }
                    }
                )

                return {
                    ...context,
                    [variableName]: {
                        message
                    }
                }
            })

            await publish(telegramChannel().status({
                nodeId: node.id,
                status: "success"
            }))

            return result
        } catch (err) {
            await publish(telegramChannel().status({
                nodeId: node.id,
                status: "error"
            }))
            throw err
        }
    },
    whatsapp_request: async({node, context, step, publish}:any) => {
      try {
          await publish(whatsappChannel().status({
              nodeId: node.id,
              status: "loading"
          }))
          const {accessToken, phoneNumberId, to, templateName, variableName} = node.data;

          if (!accessToken || !phoneNumberId || !to || !templateName) {
              await publish(whatsappChannel().status({
                  nodeId: node.id,
                  status: "error"
              }))
              throw new NonRetriableError("WhatsApp config missing")
          }

          const result = await step.run('whatsapp-send', async () => {
              await ky.post(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
                  {
                      headers: {
                          Authorization: `Bearer ${accessToken}`,
                          "Content-Type": "application/json"
                      },
                      json: {
                          messaging_product: "whatsapp",
                          to,
                          type: "template",
                          template: {
                              name: templateName,
                              language: {
                                  code: "en_US"
                              }
                          }
                      }
                  }
                  )
              // eventually we`re returning it
              return {
                  ...context,
                  [variableName]: {
                      sent: true,
                      to
                  }
              }
          })


          await publish(whatsappChannel().status({
              nodeId: node.id,
              status: "success"
          }))
          return result


      } catch (error) {
          await publish(whatsappChannel().status({
              nodeId: node.id,
              status: "error"
          }))
          throw error
      }
    },
    vk_request: async({node, context, step, publish}:any) => {
      try {

          await publish(vkChannel().status({
              nodeId: node.id,
              status: "loading"
          }))

          const { accessToken,  content, variableName, peerId } = node.data;
          if (!accessToken ||  !content || !peerId) {
              await publish(
                  vkChannel().status({
                      nodeId: node.id,
                      status: "error",
                  })
              )
              throw new NonRetriableError("VK config missing")
          }



          const message = decode(HandleBars.compile(content)(context));

          const result = await step.run('vk-send', async () => {
              const res = await ky.post('https://api.vk.com/method/messages.send', {
                  searchParams: {
                      v: '5.199',
                      access_token: accessToken,
                      peer_id: peerId,
                      random_id: Date.now(),
                      message: message
                  }
              }).json<any>()

              if (res.error) {
                  await publish(vkChannel().status({
                      nodeId: node.id,
                      status: "error"
                  }))
                  throw new Error(res.error.error_msg)
              }
              return {
                  ...context,
                  [variableName]: {
                      message: message,
                      message_id: res.response
                  }
              }
          })


          await publish(vkChannel().status({
              nodeId: node.id,
              status: "success"
          }))

          return result
      } catch (error) {
        await publish(vkChannel().status({
            nodeId: node.id,
            status: "error"
        }))
        throw error
    }
    },
    email_request: async({node, context, step, publish}:any) => {
        try {
            await publish(
                emailChannel().status({
                    nodeId: node.id,
                    status: "loading",
                })
            );

            const { to, subject, content, variableName, resendFrom } = node.data;

            if (!to || !subject || !content || !resendFrom) {
                throw new NonRetriableError("Email config missing");
            }

            // шаблоны
            const compiledSubject = HandleBars.compile(subject)(context);
            const compiledContent = HandleBars.compile(content)(context);

            const result = await step.run("send-email", async () => {
                const { data, error } = await resend.emails.send({
                    from: resendFrom,
                    to,
                    subject: compiledSubject,
                    html: compiledContent,
                });

                if (error) {
                    throw new Error(error.message);
                }

                return data;
            });

            await publish(
                emailChannel().status({
                    nodeId: node.id,
                    status: "success",
                })
            );

            return {
                ...context,
                [variableName || "emailResult"]: {
                    id: result.id,
                    to,
                    subject: compiledSubject,
                },
            };
        } catch (error) {
            await publish(
                emailChannel().status({
                    nodeId: node.id,
                    status: "error",
                })
            );
            throw error;
        }
    }

};
export const getExecutor = (data:any) => {
  const executor = executorRegistry[data.type];

  if (!executor) {
    throw  new Error(`No executor found for node type: ${data?.type}`)
  }

  return executor
}

export const generateGoogleFormScript = (
    webhookUrl: string,
) => `function onFormSubmit(e) {
  var formResponse = e.response;
  var itemResponses = formResponse.getItemResponses();

  // Build responses object
  var responses = {};
  for (var i = 0; i < itemResponses.length; i++) {
    var itemResponse = itemResponses[i];
    responses[itemResponse.getItem().getTitle()] = itemResponse.getResponse();
  }

  // Prepare webhook payload
  var payload = {
    formId: e.source.getId(),
    formTitle: e.source.getTitle(),
    responseId: formResponse.getId(),
    timestamp: formResponse.getTimestamp(),
    respondentEmail: formResponse.getRespondentEmail(),
    responses: responses
  };

  // Send to webhook
  var options = {
    'method': 'post',
    'contentType': 'application/json',
    'payload': JSON.stringify(payload)
  };

  var WEBHOOK_URL = '${webhookUrl}';

  try {
    UrlFetchApp.fetch(WEBHOOK_URL, options);
  } catch(error) {
    console.error('Webhook failed:', error);
  }
};`

export const sendWorkflowExecution = async (data: {
  workflowId: string;
  [key:string]:any
}) => {
  return inngest.send({
    name: 'workflow/execute.workflow',
    data
  })
}

export function formatDateRu(date: string | Date) {
    return new Date(date).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

export function formatDuration(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    if (mins === 0) {
        return `${secs} сек`;
    }

    return `${mins} мин ${secs} сек`;
}