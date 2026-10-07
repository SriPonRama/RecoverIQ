export function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
      <div className="h-16 w-16 bg-brand-100 rounded-full flex items-center justify-center mb-4">
        <span className="text-brand-600 font-semibold text-xl">{title.charAt(0)}</span>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-500 max-w-md">
        This is a placeholder page for the {title} module. It will be implemented in a future phase.
      </p>
    </div>
  )
}
