import type { NextApiRequest, NextApiResponse } from 'next'
import { getSteamshipPackage } from '@steamship/steamship-nextjs'


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const { messages } = req.body as any;

  if (!messages) {
    return res.json({ error: "Please enter a message." })
  }

  const {message, who} = messages[messages.length - 1]

  if (!message) {
    return res.json({ error: "No last message found." })
  }

  try {
    // Fetch a stub to the Steamship-hosted backend.
    // Use a different workspace name per-user to provide data isolation.
    const uniqueUserToken = "user-1234";
    const packageHandle = process.env.STEAMSHIP_PACKAGE_HANDLE as string;
    const indexName = process.env.INDEX_NAME as string;

    if (!process.env.STEAMSHIP_API_KEY) {
      return res.json({ error: "Please set the STEAMSHIP_API_KEY env variable." })
    }
    if (!packageHandle) {
      return res.json({ error: "Please set the STEAMSHIP_PACKAGE_HANDLE env variable." })
    }
     if (!indexName) {
      return res.json({ error: "Please set the INDEX_NAME env variable." })
    }

    const config = new Map<string, any>();
    config.set('index_name', indexName);

    const pkg = await getSteamshipPackage({
      workspace: `${packageHandle}-${uniqueUserToken}`,
      pkg: packageHandle,
      config: config
    })

    // Invoke a method on the package defined in steamship/api.py. Full syntax: pkg.invoke("method", {args}, "POST" | "GET")
    const resp = await pkg.invoke('generate', {
      question: message,
      chat_session_id: 'default' // Note: the bundled chat package provides different chat "rooms" with a workspace.
    })

    // The resp object is an Axios response object. The .data field can be binary, JSON, text, etc.
    // For example, it's just text -- see steamship/api.py for where it's produced and returned.
    const text = resp.data

    // Return JSON to the web client.
    return res.json({ text })
  } catch (ex) {
    console.log(ex)
    const awaitedEx = (await ex) as any;

    if (awaitedEx?.response?.data?.status?.statusMessage) {
      return res.json({ error: awaitedEx?.response?.data?.status?.statusMessage })
    }

    console.log(typeof awaitedEx)
    console.log(awaitedEx)

    return res.json({ error: `There was an error responding to your message.` })
  }


}
