"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Mail, Phone, MapPin, Loader2 } from "lucide-react";
import { useState } from "react";
import { submitContactForm } from "@/lib/actions/contact";
import { toast } from "sonner";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  orderNumber: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);
    try {
      const result = await submitContactForm(data);
      if (result.success) {
        toast.success("Message sent successfully!");
        reset();
      }
    } catch (_) {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
        {/* Left Side: Contact Information */}
        <div>
          <h1 className="text-heading-2 text-dark-900">Get in Touch</h1>
          <p className="mt-4 text-lead text-dark-700">
            Have questions about our mattresses? Our sleep experts are here to help you find the perfect rest.
          </p>

          <div className="mt-12 space-y-8">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-light-200 text-dark-900">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-body-medium text-dark-900">Email Us</h3>
                <p className="text-body text-dark-700">support@pillowpeek.com</p>
                <p className="text-caption text-dark-500">Expect a response within 24 hours.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-light-200 text-dark-900">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-body-medium text-dark-900">Call Us</h3>
                <p className="text-body text-dark-700">+1 (555) 123-4567</p>
                <p className="text-caption text-dark-500">Mon-Fri: 9am - 6pm EST</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-light-200 text-dark-900">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-body-medium text-dark-900">Showroom Address</h3>
                <p className="text-body text-dark-700">
                  123 Comfort Lane<br />
                  Sleepy Hollow, NY 10591
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Contact Form */}
        <div className="rounded-2xl border border-light-300 bg-white p-8 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-caption text-dark-900">
                Full Name
              </label>
              <input
                id="name"
                {...register("name")}
                className={`w-full rounded-md border px-4 py-2 text-body transition-colors focus:border-dark-900 focus:outline-none ${
                    errors.name ? "border-red" : "border-light-400"
                }`}
                placeholder="John Doe"
              />
              {errors.name && (
                <p className="text-footnote text-red">{errors.name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="email" className="text-caption text-dark-900">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  {...register("email")}
                  className={`w-full rounded-md border px-4 py-2 text-body transition-colors focus:border-dark-900 focus:outline-none ${
                    errors.email ? "border-red" : "border-light-400"
                  }`}
                  placeholder="john@example.com"
                />
                {errors.email && (
                  <p className="text-footnote text-red">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="orderNumber" className="text-caption text-dark-900">
                  Order Number (Optional)
                </label>
                <input
                  id="orderNumber"
                  {...register("orderNumber")}
                  className="w-full rounded-md border border-light-400 px-4 py-2 text-body transition-colors focus:border-dark-900 focus:outline-none"
                  placeholder="#PP-12345"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="message" className="text-caption text-dark-900">
                Message
              </label>
              <textarea
                id="message"
                rows={5}
                {...register("message")}
                className={`w-full resize-none rounded-md border px-4 py-2 text-body transition-colors focus:border-dark-900 focus:outline-none ${
                    errors.message ? "border-red" : "border-light-400"
                }`}
                placeholder="How can we help you?"
              />
              {errors.message && (
                <p className="text-footnote text-red">{errors.message.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center rounded-md bg-dark-900 py-3 text-body-medium text-light-100 transition-colors hover:bg-dark-700 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Message"
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
