export default function Press() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Press</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Media Coverage</h2>
          <ul className="space-y-4">
            <li className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium">Fasfar Launches in 2025</h3>
              <p className="text-gray-600">TechCrunch - July 2025</p>
              <p className="mt-2">Read about our innovative approach to peer-to-peer marketplaces.</p>
            </li>
            <li className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium">Disrupting Local Commerce</h3>
              <p className="text-gray-600">Forbes - June 2025</p>
              <p className="mt-2">Learn how we're changing the way people buy and sell locally.</p>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-4">Press Resources</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Press Kit</h3>
              <p className="text-gray-600">Download our press kit with company information, logos, and images.</p>
            </div>
            <div>
              <h3 className="font-medium">Contact</h3>
              <p className="text-gray-600">For media inquiries, please contact:</p>
              <p className="text-gray-600">press@fasfar.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
