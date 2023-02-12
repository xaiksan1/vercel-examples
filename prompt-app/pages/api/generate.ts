import { type NextRequest, NextResponse } from 'next/server'
import { getSteamshipPackage } from '@steamship/steamship-nextjs'

// IMPORTANT TODO:
// Copy the name from your steamship/steamship.json file after deploying (see steamship/README.md)
const PACKAGE_NAME = "ted-test-twitter-bio"

export default async function handler(req: NextRequest, res: NextResponse) {
  const { bio, vibe } = req.body as any;
  console.log("hi", bio, vibe)

  // Fetch a stub to the Steamship-hosted backend.
  // Use a different workspace name per-user to provide data isolation.
  const pkg = await getSteamshipPackage({workspace: 'my-workspace-4', pkg: PACKAGE_NAME})

  console.log("YES ")
  try {
    // Invoke a method on the package defined in steamship/api.py. Full syntax: pkg.invoke("method", {args}, "POST" | "GET")
    const resp = await pkg.invoke('generate', {bio, vibe})

    // The resp object is an Axios response object. The .data field can be binary, JSON, text, etc.
    // For example, it's just text -- see steamship/api.py for where it's produced and returned.
    const bios = resp.data

    // Return JSON to the web client.
    // @ts-ignore
    return res.json({ bios })
  } catch (ex) {
    console.log(ex)
    // @ts-ignore
    return res.json({ text: "There was an error responding to you." })
  }
}

