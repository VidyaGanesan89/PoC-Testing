import ProgressBar from './ProgressBar';

const TestProgressPanel = ({ testProgress }) => {
    if (!testProgress) {
        return null;
    }

    const getStatusColor = () => {
        const status = testProgress.status?.toLowerCase();
        if (status === 'completed' || status === 'passed') return 'text-green-600';
        if (status === 'failed') return 'text-red-600';
        if (status === 'regenerating') return 'text-yellow-600';
        return 'text-blue-600';
    };

    const getStatusIcon = () => {
        const status = testProgress.status?.toLowerCase();
        if (status === 'completed' || status === 'passed') return '✓';
        if (status === 'failed') return '✗';
        if (status === 'regenerating') return '🔄';
        return '⟳';
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Test Execution Progress</h2>
                <span className={`text-2xl ${getStatusColor()}`}>{getStatusIcon()}</span>
            </div>

            <div className="space-y-4">
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">{testProgress.currentStep}</span>
                        <span className="text-sm font-semibold text-gray-800">{testProgress.progress}%</span>
                    </div>
                    <ProgressBar progress={testProgress.progress} status={testProgress.status} />
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700 font-mono">{testProgress.message}</p>
                </div>

                <div className="text-xs text-gray-500">
                    Test ID: {testProgress.testId}
                </div>
            </div>
        </div>
    );
};

export default TestProgressPanel;
