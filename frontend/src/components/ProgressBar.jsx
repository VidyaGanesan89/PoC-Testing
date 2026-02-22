const ProgressBar = ({ progress, status }) => {
    const getColorClass = () => {
        const statusLower = status?.toLowerCase();
        if (statusLower === 'completed' || statusLower === 'passed') return 'bg-green-500';
        if (statusLower === 'failed') return 'bg-red-500';
        if (statusLower === 'regenerating') return 'bg-yellow-500';
        return 'bg-blue-500';
    };

    return (
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
                className={`h-full ${getColorClass()} transition-all duration-300 ease-out rounded-full`}
                style={{ width: `${progress}%` }}
            >
                <div className="h-full w-full animate-pulse bg-white opacity-20"></div>
            </div>
        </div>
    );
};

export default ProgressBar;
