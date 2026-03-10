import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-800">My App</h1>
            </div>
            <div className="flex items-center space-x-4">
              <a href="#" className="text-gray-600 hover:text-gray-900">Home</a>
              <a href="#" className="text-gray-600 hover:text-gray-900">About</a>
              <a href="#" className="text-gray-600 hover:text-gray-900">Contact</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">Welcome to My App</h2>
          <p className="text-xl mb-8">Discover amazing features and responsive design with Tailwind CSS.</p>
          <button className="bg-white text-blue-500 px-6 py-3 rounded-full font-semibold hover:bg-gray-100">
            Get Started
          </button>
        </div>
      </section>

      {/* Card Section */}
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="max-w-sm w-full bg-white rounded-lg shadow-lg overflow-hidden md:max-w-2xl md:flex">
          <div className="md:flex-shrink-0">
            <Image
              className="h-48 w-full object-cover md:h-full md:w-48"
              src="/next.svg"
              alt="Card image"
              width={192}
              height={192}
            />
          </div>
          <div className="p-8">
            <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">
              Responsive Card
            </div>
            <h2 className="block mt-1 text-lg leading-tight font-medium text-black">
              Built with Tailwind CSS
            </h2>
            <p className="mt-2 text-gray-500">
              This card is responsive. On small screens, it stacks vertically. On medium and larger screens, it displays horizontally.
            </p>
            <button className="mt-4 bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600">
              Learn More
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2023 My App. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
