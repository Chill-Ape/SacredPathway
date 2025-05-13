import { motion } from "framer-motion";

interface ChatMessageProps {
  isUser: boolean;
  message: string;
  loading?: boolean;
}

export default function ChatMessage({ isUser, message, loading = false }: ChatMessageProps) {
  return (
    <motion.div 
      className={`flex items-start mb-4 ${isUser ? 'justify-end' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-sacred-blue flex items-center justify-center text-sacred-white mr-3 flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="4" />
            <line x1="4.93" y1="4.93" x2="9.17" y2="9.17" />
            <line x1="14.83" y1="14.83" x2="19.07" y2="19.07" />
            <line x1="14.83" y1="9.17" x2="19.07" y2="4.93" />
            <line x1="14.83" y1="9.17" x2="18.36" y2="5.64" />
            <line x1="4.93" y1="19.07" x2="9.17" y2="14.83" />
          </svg>
        </div>
      )}
      
      <div className={`${
        isUser 
          ? 'bg-sacred-white shadow-sm' 
          : 'bg-sacred-blue/10'
        } rounded-lg py-2 px-4 max-w-xs md:max-w-md`}>
        <p className={`${
          isUser 
            ? 'font-raleway text-sacred-gray' 
            : 'font-playfair text-sacred-blue'
          } ${loading ? 'animate-pulse' : ''}`}>
          {message}
        </p>
      </div>
      
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-sacred-gold/80 flex items-center justify-center text-sacred-white ml-3 flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
      )}
    </motion.div>
  );
}
