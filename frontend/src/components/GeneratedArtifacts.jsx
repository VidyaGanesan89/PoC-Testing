import { BarChart3, Clock, FileCode, FileText, X } from 'lucide-react';
import { useState } from 'react';

const GeneratedArtifacts = ({ artifacts }) => {
    const [previewFile, setPreviewFile] = useState(null);
    const [csvContent, setCsvContent] = useState(null);
    const [loadingCsv, setLoadingCsv] = useState(false);
    
    const fetchCsvContent = async (filePath) => {
        setLoadingCsv(true);
        try {
            const response = await fetch(`http://localhost:8080/api/csv-content?filePath=${encodeURIComponent(filePath)}`);
            if (response.ok) {
                const data = await response.json();
                setCsvContent(data.content);
            } else {
                console.error('Failed to fetch CSV content');
                setCsvContent(null);
            }
        } catch (error) {
            console.error('Error fetching CSV content:', error);
            setCsvContent(null);
        } finally {
            setLoadingCsv(false);
        }
    };
    
    const handleViewClick = (artifact) => {
        setPreviewFile(artifact);
        setCsvContent(null); // Reset CSV content
        
        // If it's a CSV Test Case with a file path, fetch the content
        if (artifact.type === 'CSV Test Case' && artifact.filePath) {
            fetchCsvContent(artifact.filePath);
        }
    };
    
    const handleClosePreview = () => {
        setPreviewFile(null);
        setCsvContent(null);
    };

    const parseCsvToTable = (csvText) => {
        if (!csvText) return { headers: [], rows: [] };
        
        // Advanced CSV parser that handles multi-line fields and quoted content
        const parseCSV = (text) => {
            const rows = [];
            let currentRow = [];
            let currentField = '';
            let inQuotes = false;
            
            for (let i = 0; i < text.length; i++) {
                const char = text[i];
                const nextChar = text[i + 1];
                
                if (char === '"') {
                    if (inQuotes && nextChar === '"') {
                        // Escaped quote - add single quote to field
                        currentField += '"';
                        i++; // Skip next quote
                    } else {
                        // Toggle quote mode
                        inQuotes = !inQuotes;
                    }
                } else if (char === ',' && !inQuotes) {
                    // Field separator - push current field and start new one
                    currentRow.push(currentField.trim());
                    currentField = '';
                } else if ((char === '\n' || char === '\r') && !inQuotes) {
                    // Row separator - push current field and row, start new row
                    if (char === '\r' && nextChar === '\n') {
                        i++; // Skip \n in \r\n
                    }
                    currentRow.push(currentField.trim());
                    if (currentRow.some(field => field !== '')) {
                        rows.push(currentRow);
                    }
                    currentRow = [];
                    currentField = '';
                } else {
                    // Regular character
                    currentField += char;
                }
            }
            
            // Push last field and row if any
            if (currentField || currentRow.length > 0) {
                currentRow.push(currentField.trim());
                if (currentRow.some(field => field !== '')) {
                    rows.push(currentRow);
                }
            }
            
            return rows;
        };
        
        const allRows = parseCSV(csvText);
        if (allRows.length === 0) return { headers: [], rows: [] };
        
        const headers = allRows[0];
        const rows = allRows.slice(1);
        
        return { headers, rows };
    };
    
    const getFileIcon = (type) => {
        switch (type) {
            case 'Selenium Test':
                return <FileCode className="w-5 h-5 text-blue-500" />;
            case 'JMeter Script':
                return <BarChart3 className="w-5 h-5 text-green-500" />;
            case 'Report':
                return <FileText className="w-5 h-5 text-purple-500" />;
            case 'CSV Test Case':
                return <FileText className="w-5 h-5 text-orange-500" />;
            default:
                return <FileText className="w-5 h-5 text-gray-500" />;
        }
    };

    const getFileTypeColor = (type) => {
        switch (type) {
            case 'Selenium Test':
                return 'bg-blue-100 text-blue-800';
            case 'JMeter Script':
                return 'bg-green-100 text-green-800';
            case 'Report':
                return 'bg-purple-100 text-purple-800';
            case 'CSV Test Case':
                return 'bg-orange-100 text-orange-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;

        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;

        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getFilePreview = (artifact) => {
        // For CSV Test Case, use fetched content if available
        if (artifact.type === 'CSV Test Case' && csvContent) {
            return csvContent;
        }
        
        // If artifact has actual content from backend, use it
        if (artifact.content) {
            return artifact.content;
        }
        
        // Otherwise, generate placeholder preview
        const fileName = artifact.fileName || 'UnknownTest';
        const className = fileName.replace('.java', '').replace(/[^a-zA-Z0-9_]/g, '_');
        const timestamp = artifact.timestamp || new Date();
        const description = artifact.description || 'No description available';
        
        if (artifact.type === 'Selenium Test') {
            return `// ${fileName}\n// Generated: ${new Date(timestamp).toLocaleString()}\n// Description: ${description}\n\nimport org.openqa.selenium.WebDriver;\nimport org.openqa.selenium.chrome.ChromeDriver;\nimport org.testng.annotations.Test;\n\npublic class ${className} {\n    \n    @Test\n    public void testParcelProFunctionality() {\n        WebDriver driver = new ChromeDriver();\n        \n        try {\n            // Navigate to ParcelPro application\n            driver.get("http://localhost:3000");\n            \n            // Test implementation will be generated here\n            // based on your test prompt\n            \n            System.out.println("Test executed successfully");\n        } finally {\n            driver.quit();\n        }\n    }\n}`;
        } else if (artifact.type === 'JMeter Script') {
            return `<?xml version="1.0" encoding="UTF-8"?>\n<jmeterTestPlan version="1.2">\n  <hashTree>\n    <TestPlan guiclass="TestPlanGui" testclass="TestPlan" testname="${fileName}">\n      <stringProp name="TestPlan.comments">Generated Performance Test</stringProp>\n      <boolProp name="TestPlan.functional_mode">false</boolProp>\n      <boolProp name="TestPlan.serialize_threadgroups">false</boolProp>\n      <elementProp name="TestPlan.user_defined_variables">\n        <collectionProp name="Arguments.arguments"/>\n      </elementProp>\n    </TestPlan>\n    <hashTree>\n      <ThreadGroup guiclass="ThreadGroupGui" testclass="ThreadGroup" testname="ParcelPro Users">\n        <stringProp name="ThreadGroup.num_threads">10</stringProp>\n        <stringProp name="ThreadGroup.ramp_time">5</stringProp>\n      </ThreadGroup>\n    </hashTree>\n  </hashTree>\n</jmeterTestPlan>`;
        } else if (artifact.type === 'CSV Test Case') {
            // For CSV test cases, show file info instead of rendering HTML
            return `📊 CSV Test Case File Generated\n\n📁 File Name: ${fileName}\n📍 Location: ${artifact.filePath || 'functional test report folder'}\n🕒 Generated: ${new Date(timestamp).toLocaleString()}\n📝 Description: ${description}\n\n✅ CSV test case has been created successfully!\n\nThe CSV file contains detailed test steps with the following columns:\n• S.No\n• Test Name\n• Scenario\n• Step Name\n• Steps to Execute\n• Expected Results\n• Pass/Fail\n\nYou can:\n1. Open the file from the functional test report folder\n2. View in Excel, Google Sheets, or any CSV viewer\n3. Import into your test management tool\n4. Use for manual test execution\n\n📥 File Path:\n${artifact.filePath || fileName}`;
        } else {
            return `<!DOCTYPE html>\n<html>\n<head>\n    <title>Test Report - ${fileName}</title>\n    <style>\n        body { font-family: Arial, sans-serif; margin: 20px; }\n        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; }\n        .summary { margin: 20px 0; }\n    </style>\n</head>\n<body>\n    <div class="header">\n        <h1>ParcelPro Test Report</h1>\n        <p>Generated: ${new Date(timestamp).toLocaleString()}</p>\n    </div>\n    <div class="summary">\n        <h2>Test Summary</h2>\n        <p>Status: <strong>PASSED</strong></p>\n        <p>Duration: 5.2 seconds</p>\n    </div>\n</body>\n</html>`;
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Generated Test Artifacts</h2>

            {artifacts.length === 0 ? (
                <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                        <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-lg">No files generated yet</p>
                    <p className="text-gray-400 text-sm mt-2">
                        Run a test to generate artifacts
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {artifacts.map((artifact, index) => (
                        <div
                            key={index}
                            className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 hover:shadow-md transition-all duration-200"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-3 flex-1">
                                    <div className="mt-1">
                                        {getFileIcon(artifact.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-base font-semibold text-gray-900 truncate">
                                            {artifact.fileName || 'Unnamed File'}
                                        </h3>
                                        <div className="flex flex-wrap items-center gap-2 mt-2">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getFileTypeColor(artifact.type)}`}>
                                                {artifact.type || 'Unknown'}
                                            </span>
                                            <span className="inline-flex items-center text-xs text-gray-500">
                                                <Clock className="w-3 h-3 mr-1" />
                                                {formatTimestamp(artifact.timestamp || new Date())}
                                            </span>
                                        </div>
                                        {artifact.description && (
                                            <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap max-h-24 overflow-y-auto">
                                                {artifact.description.length > 200
                                                    ? artifact.description.substring(0, 200) + '...'
                                                    : artifact.description
                                                }
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <button
                                    className="ml-4 px-3 py-1.5 text-sm font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-md transition-colors"
                                    onClick={() => handleViewClick(artifact)}
                                >
                                    View
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Preview Modal */}
            {previewFile && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <div className="flex items-center space-x-3">
                                {getFileIcon(previewFile.type)}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {previewFile.fileName || 'Unnamed File'}
                                    </h3>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getFileTypeColor(previewFile.type)}`}>
                                        {previewFile.type || 'Unknown'}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={handleClosePreview}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-auto p-6">
                            <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                <div className="flex items-center text-sm text-gray-600 mb-2">
                                    <Clock className="w-4 h-4 mr-2" />
                                    Generated {formatTimestamp(previewFile.timestamp || new Date())}
                                </div>
                                {previewFile.description && (
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{previewFile.description}</p>
                                )}
                            </div>

                            <div className="bg-gray-900 rounded-lg p-4 overflow-auto">
                                {loadingCsv ? (
                                    <div className="text-center py-8">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                                        <p className="text-white mt-4">Loading CSV content...</p>
                                    </div>
                                ) : previewFile.type === 'CSV Test Case' && csvContent ? (
                                    <div className="overflow-x-auto">
                                        {(() => {
                                            const { headers, rows } = parseCsvToTable(csvContent);
                                            return (
                                                <table className="min-w-full divide-y divide-gray-700">
                                                    <thead className="bg-gray-800">
                                                        <tr>
                                                            {headers.map((header, idx) => (
                                                                <th 
                                                                    key={idx}
                                                                    className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider border-r border-gray-700 last:border-r-0"
                                                                >
                                                                    {header}
                                                                </th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-gray-900 divide-y divide-gray-800">
                                                        {rows.map((row, rowIdx) => (
                                                            <tr key={rowIdx} className="hover:bg-gray-800 transition-colors">
                                                                {row.map((cell, cellIdx) => (
                                                                    <td 
                                                                        key={cellIdx}
                                                                        className="px-4 py-3 text-sm text-gray-100 border-r border-gray-800 last:border-r-0 whitespace-pre-wrap"
                                                                    >
                                                                        {cell}
                                                                    </td>
                                                                ))}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            );
                                        })()}
                                    </div>
                                ) : (
                                    <pre className="text-sm text-gray-100 font-mono whitespace-pre-wrap">
                                        {getFilePreview(previewFile)}
                                    </pre>
                                )}
                            </div>

                            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm text-blue-800">
                                    <strong>Note:</strong> This is a demo preview. In production, actual test files will be generated and saved to the project directory.
                                </p>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
                            <button
                                onClick={handleClosePreview}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    // Use csvContent if available for CSV Test Cases, otherwise use getFilePreview
                                    const content = (previewFile.type === 'CSV Test Case' && csvContent) 
                                        ? csvContent 
                                        : getFilePreview(previewFile);
                                    const blob = new Blob([content], { type: 'text/plain' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = previewFile.fileName || 'download.txt';
                                    document.body.appendChild(a);
                                    a.click();
                                    document.body.removeChild(a);
                                    URL.revokeObjectURL(url);
                                }}
                                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md transition-colors"
                            >
                                Download
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GeneratedArtifacts;
