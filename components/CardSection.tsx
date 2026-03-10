import Image from "next/image";

export default function CardSection() {
  return (
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
            This card is responsive. On small screens, it stacks vertically. On
            medium and larger screens, it displays horizontally.
          </p>
          <button className="mt-4 bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600">
            Learn More
          </button>
        </div>
      </div>
    </main>
  );
}