export default function MyResumes() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Resumes</h1>
      <p className="text-gray-600">Upload and manage your resumes here.</p>
      
      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <button className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700">
          Upload New Resume
        </button>
      </div>
    </div>
  );
}