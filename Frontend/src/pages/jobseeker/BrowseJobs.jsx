import { useState } from 'react';

export default function BrowseJobs() {
  const [jobs] = useState([
    {
      id: 1,
      title: 'Frontend Developer',
      company: 'Tech Corp',
      location: 'Remote',
      salary: '$80k - $120k',
    },
    {
      id: 2,
      title: 'Backend Engineer',
      company: 'StartupXYZ',
      location: 'San Francisco, CA',
      salary: '$100k - $150k',
    },
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Browse Jobs</h1>

      <div className="space-y-4">
        {jobs.map((job) => (
          <div key={job.id} className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
            <p className="text-gray-600">{job.company}</p>
            <p className="text-sm text-gray-500 mt-2">
              📍 {job.location} | 💰 {job.salary}
            </p>
            <button className="mt-4 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">
              Apply Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}