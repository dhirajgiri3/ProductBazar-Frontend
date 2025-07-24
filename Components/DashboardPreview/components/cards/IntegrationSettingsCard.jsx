import { motion } from 'framer-motion';
import { Link2, MessageSquare, GitBranch, CreditCard, Workflow } from 'lucide-react';

export const IntegrationSettingsCard = ({ cardVariants, itemVariants, darkMode }) => {
  const integrations = [
    { name: 'Slack', status: 'connected', icon: <MessageSquare size={16} />, description: 'Team notifications' },
    { name: 'GitHub', status: 'connected', icon: <GitBranch size={16} />, description: 'Code repository sync' },
    { name: 'Stripe', status: 'connected', icon: <CreditCard size={16} />, description: 'Payment processing' },
    { name: 'Zapier', status: 'disconnected', icon: <Workflow size={16} />, description: 'Workflow automation' }
  ];

  return (
    <motion.div
      variants={cardVariants}
      whileHover="hover"
      className={`backdrop-blur-xl rounded-xl p-4 shadow-xl border cursor-default transition-colors duration-300 ${
        darkMode 
          ? 'bg-slate-800/70 border-slate-700/60' 
          : 'bg-white/70 border-slate-200/60'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-semibold text-sm flex items-center transition-colors duration-300 ${
          darkMode ? 'text-slate-100' : 'text-slate-800'
        }`}>
          <Link2 size={16} className="mr-2.5 text-purple-500" /> Integrations
        </h3>
        <span className="text-[10px] px-2 py-1 rounded-full bg-purple-100 text-purple-600 font-medium">
          3 Active
        </span>
      </div>
      
      <div className="space-y-3">
        {integrations.map((integration, index) => (
          <motion.div
            key={integration.name}
            variants={itemVariants}
            className={`flex items-center justify-between p-3 rounded-lg border group transition-colors duration-300 ${
              darkMode 
                ? 'border-slate-700/70 hover:bg-slate-700/40' 
                : 'border-slate-200/70 hover:bg-slate-50/40'
            }`}
            whileHover={{ x: 2.5 }}
          >
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 transition-colors duration-300 ${
                darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
              }`}>
                {integration.icon}
              </div>
              <div>
                <p className={`text-xs font-medium transition-colors duration-300 ${
                  darkMode ? 'text-slate-200' : 'text-slate-700'
                }`}>{integration.name}</p>
                <p className={`text-[10px] transition-colors duration-300 ${
                  darkMode ? 'text-slate-400' : 'text-slate-500'
                }`}>{integration.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                integration.status === 'connected' 
                  ? 'text-emerald-600 bg-emerald-100' 
                  : darkMode 
                    ? 'text-slate-400 bg-slate-700' 
                    : 'text-slate-500 bg-slate-100'
              }`}>
                {integration.status}
              </span>
              <motion.button
                className="text-xs text-violet-600 hover:text-violet-700 font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {integration.status === 'connected' ? 'Manage' : 'Connect'}
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}; 