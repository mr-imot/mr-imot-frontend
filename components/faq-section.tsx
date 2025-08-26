import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

interface FaqSectionProps {
  heading?: string;
  items?: FaqItem[];
}

const FaqSection = ({
  heading = "Frequently asked questions",
  items = [
    {
      id: "faq-1",
      question: "How can I find new apartments or houses in my city?",
      answer:
        "Open the map at mrimot.com/listings and explore projects in your city. Each project is posted by a verified developer, not a broker. You can view location details, visit sites in person, and contact developers directly. No registration is required to browse and explore all listings.",
    },
    {
      id: "faq-2",
      question: "Are the projects on the platform reliable?",
      answer:
        "Every project is posted by a verified developer. Developers are accountable for the accuracy of their listing details. Our verification confirms the developer identity, ensuring you can trust the source while connecting directly with legitimate builders without middlemen.",
    },
    {
      id: "faq-3",
      question: "What does it cost to list a project?",
      answer:
        "Listing projects is completely free. Verified developers can post an unlimited number of residential projects at no charge, helping them reach buyers directly without middlemen.",
    },
    {
      id: "faq-4",
      question: "Do I need to register to browse listings?",
      answer:
        "No registration is required. You can search, explore, and view all projects completely open.",
    },
    {
      id: "faq-5",
      question: "Does it cost money for buyers to use the platform?",
      answer:
        "Browsing listings, checking project details, and contacting developers directly is 100% free. Buyers can explore all verified developer projects without any fees, advertisements, or hidden costs.",
    },
    {
      id: "faq-6",
      question: "What does it take to get verified as a developer?",
      answer:
        "Our team manually verifies developers through direct contact via phone or email. The process confirms your identity and role in the project, ensuring only genuine developers can post listings and that buyers see authentic sources.",
    },
    {
      id: "faq-7",
      question: "Are only developers allowed on the platform?",
      answer:
        "Yes. Only verified real estate developers can post projects. Brokers or third parties are not allowed unless explicitly authorized by the developer, ensuring a trustworthy platform for buyers.",
    },
    {
      id: "faq-8",
      question: "How long does verification take?",
      answer:
        "Verification is usually completed within 48 hours. We prioritize speed while ensuring accuracy, so developers can post projects quickly and buyers can access verified listings reliably.",
    },
    {
      id: "faq-9",
      question: "How do I post a project after verification?",
      answer:
        "Once verified, developers gain access to a dashboard where they can post unlimited projects. Step-by-step video tutorials and support are available to assist with posting and managing listings effectively.",
    },
  ],
}: FaqSectionProps) => {
  return (
    <section className="py-24" style={{backgroundColor: 'var(--brand-glass-light)'}}>
      <div className="container max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{color: 'var(--brand-text-primary)'}}>
            {heading}
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{color: 'var(--brand-text-secondary)'}}>
            Everything you need to know about using Mr. imot Platform
          </p>
        </div>
        <Accordion type="single" collapsible className="w-full">
          {items.map((item, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border-b border-gray-200">
              <AccordionTrigger className="font-semibold hover:no-underline text-left py-4" style={{color: 'var(--brand-text-primary)'}}>
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-4 leading-relaxed">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export { FaqSection };
