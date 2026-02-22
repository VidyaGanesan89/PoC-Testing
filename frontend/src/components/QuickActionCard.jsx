const QuickActionCard = ({ icon, title, description, onClick, color }) => {
    const colorClasses = {
        purple: 'bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border-purple-200',
        orange: 'bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 border-orange-200',
        blue: 'bg-gradient-to-br from-blue-200 to-blue-300 hover:from-blue-300 hover:to-blue-400 border-blue-400',
    };

    return (
        <button
            onClick={onClick}
            className={`rounded-lg border-2 p-6 ${colorClasses[color]} text-left transition-all cursor-pointer shadow-sm hover:shadow-md w-full`}
        >
            <div className="flex items-start gap-4">
                <div className="text-4xl">{icon}</div>
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800 mb-1">{title}</h3>
                    <p className="text-sm text-gray-600">{description}</p>
                </div>
            </div>
        </button>
    );
};

export default QuickActionCard;
