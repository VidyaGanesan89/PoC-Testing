import React, { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';

const ScriptViewerModal = ({ isOpen, onClose, testClass, testContent, pageObjectContent }) => {
  const [activeTab, setActiveTab] = useState('test');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    const contentToCopy = activeTab === 'test' ? testContent : pageObjectContent;
    if (contentToCopy) {
      navigator.clipboard.writeText(contentToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const currentContent = activeTab === 'test' ? testContent : pageObjectContent;
  const hasTestFile = !!testContent;
  const hasPageObject = !!pageObjectContent;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              View Test Script: {testClass}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b">
            {hasTestFile && (
              <button
                onClick={() => setActiveTab('test')}
                className={`px-6 py-3 font-medium text-sm transition-colors ${
                  activeTab === 'test'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Test File ({testClass}.java)
              </button>
            )}
            {hasPageObject && (
              <button
                onClick={() => setActiveTab('pageObject')}
                className={`px-6 py-3 font-medium text-sm transition-colors ${
                  activeTab === 'pageObject'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Page Object ({testClass}Page.java)
              </button>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-4 bg-gray-50">
            {currentContent ? (
              <pre className="text-sm font-mono bg-white p-4 rounded border border-gray-200 overflow-x-auto">
                <code>{currentContent}</code>
              </pre>
            ) : (
              <div className="text-center text-gray-500 py-8">
                No content available
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-4 border-t bg-gray-50">
            <button
              onClick={handleCopy}
              disabled={!currentContent}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy to Clipboard
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScriptViewerModal;
