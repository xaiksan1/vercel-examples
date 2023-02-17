import { Layout, Text, Page } from '@vercel/examples-ui'
import { Chat } from '../components/Chat'
import { useRouter } from 'next/router'

function Home() {
  const router = useRouter()
  const {db_id} = router.query
  process.env.DB_ID = db_id as string

  const errorMessage = (
        <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p>Unknown index selected.</p>
              </div>
            </div>
          </div>
          )


  return (
    <Page className="flex flex-col gap-12">
      <section className="flex flex-col gap-6">
        <Text variant="h1">Chat with your book</Text>
        <Text variant="h2">Get twice the learnings 🧠</Text>

      </section>

      <section className="flex flex-col gap-3">
        <div className="lg">
            { typeof db_id == "undefined" ? errorMessage : <Chat/> }
        </div>
      </section>
    </Page>
  )
}

Home.Layout = Layout

export default Home
