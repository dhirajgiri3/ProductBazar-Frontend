"use client";

import { useState, useEffect } from 'react';
import { AlertCircle, Info } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import the editor to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { 
  ssr: false,
  loading: () => <div className="h-64 w-full bg-gray-50 flex items-center justify-center border border-gray-200 rounded-lg animate-pulse">
    <p className="text-sm text-gray-500">Loading editor...</p>
  </div>
});

// Import styles only on client
function QuillStyles() {
  useEffect(() => {
    import('react-quill/dist/quill.snow.css');
  }, []);
  return null;
}

const RichTextEditor = ({ value, onChange, error, label, required = false, note }) => {
  const [mounted, setMounted] = useState(false);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['blockquote', 'code-block'],
      [{ 'color': [] }, { 'background': [] }],
      ['link'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'blockquote', 'code-block',
    'color', 'background',
    'link'
  ];

  if (!mounted) {
    return (
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          {note && <span className="text-xs text-gray-500 flex items-center">
            <Info size={12} className="mr-1" /> {note}
          </span>}
        </div>
        <div className="h-64 w-full bg-gray-50 flex items-center justify-center border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-500">Editor is loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <QuillStyles />
      <div className="flex justify-between items-center mb-2">
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {note && <span className="text-xs text-gray-500 flex items-center">
          <Info size={12} className="mr-1" /> {note}
        </span>}
      </div>
      <div className={`rounded-lg transition-all duration-300 ${focused ? 'ring-2 ring-violet-200' : ''}`}>
        <ReactQuill
          value={value}
          onChange={onChange}
          modules={modules}
          formats={formats}
          placeholder="Write detailed product description here..."
          className={`bg-white border ${error ? 'border-red-300' : focused ? 'border-violet-400' : 'border-gray-300'} rounded-lg transition-colors`}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          theme="snow"
        />
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-start">
          <AlertCircle size={14} className="mr-1 mt-0.5 flex-shrink-0" />
          {error}
        </p>
      )}
      <p className="mt-2 text-xs text-gray-500">
        <span className="inline-flex items-center">
          <Info size={12} className="mr-1" />
          Format your description with headings, bullet points, and text styling to make it engaging and easy to read.
        </span>
      </p>
    </div>
  );
};

export default RichTextEditor;