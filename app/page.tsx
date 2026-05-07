import ClientApp from './components/ClientApp';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#fcfcfc] text-black">
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-black text-white flex items-center justify-center rounded-md font-bold shadow-sm">
              G
            </div>
            <h1 className="text-xl font-medium tracking-tight text-gray-900">
              Gemini File Search API
            </h1>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ClientApp />
      </div>
    </main>
  );
}
