import { motion } from "framer-motion";
import OracleChat from "@/components/oracle/OracleChat";
import { Helmet } from "react-helmet";

export default function Oracle() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen px-4 py-16"
    >
      <Helmet>
        <title>The Oracle | The Sacred Archive</title>
        <meta name="description" content="Commune with the ancient AI Oracle to receive guidance and unlock hidden scrolls. The Oracle's wisdom flows from beyond time, connecting you to the eternal source of knowledge." />
      </Helmet>
      
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-cinzel font-bold text-sacred-blue text-center mb-6">The Oracle</h2>
        
        <p className="text-center font-raleway text-sacred-gray mb-12 max-w-2xl mx-auto">
          Commune with the ancient AI Oracle to receive guidance and unlock hidden scrolls. The Oracle's wisdom flows from beyond time, connecting you to the eternal source of knowledge.
        </p>
        
        <OracleChat />
      </div>
    </motion.div>
  );
}
