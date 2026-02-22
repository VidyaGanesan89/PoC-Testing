const MetricsCard = ({ icon, title, value, color }) => {
    const colorClasses = {
        blue: 'bg-blue-50 border-blue-200',
        green: 'bg-green-50 border-green-200',
        red: 'bg-red-50 border-red-200',
        purple: 'bg-purple-50 border-purple-200',
    };

    return (
        <div className={`rounded-lg border-2 p-6 ${colorClasses[color]} shadow-sm hover:shadow-md transition-shadow`}>
            <div className="flex items-center gap-3">
                <div className={`text-3xl`}>{icon}</div>
                <div>
                    <h3 className="text-sm font-medium text-gray-600">{title}</h3>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
                </div>
            </div>
        </div>
    );
};

export default MetricsCard;
