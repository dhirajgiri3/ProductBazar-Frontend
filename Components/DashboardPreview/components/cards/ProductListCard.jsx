import { motion } from 'framer-motion';
import { Package, ArrowUp, Users, Target } from 'lucide-react';
import { colorMap } from '../../constants';

export const ProductListCard = ({ productsData, cardVariants, itemVariants, darkMode }) => (
  <motion.div
    variants={cardVariants}
    whileHover="hover"
    className={`backdrop-blur-xl rounded-xl p-4 shadow-xl border cursor-default md:col-span-2 transition-colors duration-300 ${
      darkMode 
        ? 'bg-slate-900/80 border-slate-700/50 shadow-slate-900/50' 
        : 'bg-white/90 border-slate-200/70 shadow-slate-200/40'
    }`}
  >
    <div className="flex items-center justify-between mb-4">
      <h3 className={`font-semibold text-sm flex items-center transition-colors duration-300 ${
        darkMode ? 'text-slate-100' : 'text-slate-800'
      }`}>
        <Package size={16} className="mr-2.5 text-violet-500" /> Product Performance
      </h3>
      <span className={`text-[10px] px-2 py-1 rounded-full font-medium transition-colors duration-300 ${
        darkMode 
          ? 'bg-violet-500/20 text-violet-300 shadow-lg shadow-violet-500/10 border border-violet-500/30' 
          : 'bg-violet-100 text-violet-600 shadow-md shadow-violet-200/30'
      }`}>
        Active
      </span>
    </div>
    <div className="space-y-3">
      {productsData.map((product, index) => {
        const color = colorMap[product.color] || colorMap.slate;
        return (
          <motion.div
            key={product.name}
            variants={itemVariants}
            className={`flex items-center p-3 rounded-lg border shadow-md group relative overflow-hidden transition-colors duration-300 ${
              darkMode 
                ? 'border-slate-700/40 bg-slate-800/70 hover:bg-slate-800/90 shadow-slate-900/40' 
                : 'border-slate-200/60 bg-white/70 hover:bg-slate-50/50'
            }`}
            whileHover={{ y: -2.5 }}
            transition={{ type: 'spring', stiffness: 300, damping: 18 }}
          >
            <motion.div
              className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color.bg} ${color.text} flex items-center justify-center mr-3 shadow-md group-hover:shadow-lg transition-all duration-300`}
              whileHover={{ scale: 1.12, rotate: 6 }}
              transition={{ type: 'spring', stiffness: 300, damping: 12 }}
            >
              {product.icon}
            </motion.div>
            <div className="flex-grow">
              <div className="flex justify-between items-baseline">
                <p className={`font-medium text-xs transition-colors duration-300 ${
                  darkMode ? 'text-slate-200' : 'text-slate-700'
                }`}>
                  {product.name}
                </p>
                <motion.span
                  className={`text-xs font-medium flex items-center px-1.5 py-0.5 rounded-full transition-all duration-300 ${
                    darkMode 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-emerald-500/10 shadow-sm' 
                      : 'bg-emerald-100/70 text-emerald-600 group-hover:shadow-sm'
                  }`}
                  whileHover={{ scale: 1.06 }}
                >
                  <ArrowUp size={9} className="mr-0.5" />
                  {product.change}
                </motion.span>
              </div>
              <div className="relative mt-2">
                <div className={`w-full rounded-full h-1.5 transition-colors duration-300 ${
                  darkMode ? 'bg-slate-700/60' : 'bg-slate-200/50'
                }`}>
                  <motion.div
                    className={`h-1.5 rounded-full bg-gradient-to-r ${color.gradFrom} ${color.gradTo} shadow-sm`}
                    initial={{ width: '0%' }}
                    animate={{ width: `${product.progress}%` }}
                    transition={{ delay: 0.35 + index * 0.12, duration: 0.9, ease: 'circOut' }}
                  />
                </div>
              </div>
              <div className={`flex justify-between mt-2 text-[9px] transition-colors duration-300 ${
                darkMode ? 'text-slate-400' : 'text-slate-500'
              }`}>
                <span className="flex items-center">
                  <Users size={9} className={`mr-1 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} /> {product.users}
                </span>
                <span className="flex items-center">
                  <Target size={9} className={`mr-1 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} /> {product.target}
                </span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  </motion.div>
); 