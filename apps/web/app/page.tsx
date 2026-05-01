export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-primary-50 to-background p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-primary-900">
            ProperHOA
          </h1>
          <p className="text-xl text-neutral-600">
            Run your HOA in minutes a week, not hours.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-neutral-800">
              🏠 Welcome to ProperHOA
            </h2>
            <p className="text-sm text-neutral-500">
              The AI-assisted HOA management platform built for self-managed communities.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-primary-50 rounded-lg p-3">
              <div className="font-semibold text-primary-700">AI Assistant</div>
              <div className="text-primary-600">Auto-answers homeowner questions</div>
            </div>
            <div className="bg-secondary-50 rounded-lg p-3">
              <div className="font-semibold text-secondary-700">Payments</div>
              <div className="text-secondary-600">Dues collection & autopay</div>
            </div>
            <div className="bg-primary-50 rounded-lg p-3">
              <div className="font-semibold text-primary-700">Meetings</div>
              <div className="text-primary-600">Smart agendas & minutes</div>
            </div>
            <div className="bg-secondary-50 rounded-lg p-3">
              <div className="font-semibold text-secondary-700">Compliance</div>
              <div className="text-secondary-600">Never miss a deadline</div>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-200">
            <p className="text-xs text-neutral-400">
              Built by Leap Ahead Labs with OpenClaw
            </p>
          </div>
        </div>

        <div className="text-sm text-neutral-500">
          <p>Self-hosted • PostgreSQL + pgvector • Ollama AI</p>
          <p>Stripe payments • Plaid bank sync</p>
        </div>
      </div>
    </main>
  );
}