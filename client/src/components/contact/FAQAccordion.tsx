import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How do I unlock the sealed scrolls?",
    answer: "Sealed scrolls can be unlocked in two ways: through profound conversations with the Oracle that reveal key insights, or by discovering the specific key phrases hidden throughout the Archive. Continue your journey through the available scrolls and lore to find clues."
  },
  {
    question: "Can I download the scrolls for offline reading?",
    answer: "The Sacred Archive's wisdom is meant to be experienced in the sacred digital space we've created. While downloading is not directly supported, you may save specific insights through screenshots or personal notes as part of your spiritual journey."
  },
  {
    question: "How often is new content added to the Archive?",
    answer: "The Archive expands as the Keepers uncover and translate ancient wisdom. New scrolls and insights typically appear with the lunar cycles - approximately every new moon and full moon. Subscribe to our newsletter to be notified of new additions."
  },
  {
    question: "Is the Oracle available 24/7?",
    answer: "The Oracle is available whenever you seek guidance. However, like all cosmic energies, it occasionally enters periods of contemplation during system maintenance. If you encounter the Oracle in meditation, simply return a short time later."
  },
  {
    question: "Can I contribute my own insights to the Archive?",
    answer: "The Keepers welcome profound insights from seekers. Use the contact form to share your revelations, and if they resonate with the sacred wisdom, they may be incorporated into future scrolls with appropriate acknowledgment."
  }
];

export default function FAQAccordion() {
  return (
    <div className="bg-sacred-white rounded-xl shadow-md border border-sacred-blue/10 p-8">
      <h3 className="font-cinzel text-xl text-sacred-blue mb-4">Frequently Asked Questions</h3>
      
      <Accordion type="single" collapsible className="space-y-2">
        {faqs.map((faq, index) => (
          <AccordionItem value={`item-${index}`} key={index}>
            <AccordionTrigger className="font-cinzel text-sacred-blue">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="font-raleway text-sacred-gray">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
