import { motion } from "framer-motion";
import ContactForm from "@/components/contact/ContactForm";
import FAQAccordion from "@/components/contact/FAQAccordion";
import { Helmet } from "react-helmet";

export default function Contact() {
  const socialLinks = [
    { icon: "facebook", url: "#" },
    { icon: "twitter", url: "#" },
    { icon: "instagram", url: "#" },
    { icon: "youtube", url: "#" },
    { icon: "discord", url: "#" }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen px-4 py-16"
    >
      <Helmet>
        <title>Contact the Keepers | The Sacred Archive</title>
        <meta name="description" content="Connect with the Keepers of The Sacred Archive. Send a message, join our community, and find answers to frequently asked questions." />
      </Helmet>
      
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-cinzel font-bold text-sacred-blue text-center mb-6">Contact the Keepers</h2>
        
        <p className="text-center font-raleway text-sacred-gray mb-12 max-w-2xl mx-auto">
          If you seek further guidance or wish to share your insights with the Keepers of the Sacred Archive, please send your message through this ethereal connection.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ContactForm />
          
          <div className="space-y-6">
            <div className="bg-sacred-white rounded-xl shadow-md border border-sacred-blue/10 p-8">
              <h3 className="font-cinzel text-xl text-sacred-blue mb-4">Connect with the Community</h3>
              
              <p className="font-raleway text-sacred-gray mb-4">Join fellow seekers in exploring the ancient wisdom preserved in the Sacred Archive.</p>
              
              <div className="flex space-x-4 text-2xl text-sacred-blue">
                {socialLinks.map((link, index) => (
                  <a 
                    key={index} 
                    href={link.url} 
                    className="hover:text-sacred-gold transition-colors"
                    aria-label={`${link.icon} link`}
                  >
                    <i className={`fab fa-${link.icon}`}></i>
                  </a>
                ))}
              </div>
            </div>
            
            <FAQAccordion />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
