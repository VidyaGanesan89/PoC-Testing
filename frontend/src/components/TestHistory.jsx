const TestHistory = ({ history }) => {
    const normalizeTestTypeLabel = (value) => {
        const text = (value || '').toString().trim();
        const lowered = text.toLowerCase();
        if (lowered === 'performance' ||
            lowered.includes('azure boards') ||
            lowered.includes('work item management')) {
            return 'Azure Boards \u2013 Work Item Management';
        }
        if (lowered === 'jmeter' || lowered.includes('jmeter')) {
            return '\u26a1 Performance Tests (JMeter)';
        }
        return text;
    };

    const getTestDisplayName = (test) => {
        // Priority: testMethod > testName > class name > testType label
        if (test.testMethod) return test.testMethod;
        if (test.testName) return test.testName;
        
        // Extract readable name from testClass
        if (test.testClass) {
            const className = test.testClass.includes('.') 
                ? test.testClass.split('.').pop() 
                : test.testClass;
            const withoutTest = className.endsWith('Test') 
                ? className.slice(0, -4) 
                : className;
            const readable = withoutTest.replace(/([A-Z])/g, ' $1').trim();
            
            // Add Azure Boards badge if applicable
            if (test.azureDevOps) {
                return `${readable} [Azure Boards]`;
            }
            return readable;
        }
        
        // Fallback to testType
        return `${(normalizeTestTypeLabel(test.testType) || 'Functional').toUpperCase()} TEST`;
    };

    if (!history || history.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Test History</h2>
                <p className="text-gray-500 text-center py-8">No tests run yet</p>
            </div>
        );
    }

    const getStatusBadge = (status) => {
        const statusUpper = status?.toUpperCase() || 'UNKNOWN';
        const classes = {
            PASSED: 'bg-green-100 text-green-800 border-green-200',
            FAILED: 'bg-red-100 text-red-800 border-red-200',
            RUNNING: 'bg-blue-100 text-blue-800 border-blue-200',
        };

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${classes[statusUpper] || 'bg-gray-100 text-gray-800'}`}>
                {statusUpper}
            </span>
        );
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleString();
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Test History</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
                {history.map((test, index) => (
                    <div
                        key={test.id || test.testId || index}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                    {getTestDisplayName(test)}
                                    {test.azureDevOps && (
                                        <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full border border-blue-200">
                                            Azure Boards
                                        </span>
                                    )}
                                </h3>
                                <p className="text-xs text-gray-500 mt-1">
                                    {formatDate(test.startTime || test.timestamp)}
                                </p>
                                {test.duration && (
                                    <p className="text-xs text-gray-400 mt-1">
                                        Duration: {(test.duration / 1000).toFixed(2)}s
                                    </p>
                                )}
                            </div>
                            {getStatusBadge(test.status)}
                        </div>
                        <div className="text-xs text-gray-400 font-mono truncate">
                            ID: {test.id || test.testId}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TestHistory;
