import { motion } from "framer-motion";

interface FeatureCardProps {
  title: string;
  description: string;
  image: string;
  delay: number;
  href: string;
}

export default function FeatureCard({ title, description, image, delay, href }: FeatureCardProps) {
  return (
    <motion.div
      className="bg-sacred-white p-6 rounded-lg shadow-md border border-sacred-blue/10 transform hover:-translate-y-1 transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02 }}
    >
      <a href={href}>
        <img 
          src={image} 
          alt={title} 
          className="w-full h-40 object-cover rounded mb-4"
        />
        <h3 className="font-cinzel text-sacred-blue text-xl mb-2">{title}</h3>
        <p className="font-raleway text-sacred-gray">{description}</p>
      </a>
    </motion.div>
  );
}
