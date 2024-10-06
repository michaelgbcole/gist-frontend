import { cookies } from "next/headers"
import SubmissionViewerContent from "./submission-viewer-content"
import { createServerClient } from "@supabase/ssr"

export const dynamic = 'force-dynamic'

async function Submission({ params }: { params: { formId: string } }) {
  const cookieStore = cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    // Handle unauthenticated state, e.g. render log in component
    return <div>Please log in to access this page.</div>
  }

  return <SubmissionViewerContent user={session.user} />
}

export default Submission
