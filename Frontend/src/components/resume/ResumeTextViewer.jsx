export default function ResumeTextViewer({ resumeText, filename }) {
  return (
    <div className="bg-white rounded-lg border-2 border-gray-300 overflow-hidden">
      <div className="bg-gray-100 px-4 py-3 border-b border-gray-300 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
          <span className="font-medium text-gray-700">{filename}</span>
        </div>
        <span className="text-xs text-gray-500">Preview</span>
      </div>
      <div className="p-6 max-h-96 overflow-y-auto bg-gray-50">
        <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed">
          {resumeText}
        </pre>
      </div>
    </div>
  );
}