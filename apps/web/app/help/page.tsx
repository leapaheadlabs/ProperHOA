import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle, MessageSquare, Mail, BookOpen } from "lucide-react";
import Link from "next/link";

const faqs = [
  {
    question: "How do I create a new community?",
    answer: "Sign up as a new user and select 'Create Community' during onboarding. You'll be set as the President with full admin access."
  },
  {
    question: "How do residents join my community?",
    answer: "Share your community invite link from the Settings page. Residents can sign up and join using the link."
  },
  {
    question: "Is my payment information secure?",
    answer: "Yes. All payment processing is handled by Stripe. We never store or see your card details. We're PCI DSS compliant."
  },
  {
    question: "Can I export my community data?",
    answer: "Yes. Go to Settings > Data Export to download your full community data as JSON or CSV."
  },
  {
    question: "How does the AI Board Assistant work?",
    answer: "The AI uses your community's documents (CC&Rs, bylaws, meeting minutes) to answer questions. All data stays on your server."
  },
  {
    question: "What if I forget my password?",
    answer: "Click 'Forgot Password' on the sign-in page. We'll email you a secure reset link."
  },
  {
    question: "Can I use ProperHOA on my phone?",
    answer: "Yes! ProperHOA is a Progressive Web App. Add it to your home screen for a native app experience."
  },
  {
    question: "How do I contact support?",
    answer: "Email support@properhoa.com or open an issue on our GitHub repository."
  }
];

export default function HelpPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Help & Support</h1>
        <p className="text-muted-foreground text-sm">Find answers or get in touch</p>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <Input placeholder="Search help articles..." />
        <Button>Search</Button>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Documentation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Read the full documentation for setup, API, and deployment guides.</p>
            <Button variant="link" className="px-0" asChild>
              <Link href="https://github.com/leapaheadlabs/ProperHOA/tree/main/docs">View Docs</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              GitHub Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Report bugs, request features, or ask questions on GitHub.</p>
            <Button variant="link" className="px-0" asChild>
              <Link href="https://github.com/leapaheadlabs/ProperHOA/issues">Open Issue</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Contact Us
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm">Email: <a href="mailto:support@properhoa.com" className="text-primary">support@properhoa.com</a></p>
          <p className="text-sm">Security: <a href="mailto:security@properhoa.com" className="text-primary">security@properhoa.com</a></p>
          <p className="text-sm">GitHub: <a href="https://github.com/leapaheadlabs/ProperHOA" className="text-primary">github.com/leapaheadlabs/ProperHOA</a></p>
        </CardContent>
      </Card>
    </div>
  );
}
