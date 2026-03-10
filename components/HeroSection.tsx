export default function HeroSection() {
  return (
    <section className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl font-bold mb-4">Welcome to My App</h2>
        <p className="text-xl mb-8">
          Discover amazing features and responsive design with Tailwind CSS.
        </p>
        <button className="bg-white text-blue-500 px-6 py-3 rounded-full font-semibold hover:bg-gray-100">
          Get Started
        </button>
      </div>
    </section>
  );
}