import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "এই সফটওয়্যার ব্যবহার করতে কি কম্পিউটার জ্ঞান লাগবে?",
    answer: "না, একেবারেই না। আমাদের সফটওয়্যার এতটাই সহজ যে আপনি যদি ফেসবুক ব্যবহার করতে পারেন, তাহলে এটিও পারবেন। তাছাড়া আমরা সম্পূর্ণ ট্রেনিং দিই।"
  },
  {
    question: "ডেটা কি নিরাপদ থাকবে?",
    answer: "হ্যাঁ, ১০০% নিরাপদ। আমরা Bank-level SSL encryption ব্যবহার করি এবং প্রতিদিন অটোমেটিক ব্যাকআপ নেওয়া হয়। আপনার ডেটা শুধুমাত্র আপনি দেখতে পারবেন।"
  },
  {
    question: "ইন্টারনেট না থাকলে কি কাজ করবে?",
    answer: "এটি একটি ক্লাউড-বেসড সফটওয়্যার তাই ইন্টারনেট প্রয়োজন। তবে মোবাইল ডেটা দিয়েও চলবে। ভবিষ্যতে অফলাইন মোড আসছে।"
  },
  {
    question: "পেমেন্ট গেটওয়ে সেটআপ করতে কি লাগবে?",
    answer: "বিকাশ, নগদ বা রকেট মার্চেন্ট একাউন্ট থাকলেই হবে। আমরা সেটআপ করে দিই। মার্চেন্ট একাউন্ট না থাকলে ম্যানুয়াল পেমেন্ট অপশন আছে।"
  },
  {
    question: "কতজন ইউজার ব্যবহার করতে পারবে?",
    answer: "প্ল্যান অনুযায়ী আনলিমিটেড ইউজার অ্যাড করতে পারবেন। Admin, Teacher, Accountant - প্রতিটি রোলের জন্য আলাদা লগইন ও পারমিশন।"
  },
  {
    question: "পুরনো ডেটা কি ইমপোর্ট করা যাবে?",
    answer: "হ্যাঁ, Excel বা CSV ফাইল থেকে ছাত্র, শিক্ষক ও অন্যান্য ডেটা ইমপোর্ট করা যায়। আমাদের টিম সাহায্য করবে।"
  },
];

export function FAQSection() {
  return (
    <section id="faq" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            সচরাচর জিজ্ঞাসা
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            আপনার প্রশ্নের উত্তর
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            সবচেয়ে বেশি জিজ্ঞাসিত প্রশ্নগুলোর উত্তর এখানে পাবেন
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card border border-border rounded-lg px-6"
              >
                <AccordionTrigger className="text-left text-foreground hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
