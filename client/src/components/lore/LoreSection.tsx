import { motion } from "framer-motion";

interface LoreSectionProps {
  title: string;
  content: string[];
  image: string;
  delay?: number;
  listItems?: {label: string; value: string}[];
}

export default function LoreSection({ title, content, image, delay = 0, listItems }: LoreSectionProps) {
  return (
    <motion.div 
      className="bg-sacred-white rounded-xl shadow-md border border-sacred-blue/10 p-8 mb-12"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
    >
      {/* Image */}
      <div className="w-full max-w-md mx-auto mb-8">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-auto rounded-lg"
        />
      </div>
      
      {/* Title */}
      <h3 className="font-cinzel text-2xl text-sacred-blue mb-4">{title}</h3>
      
      {/* Content paragraphs */}
      <div className="font-raleway text-sacred-gray space-y-4">
        {content.map((paragraph, idx) => (
          <p key={idx}>{paragraph}</p>
        ))}
        
        {/* Optional list items */}
        {listItems && (
          <ul className="list-disc pl-6 space-y-2 mt-4">
            {listItems.map((item, idx) => (
              <li key={idx}>
                <span className="font-medium text-sacred-blue">{item.label}:</span> {item.value}
              </li>
            ))}
          </ul>
        )}
      </div>
    </motion.div>
  );
}
