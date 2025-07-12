export default function Careers() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Join Our Team</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Current Openings</h2>
          <ul className="space-y-4">
            <li className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium">Software Engineer</h3>
              <p className="text-gray-600">Full-time | Remote</p>
              <p className="mt-2">Join our engineering team and help build the future of peer-to-peer marketplaces.</p>
            </li>
            <li className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium">Product Manager</h3>
              <p className="text-gray-600">Full-time | Remote</p>
              <p className="mt-2">Shape the future of our platform and lead cross-functional teams to deliver exceptional user experiences.</p>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-4">Why Work With Us?</h2>
          <ul className="space-y-4">
            <li className="flex items-start mb-4">
              <div className="flex-shrink-0">
                <span className="text-rose-500">•</span>
              </div>
              <div className="ml-3">
                <p className="text-gray-600">Flexible work environment</p>
              </div>
            </li>
            <li className="flex items-start mb-4">
              <div className="flex-shrink-0">
                <span className="text-rose-500">•</span>
              </div>
              <div className="ml-3">
                <p className="text-gray-600">Competitive compensation</p>
              </div>
            </li>
            <li className="flex items-start mb-4">
              <div className="flex-shrink-0">
                <span className="text-rose-500">•</span>
              </div>
              <div className="ml-3">
                <p className="text-gray-600">Professional growth opportunities</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
