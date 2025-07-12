export default function Help() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Help Center</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Getting Started</h2>
          <ul className="space-y-2 text-gray-600">
            <li>Creating an account</li>
            <li>Setting up your profile</li>
            <li>Adding payment methods</li>
          </ul>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Selling Items</h2>
          <ul className="space-y-2 text-gray-600">
            <li>Creating listings</li>
            <li>Setting prices</li>
            <li>Managing inventory</li>
          </ul>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Buying Items</h2>
          <ul className="space-y-2 text-gray-600">
            <li>Browsing listings</li>
            <li>Making offers</li>
            <li>Completing purchases</li>
          </ul>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Safety & Security</h2>
          <ul className="space-y-2 text-gray-600">
            <li>Safe payment practices</li>
            <li>Meeting buyers/sellers</li>
            <li>Reporting issues</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
